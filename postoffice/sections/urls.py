# Django
from django.conf.urls import url

# Local
from .views import SectionDetailView
from .views import SectionListView

urlpatterns = [
    url(r'^$', SectionListView.as_view(), name='sections.section.list'),
    url(r'^(?P<slug>[0-9a-z-]+)/$', SectionDetailView.as_view(), name='sections.section.detail'),
    ]
