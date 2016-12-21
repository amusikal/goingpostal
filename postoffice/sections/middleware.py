import logging

from .models import Section
from django.db.models import Q


logger = logging.getLogger(__name__)


def sections_for_site_user(site, user):
    sections = Section.objects.filter(site=site)
    if user.is_authenticated():
        sections = sections.distinct().filter(
            Q(is_public=True) | Q(sectionmember__user=user)
            )
    else:
        sections = sections.filter(is_public=True)

    return sections


def site_sections_middleware(get_response):

    def middleware(request):

        site = getattr(request, 'site_id', None)

        # Bug out early if nothing to do.
        if not site:
            logger.debug('Unable to get site_id.')
            return get_response(request)
        logger.debug('Got request.site_id: {}'.format(site))

        sections = sections_for_site_user(site, request.user)
        logger.debug('Got sections: {}'.format(sections))

        request.sections = sections
        response = get_response(request)
        return response

    return middleware
