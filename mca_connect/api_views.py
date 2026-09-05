from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.knowledge.models import Article, Category, Roadmap
from apps.interviews.models import InterviewExperience
from apps.projects.models import Project
from apps.mentorship.models import MentorProfile
from apps.qa.models import Question
from apps.accounts.models import User
from apps.ai_assistant.services import AIAssistantService

@api_view(['GET'])
@permission_classes([AllowAny])
def api_global_stats(request):
    """Returns platform summary statistics."""
    return Response({
        'articles_count': Article.objects.count(),
        'interviews_count': InterviewExperience.objects.count(),
        'mentors_count': MentorProfile.objects.filter(is_active=True).count(),
        'projects_count': Project.objects.count(),
        'questions_count': Question.objects.count(),
        'students_count': User.objects.count(),
    })

# --- AI ASSISTANT API ---

@api_view(['POST'])
@permission_classes([AllowAny])
def api_resume_matcher(request):
    """Analyzes resume text against a job description."""
    resume_text = request.data.get('resume_text', '')
    job_desc = request.data.get('job_desc', '')

    if not resume_text.strip() or not job_desc.strip():
        return Response({'error': 'Please provide both resume and job description.'}, status=400)

    result = AIAssistantService.match_resume_with_job(resume_text, job_desc)
    
    # Serialize recommended articles
    recommended = []
    for a in result.get('recommended_articles', []):
        recommended.append({
            'id': a.id,
            'title': a.title,
            'slug': a.slug,
            'category': a.category.name if a.category else 'General',
            'summary': a.summary,
            'read_time_minutes': a.read_time_minutes,
        })

    # Group skills by domain for rich categorized matrix
    languages = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', '.net']
    frameworks = ['django', 'fastapi', 'flask', 'react', 'next.js', 'angular', 'vue', 'node.js', 'express', 'spring boot']
    databases_cloud = ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp']
    tools_core = ['git', 'github', 'ci/cd', 'linux', 'rest api', 'graphql', 'data structures', 'algorithms', 'system design', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'microservices', 'kafka']

    def categorize(skill_list):
        cats = {'languages': [], 'frameworks': [], 'cloud_db': [], 'tools': []}
        for s in skill_list:
            sl = s.lower()
            if sl in languages:
                cats['languages'].append(s)
            elif sl in frameworks:
                cats['frameworks'].append(s)
            elif sl in databases_cloud:
                cats['cloud_db'].append(s)
            else:
                cats['tools'].append(s)
        return cats

    # Generate 14-day gap roadmap
    roadmap_tasks = []
    for idx, missing in enumerate(result['missing_skills'][:5]):
        roadmap_tasks.append({
            'day': f"Day {idx*2 + 1}-{idx*2 + 2}",
            'skill': missing.upper(),
            'action': f"Master fundamental concepts, build a mini-feature using {missing.upper()}, and review interview Q&A.",
        })

    return Response({
        'match_score': result['match_score'],
        'total_required': result['total_required'],
        'matched_skills': result['matched_skills'],
        'missing_skills': result['missing_skills'],
        'matched_categorized': categorize(result['matched_skills']),
        'missing_categorized': categorize(result['missing_skills']),
        'recommended_articles': recommended,
        'roadmap_tasks': roadmap_tasks,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def api_code_explainer(request):
    """Explains code and calculates time/space complexity."""
    code = request.data.get('code', '')
    language = request.data.get('language', 'python')
    if not code.strip():
        return Response({'error': 'Please provide code.'}, status=400)
    result = AIAssistantService.explain_code(code, language)
    return Response(result)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def api_flashcards(request):
    """Generates revision flashcards for CS/MCA topics."""
    topic = request.data.get('topic') if request.method == 'POST' else request.GET.get('topic', 'DBMS')
    cards = AIAssistantService.generate_flashcards(topic or 'DBMS')
    return Response({'topic': topic, 'cards': cards})

# --- KNOWLEDGE HUB API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_articles_list(request):
    """Lists articles with category filter and search."""
    category_slug = request.GET.get('category')
    query = request.GET.get('q')

    articles = Article.objects.select_related('author', 'category').all()
    if category_slug:
        articles = articles.filter(category__slug=category_slug)
    if query:
        articles = articles.filter(title__icontains=query) | articles.filter(tags__icontains=query)

    data = []
    for a in articles[:30]:
        data.append({
            'id': a.id,
            'title': a.title,
            'slug': a.slug,
            'summary': a.summary,
            'content': a.content[:300] + '...',
            'category': a.category.name if a.category else 'General',
            'category_slug': a.category.slug if a.category else '',
            'author_name': a.author.get_full_name() or a.author.username if a.author else 'Community',
            'read_time_minutes': a.read_time_minutes,
            'tags': [t.strip() for t in a.tags.split(',')] if a.tags else [],
            'views_count': a.views_count,
            'created_at': a.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_roadmaps_list(request):
    """Lists learning roadmaps."""
    roadmaps = Roadmap.objects.all()
    data = []
    for r in roadmaps:
        data.append({
            'id': r.id,
            'title': r.title,
            'slug': r.slug,
            'description': r.description,
            'difficulty': r.difficulty,
            'estimated_weeks': r.estimated_weeks,
        })
    return Response(data)

# --- INTERVIEW HUB API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_interviews_list(request):
    """Lists company interview experiences."""
    company = request.GET.get('company')
    experiences = InterviewExperience.objects.select_related('student').all()
    if company:
        experiences = experiences.filter(company_name__icontains=company)

    data = []
    for exp in experiences[:30]:
        data.append({
            'id': exp.id,
            'company_name': exp.company_name,
            'role': exp.role,
            'package_lpa': str(exp.package_lpa) if exp.package_lpa else None,
            'difficulty': exp.difficulty,
            'outcome': exp.outcome,
            'rounds_count': exp.rounds_count,
            'summary': exp.summary,
            'student_name': exp.student.get_full_name() or exp.student.username if exp.student else 'Anonymous',
            'created_at': exp.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

# --- PROJECTS API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_projects_list(request):
    """Lists student & open source projects."""
    projects = Project.objects.select_related('creator').all()
    data = []
    for p in projects[:30]:
        data.append({
            'id': p.id,
            'title': p.title,
            'slug': p.slug,
            'short_description': p.short_description,
            'tech_stack': [t.strip() for t in p.tech_stack.split(',')] if p.tech_stack else [],
            'github_url': p.github_url,
            'live_demo_url': p.live_demo_url,
            'creator_name': p.creator.get_full_name() or p.creator.username if p.creator else 'MCA Scholar',
            'likes_count': p.likes_count,
            'status': p.status,
            'created_at': p.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

# --- MENTORSHIP API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_mentors_list(request):
    """Lists active mentors."""
    mentors = MentorProfile.objects.filter(is_active=True).select_related('user')
    data = []
    for m in mentors[:30]:
        data.append({
            'id': m.id,
            'name': m.user.get_full_name() or m.user.username,
            'current_role': m.current_role,
            'company': m.company,
            'bio': m.bio,
            'expertise_areas': [e.strip() for e in m.expertise_areas.split(',')] if m.expertise_areas else [],
            'rating': float(m.rating),
            'sessions_completed': m.sessions_completed,
            'avatar_url': m.user.get_avatar_url() if hasattr(m.user, 'get_avatar_url') else '',
        })
    return Response(data)

# --- Q&A API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_qa_list(request):
    """Lists questions and discussion threads."""
    questions = Question.objects.select_related('author').all()
    data = []
    for q in questions[:30]:
        data.append({
            'id': q.id,
            'title': q.title,
            'slug': q.slug,
            'body': q.body[:200] + '...',
            'author_name': q.author.get_full_name() or q.author.username if q.author else 'Member',
            'upvotes_count': q.upvotes_count,
            'answers_count': q.answers_count,
            'is_solved': q.is_solved,
            'tags': [t.strip() for t in q.tags.split(',')] if q.tags else [],
            'created_at': q.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)
