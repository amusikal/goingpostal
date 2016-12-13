from django.conf.urls import url
from .views import SectionListView
from .views import SectionDetailView


urlpatterns = [
    url(r'^$', SectionListView.as_view(), name='sections.section.list'),
    url(r'^(?P<slug>[0-9a-z-]+)/$', SectionDetailView.as_view(), name='sections.section.detail'),
    ]
