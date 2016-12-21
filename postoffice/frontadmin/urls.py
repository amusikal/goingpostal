# Django
from django.conf.urls import include
from django.conf.urls import url

# Local
from .views import ArticleFrontadmin
from .views import FrontadminIndex
from .views import SectionFrontadmin
from .views import SectionMemberFrontadmin
from .views import TopicFrontadmin

urlpatterns = [
    url(r'^$', FrontadminIndex.as_view(), name='frontadmin.index'),
    url(r'articles/', include(ArticleFrontadmin().get_url_patterns())),
    url(r'sections/', include(SectionFrontadmin().get_url_patterns())),
    url(r'sectionmembers/', include(SectionMemberFrontadmin().get_url_patterns())),
    url(r'topics/', include(TopicFrontadmin().get_url_patterns())),
    ]
