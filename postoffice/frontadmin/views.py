# 3rd-party
from vanilla import TemplateView

# Project
from articles.models import Article
from jam.views import CRUDViewSet


class FrontadminIndex(TemplateView):

    template_name = 'jam/index.html'


class ArticleFrontadmin(CRUDViewSet):
    model = Article
    fields = ('title', 'content', 'status', 'topic')
