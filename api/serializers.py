from rest_framework import serializers
from mysite.models import Task, Event, Activity, Project, Time, Settings


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'prev', 'next', 'activity', 'google_calendar_id',
                  'title', 'start', 'duration']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'pinned', 'duration', 'complete']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Task.objects.create(**validated_data)

class TimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Time
        fields = ['id', 'task', 'event', 'prev', 'next', 'duration', 'complete']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Time.objects.create(**validated_data)

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = ['id', 'code', 'title', 'value']

