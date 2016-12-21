import rules
from sections.models import SectionMember


@rules.predicate
def is_article_author(user, article):
    return user in article.authors


@rules.predicate
def is_article_editor(user, article):
    return SectionMember.objects.filter(
        section=article.topic.section,
        user=user,
        roles=SectionMember.ROLE_EDITOR
        ).exists()


@rules.predicate
def article_is_unlocked(article):
    article.status in (article.DRAFT, )


@rules.predicate
def user_is_topic_editor(user, topic):
    kwargs = {'user': user, 'roles__gte': SectionMember.ROLE_EDITOR}
    return topic.section.sectionmember_set.filter(**kwargs).exists()


rules.add_perm('articles', rules.always_allow)
rules.add_perm('articles.article.edit.own', is_article_author & article_is_unlocked)

# Can user edit a given article?
rules.add_perm('articles.article.edit',
    (is_article_author & article_is_unlocked) | is_article_editor
    )

# 'articles.article.approve'
# 'articles.article.approve.own'

# 'articles.article.delete'



rules.add_perm('topics', rules.always_allow)
rules.add_perm('topics.topic.edit', user_is_topic_editor)

rules.add_perm('sections', rules.always_allow)
rules.add_perm('profiles', rules.always_allow)
