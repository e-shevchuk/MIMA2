# Generated by Django 2.2.12 on 2020-07-01 19:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mysite', '0015_auto_20200629_1704'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='pinned',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]
