from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Count, Avg
from .models import Company, InterviewExperience, InterviewComment
from .forms import InterviewExperienceForm, InterviewCommentForm
from apps.accounts.models import ActivityLog

def experience_list_view(request):
    query = request.GET.get('q', '')
    company_slug = request.GET.get('company', '')
    difficulty = request.GET.get('difficulty', '')
    exp_type = request.GET.get('type', '')
    offer_status = request.GET.get('status', '')

    experiences = InterviewExperience.objects.select_related('author', 'company').prefetch_related('upvotes')

    if query:
        experiences = experiences.filter(
            Q(title__icontains=query) |
            Q(role_applied__icontains=query) |
            Q(company__name__icontains=query) |
            Q(summary__icontains=query) |
            Q(questions_asked__icontains=query)
        )
    if company_slug:
        experiences = experiences.filter(company__slug=company_slug)
    if difficulty:
        experiences = experiences.filter(difficulty=difficulty)
    if exp_type:
        experiences = experiences.filter(experience_type=exp_type)
    if offer_status:
        experiences = experiences.filter(offer_status=offer_status)

    companies = Company.objects.annotate(exp_count=Count('experiences')).filter(exp_count__gt=0).order_by('-exp_count')

    # Placement Stats
    total_experiences = InterviewExperience.objects.count()
    offered_count = InterviewExperience.objects.filter(offer_status='OFFERED').count()
    companies_count = Company.objects.count()

    context = {
        'experiences': experiences,
        'companies': companies,
        'total_experiences': total_experiences,
        'offered_count': offered_count,
        'companies_count': companies_count,
        'selected_company': company_slug,
        'selected_difficulty': difficulty,
        'selected_type': exp_type,
        'selected_status': offer_status,
        'search_query': query,
    }
    return render(request, 'interviews/experience_list.html', context)


def experience_detail_view(request, slug):
    experience = get_object_or_404(
        InterviewExperience.objects.select_related('author', 'company').prefetch_related('comments__author', 'upvotes'),
        slug=slug
    )

    # Increment view count
    InterviewExperience.objects.filter(pk=experience.pk).update(views_count=experience.views_count + 1)

    is_upvoted = False
    if request.user.is_authenticated:
        is_upvoted = experience.upvotes.filter(pk=request.user.pk).exists()

    comment_form = InterviewCommentForm()
    related_experiences = InterviewExperience.objects.filter(company=experience.company).exclude(pk=experience.pk)[:3]

    context = {
        'experience': experience,
        'is_upvoted': is_upvoted,
        'comment_form': comment_form,
        'related_experiences': related_experiences,
    }
    return render(request, 'interviews/experience_detail.html', context)


@login_required
def experience_create_view(request):
    if request.method == 'POST':
        form = InterviewExperienceForm(request.POST)
        if form.is_valid():
            company_name = form.cleaned_data.pop('company_name').strip()
            company, _ = Company.objects.get_or_create(
                name__iexact=company_name,
                defaults={'name': company_name}
            )
            
            experience = form.save(commit=False)
            experience.author = request.user
            experience.company = company
            experience.save()

            # Award reputation & activity
            request.user.add_reputation(30)
            ActivityLog.objects.create(
                user=request.user,
                activity_type='EXPERIENCE',
                title=f'Shared interview experience for {company.name} ({experience.role_applied})',
                link=experience.get_absolute_url()
            )

            messages.success(request, 'Thank you for giving back to the junior batches! Your interview experience has been shared. (+30 reputation points)')
            return redirect(experience.get_absolute_url())
    else:
        form = InterviewExperienceForm()
    return render(request, 'interviews/experience_form.html', {'form': form, 'title': 'Share Interview Experience'})


@login_required
def experience_toggle_upvote(request, slug):
    experience = get_object_or_404(InterviewExperience, slug=slug)
    if experience.upvotes.filter(pk=request.user.pk).exists():
        experience.upvotes.remove(request.user)
        upvoted = False
    else:
        experience.upvotes.add(request.user)
        upvoted = True
        if experience.author != request.user:
            experience.author.add_reputation(5)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'upvoted': upvoted, 'count': experience.upvotes.count()})
    return redirect(experience.get_absolute_url())


@login_required
def experience_add_comment(request, slug):
    experience = get_object_or_404(InterviewExperience, slug=slug)
    if request.method == 'POST':
        form = InterviewCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.experience = experience
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment added.')
    return redirect(experience.get_absolute_url())


def company_directory_view(request):
    companies = Company.objects.annotate(
        experiences_total=Count('experiences')
    ).order_by('-experiences_total', 'name')
    return render(request, 'interviews/company_directory.html', {'companies': companies})
