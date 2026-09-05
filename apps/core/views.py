from django.shortcuts import render, redirect
from django.db.models import Q, Count
from django.contrib.auth.decorators import login_required
from apps.knowledge.models import Article, Category, Roadmap, Bookmark
from apps.interviews.models import InterviewExperience, Company
from apps.projects.models import Project, ProjectApplication
from apps.qa.models import Question
from apps.accounts.models import User, ActivityLog
from apps.mentorship.models import MentorshipBooking, MentorProfile

def home_view(request):
    featured_articles = Article.objects.filter(is_published=True, is_featured=True).select_related('author', 'category')[:3]
    if not featured_articles.exists():
        featured_articles = Article.objects.filter(is_published=True).select_related('author', 'category')[:3]

    recent_experiences = InterviewExperience.objects.select_related('author', 'company')[:4]
    showcase_projects = Project.objects.select_related('author').filter(is_looking_for_teammates=True)[:3]
    if not showcase_projects.exists():
        showcase_projects = Project.objects.select_related('author')[:3]

    trending_questions = Question.objects.select_related('author').annotate(ans_count=Count('answers')).order_by('-views_count')[:4]
    top_mentors = MentorProfile.objects.filter(is_active=True).select_related('user')[:4]
    top_categories = Category.objects.annotate(art_count=Count('articles')).order_by('-art_count')[:6]

    context = {
        'featured_articles': featured_articles,
        'recent_experiences': recent_experiences,
        'showcase_projects': showcase_projects,
        'trending_questions': trending_questions,
        'top_mentors': top_mentors,
        'top_categories': top_categories,
    }
    return render(request, 'core/home.html', context)


@login_required
def dashboard_view(request):
    user = request.user
    
    # User's bookmarks
    my_bookmarks = Bookmark.objects.filter(user=user).select_related('article__category')[:5]
    
    # User's recent articles
    my_articles = Article.objects.filter(author=user)[:5]
    
    # User's projects & applications
    my_projects = Project.objects.filter(author=user)[:5]
    my_applications = ProjectApplication.objects.filter(applicant=user).select_related('project')[:5]
    
    # Mentorship sessions
    student_sessions = MentorshipBooking.objects.filter(student=user)[:3]
    mentor_sessions = MentorshipBooking.objects.filter(mentor=user)[:3]
    
    # Community feed (recent activities)
    recent_activities = ActivityLog.objects.select_related('user')[:8]
    
    # Recommended roadmaps
    roadmaps = Roadmap.objects.all()[:3]

    context = {
        'user': user,
        'my_bookmarks': my_bookmarks,
        'my_articles': my_articles,
        'my_projects': my_projects,
        'my_applications': my_applications,
        'student_sessions': student_sessions,
        'mentor_sessions': mentor_sessions,
        'recent_activities': recent_activities,
        'roadmaps': roadmaps,
    }
    return render(request, 'core/dashboard.html', context)


def global_search_view(request):
    q = request.GET.get('q', '').strip()
    
    articles = []
    experiences = []
    projects = []
    questions = []
    users = []

    if q:
        articles = Article.objects.filter(
            Q(title__icontains=q) | Q(content__icontains=q) | Q(tags__icontains=q)
        ).select_related('author', 'category')[:6]

        experiences = InterviewExperience.objects.filter(
            Q(title__icontains=q) | Q(company__name__icontains=q) | Q(role_applied__icontains=q) | Q(summary__icontains=q)
        ).select_related('author', 'company')[:6]

        projects = Project.objects.filter(
            Q(title__icontains=q) | Q(tech_stack__icontains=q) | Q(description__icontains=q)
        ).select_related('author')[:6]

        questions = Question.objects.filter(
            Q(title__icontains=q) | Q(content__icontains=q) | Q(tags__icontains=q)
        ).select_related('author')[:6]

        users = User.objects.filter(
            Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(username__icontains=q) | Q(skills__icontains=q) | Q(company__icontains=q)
        )[:6]

    total_results = len(articles) + len(experiences) + len(projects) + len(questions) + len(users)

    context = {
        'query': q,
        'articles': articles,
        'experiences': experiences,
        'projects': projects,
        'questions': questions,
        'users': users,
        'total_results': total_results,
    }
    return render(request, 'core/search.html', context)


def about_view(request):
    return render(request, 'core/about.html')
