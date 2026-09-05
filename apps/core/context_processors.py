from apps.knowledge.models import Article, Category
from apps.interviews.models import InterviewExperience, Company
from apps.projects.models import Project
from apps.qa.models import Question
from apps.accounts.models import User

def global_stats_context(request):
    """
    Supplies real-time counts across the platform for the navigation bar,
    badges, and footers without redundant query costs.
    """
    try:
        return {
            'total_students_count': User.objects.count(),
            'total_articles_count': Article.objects.filter(is_published=True).count(),
            'total_interviews_count': InterviewExperience.objects.count(),
            'total_projects_count': Project.objects.count(),
            'total_questions_count': Question.objects.count(),
            'active_mentors_count': User.objects.filter(is_mentor_available=True).count(),
        }
    except Exception:
        return {}
