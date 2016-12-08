# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-07 15:36
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('modified', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='TopicMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('modified', models.DateTimeField(blank=True, null=True)),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='topics.Topic')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='topicmember',
            unique_together=set([('user', 'topic')]),
        ),
    ]
