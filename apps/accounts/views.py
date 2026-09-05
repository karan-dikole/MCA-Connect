from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Sum
from .models import User, Badge, UserBadge, ActivityLog
from .forms import CustomUserCreationForm, UserProfileUpdateForm

def register_view(request):
    if request.user.is_authenticated:
        return redirect('core:dashboard')
        
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # award initial newcomer badge if exists
            newcomer_badge = Badge.objects.filter(slug='newcomer').first()
            if newcomer_badge:
                UserBadge.objects.get_or_create(user=user, badge=newcomer_badge)
            ActivityLog.objects.create(
                user=user,
                activity_type='BADGE',
                title=f'Joined MCA Connect community!',
                link=''
            )
            login(request, user)
            messages.success(request, f'Welcome to MCA Connect, {user.first_name or user.username}!')
            return redirect('accounts:edit_profile')
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True

    def form_valid(self, form):
        messages.success(self.request, f"Welcome back, {form.get_user().first_name or form.get_user().username}!")
        return super().form_valid(form)


def profile_detail_view(request, username):
    profile_user = get_object_or_404(User, username=username)
    badges = UserBadge.objects.filter(user=profile_user).select_related('badge')
    activities = ActivityLog.objects.filter(user=profile_user)[:10]
    
    # User's contributions
    articles = profile_user.articles.filter(is_published=True)[:5] if hasattr(profile_user, 'articles') else []
    experiences = profile_user.interview_experiences.all()[:5] if hasattr(profile_user, 'interview_experiences') else []
    projects = profile_user.projects.all()[:5] if hasattr(profile_user, 'projects') else []
    questions = profile_user.questions.all()[:5] if hasattr(profile_user, 'questions') else []
    
    context = {
        'profile_user': profile_user,
        'badges': badges,
        'activities': activities,
        'articles': articles,
        'experiences': experiences,
        'projects': projects,
        'questions': questions,
    }
    return render(request, 'accounts/profile_detail.html', context)


@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        form = UserProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your profile has been updated successfully!')
            return redirect('accounts:profile', username=request.user.username)
    else:
        form = UserProfileUpdateForm(instance=request.user)
    return render(request, 'accounts/edit_profile.html', {'form': form})


def leaderboard_view(request):
    top_contributors = User.objects.order_by('-reputation_points')[:30]
    all_badges = Badge.objects.all()
    context = {
        'top_contributors': top_contributors,
        'all_badges': all_badges,
    }
    return render(request, 'accounts/leaderboard.html', context)


def alumni_directory_view(request):
    query = request.GET.get('q', '')
    company = request.GET.get('company', '')
    batch = request.GET.get('batch', '')

    alumni_list = User.objects.filter(role='ALUMNI')

    if query:
        alumni_list = alumni_list.filter(
            models.Q(first_name__icontains=query) |
            models.Q(last_name__icontains=query) |
            models.Q(skills__icontains=query) |
            models.Q(company__icontains=query) |
            models.Q(designation__icontains=query)
        )
    if company:
        alumni_list = alumni_list.filter(company__icontains=company)
    if batch:
        alumni_list = alumni_list.filter(batch_year=batch)

    companies = User.objects.filter(role='ALUMNI').exclude(company='').values_list('company', flat=True).distinct()
    batches = User.objects.filter(role='ALUMNI').exclude(batch_year__isnull=True).values_list('batch_year', flat=True).distinct().order_by('-batch_year')

    context = {
        'alumni_list': alumni_list,
        'companies': companies,
        'batches': batches,
        'selected_company': company,
        'selected_batch': batch,
        'search_query': query,
    }
    return render(request, 'accounts/alumni_directory.html', context)
