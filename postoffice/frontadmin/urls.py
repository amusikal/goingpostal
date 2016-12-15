# Django
from django.conf.urls import include
from django.conf.urls import url

# Local
from .views import ArticleFrontadmin
from .views import FrontadminIndex

urlpatterns = [
    url(r'^$', FrontadminIndex.as_view(), name='frontadmin.index'),
    url(r'articles/', include(ArticleFrontadmin().get_url_patterns())),
    ]
