# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-15 19:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('articles', '0001_initial'),
        ('topics', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='topic',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='topics.Topic'),
        ),
        migrations.AlterUniqueTogether(
            name='author',
            unique_together=set([('article', 'user')]),
        ),
        migrations.AlterIndexTogether(
            name='article',
            index_together=set([('status', 'published', 'unpublished'), ('slug', 'published')]),
        ),
    ]
