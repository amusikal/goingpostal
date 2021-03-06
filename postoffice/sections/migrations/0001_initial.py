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
        ('sites', '0002_alter_domain_unique'),
    ]

    operations = [
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(null=True)),
                ('modified', models.DateTimeField(null=True)),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('site', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='sites.Site')),
            ],
        ),
        migrations.CreateModel(
            name='SectionMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(null=True)),
                ('modified', models.DateTimeField(null=True)),
                ('roles', models.PositiveSmallIntegerField(choices=[(100, 'Owner'), (50, 'Editor'), (30, 'Contributor'), (20, 'Member'), (10, 'Observer')], default=20)),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sections.Section')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='sectionmember',
            unique_together=set([('user', 'section')]),
        ),
        migrations.AlterUniqueTogether(
            name='section',
            unique_together=set([('slug', 'site')]),
        ),
    ]
