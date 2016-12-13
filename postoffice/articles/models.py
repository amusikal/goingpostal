import uuid

from django.core.urlresolvers import reverse
from django.db import models
from django.db.models import Q
from django.utils.html import strip_tags
from django.utils.translation import ugettext_lazy as _
from django.utils.html import linebreaks

from core.models import TimeStamped
import django_comments as comments
from django_comments.models import CommentFlag


def html_format(content):
    if '</p>' not in content:
        return linebreaks(content)
    return content


class CoreEntry(models.Model):

    uuid = models.UUIDField(
        verbose_name=_('UUID'),
        default=uuid.uuid4,
        unique=True
        )

    title = models.CharField(
        verbose_name=_('title'),
        max_length=255
        )

    slug = models.SlugField(
        verbose_name=_('slug'),
        max_length=255,
        unique_for_date='published'
        )

    topic = models.ForeignKey('topics.Topic', null=True)

    DRAFT = 0
    HIDDEN = 1
    PUBLISHED = 2
    STATUS_CHOICES = (
        (DRAFT, _('draft')),
        (HIDDEN, _('hidden')),
        (PUBLISHED, _('published'))
        )

    status = models.IntegerField(
        verbose_name=_('status'),
        db_index=True,
        choices=STATUS_CHOICES,
        default=DRAFT
        )

    published = models.DateTimeField(blank=True, null=True)
    unpublished = models.DateTimeField(blank=True, null=True)

    class Meta:
        abstract = True
        ordering = ['-published']
        get_latest_by = 'published'
        index_together = [
            ['slug', 'published'],
            ['status', 'published', 'unpublished']]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('articles.article.detail', kwargs={
            'year': self.created.year,
            'month': self.created.strftime('%m'),
            'slug': self.slug,
            })


class ContentEntry(models.Model):

    content = models.TextField(verbose_name=_('content'), blank=True)

    @property
    def html_content(self):
        """
        Returns the "content" field formatted in HTML.
        """
        return html_format(self.content)

    @property
    def word_count(self):
        """
        Counts the number of words used in the content.
        """
        return len(strip_tags(self.html_content).split())

    class Meta:
        abstract = True


class DiscussionsEntry(models.Model):

    comment_enabled = models.BooleanField(
        _('comments enabled'), default=True,
        help_text=_('Allows comments if checked.'))

    pingback_enabled = models.BooleanField(
        _('pingbacks enabled'), default=True,
        help_text=_('Allows pingbacks if checked.'))

    trackback_enabled = models.BooleanField(
        _('trackbacks enabled'), default=True,
        help_text=_('Allows trackbacks if checked.'))

    comment_count = models.IntegerField(
        _('comment count'), default=0)

    pingback_count = models.IntegerField(
        _('pingback count'), default=0)

    trackback_count = models.IntegerField(
        _('trackback count'), default=0)

    class Meta:
        abstract = True

    @property
    def discussions(self):
        """
        Returns a queryset of the published discussions.
        """
        return comments.get_model().objects.for_model(
            self).filter(is_public=True, is_removed=False)

    @property
    def comments(self):
        """
        Returns a queryset of the published comments.
        """
        return self.discussions.filter(Q(flags=None) | Q(
            flags__flag=CommentFlag.MODERATOR_APPROVAL))

    #@property
    #def pingbacks(self):
    #    """
    #    Returns a queryset of the published pingbacks.
    #    """
    #    return self.discussions.filter(flags__flag=PINGBACK)

    #@property
    #def trackbacks(self):
    #    """
    #    Return a queryset of the published trackbacks.
    #    """
    #    return self.discussions.filter(flags__flag=TRACKBACK)

    #def discussion_is_still_open(self, discussion_type, auto_close_after):
    #    """
    #    Checks if a type of discussion is still open
    #    are a certain number of days.
    #    """
    #    discussion_enabled = getattr(self, discussion_type)
    #    if (discussion_enabled and isinstance(auto_close_after, int) and
    #            auto_close_after >= 0):
    #        return (timezone.now() - (
    #            self.start_publication or self.publication_date)).days < \
    #            auto_close_after
    #    return discussion_enabled

    #@property
    #def comments_are_open(self):
    #    """
    #    Checks if the comments are open with the
    #    AUTO_CLOSE_COMMENTS_AFTER setting.
    #    """
    #    return self.discussion_is_still_open(
    #        'comment_enabled', AUTO_CLOSE_COMMENTS_AFTER)

    #@property
    #def pingbacks_are_open(self):
    #    """
    #    Checks if the pingbacks are open with the
    #    AUTO_CLOSE_PINGBACKS_AFTER setting.
    #    """
    #    return self.discussion_is_still_open(
    #        'pingback_enabled', AUTO_CLOSE_PINGBACKS_AFTER)

    #@property
    #def trackbacks_are_open(self):
    #    """
    #    Checks if the trackbacks are open with the
    #    AUTO_CLOSE_TRACKBACKS_AFTER setting.
    #    """
    #    return self.discussion_is_still_open(
    #        'trackback_enabled', AUTO_CLOSE_TRACKBACKS_AFTER)


class RelatedEntry(models.Model):
    """Abstract model class for making manual relations between the differents entries."""

    related = models.ManyToManyField(
        'self',
        blank=True,
        verbose_name=_('related entries'))

    class Meta:
        abstract = True

    # @property
    # def related_published(self):
    #     """
    #     Returns only related entries published.
    #     """
    #     return entries_published(self.related)


class LeadEntry(models.Model):
    """
    Abstract model class providing a lead content to the entries.
    """
    lead = models.TextField(
        verbose_name=_('lead'),
        blank=True,
        help_text=_('Lead paragraph')
        )

    @property
    def html_lead(self):
        """
        Returns the "lead" field formatted in HTML.
        """
        return html_format(self.lead)

    class Meta:
        abstract = True


class AbstractArticle(
        CoreEntry,
        ContentEntry,
        DiscussionsEntry,
        RelatedEntry,
        LeadEntry,
        TimeStamped):

    class Meta(CoreEntry.Meta):
        abstract = True
        verbose_name = _('article')
        verbose_name_plural = _('articles')


class Article(AbstractArticle):
    pass
