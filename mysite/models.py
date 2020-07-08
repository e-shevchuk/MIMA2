from datetime import timedelta
from datetime import datetime
from django.db import models
from django.db.models import Sum, Max
from django.utils import timezone
from django.utils.timezone import make_aware, make_naive
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from django.contrib.auth.models import User
from picklefield.fields import PickledObjectField
import json
import re

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
GAUTH_REDIRECT_URI = 'https://mima.f15.dev/gcauth'
FLOW_CRED_JSON = json.loads(
    '{"web":{"client_id":"399766475307-5o7r5dbnk4f9oalicl2m51ucpr41ntq0.apps.googleusercontent.com","project_id":"utility-melody-235110","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"4IxQD0oMYyRViQDpYS6N74zo","redirect_uris":["https://mima.f15.dev/gcauth"]}}')


class Activity(models.Model):
    user_id = models.ForeignKey(
        'auth.User',
        related_name='activities',
        on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    feasibility = models.FloatField(default=1)
    events_is_movable = models.BooleanField(default=True)
    events_min_length = models.IntegerField(default=30)
    events_max_length = models.IntegerField(default=90)

    def __str__(self):
        return self.title + ' (%s)' % self.id

    @classmethod
    def ongoing_by_user(cls, user):
        """
        Provide the list of user's activities related to his uncompleted tasks

        :param user: (type: User)
        :return: (type: QuerySet)
        """

        # Get all current user active tasks
        tasks = Task.objects.filter(
            user_id=user,
            complete=False)

        # Related time records
        time_records = Time.objects.filter(task__in=tasks)
        # Get the activities list
        activities = \
            {tr.event.activity_id for tr in time_records if tr.event.active}

        # Return set
        return Activity.objects.filter(id__in=[a.id for a in activities])

    @property
    def tasks_ongoing(self):
        """
        :return: The list of all non complete tasks related to this activity
                 (type: list)
        """

        tasks = []

        # Get all the activity events
        for e in self.event_set.order_by('start'):
            # For each event pull all the time records
            for t in e.task_set.order_by('order'):
                if not t.complete and t not in tasks:
                    # Add it to the list
                    tasks.extend([t])

            for ti in e.time_set.order_by('order'):
                # Get a task from each time record. If the task isn't complete
                # and not in the list yet
                if not ti.task.complete and ti.task not in tasks:
                    # Add it to the list
                    tasks.extend([ti.task])

        # Voila!
        return tasks

    def straight_up_order(self):
        """
        Straight-up the order values in all the included Events
        """

        for e in self.event_set.all():
            e.straight_up_order()


class Event(models.Model):
    user_id = models.ForeignKey(
        'auth.User',
        related_name='events',
        on_delete=models.CASCADE)

    activity_id = models.ForeignKey(Activity, on_delete=models.CASCADE)
    google_calendar_id = models.CharField(max_length=200, default='')
    title = models.CharField(max_length=200, default='')
    feasibility = models.FloatField(default=1)
    start = models.DateTimeField(default=timezone.now)
    duration = models.DurationField(default=timedelta(minutes=30))
    active = models.BooleanField(default=True)

    @property
    def duration_min(self):
        duration_minutes = self.duration.seconds // 60
        if duration_minutes > 0:
            return str(self.duration.seconds // 60) + ' min'
        else:
            return ''

    @property
    def duration_hours(self):
        duration_minutes = self.duration.seconds // 3600
        if duration_minutes > 0:
            return str(self.duration.seconds // 3600) + ' h'
        else:
            return ''

    @property
    def end(self):
        return self.start + self.duration

    def __str__(self):
        return self.title[:15] \
               + ' ' + self.start.strftime("%d.%m.%Y") \
               + ' (ID: ' + str(self.id) + ')'

    @property
    def scheduled_tasks(self):
        # Get the task IDs list from time records
        task_ids = [t.task.id for t in Time.objects.filter(event=self)]
        # Convert it into a QuerySet and return
        return Task.objects.filter(id__in=task_ids)

    @property
    def order_next(self):
        time_records = Time.objects.filter(event=self)
        return time_records.aggregate(Max('order'))['order__max'] + 1

    def time_available(self, pin_only=False):
        """
        Compute time available for additional tasks within current event

        :param pin_only: - False: take into account all the tasks
                         - True: take into account pinned tasks only

        :return: Time available in the event (type: timedelta)
        """

        # GET THE EVENT TASKS LIST TO COMPUTE BUSY TIME

        # Get all the attached tasks
        tasks = self.scheduled_tasks

        # If we consider pinned tasks only
        if pin_only:
            tasks = tasks.exclude(pinned=False, complete=False)

        # COMPUTE BUSY TIME

        # By default consider event empty
        busy = timedelta(0)
        # If the task set isn't empty
        if len(tasks) > 0:
            # Update the busy time as sum of all tasks time-records durations
            busy = Time.objects.filter(task__in=tasks, event=self).\
                aggregate(Sum('duration'))['duration__sum']

        # COMPUTE AVAILABLE TIME

        # Available time is the delta between the busy time and event duration
        available = self.duration - busy

        return available

    def append_task(self, task: "Task", time: timedelta = None,
                    soft: bool = True):
        """
        Append a task to the end of the event tasks list. If task was already
        there, increment scheduled time.

        :param task: Task instance
        :param time_want_to_schedule: Amount of time to schedule. Can not
                                      exceed task unscheduled time
                                      (type: timedelta)
        :param soft: - True (by default), than no more that time available
                       in the event can be scheduled
                     - False, schedule all the request time, but no more than
                       task unscheduled even if that exceed time available
                       in this event considering it's duration and other tasks
                       (type: bool)

        :return: event_time_available: (type: timedelta)
        :return: task_time_unscheduled: (type: timedelta)
        """

        # INITIALIZATION

        # Minimal duration task schedule can be splitted into
        min_split = timedelta(minutes=20)
        # Unpack
        time_available = self.time_available()

        # If no desired time passed
        if time is None:
            # Consider all the unscheduled time of the task
            time = task.time_unscheduled

        # If how much time to schedule is passed
        else:
            # Limit it with total unscheduled time of the task
            time = min(time, task.time_unscheduled)

        # If what we are going to schedule is zero
        if time == timedelta(0):
            # Let's call it a day
            return time_available, task.time_unscheduled,

        # If soft mode
        if soft:
            # If event don't have available time
            if time_available <= timedelta(0):
                # Don't bather =)
                return time_available, task.time_unscheduled,

            # If Event free time not enough for the whole task or to split it
            if time_available < time and time_available < min_split:
                # Don't schedule
                return time_available, task.time_unscheduled,

            # If we can split task into to sub-tasks of at least minimal size
            if time_available < time and time > 2 * min_split:

                # If, given we take whole available time for the first sub-task
                # and the second sub-task will be longer than minimal duration
                if task.time_unscheduled - time_available > min_split:
                    # Go for it
                    time = time_available

                # Otherwise, cut the second sub-task to be at least minimal
                # and schedule all rest to this event
                else:
                    # In this case we schedule to this even less enough time
                    # to leave next task equal to minimal duration
                    time = task.time_unscheduled - min_split

        # Creating a record or updating existing one
        record, new = Time.objects.get_or_create(event=self, task=task)
        record.duration += time
        record.order = self.order_next if new else record.order
        record.save()

        return time_available - time, task.time_unscheduled,

    def append_tasks(self, tasks, time_want_to_schedule: timedelta = None,
                     soft: bool = True):

        # If we got a single task
        if type(tasks) == Task:
            self.append_task(tasks,)

        # If we got the list
        if type(tasks) == list and len(tasks) > 0:
            # Run through each task in the list
            for t in tasks:
                # Add it
                self.append_task(t)

    def tasks(self):
        pass

    def straight_up_order(self):
        # Get all the event time records
        time_records = self.time_set.order_by('order')
        time_records_number = len(time_records)

        # If there any records
        if time_records_number > 0:
            # Go through each record
            for i in range(len(time_records)):
                # If time record order value
                # don't correspond its index (int) position
                ti = time_records[i]
                if ti.order != i:
                    # Update it to index
                    ti.order = i
                    ti.save()

class Project(models.Model):
    user_id = models.ForeignKey(
        'auth.User',
        related_name='projects',
        on_delete=models.CASCADE)

    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)


class Task(models.Model):
    user_id = models.ForeignKey(
        'auth.User',
        related_name='tasks',
        on_delete=models.CASCADE)

    event_id = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        blank=True,
        null=True)

    project_id = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        blank=True,
        null=True)

    title = models.CharField(max_length=200, default='', blank=True, null=True)
    duration = models.DurationField(default=timedelta(minutes=10))
    complete = models.BooleanField(default=False)
    order = models.FloatField(default=0)
    active = models.BooleanField(default=True)
    pinned = models.BooleanField(default=False, blank=True, null=True)

    def __str__(self):
        return self.title[:15] + ' (%s)' % self.id

    @property
    def activity_id(self):
        return self.event_id.activity_id.id

    @property
    def time_unscheduled(self):
        # By default consider no time scheduled
        scheduled = timedelta(0)

        # Pull this time time schedule records
        time_records = self.time_set.all()
        # If there any
        if len(time_records) > 0:
            # Pull the total scheduled time into 'scheduled'
            scheduled = time_records.aggregate(Sum('duration'))['duration__sum']

        # Compute unscheduled time as 'duration - scheduled' delta
        return self.duration - scheduled


class Time(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    duration = models.DurationField(default=timedelta(0))
    order = models.FloatField(default=0)

    def __str__(self):

        str_params = (
            self.task.title[:15],
            self.task.id,
            self.event.title[:15],
            self.event.id,
            self.duration.seconds,)

        return '%s (%i) => %s (%i) [%i]' % str_params


class GoogleCreds(models.Model):
    """
    Class to store and manage user auth2 Google creds
    """

    # One user can have only one set of creds and vise-versa
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True
    )
    # Google auth2 flow creds. We get those from call-back URI using code
    # provided by google after user confirmed app access to his data
    creds = PickledObjectField(
        blank=True,
        null=True,
        default=None)

    def update_from_creds(self, credentials):
        """
        Save google credential original object for future use

        :param credentials: Google flow credentials

        """
        if credentials is not None:
            self.creds = credentials

    @classmethod
    def get_or_create(cls, user):
        try:
            googlecreds = user.googlecreds
        except:
            googlecreds = GoogleCreds.create(user=user)

        return googlecreds

    @classmethod
    def create(cls, credentials=None, user=None):
        """
        Create GoogleCreds object using provided data
        ATTENTION! Newly created objects requires to be saved via .save()

        :param credentials: Google flow credentials
        :param user: User class instance

        """

        # Create the GoogleCreds instance using parent class method
        google_creds = cls()

        # Add credentials if provided
        if credentials is not None:
            google_creds.creds = credentials

        # Add user, if provided
        if user is not None:
            google_creds.user = user

        return google_creds

    @property
    def oauth2_creds_ready(self):
        """
        Check if credentials initialized at all. If they are, check if
        credentials ready to be used. Refresh if need and if refresh_token
        is defined

        :return: True, if credentials are exists and valid
        """

        if self.creds is None:
            return False

        # If credentials are OK
        if self.creds.valid:
            # Say we're ready
            return True

        # If credentials are Expired
        elif self.creds.expired and self.creds.refresh_token is not None:

            # Rerequest them from Google
            self.creds.refresh(Request())
            self.save()

            # Say we're ready
            return True

        # Creds aren't OK, but refresh isn't enough so far...
        return False

    @property
    def oauth2_creds(self):
        """
        :return: Instance of Google Flow credential to communicate
                 with Google API
        """

        if self.oauth2_creds_ready:
            return self.creds

        return None

    @property
    def oauth2_authorization_url(self):
        """
        If Google flow auth2 credential need to be generated from the scratch,
        provide the user redirect url to move user to, to confirm app access
        to his data

        :return: - Google Authorization url (str), if it was pulled from Google
                   for this user successfully
                 - None if something went wrong
        """

        # Build the Google Oauth2 Flow instance
        flow = InstalledAppFlow.from_client_config(FLOW_CRED_JSON, SCOPES)
        # Initialize it for the authorization URL request
        flow.authorization_url(
            access_type='offline',
            prompt='consent',
            approval_prompt='force',
            # Enable incremental authorization.
            include_granted_scopes='true')

        # Fill in the redirect URL parameter
        flow.redirect_uri = GAUTH_REDIRECT_URI

        # Get the authorization URL and fresh reds
        authorization_url, code = flow.authorization_url()

        if code:
            return authorization_url
        else:
            return None
