from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .services import AIAssistantService

def ai_hub_view(request):
    return render(request, 'ai_assistant/hub.html')

def ai_code_explainer_view(request):
    result = None
    initial_code = request.POST.get('code', '''def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []''')
    language = request.POST.get('language', 'python')

    if request.method == 'POST' and 'explain_btn' in request.POST:
        code_input = request.POST.get('code', '')
        lang_input = request.POST.get('language', 'python')
        if code_input.strip():
            result = AIAssistantService.explain_code(code_input, lang_input)

    context = {
        'initial_code': initial_code,
        'language': language,
        'result': result,
    }
    return render(request, 'ai_assistant/code_explainer.html', context)


def ai_resume_matcher_view(request):
    result = None
    default_resume = ""
    default_job = ""

    if request.user.is_authenticated:
        skills = request.user.skills or "Python, Django, React, SQL, Git"
        default_resume = f"Skills: {skills}\nDegree: MCA\nExperience: Built full-stack web applications, REST APIs, database design."

    default_job = "We are seeking a Software Development Engineer with hands-on proficiency in Python, Django, REST APIs, Docker, PostgreSQL, and Data Structures & Algorithms. Experience with Git and CI/CD pipelines is a plus."

    if request.method == 'POST':
        resume_text = request.POST.get('resume_text', '')
        job_desc = request.POST.get('job_desc', '')
        if resume_text.strip() and job_desc.strip():
            result = AIAssistantService.match_resume_with_job(resume_text, job_desc)
            default_resume = resume_text
            default_job = job_desc

    context = {
        'default_resume': default_resume,
        'default_job': default_job,
        'result': result,
    }
    return render(request, 'ai_assistant/resume_matcher.html', context)


def ai_flashcards_view(request):
    cards = None
    topic = request.GET.get('topic', 'DBMS Normalization & Indexing')
    if topic:
        cards = AIAssistantService.generate_flashcards(topic)

    context = {
        'topic': topic,
        'cards': cards,
    }
    return render(request, 'ai_assistant/flashcards.html', context)
