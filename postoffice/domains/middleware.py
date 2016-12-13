import os

from django.conf import settings
from django.contrib.sites.models import Site


def cache_installed():
    return False


def cache_get(*args, **kwargs):
    raise NotImplementedError


def cache_set(*args, **kwargs):
    raise NotImplementedError


def multisite_middleware(get_response):

    def middleware(request):

        site_id = getattr(request, 'site_id', None)

        if request and not site_id:
            site_id = request.session.get('site_id', None)
            if not site_id:

                domain = request.get_host().lower()
                if cache_installed():
                    bits = (settings.CACHE_MIDDLEWARE_KEY_PREFIX, domain)
                    cache_key = '{0}.site_id.{1}'.format(*bits)
                    site_id = cache_get(cache_key)

                if not site_id:
                    try:
                        site = Site.objects.get(domain__iexact=domain)
                    except Site.DoesNotExist:
                        pass
                    else:
                        site_id = site.id
                        if cache_installed():
                            cache_set(cache_key, site_id)

        if not site_id:
            site_id = os.environ.get('MASTER_SITE_ID', settings.SITE_ID)

        if request and site_id and not getattr(settings, 'TESTING', False):
            request.site_id = site_id

        response = get_response(request)
        return response

    return middleware
