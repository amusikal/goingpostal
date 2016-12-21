# Django
from django.contrib import admin

# Local
from .models import Article
from .models import Author


class RelatedEntryInlineAdmin(admin.TabularInline):
    model = Article


class AuthorInlineAdmin(admin.TabularInline):
    model = Author


class ArticleAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': (
            'title',
            'slug',
            'content'
            )}),
        ('Publication', {'fields': (
            'status',
            'topic',
            'published',
            )}),
        ('Metadata', {
            'fields': (
                'created',
                'modified',
                'uuid',
                ),
            'classes': ('collapse', )
            }),
        )
    # exclude = (
    #     'related',
    #     'comment_enabled',
    #     'pingback_enabled',
    #     'trackback_enabled',
    #     'lead'
    #     'unpublished',
    #     )
    raw_id_fields = ('topic', )

    readonly_fields = (
        'comment_count',
        'pingback_count',
        'trackback_count',
        'created',
        'modified',
        'uuid',
        'published'
        )
    inlines = [AuthorInlineAdmin]

admin.site.register(Article, ArticleAdmin)
admin.site.register(Author)
