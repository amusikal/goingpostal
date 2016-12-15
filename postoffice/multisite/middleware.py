# Standard Library
import os

# Django
from django.conf import settings
from django.contrib.redirects.models import Redirect
from django.contrib.sites.models import Site
from django.core.exceptions import MiddlewareNotUsed
from django.http import HttpResponseGone
from django.http import HttpResponsePermanentRedirect


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


def redirect_fallback_middleware(get_response):
    """
    Port of Django's ``RedirectFallbackMiddleware`` that uses
    Mezzanine's approach for determining the current site.
    """

    def middleware(request):
        response = get_response(request)

        if response.status_code == 404:
            lookup = {
                'site_id': request.site_id,
                'old_path': request.get_full_path(),
            }
            try:
                redirect = Redirect.objects.get(**lookup)
            except Redirect.DoesNotExist:
                pass
            else:
                if not redirect.new_path:
                    response = HttpResponseGone()
                else:
                    response = HttpResponsePermanentRedirect(
                        redirect.new_path)

        return response

    if 'django.contrib.redirects' not in settings.INSTALLED_APPS:
        raise MiddlewareNotUsed

    return middleware
