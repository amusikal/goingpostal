import uuid
from django.db import models
from django.conf import settings
from core.models import TimeStamped


class Topic(TimeStamped):

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    organisation = models.ForeignKey('organisations.Organisation')

    uuid = models.UUIDField(
        verbose_name='UUID',
        unique=True,
        default=uuid.uuid4
        )

    class Meta:
        unique_together = (['slug', 'organisation'], )

    def __str__(self):
        return self.name

    @property
    def articles(self):
        qs = self.article_set.all()
        return qs


class TopicMember(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    topic = models.ForeignKey(Topic)

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
    created = models.DateTimeField(blank=True, null=True)
    modified = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = (['user', 'topic'], )
