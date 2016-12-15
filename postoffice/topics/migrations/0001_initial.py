# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-15 19:06
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sections', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(null=True)),
                ('modified', models.DateTimeField(null=True)),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=255)),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sections.Section')),
            ],
        ),
        migrations.CreateModel(
            name='TopicMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('roles', models.PositiveSmallIntegerField(choices=[(100, 'Owner'), (50, 'Editor'), (30, 'Contributor'), (20, 'Member'), (10, 'Observer')], default=20)),
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
        migrations.AlterUniqueTogether(
            name='topic',
            unique_together=set([('slug', 'section')]),
        ),
    ]
