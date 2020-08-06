from django.test import TestCase, tag
from django.contrib.auth.models import User
from mysite.models import Activity, Event, Task, Project, GoogleCreds, Time

@tag('complete')
class GoogleCredsTestCase(TestCase):
    def setUp(self):
        user, just_created = User.objects.get_or_create(username="John Snow")
        GoogleCreds.objects.get_or_create(user=user)

    def test_uninitialized_creds_unready(self):
        user = User.objects.get(username="John Snow")
        self.assertFalse(user.googlecreds.oauth2_creds_ready)



class JusOneTestCase(TestCase):

    def setUp(self):

        # Create some variable
        self.a = 10

    def JusOneTestCase_01(self):

        self.assertEqual(self.a, 10)

def main():
    pass

if __name__ == '__main__':
    main()

