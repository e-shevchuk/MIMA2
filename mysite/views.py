# General View libraries
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import dateparse
from mysite.models import Activity, Event, Task, Project, GoogleCreds
from django.views.generic.base import RedirectView
from .tasks_operation import tasks_to_events_sync
from django.contrib.auth import authenticate, login
import django


# Google Calendar code
from .gcal import *

def index(request):


    # SYNCHRONIZING WITH GOOGLE CALENDAR

    # GOOGLE ACCESS CREDENTIALS

    # If user isn't authentificated - get out
    if not request.user.is_authenticated:
        return HttpResponseRedirect("/accounts/login")

    # Initialize google creds for this user
    googlecreds = GoogleCreds.get_or_create(user=request.user)
    googlecreds.save()
    # If creds are fresh enough or can be refreshed and provided
    if request.user.googlecreds.oauth2_creds_ready:
        # Get the fresh creds
        creds = request.user.googlecreds.oauth2_creds

    # Otherwise user have to re-authorise
    else:
        # Get the re-authorization URL
        oauth2_authorization_url = \
            request.user.googlecreds.oauth2_authorization_url
        # If re-authorization URL we is OK
        if oauth2_authorization_url:
            # Go for it!
            return HttpResponseRedirect(oauth2_authorization_url)


    # Get Google Calendar event starting from "now - 24h"
    start_from = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    # Perform the request to google API
    gc_events = get_google_calendar_events(creds, datetime_min=start_from)

    # gc_activity_titles = list({e['summary'] for e in gc_events})

    # Select all unique Google calendar events activity titles
    gc_activity_titles = []
    # Run through all events
    for e in gc_events:
        # If event title ("Summary" in terms of Google Calendar) isn't saved
        if e['summary'] not in gc_activity_titles:
            # Add event title to activities list
            gc_activity_titles.extend([e['summary']])

    # If there any new activities - let's create those,
    # with included events, otherwise just pick them from DB

    # Before pushing new google data into the DB, deactivate all the events
    current_events = Event.objects.filter(user_id=request.user,
                                          start__gte=start_from)
    current_events.update(active=False)

    # Activity "Other" is displayed regardles of it's presence in the calendar
    activities = [Activity.objects.get(title='Other')]
    # Run through all the picked activities titles
    for at in gc_activity_titles:
        # Create this activity in the calendar if necessary
        a, cr = Activity.objects.get_or_create(title=at, user_id=request.user)
        activities.extend([a])
        # Form a list of events for a particular activity title
        at_events = [e for e in gc_events if e['summary'] == at]
        # Run through each event within current activity
        for e in at_events:

            # If this event start has date & time both
            if 'dateTime' in e['start'].keys():

                # Unpack dates
                start = dateparse.parse_datetime(e['start']['dateTime'])
                duration = dateparse.parse_datetime(
                    e['end']['dateTime']) - start

                # Create the event if it doesn't exists
                ie, cr = a.event_set.get_or_create(google_calendar_id = e['id'],
                                                   title=e['summary'],
                                                   user_id=request.user,
                                                   activity_id=a)
                # Update created / update event parameters
                ie.active = True
                ie.start = start
                ie.duration = duration
                ie.save()

    tasks_to_events_sync(request.user)

    # FRONT-END OBJECTS TO DISPLAY

    # Forming context values dictionary for template renderer
    context = {'activities': list(activities),
               'projects': list(Project.objects.all())}

    return render(request, 'index.html', context=context)

# This is the URL that google redirect back to after user auth confirmation
def gcauth(request):

    # We expect the google calendar auth code to be passed in GET
    try:
        # Pull the google auth code out of GET
        auth_code = request.GET['code']
    # If there is now code
    except (KeyError):
        # This is wrong. Don't go further
        # TODO: Make a nice 404 design based page for this error
        return HttpResponse('Authentification error - no code submitted')

    # return HttpResponse("We are going to fetch with code : " + auth_code)

    user = None
    # If user isn't authentificated
    if not request.user.is_authenticated:
        return HttpResponse('Authentification is required:'
                            + '<a href="https://mima.f15.dev/admin"> login</a>')
    else:
        user = request.user

    # Get new creds from Google and save
    fetch_success, msg = fetch_gcal_auth_creds(auth_code, user)

    if not fetch_success:
        return HttpResponse(msg)

    # # DEBUG: Save what we requested into file
    # gcal_fetch_file =\
    #     '/home/eugene/edu/mysite/mysite/fetch_gcal_auth_creds.pickle'
    # with open(gcal_fetch_file, 'wb') as gcal_fetch:
    #     gcal_fetch_val = fetch_success, msg,
    #     pickle.dump(gcal_fetch_val, gcal_fetch)

    # If everything is OK - proceed to the next page to use creds
    return HttpResponseRedirect('https://mima.f15.dev')


# def gcal(request):
#
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
#     # If creds are OK - go index
#     return HttpResponseRedirect('https://mima.f15.dev')

def privacy(request):
    return HttpResponse('It\'s a privacy page')

def policy(request):
    return HttpResponse('It\'s a policy page')

favicon_view = RedirectView.as_view(url='/static/favicon.png', permanent=True)


