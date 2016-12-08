# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-07 15:29
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organisations', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organisation',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID'),
        ),
        migrations.AlterField(
            model_name='organisationmember',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID'),
        ),
        migrations.AlterUniqueTogether(
            name='organisationmember',
            unique_together=set([('user', 'organisation')]),
        ),
    ]
