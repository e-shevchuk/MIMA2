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

    # Cycle parameters

    # Task time to try to schedule during particular cycle iteration
    time_left_to_schedule = timedelta(0)
    # Way of scheduling a task time during iteration
    soft = True

    # Unbind all the provided tasks from their respective events
    for t in tasks:
        t.time_set.all().delete()

    # REDISTRIBUTION

    # For each task
    while task_index < tasks_length and event_index < events_length:
        # Shorten cycle objects names
        task, event = tasks[task_index], events[event_index]

        # It is 1st iteration or we scheduled previous iteration task completely
        if time_left_to_schedule == timedelta(0):
            # Pull the time to Schedule from the task of "this iteration"
            time_left_to_schedule = task.time_unscheduled

        # Schedule the current task to active event
        event_time_available, time_left_to_schedule = \
            event.append_task(task=task, soft=soft, time=time_left_to_schedule)

        # If we Scheduled this task time entirely
        if time_left_to_schedule == timedelta(0):
            # Get ready to schedule the next
            task_index += 1

        # If something left of this task to schedule
        else:
            # If it is the last event in the list
            if event_index == events_length - 1:
                # Turn off "soft mode" to schedule tasks to this event
                # with not concert of its capacity on next iterations
                soft = False

            # If there are more events to try to schedule this task
            else:
                # Straight-up order values for time records in current event
                # and get ready to process the next one
                event.straight_up_order()
                event_index += 1

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

        # Redistributing tasks
        redistribute(tasks_redistr, events_redistr)


def test():
    print("I'm test = ). I'm small, but cool!!!")