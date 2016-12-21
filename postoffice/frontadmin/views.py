# 3rd-party
from jam.views import CRUDViewSet

# Project
from articles.models import Article
from sections.models import Section
from sections.models import SectionMember
from topics.models import Topic
from vanilla import TemplateView


class FrontadminIndex(TemplateView):

    template_name = 'jam/index.html'


class ArticleFrontadmin(CRUDViewSet):
    model = Article
    fields = ('title', 'content', 'status', 'topic')


class SectionFrontadmin(CRUDViewSet):
    model = Section
    fields = ('name', 'slug', 'description', )


class SectionMemberFrontadmin(CRUDViewSet):
    model = SectionMember
    fields = ('section', 'member', )


class TopicFrontadmin(CRUDViewSet):
    model = Topic
    fields = ('name', 'slug', 'description', )
