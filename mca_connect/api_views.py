from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.db.models import F
from apps.knowledge.models import Article, Category, Roadmap
from apps.interviews.models import Company, InterviewExperience
from apps.projects.models import Project
from apps.mentorship.models import MentorProfile, MentorshipBooking
from apps.qa.models import Question, Answer
from apps.accounts.models import User
from apps.ai_assistant.services import AIAssistantService

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bypass CSRF enforcement for REST endpoints

# --- AUTHENTICATION API ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_auth_me(request):
    """Returns the currently authenticated user profile or guest status."""
    if not request.user.is_authenticated:
        return Response({'authenticated': False, 'user': None})
    
    u = request.user
    return Response({
        'authenticated': True,
        'user': {
            'id': u.id,
            'username': u.username,
            'name': u.get_full_name() or u.username,
            'email': u.email,
            'role': u.role,
            'role_display': u.get_role_display(),
            'headline': u.headline,
            'college': u.college,
            'company': u.company,
            'designation': u.designation,
            'reputation_points': u.reputation_points,
            'is_mentor_available': u.is_mentor_available,
            'skills': u.get_skills_list(),
            'avatar_url': u.get_avatar_url(),
        }
    })

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_auth_login(request):
    """Authenticates a user by username/password."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Please provide both username and password.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        try:
            u_obj = User.objects.get(email=username)
            user = authenticate(request, username=u_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user is not None:
        login(request, user)
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'role': user.role,
                'role_display': user.get_role_display(),
                'headline': user.headline,
                'reputation_points': user.reputation_points,
                'avatar_url': user.get_avatar_url(),
            }
        })
    return Response({'error': 'Invalid username or password.'}, status=401)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_auth_register(request):
    """Registers a new MCA student or alumni user."""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    role = request.data.get('role', 'STUDENT')
    college = request.data.get('college', 'MCA Department')

    if not username or not password or not email:
        return Response({'error': 'Username, email, and password are required.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email is already registered.'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            college=college,
            reputation_points=50,
        )
        login(request, user)
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'role': user.role,
                'role_display': user.get_role_display(),
                'headline': user.headline,
                'reputation_points': user.reputation_points,
                'avatar_url': user.get_avatar_url(),
            }
        })
    except Exception as e:
        return Response({'error': f'Failed to create account: {str(e)}'}, status=500)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_auth_logout(request):
    """Logs out the user session."""
    logout(request)
    return Response({'success': True})

# --- GLOBAL STATS API ---

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
    
    recommended = []
    for a in result.get('recommended_articles', []):
        recommended.append({
            'id': a.id,
            'title': a.title,
            'slug': a.slug,
            'category': a.category.name if a.category else 'General',
            'summary': a.summary,
            'read_time': a.estimate_read_time(),
        })

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
    code = request.data.get('code', '')
    language = request.data.get('language', 'python')
    if not code.strip():
        return Response({'error': 'Please provide code.'}, status=400)
    result = AIAssistantService.explain_code(code, language)
    return Response(result)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def api_flashcards(request):
    topic = request.data.get('topic') if request.method == 'POST' else request.GET.get('topic', 'DBMS')
    cards = AIAssistantService.generate_flashcards(topic or 'DBMS')
    return Response({'topic': topic, 'cards': cards})

# --- KNOWLEDGE HUB API (CRUD) ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_articles_list(request):
    """GET: lists articles. POST: allows authenticated Mentor/Alumni/Admin to publish guide."""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to publish a study guide.'}, status=401)
        
        # Enforce Mentor / Alumni privilege
        if request.user.role not in ['ALUMNI', 'FACULTY', 'ADMIN']:
            return Response({'error': 'Publishing official study guides is reserved for Verified Alumni Mentors and Faculty.'}, status=403)

        title = request.data.get('title', '').strip()
        summary = request.data.get('summary', '').strip()
        content = request.data.get('content', '').strip()
        tags = request.data.get('tags', '').strip()
        category_name = request.data.get('category', 'Core Computer Science').strip()

        if not title or not content or not summary:
            return Response({'error': 'Title, summary, and content are required.'}, status=400)

        category, _ = Category.objects.get_or_create(name=category_name)
        art = Article.objects.create(
            title=title,
            author=request.user,
            category=category,
            summary=summary,
            content=content,
            tags=tags,
            difficulty=request.data.get('difficulty', 'INTERMEDIATE'),
        )
        request.user.add_reputation(30)
        return Response({'success': True, 'id': art.id, 'title': art.title})

    # GET articles
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
            'content': a.content,
            'category': a.category.name if a.category else 'General',
            'author_id': a.author.id if a.author else None,
            'author_name': a.author.get_full_name() or a.author.username if a.author else 'Community',
            'author_role': a.author.get_role_display() if a.author else '',
            'read_time': a.estimate_read_time(),
            'tags': a.get_tags_list(),
            'views_count': a.views_count,
            'difficulty': a.get_difficulty_display(),
            'created_at': a.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_article_detail_actions(request, pk):
    art = get_object_or_404(Article, pk=pk)
    if not request.user.is_authenticated or (request.user != art.author and request.user.role != 'ADMIN'):
        return Response({'error': 'Unauthorized to delete this study guide.'}, status=403)
    art.delete()
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
def api_roadmaps_list(request):
    roadmaps = Roadmap.objects.all()
    data = []
    for r in roadmaps:
        data.append({
            'id': r.id,
            'title': r.title,
            'slug': r.slug,
            'target_role': r.target_role,
            'icon': r.icon,
            'summary': r.summary,
            'content': r.content,
            'difficulty': r.difficulty,
            'created_at': r.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

# --- INTERVIEW HUB API (CRUD) ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_interviews_list(request):
    """GET: lists interview experiences. POST: create experience."""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to share an interview experience.'}, status=401)

        company_name = request.data.get('company_name', '').strip()
        role_applied = request.data.get('role_applied', '').strip()
        summary = request.data.get('summary', '').strip()
        rounds_breakdown = request.data.get('rounds_breakdown', '').strip()

        if not company_name or not role_applied or not summary:
            return Response({'error': 'Company name, role, and summary are required.'}, status=400)

        company, _ = Company.objects.get_or_create(name=company_name)
        exp = InterviewExperience.objects.create(
            company=company,
            author=request.user,
            role_applied=role_applied,
            batch_year=request.data.get('batch_year', 2025),
            offer_status=request.data.get('offer_status', 'OFFERED'),
            difficulty=request.data.get('difficulty', 'MEDIUM'),
            compensation_details=request.data.get('compensation_details', ''),
            rounds_count=request.data.get('rounds_count', 3),
            summary=summary,
            rounds_breakdown=rounds_breakdown or summary,
            questions_asked=request.data.get('questions_asked', ''),
            tips_for_juniors=request.data.get('tips_for_juniors', ''),
        )
        request.user.add_reputation(40)
        return Response({'success': True, 'id': exp.id, 'company_name': company.name})

    experiences = InterviewExperience.objects.select_related('author', 'company').all()
    data = []
    for exp in experiences[:30]:
        data.append({
            'id': exp.id,
            'company_name': exp.company.name if exp.company else 'Tech Firm',
            'role_applied': exp.role_applied,
            'batch_year': exp.batch_year,
            'offer_status': exp.get_offer_status_display(),
            'difficulty': exp.get_difficulty_display(),
            'compensation_details': exp.compensation_details,
            'rounds_count': exp.rounds_count,
            'summary': exp.summary,
            'questions_asked': exp.questions_asked,
            'tips_for_juniors': exp.tips_for_juniors,
            'author_id': exp.author.id if exp.author else None,
            'author_name': exp.author.get_full_name() or exp.author.username if exp.author else 'Senior Alum',
            'author_role': exp.author.get_role_display() if exp.author else '',
            'upvotes_count': exp.upvotes.count(),
            'created_at': exp.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def api_interview_detail_actions(request, pk):
    exp = get_object_or_404(InterviewExperience, pk=pk)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or (request.user != exp.author and request.user.role != 'ADMIN'):
            return Response({'error': 'Unauthorized to delete this interview log.'}, status=403)
        exp.delete()
        return Response({'success': True})

    if not request.user.is_authenticated:
        return Response({'error': 'Please sign in to upvote.'}, status=401)
    if request.user in exp.upvotes.all():
        exp.upvotes.remove(request.user)
    else:
        exp.upvotes.add(request.user)
    return Response({'upvotes_count': exp.upvotes.count()})

# --- PROJECTS API (CRUD) ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_projects_list(request):
    """GET: lists projects. POST: create project."""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to showcase a project.'}, status=401)

        title = request.data.get('title', '').strip()
        tagline = request.data.get('tagline', '').strip()
        description = request.data.get('description', '').strip()
        tech_stack = request.data.get('tech_stack', '').strip()

        if not title or not tagline:
            return Response({'error': 'Title and tagline are required.'}, status=400)

        proj = Project.objects.create(
            title=title,
            author=request.user,
            tagline=tagline,
            description=description or tagline,
            tech_stack=tech_stack,
            category=request.data.get('category', 'WEB'),
            github_url=request.data.get('github_url', ''),
            live_demo_url=request.data.get('live_demo_url', ''),
            is_looking_for_teammates=request.data.get('is_looking_for_teammates', False),
            roles_needed=request.data.get('roles_needed', ''),
        )
        request.user.add_reputation(25)
        return Response({'success': True, 'id': proj.id, 'title': proj.title})

    projects = Project.objects.select_related('author').prefetch_related('likes').all()
    data = []
    for p in projects[:30]:
        data.append({
            'id': p.id,
            'title': p.title,
            'slug': p.slug,
            'tagline': p.tagline,
            'description': p.description,
            'tech_stack': p.get_tech_list(),
            'category': p.get_category_display(),
            'github_url': p.github_url,
            'live_demo_url': p.live_demo_url,
            'author_id': p.author.id,
            'author_name': p.author.get_full_name() or p.author.username if p.author else 'MCA Scholar',
            'author_role': p.author.get_role_display() if p.author else '',
            'likes_count': p.likes.count(),
            'is_liked_by_me': request.user.is_authenticated and (request.user in p.likes.all()),
            'is_looking_for_teammates': p.is_looking_for_teammates,
            'roles_needed': p.roles_needed,
            'created_at': p.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def api_project_detail_actions(request, pk):
    proj = get_object_or_404(Project, pk=pk)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or request.user != proj.author:
            return Response({'error': 'Unauthorized to delete this project.'}, status=403)
        proj.delete()
        return Response({'success': True})

    # Like / unlike
    if not request.user.is_authenticated:
        return Response({'error': 'Please sign in to like projects.'}, status=401)
    if request.user in proj.likes.all():
        proj.likes.remove(request.user)
    else:
        proj.likes.add(request.user)
    return Response({'likes_count': proj.likes.count()})

# --- MENTORSHIP API (CRUD & RBAC) ---

@api_view(['GET'])
@permission_classes([AllowAny])
def api_mentors_list(request):
    """Lists active mentors."""
    mentors = MentorProfile.objects.filter(is_active=True).select_related('user')
    data = []
    for m in mentors[:30]:
        data.append({
            'id': m.id,
            'user_id': m.user.id,
            'name': m.user.get_full_name() or m.user.username,
            'headline': m.headline,
            'company': m.user.company or 'Tech Firm',
            'expertise_areas': m.get_expertise_list(),
            'years_of_experience': m.years_of_experience,
            'about': m.about,
            'offers_resume_review': m.offers_resume_review,
            'offers_mock_interview': m.offers_mock_interview,
            'offers_career_guidance': m.offers_career_guidance,
            'preferred_meeting_tool': m.preferred_meeting_tool,
            'avatar_url': m.user.get_avatar_url(),
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
def api_mentorship_book_session(request):
    """Students book 1-on-1 session with a mentor."""
    if not request.user.is_authenticated:
        return Response({'error': 'Please sign in as a student to book a session.'}, status=401)

    mentor_user_id = request.data.get('mentor_user_id')
    requested_date = request.data.get('requested_date')
    requested_time = request.data.get('requested_time', '6:00 PM - 7:00 PM IST')
    session_type = request.data.get('session_type', 'MOCK_INTERVIEW')
    student_notes = request.data.get('student_notes', '').strip()

    if not mentor_user_id or not requested_date:
        return Response({'error': 'Mentor ID and requested date are required.'}, status=400)

    mentor_user = get_object_or_404(User, pk=mentor_user_id)
    booking = MentorshipBooking.objects.create(
        mentor=mentor_user,
        student=request.user,
        session_type=session_type,
        requested_date=requested_date,
        requested_time=requested_time,
        student_notes=student_notes or 'Session requested via MCA Connect',
        status='PENDING',
    )
    return Response({'success': True, 'booking_id': booking.id, 'mentor_name': mentor_user.get_full_name() or mentor_user.username})

@api_view(['GET'])
@permission_classes([AllowAny])
def api_mentorship_my_sessions(request):
    """Fetches mentorship sessions for current user (either as student or as mentor)."""
    if not request.user.is_authenticated:
        return Response({'sessions': []})

    is_mentor = request.user.role in ['ALUMNI', 'FACULTY'] or hasattr(request.user, 'mentor_profile')
    if is_mentor:
        bookings = MentorshipBooking.objects.filter(mentor=request.user).select_related('student')
    else:
        bookings = MentorshipBooking.objects.filter(student=request.user).select_related('mentor')

    data = []
    for b in bookings:
        data.append({
            'id': b.id,
            'session_type': b.get_session_type_display(),
            'mentor_id': b.mentor.id,
            'mentor_name': b.mentor.get_full_name() or b.mentor.username,
            'student_id': b.student.id,
            'student_name': b.student.get_full_name() or b.student.username,
            'requested_date': b.requested_date.strftime('%b %d, %Y'),
            'requested_time': b.requested_time,
            'student_notes': b.student_notes,
            'status': b.status,
            'meeting_link': b.meeting_link,
            'is_mentor_view': is_mentor,
            'created_at': b.created_at.strftime('%b %d, %Y'),
        })
    return Response({'is_mentor': is_mentor, 'sessions': data})

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def api_mentorship_remove_mentor_profile(request):
    """Allows a user to undo/delete their mentor account/profile and revert back to MCA Student."""
    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)

    MentorProfile.objects.filter(user=request.user).delete()
    u = request.user
    u.role = 'STUDENT'
    u.is_mentor_available = False
    u.save()

    return Response({
        'success': True,
        'message': 'Mentor profile successfully removed. Role reverted to MCA Student.',
        'user': {
            'id': u.id,
            'username': u.username,
            'name': u.get_full_name() or u.username,
            'email': u.email,
            'role': u.role,
            'role_display': u.get_role_display(),
            'headline': u.headline,
            'reputation_points': u.reputation_points,
            'avatar_url': u.get_avatar_url(),
        }
    })

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def api_mentorship_session_actions(request, pk):
    """Mentors can confirm/add meet link, students/mentors can cancel/delete."""
    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)

    booking = get_object_or_404(MentorshipBooking, pk=pk)
    
    if request.method == 'DELETE':
        if booking.student != request.user and booking.mentor != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Unauthorized to cancel this session.'}, status=403)
        booking.delete()
        return Response({'success': True, 'message': 'Mentorship session cancelled and removed.'})

    if booking.mentor != request.user and request.user.role != 'ADMIN':
        return Response({'error': 'Only the assigned mentor can update this session.'}, status=403)

    status = request.data.get('status')
    meeting_link = request.data.get('meeting_link', '')

    if status:
        booking.status = status
    if meeting_link:
        booking.meeting_link = meeting_link
    booking.save()

    return Response({'success': True, 'status': booking.status, 'meeting_link': booking.meeting_link})

# --- Q&A API (CRUD) ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_qa_list(request):
    """GET: lists questions with answers. POST: asks a new question."""
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to ask a question.'}, status=401)

        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()
        language = request.data.get('language', 'python')
        tags = request.data.get('tags', '').strip()

        if not title or not content:
            return Response({'error': 'Title and question details are required.'}, status=400)

        q = Question.objects.create(
            title=title,
            author=request.user,
            content=content,
            code_snippet=request.data.get('code_snippet', ''),
            language=language,
            tags=tags,
        )
        request.user.add_reputation(15)
        return Response({'success': True, 'id': q.id, 'title': q.title})

    questions = Question.objects.select_related('author').prefetch_related('upvotes', 'answers__author').all()
    data = []
    for q in questions[:30]:
        answers = []
        for ans in q.answers.all():
            answers.append({
                'id': ans.id,
                'content': ans.content,
                'code_snippet': ans.code_snippet,
                'author_id': ans.author.id if ans.author else None,
                'author_name': ans.author.get_full_name() or ans.author.username if ans.author else 'Community',
                'author_role': ans.author.get_role_display() if ans.author else '',
                'is_mentor': ans.author.role in ['ALUMNI', 'FACULTY'] if ans.author else False,
                'upvotes_count': ans.upvotes.count(),
                'created_at': ans.created_at.strftime('%b %d, %Y'),
            })

        data.append({
            'id': q.id,
            'title': q.title,
            'slug': q.slug,
            'content': q.content,
            'code_snippet': q.code_snippet,
            'author_id': q.author.id if q.author else None,
            'author_name': q.author.get_full_name() or q.author.username if q.author else 'Member',
            'author_role': q.author.get_role_display() if q.author else '',
            'upvotes_count': q.upvotes.count(),
            'answers_count': q.answers.count(),
            'is_solved': q.is_solved,
            'language': q.get_language_display(),
            'tags': q.get_tags_list(),
            'answers': answers,
            'created_at': q.created_at.strftime('%b %d, %Y'),
        })
    return Response(data)

@api_view(['POST', 'DELETE'])
@permission_classes([AllowAny])
def api_question_detail_actions(request, pk):
    q = get_object_or_404(Question, pk=pk)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or (request.user != q.author and request.user.role != 'ADMIN'):
            return Response({'error': 'Unauthorized to delete this question.'}, status=403)
        q.delete()
        return Response({'success': True})

    # Post Answer or Upvote
    action = request.data.get('action')
    if action == 'answer':
        if not request.user.is_authenticated:
            return Response({'error': 'Please sign in to answer.'}, status=401)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Answer content is required.'}, status=400)
        ans = Answer.objects.create(
            question=q,
            author=request.user,
            content=content,
            code_snippet=request.data.get('code_snippet', ''),
        )
        request.user.add_reputation(20)
        return Response({'success': True, 'answer_id': ans.id})

    # Upvote question
    if not request.user.is_authenticated:
        return Response({'error': 'Please sign in to upvote.'}, status=401)
    if request.user in q.upvotes.all():
        exp = q.upvotes.remove(request.user)
    else:
        exp = q.upvotes.add(request.user)
    return Response({'upvotes_count': q.upvotes.count()})

@api_view(['DELETE'])
@permission_classes([AllowAny])
def api_answer_delete(request, pk):
    ans = get_object_or_404(Answer, pk=pk)
    if not request.user.is_authenticated or (request.user != ans.author and request.user.role != 'ADMIN'):
        return Response({'error': 'Unauthorized to delete this answer.'}, status=403)
    ans.delete()
    return Response({'success': True})
