from django.test import TestCase, tag
from django.contrib.auth.models import User
from mysite.models import Activity, Event, Task, Project, GoogleCreds, Time
from datetime import datetime, timedelta
from mysite import tasks_operation
from django.utils.timezone import make_aware, make_naive

@tag('complete')
class GoogleCredsTestCase(TestCase):
    def setUp(self):
        user, just_created = User.objects.get_or_create(username="John Snow")
        GoogleCreds.objects.get_or_create(user=user)

    def test_uninitialized_creds_unready(self):
        user = User.objects.get(username="John Snow")
        self.assertFalse(user.googlecreds.oauth2_creds_ready)


@tag('complete')
class RedistributeTestCase(TestCase):

    def setUp(self):

        # Create the test user
        user, just_created = User.objects.get_or_create(username="John Snow")
        self.user = user

        # Create the test activity, which is Primary key for Events
        activity = Activity.objects.create(
            user_id=user,
            title="Morning routine")

        # Create the test events, which are Primary keys for Tasks
        self.events = []
        day = timedelta(days=1)
        now = make_aware(datetime.now())

        # Default event Create parameters
        def_event_params = {
            "user_id": user,
            "activity_id": activity,
            "title": "Morning routine",
            # "start": make_aware(datetime.now()),
            "duration": timedelta(minutes=7)
        }

        self.events.extend([
            Event.objects.create(**def_event_params, start=now + day * 0)])
        self.events.extend([
            Event.objects.create(**def_event_params, start=now + day * 1)])
        self.events.extend([
            Event.objects.create(**def_event_params, start=now + day * 2)])
        self.events.extend([
            Event.objects.create(**def_event_params, start=now + day * 3)])

        # Create the test tasks list, to test redistribution
        self.tasks = []
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Brush my teeth",
            duration=timedelta(minutes=10),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Go for a walk",
            duration=timedelta(minutes=20),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Save the world",
            duration=timedelta(minutes=120),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Drink a cup of coffee",
            duration=timedelta(minutes=10),
        )])


    def test_redistribute_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters
        # - Event: 7 min
        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1])
        # Assessing
        e1_tasks = e1.scheduled_tasks
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)
        self.assertIn(t3, e1.scheduled_tasks)
        self.assertIn(t4, e1.scheduled_tasks)

    def test_redistribute_02(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=10)
        e2.duration = timedelta(minutes=30)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2])
        # Assessing
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e2.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t4, e2.scheduled_tasks)

    def test_redistribute_03(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=10)
        e2.duration = timedelta(minutes=15)
        e3.duration = timedelta(minutes=40)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2, e3])
        # Assessing
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e3.scheduled_tasks)
        self.assertIn(t3, e3.scheduled_tasks)
        self.assertIn(t4, e3.scheduled_tasks)

    def test_redistribute_04(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=40)
        e2.duration = timedelta(minutes=30)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2])
        # Assessing
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t4, e2.scheduled_tasks)
        self.assertEqual(e1.time_available().seconds, 600)

    def test_redistribute_04(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=40)
        e2.duration = timedelta(minutes=180)
        # Move all the tasks 4-th event, since we're working with 1 and 2 here
        e4.append_task(t1)
        e4.append_task(t2)
        e4.append_task(t3)
        e4.append_task(t4)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3], [e1, e2])

        # Assessing tasks distribution
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)

        # Assessing time_available estimations
        self.assertEqual(e1.time_available().seconds, 600)
        self.assertEqual(e2.time_available().seconds, 3600)

    def test_redistribute_05(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=180)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2])

        # Assessing tasks distribution
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)
        self.assertIn(t3, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t4, e2.scheduled_tasks)

        # Assessing time_available estimations
        self.assertEqual(e1.time_available().seconds, 0)
        self.assertEqual(e2.time_available().seconds, 5400)

    def test_redistribute_06(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=60)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2, e3])

        # Assessing tasks distribution
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)
        self.assertIn(t3, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t3, e3.scheduled_tasks)
        self.assertIn(t4, e3.scheduled_tasks)

        # Assessing time_available estimations
        self.assertEqual(e1.time_available().seconds, 0)
        self.assertEqual(e2.time_available().seconds, 0)
        self.assertEqual(e3.time_available().seconds, 600)

    def test_redistribute_07(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=40)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=70)
        e4.duration = timedelta(minutes=40)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        tasks_operation.redistribute([t1, t2, t3, t4], [e1, e2, e3, e4])

        # Assessing tasks distribution
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)

        self.assertNotIn(t3, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t3, e3.scheduled_tasks)
        self.assertIn(t3, e4.scheduled_tasks)
        self.assertIn(t4, e4.scheduled_tasks)

        # Assessing time_available estimations
        self.assertEqual(e1.time_available(), timedelta(minutes=10))
        self.assertEqual(e2.time_available(), timedelta(minutes=0))
        self.assertEqual(e3.time_available(), timedelta(minutes=10))
        self.assertEqual(e4.time_available(), timedelta(minutes=10))


    def test_tasks_to_events_sync_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        # Unpacking class parameters
        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # Tuning

        # - Events durations:
        e1.duration = timedelta(minutes=40)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=70)
        e4.duration = timedelta(minutes=40)
        # Save all
        for e in (e1, e2, e3, e4,):
            e.save()


        # - Tasks: 10, 20, 120, 10 minutes (class setUp)
        t4.pinned = True
        t4.save()

        e1.append_task(t1, time=timedelta(minutes=1), soft=False)
        e1.append_task(t2, time=timedelta(minutes=1), soft=False)
        e1.append_task(t3, time=timedelta(minutes=1), soft=False)
        e1.append_task(t4, time=timedelta(minutes=1), soft=False)

        # TESTING

        # Running
        tasks_operation.tasks_to_events_sync(self.user)

        # Assessing tasks distribution
        self.assertIn(t1, e1.scheduled_tasks)
        self.assertIn(t2, e1.scheduled_tasks)

        self.assertNotIn(t3, e1.scheduled_tasks)
        self.assertIn(t3, e2.scheduled_tasks)
        self.assertIn(t3, e3.scheduled_tasks)
        self.assertIn(t3, e4.scheduled_tasks)
        self.assertNotIn(t4, e4.scheduled_tasks)

        # Assessing time_available estimations
        self.assertEqual(e1.time_available(), timedelta(minutes=9))
        self.assertEqual(e2.time_available(), timedelta(minutes=0))
        self.assertEqual(e3.time_available(), timedelta(minutes=10))
        self.assertEqual(e4.time_available(), timedelta(minutes=20))

    def test_tasks_to_events_sync_02(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        u = User.objects.create(username='Tirion')

        # TESTING

        tasks_operation.tasks_to_events_sync(u)

class EventTestCase(TestCase):

    def setUp(self):

        # Create the test user
        user, just_created = User.objects.get_or_create(username="John Snow")
        self.user = user

        # Create the test activity, which is Primary key for Events
        activity = Activity.objects.create(
            user_id=user,
            title="Morning routine")

        # Create the test events, which are Primary keys for Tasks
        self.events = []

        # Default event Create parameters
        def_event_params = {
            "user_id": user,
            "activity_id": activity,
            "title": "Morning routine",
            "start": make_aware(datetime.now()),
            "duration": timedelta(minutes=7)
        }

        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])

        # Create the test tasks list, to test redistribution
        self.tasks = []
        self.tasks.extend([Task.objects.create(
            user_id=user,
            title="Brush my teeth",
            duration=timedelta(minutes=10),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            title="Go for a walk",
            duration=timedelta(minutes=20),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            title="Save the world",
            duration=timedelta(minutes=120),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            title="Drink a cup of coffee",
            duration=timedelta(minutes=10),
        )])


    def test_time_availabe_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters
        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=50)
        # - Tasks: 10, 20, 120, 10 minutes (class setUp)
        t4.pinned = True
        t4.save()

        # TESTING

        # Running
        Time.objects.get_or_create(event=e1, task=t1, duration=t1.duration)
        Time.objects.get_or_create(event=e1, task=t2, duration=t2.duration)
        Time.objects.get_or_create(event=e1, task=t4, duration=t4.duration)
        Time.objects.get_or_create(event=e2, task=t3, duration=t3.duration)

        # Assessing
        self.assertEqual(e1.time_available(pin_only=True).seconds, 3600)
        self.assertEqual(e2.time_available(pin_only=True).seconds, 2400)
        self.assertEqual(e3.time_available(pin_only=True).seconds, 3000)

    def test_time_availabe_02(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters
        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=50)
        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Running
        Time.objects.get_or_create(event=e1, task=t1, duration=t1.duration)
        Time.objects.get_or_create(event=e1, task=t2, duration=t2.duration)
        Time.objects.get_or_create(event=e2, task=t3, duration=t3.duration)

        # Assessing
        self.assertEqual(e1.time_available(), timedelta(minutes=40))
        self.assertEqual(e2.time_available(), -timedelta(minutes=80))
        self.assertEqual(e3.time_available(), timedelta(minutes=50))

    def test_append_task_01(self):


        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters

        # - Events durations:
        e1.duration = timedelta(minutes=70)
        for e in (e1, e2, e3, e4,):
            e.save()

        # - Tasks: 10, 20, 120, 10 minutes (class setUp)

        # TESTING

        # Preliminary assessing
        self.assertEqual(e1.time_available(), timedelta(minutes=70))
        self.assertEqual(t1.time_unscheduled, timedelta(minutes=10))

        # Running
        event_time_available, task_time_unschedule = e1.append_task(t1)

        # Assessing after run
        self.assertEqual(event_time_available, timedelta(minutes=60))
        self.assertEqual(task_time_unschedule, timedelta(minutes=0))
        self.assertEqual(e1.time_available(), timedelta(minutes=60))
        self.assertEqual(t1.time_unscheduled, timedelta(minutes=0))

    def test_append_task_02(self):


        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters

        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=30)
        for e in (e1, e2, e3, e4,):
            e.save()

        # - Tasks: 10, 20, 120, 10 minutes (class setUp)
        for t in (t1, t2, t3, t4,):
            t.save()

        # TESTING

        # Preliminary assessing
        self.assertEqual(e1.time_available().seconds, 70 * 60)
        self.assertEqual(t1.time_unscheduled.seconds, 10 * 60)
        self.assertEqual(e2.time_available().seconds, 30 * 60)

        # Running - step #1
        e1.append_task(t1)

        # Assessing after run step #1
        self.assertEqual(e1.time_available().seconds, 60 * 60)
        self.assertEqual(t1.time_unscheduled.seconds, 0 * 60)
        self.assertEqual(e2.time_available().seconds, 30 * 60)

        # Running - step #2
        e2.append_task(t1)

        # Assessing after run step #2
        self.assertEqual(e1.time_available().seconds, 60 * 60)
        self.assertEqual(e2.time_available().seconds, 30 * 60)
        self.assertEqual(t1.time_unscheduled.seconds, 0 * 60)

    def test_straight_up_order_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters

        # TESTING

        e1.straight_up_order()

    def test_straight_up_order_02(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        e1.duration = timedelta(hours=5)
        e1.append_tasks([t1, t2, t3, t4])

        Time.objects.filter(id=1).update(order=-1)
        Time.objects.filter(id=3).update(order=-0.1)
        Time.objects.filter(id=2).update(order=0)
        Time.objects.filter(id=4).update(order=17)

        # TESTING

        e1.straight_up_order()

        self.assertEqual(t1.time_set.all().first().order, 0)
        self.assertEqual(t3.time_set.all().first().order, 1)
        self.assertEqual(t2.time_set.all().first().order, 2)
        self.assertEqual(t4.time_set.all().first().order, 3)

class TaskTestCase(TestCase):

    def setUp(self):

        # Create the test user
        user, just_created = User.objects.get_or_create(username="John Snow")

        # Create the test activity, which is Primary key for Events
        activity = Activity.objects.create(
            user_id=user,
            title="Morning routine")

        # Create the test events, which are Primary keys for Tasks
        self.events = []

        # Default event Create parameters
        def_event_params = {
            "user_id": user,
            "activity_id": activity,
            "title": "Morning routine",
            "start": make_aware(datetime.now()),
            "duration": timedelta(minutes=7)
        }

        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])
        self.events.extend([Event.objects.create(**def_event_params)])

        # Create the test tasks list, to test redistribution
        self.tasks = []
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Brush my teeth",
            duration=timedelta(minutes=10),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Go for a walk",
            duration=timedelta(minutes=20),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Save the world",
            duration=timedelta(minutes=120),
        )])
        self.tasks.extend([Task.objects.create(
            user_id=user,
            event_id=self.events[0],
            title="Drink a cup of coffee",
            duration=timedelta(minutes=10),
        )])

    def test_time_unscheduled_01(self):


        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        (e1, e2, e3, e4,) = self.events
        (t1, t2, t3, t4,) = self.tasks

        # No tuning - use default class setUp parameters

        # - Events durations:
        e1.duration = timedelta(minutes=70)
        e2.duration = timedelta(minutes=40)
        e3.duration = timedelta(minutes=50)
        for e in (e1, e2, e3):
            e.save()

        # - Tasks: 10, 20, 120, 10 minutes (class setUp)
        t3.duration = timedelta(minutes=120)
        for t in (t1, t2, t3, t4,):
            t.save()

        # TESTING

        # Running
        Time.objects.get_or_create(task=t1, event=e1, duration=t1.duration)
        Time.objects.get_or_create(task=t2, event=e1, duration=t2.duration / 2)
        Time.objects.get_or_create(task=t3, event=e2, duration=e2.duration)
        Time.objects.get_or_create(task=t3, event=e3, duration=e3.duration)

        # Assessing
        self.assertEqual(t1.time_unscheduled.seconds, 0)
        self.assertEqual(t2.time_unscheduled.seconds, 600)
        self.assertEqual(t3.time_unscheduled.seconds, 1800)

class ActivityTestCase(TestCase):

    def setUp(self):

        # Create the test users

        user1, just_created = User.objects.get_or_create(username="John S.")
        user2, just_created = User.objects.get_or_create(username="Daenerys T.")

        # Create the test activities

        activity1 = Activity.objects.create(
            user_id=user1,
            title="Morning routine")

        activity2 = Activity.objects.create(
            user_id=user1,
            title="Exercises")

        activity3 = Activity.objects.create(
            user_id=user2,
            title="Morning routine")

        # TEST EVENTS

        # User 1

        # Activity 1

        now = make_aware(datetime.now())
        day = timedelta(days=1)

        def_event_params = {
            "user_id": user1,
            "activity_id": activity1,
            "title": "Morning routine",
            "duration": timedelta(minutes=7)
        }
        Event.objects.create(**def_event_params, start=now)
        Event.objects.create(**def_event_params, start=now + 1 * day)
        Event.objects.create(**def_event_params, start=now + 2 * day)

        # Activity 2
        def_event_params['title'] = "Exercises"
        def_event_params['activity_id'] = activity2
        def_event_params['active'] = False
        Event.objects.create(**def_event_params, start=now + 3 * day)

        # User 2

        # Default event Create parameters
        def_event_params = {
            "user_id": user2,
            "activity_id": activity3,
            "title": "Morning routine",
            "duration": timedelta(minutes=7)
        }
        Event.objects.create(**def_event_params, start=now + 4 * day)

        # TASKS

        task_params={}
        task_params['user_id'] = user1

        task_params['title'] = "Brush my teeth"
        task_params['duration'] = timedelta(minutes=10)
        Task.objects.create(**task_params)

        task_params['title'] = "Go for a walk"
        task_params['duration'] = timedelta(minutes=20)
        Task.objects.create(**task_params)

        task_params['title'] = "Save the world"
        task_params['duration'] = timedelta(minutes=120)
        Task.objects.create(**task_params)

        task_params['title'] = "Drink a cup of coffee"
        task_params['duration'] = timedelta(minutes=10)
        Task.objects.create(**task_params)

        task_params['title'] = "Wave sword a bit"
        task_params['duration'] = timedelta(minutes=30)
        Task.objects.create(**task_params)

        task_params['user_id'] = user2

        task_params['title'] = "Kiss the dragon"
        task_params['duration'] = timedelta(minutes=10)
        Task.objects.create(**task_params)



    def test_ongoing_by_user_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        e1, e2, e3, e4, e5 = Event.objects.all()
        t1, t2, t3, t4, t5, t6 = Task.objects.all()
        a1, a2, a3 = Activity.objects.all()
        u1, u2 = User.objects.all()

        # Assign tasks to events
        # - Events durations:
        e1.append_task(t1, soft=False)
        e1.append_task(t2, soft=False)
        e2.append_task(t3, soft=False)  # (inactive event)
        e3.append_task(t4, soft=False)
        e4.append_task(t5, soft=False)
        e5.append_task(t6, soft=False)

        # TESTING

        u1_activities = Activity.ongoing_by_user(u1)

        # Assessing
        self.assertIn(a1, u1_activities)
        self.assertNotIn(a2, u1_activities)


    def test_tasks_01(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        e1, e2, e3, e4, e5 = Event.objects.all()
        t1, t2, t3, t4, t5, t6 = Task.objects.all()
        a1, a2, a3 = Activity.objects.all()
        u1, u2 = User.objects.all()

        # Assign tasks to events
        # - Events durations:
        e1.append_task(t1, time=timedelta(10), soft=False)

        # TESTING

        tasks = a1.tasks_ongoing

        # Assessing
        self.assertIn(t1, tasks)

    def test_tasks_02(self):

        # ADDITIONAL INITIALIZATION & PARAMS TUNING

        e1, e2, e3, e4, e5 = Event.objects.all()
        t1, t2, t3, t4, t5, t6 = Task.objects.all()
        a1, a2, a3 = Activity.objects.all()
        u1, u2 = User.objects.all()

        # Assign tasks to events
        # - Events durations:
        e1.append_task(t1, time=timedelta(10), soft=False)
        e1.append_task(t2, time=timedelta(10), soft=False)
        e1.append_task(t3, time=timedelta(10), soft=False)

        e2.append_task(t3, time=timedelta(10), soft=False)
        e2.append_task(t5, time=timedelta(10), soft=False)

        e3.append_task(t4, time=timedelta(20), soft=False)
        e3.append_task(t1, time=timedelta(10), soft=False)
        e3.append_task(t5, time=timedelta(10), soft=False)

        # TESTING

        tasks = a1.tasks_ongoing

        # Assessing
        self.assertEqual(tasks, [t1, t2, t3, t5, t4])



def main():
    pass

if __name__ == '__main__':
    main()

