from rest_framework import serializers
from mysite.models import Task, Event, Activity, Project, Time


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'event_id', 'project_id', 'pinned',
                  'title', 'duration', 'complete', 'order', 'active']

    def create(self, validated_data):
        validated_data['user_id'] = self.context['request'].user
        return Task.objects.create(**validated_data)


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'activity_id', 'google_calendar_id',
                  'title', 'feasibility', 'start', 'duration']


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'feasibility']

class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = ['id', 'task', 'event', 'duration', 'order']
