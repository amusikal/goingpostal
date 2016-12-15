# Django
from django.contrib import admin

# Local
from .models import Topic
from .models import TopicMember


class TopicMemberInline(admin.TabularInline):
    model = TopicMember
    readonly_fields = ('created', 'modified', 'uuid')


class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'created', 'modified')
    date_hierarchy = 'modified'
    readonly_fields = ('created', 'modified', 'uuid')
    # inlines = [TopicMemberInline]


admin.site.register(Topic, TopicAdmin)
# admin.site.register(TopicMember)
