# Django
from django.conf.urls import url

# Project
from topics.views import TopicDetailView
from topics.views import TopicListView

urlpatterns = [
    url(r'^(?P<slug>[a-z0-9-]+)/$',
        TopicDetailView.as_view(), name='topics.topic.detail'),
    url(r'^$',
        TopicListView.as_view(), name='topics.topic.list'),
    ]
