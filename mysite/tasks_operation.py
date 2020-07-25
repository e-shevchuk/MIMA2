from mysite.models import Activity, Event, Task, Project, Time
from datetime import datetime
from datetime import timedelta
from django.contrib.auth.models import User
from django.db.models import Sum, OuterRef
from django.utils.timezone import make_aware, make_naive

class ConsolePrettyPrint(object):
    def __add__(self, arr):
        for e in arr:
            print(e)

cpp = ConsolePrettyPrint()


def activity_tasks(activity):
    # Get the activity events
    events = activity.event_set.order_by('start')

    # Pull the tasks from each activity

    # Start from the blank list
    activity_tasks = []
    # Run through each event
    for e in events:
        # Get all the event unpinned and unfinished tasks,
        # then order those by 'order' field
        tasks = e.task_set.filter(complete=False, pinned=False) \
                .order_by('order')

        # Add the pulled event tasks to the activity list
        activity_tasks.extend(tasks)

    return activity_tasks


def soft_time(available, schedule):
    """
    Compute time record duration that can be created within an event
    for a task if we don't want to over-schedule event duration capacity

    :param   available <timedelta>: time currently available within a task
    :param   schedule <timedelta>: duration of a time record we want to create

    """

    # INITIALIZATION

    # Zero duration
    zero = timedelta(0)
    # minimal task fragment time-record duration
    schedule_min = timedelta(minutes=20)

    # If there is now need to split the task
    if available >= schedule:
        # We're golden
        return schedule

    # If available time is less than minimal allowable duration
    if available < schedule_min:
        # return zero
        return zero

    # If task is too small to be splitted to two minimal duration fragments
    if schedule < schedule_min * 2:
        # return zero
        return zero

    # Compute the second part of a task after a split
    # for it to be at least of minimal duration
    tail = max(schedule_min, schedule - available)

    # Everything that isn't a second part of a task (tail) is it's first part
    return schedule - tail


def redistribute(tasks: list, events: list):
    """
    Redistribute provided tasks within given events in accordance
    with each task duration and time available for tasks in
    events with respect to time taken by pinned tasks already

    :param   tasks: a Query or a list of type Task (should be ordered)
    :param   events: a Query or a list of type Event (should be ordered)

    """

    # INITIALIZATION

    # Compute each list lengths
    tasks_length, events_length = len(tasks), len(events)
    # Define 1-st task & event indices for each list
    task_index, event_index = 0, 0

    # To redistribute tasks within events, we need both. If we don't
    if tasks_length == 0 or events_length == 0:
        return

    # REDISTRIBUTION

    event_time_available = events[0].time_available(pin_only=True)
    time_left_to_schedule = tasks[0].duration

    # For each task
    while task_index < tasks_length and event_index < events_length:
        # Shorten cycle objects names
        task, event = tasks[task_index], events[event_index]

        # SCHEDULING

        time_record = None

        # If it is a last event in the list
        if event_index == events_length - 1:
            # Schedule anyway
            time_record = event.add_task(task, time_left_to_schedule)
            time_left_to_schedule = timedelta(0)

        # Otherwise we do soft scheduling to make sure time records fit
        # event duration
        else:
            # Compute the duration of time records we're going to create
            time = soft_time(event_time_available, time_left_to_schedule)

            # If we can schedule this amount of time to this event
            if time > timedelta(0):
                # Do it
                time_record = event.add_task(task, time)
                event_time_available -= time
                time_left_to_schedule -= time

        # Cleaning tiny hanging tasks

        # If no time record was updated / created and => no task was appended
        if time_record is None:
            # Remove all currently existing time records for these Event & Task
            Time.objects.filter(task=task, event=event).delete()

        # SWITCHING TO A NEXT EVENT / TASK

        # If we scheduled this task time entirely
        if time_left_to_schedule == timedelta(0):
            # Get ready to schedule the next task
            task_index += 1

            # If this isn't last task
            if task_index < tasks_length:
                # Pull next task 'time to schedule'
                time_left_to_schedule = tasks[task_index].duration

        # If something left of this task to schedule - switch the event
        else:
            # Straight time records order up for the current event
            event.straight_up_order()
            # and get ready to process the next one
            event_index += 1

            # Remove Time records for tasks that will be scheduled
            # to next events
            for i in range(task_index+1, tasks_length-1):
                Time.objects.filter(task=tasks[i], event=event).delete()

            # If this isn't last event
            if event_index < events_length:
                # Pull next event 'available time'
                event_time_available = \
                    events[event_index].time_available(pin_only=True)

def tasks_to_events_sync(user):
    """
    To through all the active tasks and re-tie them to now and future events

    :param user: User that this operation should be done for (type: User)
    :return: None
    """

    # INITIALIZATION

    now = make_aware(datetime.now())
    activities = Activity.ongoing_by_user(user)

    # REDISTRIBUTION

    # For each activity
    for a in activities:

        # Get the ordered list of tasks
        tasks_redistr = [t for t in a.tasks_ongoing if not t.pinned]

        # Get the ordered list of events
        events = \
            Event.objects.filter(active=True, user_id=user).order_by('start')
        events_redistr = [e for e in events if e.end > now]

        # Remove the previous events non-complete and not pinned time records
        events_prev = [e for e in events if e.end <= now]
        time_to_clean = Time.objects.filter(event__in=events_prev)
        time_to_clean = time_to_clean.filter(task__in=tasks_redistr)
        time_to_clean.delete()

        # Redistributing tasks
        redistribute(tasks_redistr, events_redistr)


def test():
    print("I'm test = ). I'm small, but cool!!!")