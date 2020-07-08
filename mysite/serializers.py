from rest_framework import serializers
from mysite.models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'user_id', 'event_id', 'project_id',
                  'title', 'duration', 'complete', 'order', 'active']


