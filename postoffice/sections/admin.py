# Django
from django.contrib import admin

# Local
from .models import Section
from .models import SectionMember


class SectionMemberInline(admin.TabularInline):
    model = SectionMember
    readonly_fields = ('created', 'modified', 'uuid')


class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'site', 'is_public', 'created', 'modified')
    date_hierarchy = 'modified'
    readonly_fields = ('created', 'modified', 'uuid')
    raw_id_fields = ('site', )
    inlines = [SectionMemberInline]


admin.site.register(Section, SectionAdmin)
admin.site.register(SectionMember)
