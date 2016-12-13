from django.db import models
from django.utils import timezone


class TimeStamped(models.Model):
    """
    Provides created and updated timestamps on models.
    """

    class Meta:
        abstract = True

    created = models.DateTimeField(null=True)
    modified = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        self.modified = timezone.now()
        if not self.id:
            self.created = self.modified
        super(TimeStamped, self).save(*args, **kwargs)
