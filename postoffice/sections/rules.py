# -*- coding: utf-8 -*-

# 3rd-party
import rules

# Local
from .models import SectionMember


def has_membership(user, section, role=None):
    kwargs = {'user': user}
    if role:
        kwargs['role__gte'] = role
    return section.sectionmember_set.filter(**kwargs).exists()


@rules.predicate
def user_is_reader(user, section):
    """Members have ROLE_OBSERVER rating, or greater."""
    if user.is_authenticated():
        return has_membership(user, section, SectionMember.ROLE_OBSERVER)
    return section.is_public


@rules.predicate
def user_is_commentator(user, section):
    """Members have ROLE_MEMBER rating, or greater."""
    return has_membership(user, section, SectionMember.ROLE_MEMBER)


@rules.predicate
def user_is_contributor(user, section):
    """Members have ROLE_CONTRIBUTOR rating, or greater."""
    return has_membership(user, section, SectionMember.ROLE_CONTRIBUTOR)


@rules.predicate
def user_is_editor(user, section):
    """Editors have ROLE_EDITOR rating, or greater."""
    return has_membership(user, section, SectionMember.ROLE_EDITOR)


@rules.predicate
def user_is_owner(user, section):
    """Editors have ROLE_OWNER rating, or greater."""
    return has_membership(user, section, SectionMember.ROLE_OWNER)


# RULE: sections.section.read
#       - section is public
#       - OR user is_observer
rules.add_rule('sections.section.read', user_is_reader)

# RULE: sections.section.edit
#       - user_is_editor
rules.add_rule('sections.section.edit', user_is_editor)
