from django.contrib import admin
from .models import Organisation
from .models import OrganisationMember


class OrganisationMemberInline(admin.TabularInline):
    model = OrganisationMember
    readonly_fields = ('created', 'modified', 'uuid')


class OrganisationAdmin(admin.ModelAdmin):
    readonly_fields = ('created', 'modified', 'uuid')
    inlines = [OrganisationMemberInline]


admin.site.register(Organisation, OrganisationAdmin)
admin.site.register(OrganisationMember)
