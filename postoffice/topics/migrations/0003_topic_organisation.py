# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-12 16:19
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organisations', '0002_auto_20161207_1529'),
        ('topics', '0002_topicmember_roles'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='organisation',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='organisations.Organisation'),
            preserve_default=False,
        ),
    ]