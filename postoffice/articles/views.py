# Django
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView

# Project
from sections.models import Section

# Local
from .models import Article


class ArticleViewBase(TemplateView):

    def get_queryset(self):
        sections = Section.objects.filter(
            site_id=self.request.site_id).values_list('pk', flat=True)

        queryset = Article.objects.filter(
            topic__section__in=sections
            )

        year = self.kwargs.get('year')
        if year:
            queryset = queryset.filter(created__year=int(year))

        month = self.kwargs.get('month')
        if month:
            queryset = queryset.filter(created__month=int(month))

        return queryset


class ArticleDetailView(ArticleViewBase):

    template_name = 'articles/detail.html'

    def get_object(self):
        queryset = self.get_queryset()
        queryset = queryset.filter(created__year=int(self.kwargs['year']))
        return get_object_or_404(queryset, slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_object()
        return context


class ArticleListView(ArticleViewBase):

    template_name = 'articles/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_list'] = self.get_queryset()
        return context
