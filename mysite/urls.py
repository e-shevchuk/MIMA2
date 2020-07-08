# Core django libraries
from django.contrib import admin
from django.urls import path, include, re_path

# Django rest framework
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework.routers import DefaultRouter

# My stuff
from . import views

# Django rest framework urls router activation
router = DefaultRouter()
# router.register(r'tasks', views.TaskViewSet)


urlpatterns = [
    path('frontend/', include('frontend.urls')),
    path('api/', include('api.urls')),
    # path('event_tasks/<int:pk>', views.EventTasksList.as_view()),
    path('gcauth', views.gcauth, name = 'gcauth'),
    # path('gcal', views.gcal, name = 'gcal'),
    path('privacy', views.privacy, name = 'privacy'),
    path('policy', views.policy, name = 'policy'),
    path('favicon.ico', views.favicon_view),
    path('polls/', include('polls.urls')),
    path('admin/', admin.site.urls),
    path('', views.index, name = 'index'),
    path('accounts/profile/', views.index, name = 'index'),
    path('accounts/', include('allauth.urls')),
    path('', include(router.urls)),
]

# urlpatterns = format_suffix_patterns(urlpatterns)