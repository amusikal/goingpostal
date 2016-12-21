# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-21 09:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sections', '0003_auto_20161221_0852'),
    ]

    operations = [
        migrations.RenameField(
            model_name='sectionmember',
            old_name='roles',
            new_name='role',
        ),
        migrations.AlterField(
            model_name='section',
            name='is_public',
            field=models.BooleanField(default=True, help_text='Is this section visible to all visitors?', verbose_name='public?'),
        ),
    ]
