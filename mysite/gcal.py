from __future__ import print_function
import datetime
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from mysite.models import Activity, Event, Task, Project, GoogleCreds

import json
from django.contrib.auth.models import User

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
GAUTH_REDIRECT_URI = 'https://mima.f15.dev/gcauth'
CRED_FILE = '/home/eugene/edu/mysite/mysite/credentials.json'
# FLOW_CRED_JSON = json.loads('{"web":{"client_id":"660696621160-m49r93rdh9b7bijnuohscs3js7ibob14.apps.googleusercontent.com","project_id":"quickstart-1591618309373","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"uy981ovVICUtieOI4uqyqokS","redirect_uris":["https://mima.f15.dev/gcauth"]}}')
FLOW_CRED_JSON = json.loads('{"web":{"client_id":"399766475307-5o7r5dbnk4f9oalicl2m51ucpr41ntq0.apps.googleusercontent.com","project_id":"utility-melody-235110","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"4IxQD0oMYyRViQDpYS6N74zo","redirect_uris":["https://mima.f15.dev/gcauth"]}}')
TOKEN_PICKLE = '/home/eugene/edu/mysite/mysite/token.pickle'


def gcal_play():

    return None

def fetch_gcal_auth_creds(code, user):

    # Build instance of Flow
    flow = InstalledAppFlow.from_client_config(FLOW_CRED_JSON, SCOPES)
    # Fill in the redirect URL parameter
    flow.redirect_uri = GAUTH_REDIRECT_URI

    # return False, 'Going to fetch the code: ' + code,
    # Pass Google API the code to get credentials in Flow param "credentials"
    fetch_result = flow.fetch_token(**{'code': code})
    # return False, 'Fetched: ' + str(fetch_result),

    # If fetch failed
    if fetch_result is None:
        # Stop the process & with returned code & error
        return False, 'Fetch failed with code: ' + str(code),

    user_creds = GoogleCreds.create(flow.credentials, user)
    user_creds.save()

    # if user_google_creds.user_id is None:
    #     user_google_creds.user = User(username=str(datetime.now()))
    #     user_google_creds.user.save()

    return True, 'Everything looks more or less fine'
    # # Save the credentials for the next run
    # with open(TOKEN_PICKLE, 'wb') as token:
    #     pickle.dump(flow.credentials, token)
    #     # If all is OK return True and no message
    #     return True, ''

    # If we're here, something have gone wrong
    return False, '',

# def get_gcal_creds():
#
#     creds = None
#     # The file token.pickle stores the user's access and refresh tokens, and is
#     # created automatically when the authorization flow completes for the first
#     # time.
#     # TODO: Move this functionality to DB
#     user = User.objects.get(id=1)
#     return user.googlecreds.oauth2
#
#     # If the creds are exist
#     if os.path.exists(TOKEN_PICKLE):
#         # Just pull the existing credstoken.
#         with open(TOKEN_PICKLE, 'rb') as token:
#             creds = pickle.load(token)
#             return creds
#
#     # If there are now creds
#     return None


def rerequest_creds_if_needed(creds):

    # If there are no (valid) credentials available
    # Let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Build the Flow instance
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
            # Get the authorization URL and return it for rerequest
            return (creds, ) + flow.authorization_url()

    # Return empty str if no rerequest is necessary
    return (creds, None, None,)

# def get_google_calendar_auth_credentials():
#     # Getting Google Calendar access credentials
#     creds = get_gcal_creds()
#
#     # Re-request Google Calendar access credentials if needed. If access creds
#     # need to be re-requested altogether with the permission, set creds = None
#     # and form the URL to go beg google for the permission and re-fetch creds
#     creds, rerequest_url, code = rerequest_creds_if_needed(creds)
#
#     # If no creds available
#     if creds is None:
#         # Follow the re-request URL to repeat the authorization
#         return HttpResponseRedirect(rerequest_url)
#
#     return creds
#

def get_google_calendar_events(creds, datetime_min=None):

    data = ''

    service = build('calendar', 'v3', credentials=creds)

    # Call the Calendar API
    if datetime_min is None:
        datetime_min = datetime.datetime.utcnow() - datetime.timedelta(hours=24)

    datetime_min_iso = datetime_min.isoformat() + 'Z' # 'Z' indicates UTC time

    request_params = {
        'calendarId': 'primary',
        'timeMin': datetime_min_iso,
        'maxResults': 50,
        'singleEvents': True,
        'orderBy': 'startTime', }

    events_result = service.events().list(**request_params).execute()
    events = events_result.get('items', [])

    return events