from django.views.generic import TemplateView
from .models import Topic
from django.shortcuts import get_list_or_404
from django.shortcuts import get_object_or_404


class TopicDetailView(TemplateView):

    template_name = 'topics/detail.html'

    def get_object(self):
        return get_object_or_404(Topic, slug=self.kwargs['slug'])

    def articles(self):
        qs = self.get_queryset()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_object()
        return context


class TopicListView(TemplateView):

    template_name = 'topics/list.html'
    title = 'Topics'

    def get_queryset(self):
        return get_list_or_404(Topic)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_queryset()
        return context
