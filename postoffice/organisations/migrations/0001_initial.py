# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2016-12-14 20:32
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sites', '0002_alter_domain_unique'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organisation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('is_active', models.BooleanField(default=True)),
                ('is_locked', models.BooleanField(default=False)),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('modified', models.DateTimeField(blank=True, null=True)),
                ('site', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='sites.Site')),
            ],
        ),
        migrations.CreateModel(
            name='OrganisationMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, unique=True, verbose_name='UUID')),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('modified', models.DateTimeField(blank=True, null=True)),
                ('organisation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='organisations.Organisation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='OrganisationSite',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organisation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='organisations.Organisation')),
                ('site', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='sites.Site')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='organisationmember',
            unique_together=set([('user', 'organisation')]),
        ),
    ]