from datetime import timedelta


class ConsolePrettyPrint(object):
    def __add__(self, arr):
        for e in arr:
            print(e)


cpp = ConsolePrettyPrint()


def soft_time(available, schedule):
    """
    Compute time record duration that can be created within an event
    for a task if we don't want to over-schedule event duration capacity

    :param schedule: <timedelta>: time currently available within a task
    :param available: <timedelta>: duration of a time record we want to create

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
