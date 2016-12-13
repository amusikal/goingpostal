from django.views.generic import TemplateView
from .models import Article
from django.shortcuts import get_list_or_404
from django.shortcuts import get_object_or_404


class ArticleDetailView(TemplateView):

    template_name = 'articles/detail.html'

    def get_object(self):
        return get_object_or_404(Article, slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_object()
        return context


class ArticleListView(TemplateView):

    template_name = 'articles/list.html'

    def get_queryset(self):
        return get_list_or_404(Article)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_queryset()
        return context
