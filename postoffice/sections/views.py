from django.views.generic import TemplateView
from .models import Section
from .models import SectionMember
from django.shortcuts import get_object_or_404


class SectionViewBase(TemplateView):

    def get_queryset(self):
        return Section.objects.filter(site_id=self.request.site_id)


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
        return get_object_or_404(Section, slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        section = self.get_object()
        context['object'] = section
        context['object_list'] = SectionMember.objects.filter(section=section)
        return context
