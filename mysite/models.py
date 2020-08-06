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

class Settings(models.Model):
    """
    Class to store and manage user auth2 Google creds
    """

    # One user can have only one set of creds and vise-versa
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True
    )
    google = models.BooleanField(default=True, blank=True, null=True)

    @classmethod
    def get_or_create(cls, user):
        try:
            settings = user.settings
        except:
            settings = Settings.create(user=user)

        return settings

    @classmethod
    def create(cls, user):
        """
        Create GoogleCreds object using provided data
        ATTENTION! Newly created objects requires to be saved via .save()

        :param credentials: Google flow credentials
        :param user: User class instance

        """

        # Create the GoogleCreds instance using parent class method
        settings = cls()

        # Add user, if provided
        if user is not None:
            settings.user = user
            settings.save()

            return settings


class Activity(models.Model):
    user_id = models.ForeignKey(
        'auth.User',
        related_name='activities',
        on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title + ' (%s)' % self.id


class Event(models.Model):
    user = models.ForeignKey('auth.User', related_name='events',
                             on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE)
    next = models.ForeignKey('self', on_delete=models.SET_NULL, null=True,
                             related_name='event_prev', blank=True)
    prev = models.ForeignKey('self', on_delete=models.SET_NULL, null=True,
                             related_name='event_next', blank=True)

    google_calendar_id = models.CharField(max_length=200, default='')
    title = models.CharField(max_length=200, default='')
    start = models.DateTimeField(default=timezone.now)
    duration = models.DurationField(default=timedelta(minutes=30))


class Project(models.Model):
    user_id = models.ForeignKey('auth.User', related_name='projects',
        on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

class Task(models.Model):

    user_id = models.ForeignKey('auth.User', related_name='tasks',
        on_delete=models.CASCADE)

    project = models.ForeignKey(Project, on_delete=models.SET_NULL,
        blank=True, null=True)

    title = models.CharField(max_length=200, default='', blank=True, null=True)
    pinned = models.BooleanField(default=False, blank=True, null=True)
    complete = models.BooleanField(default=False)
    duration = models.DurationField(default=timedelta(minutes=10))

    def __str__(self):
        return self.title[:15] + ' (%s)' % self.id

class Time(models.Model):
    next = models.ForeignKey('self', on_delete=models.SET_NULL, null=True,
                             related_name='event_prev', blank=True)
    prev = models.ForeignKey('self', on_delete=models.SET_NULL, null=True,
                             related_name='event_next', blank=True)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, blank=True, null=True)
    duration = models.DurationField(default=timedelta(0))
    complete = models.BooleanField(default=False)

    def __str__(self):

        event_title = self.event.title[:15] if self.event else ''
        event_id = self.event.id if self.event else ''
        event_duration = self.duration.seconds if self.event else ''

        str_params = (
            str(self.id),
            self.task.title[:15],
            str(self.task.id),
            event_title,
            str(event_id),
            str(event_duration),
        )

        return '(ID: %s) %s (%s) => %s (%s) [%s]' % str_params


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
