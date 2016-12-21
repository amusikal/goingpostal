# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-19 15:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0003_auto_20161219_1502'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='status',
            field=models.PositiveSmallIntegerField(choices=[(0, 'Archive'), (50, 'Pending'), (100, 'Publish')], default=100),
        ),
    ]