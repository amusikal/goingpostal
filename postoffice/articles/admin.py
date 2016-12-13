from django.contrib import admin
from .models import Article


class RelatedEntryInlineAdmin(admin.TabularInline):
    model = Article


class ArticleAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': (
            'title',
            'slug',
            'content'
            )}),
        ('Publication', {'fields': (
            'status',
            'published',
            )}),
        )
    # exclude = (
    #     'related',
    #     'comment_enabled',
    #     'pingback_enabled',
    #     'trackback_enabled',
    #     'lead'
    #     'unpublished',
    #     )

    readonly_fields = (
        'comment_count',
        'pingback_count',
        'trackback_count',
        'created',
        'modified',
        'uuid',
        'published'
        )

admin.site.register(Article, ArticleAdmin)
