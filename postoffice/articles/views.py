from django.views.generic import TemplateView
from .models import Article
from django.shortcuts import get_list_or_404
from django.shortcuts import get_object_or_404


class ArticleDetailView(TemplateView):

    template_name = 'articles/detail.html'

    def get_object(self):
        queryset = Article.objects.all()
        queryset = queryset.filter(created__year=int(self.kwargs['year']))
        return get_object_or_404(queryset, slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_object()
        return context


class ArticleListView(TemplateView):

    template_name = 'articles/list.html'

    def get_queryset(self):
        queryset = Article.objects.all()

        year = self.kwargs.get('year')
        if year:
            queryset = queryset.filter(created__year=int(year))

        month = self.kwargs.get('month')
        if month:
            queryset = queryset.filter(created__month=int(month))

        return get_list_or_404(queryset)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_list'] = self.get_queryset()
        return context
