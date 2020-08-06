from django.test import TestCase, tag
from django.contrib.auth.models import User
from mysite.models import Activity, Event, Task, Project, GoogleCreds, Time
from datetime import datetime, timedelta
from django.utils.timezone import make_aware, make_naive

@tag('complete')
class GoogleCredsTestCase(TestCase):
    def setUp(self):
        user, just_created = User.objects.get_or_create(username="John Snow")
        GoogleCreds.objects.get_or_create(user=user)

    def test_uninitialized_creds_unready(self):
        user = User.objects.get(username="John Snow")
        self.assertFalse(user.googlecreds.oauth2_creds_ready)



class BaseModelTestCase(TestCase):

    def setUp(self):

        # Create some variable
        self.a = 10

        u = User.objects.get(id=8)
        Activity.objects.filter(user=u).delete()
        Event.objects.filter(user=u).delete()
        Task.objects.filter(user=u).delete()
        Time.objects.filter(user=u).delete()

        now = make_aware(datetime.now())
        day = timedelta(days=1)
        hour = timedelta(hours=1)
        min10 = timedelta(minutes=10)

        # ACTIVITY

        a1 = Activity(user=u, title='WorldTime cafe')
        a1.save()

        # EVENTS

        e1 = Event(user=u, title='WorldTime cafe', start=now+day, activity=a1,
                   duration=hour)

        e2 = Event(user=u, title='WorldTime cafe', start=now+day+2*hour, activity=a1,
                   duration=hour)
        e1.save()
        e2.save()

        e1.next = e2
        e2.prev = e1

        e1.save()
        e2.save()

        # TASKS

        t1 = Task(user=u, title='Listen to music', duration=hour/2,
                  pinned=True, complete=True)
        t2 = Task(user=u, title='Drink a cup a cappuccino', duration=4*min10,
                  pinned=True, complete=True)
        t3 = Task(user=u, title='Make a todo list', duration=min10,
                  pinned=True, complete=True)
        t4 = Task(user=u, title='Produce genius idea', duration=hour+4*min10,
                  pinned=True, complete=True)
        t1.save()
        t2.save()
        t3.save()
        t4.save()

        # TIME RECORDS

        tr1 = Time(user=u, task=t1, event=e1, duration=hour/2, complete=False)
        tr2 = Time(user=u, task=t2, event=e1, duration=hour/2, complete=False)
        tr3 = Time(user=u, task=t2, event=e2, duration=hour/2, complete=False)
        tr4 = Time(user=u, task=t3, event=e2, duration=hour/2, complete=False)
        tr5 = Time(user=u, task=t4, event=e2, duration=hour/2, complete=False)

        tr1.save()
        tr2.save()
        tr3.save()
        tr4.save()
        tr5.save()

        tr1.next = tr2
        tr2.prev = tr1
        tr2.next = tr3
        tr3.prev = tr2
        tr3.next = tr4
        tr4.prev = tr3
        tr4.next = tr5
        tr5.prev = tr4

        tr1.save()
        tr2.save()
        tr3.save()
        tr4.save()
        tr5.save()

    def JusOneTestCase_01(self):

        self.assertEqual(self.a, 10)

def main():
    pass

if __name__ == '__main__':
    main()

