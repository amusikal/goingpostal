from django.contrib import admin
from .models import Organisation
from .models import OrganisationMember
from .models import OrganisationSite


class OrganisationMemberInline(admin.TabularInline):
    model = OrganisationMember
    readonly_fields = ('created', 'modified', 'uuid')
    raw_id_fields = ('user', )


class OrganisationSiteInline(admin.TabularInline):
    model = OrganisationSite
    raw_id_fields = ('site', )


class OrganisationAdmin(admin.ModelAdmin):
    raw_id_fields = ('site', )
    readonly_fields = ('created', 'modified', 'uuid')
    inlines = [OrganisationMemberInline]


class OrganisationMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'organisation', 'created', 'modified')


admin.site.register(Organisation, OrganisationAdmin)
admin.site.register(OrganisationMember, OrganisationMemberAdmin)
