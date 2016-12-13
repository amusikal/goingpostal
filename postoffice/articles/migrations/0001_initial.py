# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-12 15:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=255, unique_for_date='published')),
                ('status', models.IntegerField(choices=[(0, 'draft'), (1, 'hidden'), (2, 'published')], db_index=True, default=0, verbose_name='status')),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('modified', models.DateTimeField(blank=True, null=True)),
                ('published', models.DateTimeField(blank=True, null=True)),
                ('unpublished', models.DateTimeField(blank=True, null=True)),
                ('content', models.TextField(blank=True)),
            ],
            options={
                'get_latest_by': 'published',
                'ordering': ['-published'],
                'abstract': False,
            },
        ),
        migrations.AlterIndexTogether(
            name='article',
            index_together=set([('slug', 'published'), ('status', 'published', 'unpublished')]),
        ),
    ]