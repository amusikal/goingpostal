# Standard Library
import logging

# Django
from django.conf import settings
from django.contrib.sites.models import Site
from django.http import Http404
from django.contrib.sites.shortcuts import get_current_site
from django.http import HttpResponsePermanentRedirect


logger = logging.getLogger(__name__)


def cache_installed():
    return False


def cache_get_site(*args, **kwargs):
    raise NotImplementedError


def cache_set_site(*args, **kwargs):
    raise NotImplementedError


def cache_key_for_domain(domain):
    if not cache_installed():
        return
    bits = (settings.CACHE_MIDDLEWARE_KEY_PREFIX, domain)
    cache_key = '{0}.site.{1}'.format(*bits)
    return cache_key


def get_site_for_domain(domain):
    try:
        site = Site.objects.get(domain=domain)
    except Site.DoesNotExist:
        return
    return site


def site_cache_for_domain(domain):
    site = None
    cache_key = cache_key_for_domain(domain)

    if cache_installed():
        site = cache_get_site(cache_key)

    if not site:
        site = get_site_for_domain(domain)

    if site and cache_installed():
        cache_set_site(cache_key, site)

    return site


def multisite_middleware(get_response):

    def middleware(request):

        # Request must be something.
        if not request:
            return get_response(request)

        site = getattr(request, 'site', None)

        if not site:
            site = request.session.get('site', None)

        if not site:
            domain = str(request.get_host().lower())
            site = site_cache_for_domain(domain)
        request.site = site

        response = get_response(request)
        return response

    return middleware


def master_redirect_middleware(get_response):

    def middleware(request):
        site = getattr(request, 'site', None)

        # Shortcut if we have a site.
        if site:
            return get_response(request)

        # Otherwise, try to redirect to the master domain.
        site = get_current_site(request)
        logger.debug('Falling back to {}'.format(site))
        master_site = 'http://{}'.format(site.domain)
        response = HttpResponsePermanentRedirect(master_site)
        return response

    return middleware


def site_not_found_middleware(get_reponse):

    def middleware(request):
        site = getattr(request, 'site', None)
        if not site:
            raise Http404('Site Not Found')
        response = get_reponse(request)
        return response

    return middleware
