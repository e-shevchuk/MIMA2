from django.urls import path, include
from rest_framework.routers import DefaultRouter

# My stuff
from . import views

# Django rest framework urls router activation
api_router = DefaultRouter()
api_router.register(r'tasks', views.TaskViewSet)
api_router.register(r'time_records', views.TimeViewSet)
api_router.register(r'events', views.EventViewSet)
api_router.register(r'activities', views.ActivityViewSet)
api_router.register(r'settings', views.SettingsViewSet)


urlpatterns = [
    path('', views.index ),
    path('', include(api_router.urls)),
]