from django.conf.urls import url
from articles.views import ArticleDetailView

urlpatterns = [
    url(r'^(?P<slug>[a-z0-9-]+)/$', ArticleDetailView.as_view()),
    url(r'^$', ArticleDetailView.as_view()),
    ]
