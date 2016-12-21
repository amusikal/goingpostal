# Django
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView

# 3rd-party
from rules.contrib.views import PermissionRequiredMixin

# Local
from .models import SectionMember


class SectionViewBase(TemplateView):

    def get_queryset(self):
        return self.request.sections


class SectionListView(SectionViewBase):

    template_name = 'sections/list.html'
    title = 'Sections'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_list'] = self.get_queryset()
        return context


class SectionDetailView(SectionViewBase):

    template_name = 'sections/detail.html'

    def get_object(self):
        return get_object_or_404(self.get_queryset(), slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        section = self.get_object()
        context['object'] = section
        context['object_list'] = SectionMember.objects.filter(section=section)
        return context
