from django.views.generic import TemplateView
from .models import Section
from .models import SectionMember


class SectionListView(TemplateView):

    template_name = 'sections/list.html'
    title = 'Sections'

    def get_queryset(self):
        return Section.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_list'] = self.get_queryset()
        return context


class SectionDetailView(TemplateView):

    template_name = 'sections/detail.html'

    def get_object(self):
        return Section.objects.get(slug=self.kwargs['slug'])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        section = self.get_object()
        context['object'] = section
        context['object_list'] = SectionMember.objects.filter(section=section)
        return context
