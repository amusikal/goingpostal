# Standard Library
import uuid

# Django
from django.conf import settings
from django.db import models


class Organisation(models.Model):

    name = models.CharField(max_length=255)

    uuid = models.UUIDField(
        verbose_name='UUID',
        unique=True,
        default=uuid.uuid4
        )

    is_active = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)

    created = models.DateTimeField(blank=True, null=True)
    modified = models.DateTimeField(blank=True, null=True)
    site = models.OneToOneField('sites.Site', null=True)

    def __str__(self):
        return self.name


class OrganisationMember(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    organisation = models.ForeignKey(Organisation)

    uuid = models.UUIDField(
        verbose_name='UUID',
        unique=True,
        default=uuid.uuid4
        )
    created = models.DateTimeField(blank=True, null=True)
    modified = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = (['user', 'organisation'], )


class OrganisationSite(models.Model):
    organisation = models.ForeignKey(Organisation)
    site = models.OneToOneField('sites.Site')
