# Django
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView

# Project
from sections.models import Section

# Local
from .models import Topic


class TopicViewBase(TemplateView):

    def get_queryset(self):
        sections = Section.objects.filter(
            site_id=self.request.site_id).values_list('pk', flat=True)
        return Topic.objects.filter(section_id__in=sections)


class TopicDetailView(TopicViewBase):

    template_name = 'topics/detail.html'

    def get_object(self):
        return get_object_or_404(Topic, slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object'] = self.get_object()
        return context


class TopicListView(TopicViewBase):

    template_name = 'topics/list.html'
    title = 'Topics'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_list'] = self.get_queryset()
        return context
