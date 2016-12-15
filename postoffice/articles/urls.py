# Django
from django.conf.urls import url

# Project
from articles.views import ArticleDetailView
from articles.views import ArticleListView

urlpatterns = [

    url(r'^(?P<year>\d{4})/(?P<month>\d{2})/(?P<slug>[a-z0-9-]+)/$',
        ArticleDetailView.as_view(), name='articles.article.detail'),

    url(r'^(?P<year>\d{4})/(?P<month>\d{2})/$',
        ArticleListView.as_view(), name='articles.article.list.month'),

    url(r'^(?P<year>\d{4})/$',
        ArticleListView.as_view(), name='articles.article.list.year'),

    url(r'^$', ArticleListView.as_view(), name='articles.article.list'),
    ]
