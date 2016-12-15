# Standard Library
import uuid

# Django
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models

# Project
from core.models import TimeStamped


class Section(TimeStamped):

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    site = models.ForeignKey('sites.Site', null=True)
    uuid = models.UUIDField(
        verbose_name='UUID',
        unique=True,
        default=uuid.uuid4
        )

    class Meta:
        unique_together = (['slug', 'site'], )

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('sections.section.detail', kwargs={'slug': self.slug})


class SectionMember(TimeStamped):

    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    section = models.ForeignKey(Section)

    ROLE_OWNER = 100
    ROLE_EDITOR = 50
    ROLE_CONTRIBUTOR = 30
    ROLE_MEMBER = 20
    ROLE_OBSERVER = 10
    ROLES = (
        (ROLE_OWNER, 'Owner'),
        (ROLE_EDITOR, 'Editor'),
        (ROLE_CONTRIBUTOR, 'Contributor'),
        (ROLE_MEMBER, 'Member'),
        (ROLE_OBSERVER, 'Observer'),
        )
    roles = models.PositiveSmallIntegerField(
        choices=ROLES,
        default=ROLE_MEMBER
        )

    uuid = models.UUIDField(
        verbose_name='UUID',
        unique=True,
        default=uuid.uuid4
        )

    class Meta:
        unique_together = (['user', 'section'], )
