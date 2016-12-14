from jam.views import CRUDViewSet
from vanilla import TemplateView

from articles.models import Article


class FrontadminIndex(TemplateView):

    template_name = 'jam/index.html'


class ArticleFrontadmin(CRUDViewSet):
    model = Article
    fields = ('title', 'content', 'status', 'topic')
