from django.test import TestCase
from sections.models import Section
from sections.models import SectionMember

import factory
import factory.django

from django.contrib.sites.models import Site



class SiteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Site

    name = factory.Sequence(lambda n: 'Site No. {}'.format(n))
    domain = factory.Sequence(lambda n: 'host{}.home.earth'.format(n))


class SectionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Section

    site = factory.SubFactory(SiteFactory)


class TestUserIsEditorPredicate(TestCase):

    def setUp(self):

        self.section = SectionFactory(id=999)
