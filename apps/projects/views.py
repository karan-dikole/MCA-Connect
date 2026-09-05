from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Count
from .models import Project, ProjectApplication, ProjectComment
from .forms import ProjectForm, ProjectApplicationForm, ProjectCommentForm
from apps.accounts.models import ActivityLog

def project_list_view(request):
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    teammates_only = request.GET.get('teammates', '')
    tech = request.GET.get('tech', '')

    projects = Project.objects.select_related('author').prefetch_related('likes').annotate(
        likes_total=Count('likes')
    )

    if query:
        projects = projects.filter(
            Q(title__icontains=query) |
            Q(tagline__icontains=query) |
            Q(description__icontains=query) |
            Q(tech_stack__icontains=query)
        )
    if category:
        projects = projects.filter(category=category)
    if teammates_only == '1':
        projects = projects.filter(is_looking_for_teammates=True)
    if tech:
        projects = projects.filter(tech_stack__icontains=tech)

    # Categories list
    categories = Project.CATEGORY_CHOICES
    teammates_needed_count = Project.objects.filter(is_looking_for_teammates=True).count()

    context = {
        'projects': projects,
        'categories': categories,
        'teammates_needed_count': teammates_needed_count,
        'selected_category': category,
        'teammates_only': teammates_only,
        'selected_tech': tech,
        'search_query': query,
    }
    return render(request, 'projects/project_list.html', context)


def project_detail_view(request, slug):
    project = get_object_or_404(
        Project.objects.select_related('author').prefetch_related('comments__author', 'applications__applicant', 'likes'),
        slug=slug
    )

    # Increment view count
    Project.objects.filter(pk=project.pk).update(views_count=project.views_count + 1)

    is_liked = False
    has_applied = False
    if request.user.is_authenticated:
        is_liked = project.likes.filter(pk=request.user.pk).exists()
        has_applied = project.applications.filter(applicant=request.user).exists()

    application_form = ProjectApplicationForm()
    comment_form = ProjectCommentForm()

    context = {
        'project': project,
        'is_liked': is_liked,
        'has_applied': has_applied,
        'application_form': application_form,
        'comment_form': comment_form,
    }
    return render(request, 'projects/project_detail.html', context)


@login_required
def project_create_view(request):
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES)
        if form.is_valid():
            project = form.save(commit=False)
            project.author = request.user
            project.save()

            # Award reputation & activity
            request.user.add_reputation(25)
            ActivityLog.objects.create(
                user=request.user,
                activity_type='PROJECT',
                title=f'Showcased project: "{project.title}"',
                link=project.get_absolute_url()
            )

            messages.success(request, 'Your project has been showcased! (+25 reputation points)')
            return redirect(project.get_absolute_url())
    else:
        form = ProjectForm()
    return render(request, 'projects/project_form.html', {'form': form, 'title': 'Showcase Your Project'})


@login_required
def project_edit_view(request, slug):
    project = get_object_or_404(Project, slug=slug, author=request.user)
    if request.method == 'POST':
        form = ProjectForm(request.POST, request.FILES, instance=project)
        if form.is_valid():
            form.save()
            messages.success(request, 'Project updated successfully.')
            return redirect(project.get_absolute_url())
    else:
        form = ProjectForm(instance=project)
    return render(request, 'projects/project_form.html', {'form': form, 'title': 'Edit Project', 'is_edit': True})


@login_required
def project_toggle_like(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if project.likes.filter(pk=request.user.pk).exists():
        project.likes.remove(request.user)
        liked = False
    else:
        project.likes.add(request.user)
        liked = True
        if project.author != request.user:
            project.author.add_reputation(5)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'liked': liked, 'count': project.likes.count()})
    return redirect(project.get_absolute_url())


@login_required
def project_apply_teammate(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if project.author == request.user:
        messages.warning(request, 'You are the owner of this project.')
        return redirect(project.get_absolute_url())

    if request.method == 'POST':
        form = ProjectApplicationForm(request.POST)
        if form.is_valid():
            app, created = ProjectApplication.objects.get_or_create(
                project=project,
                applicant=request.user,
                defaults={
                    'role_applied': form.cleaned_data['role_applied'],
                    'pitch_message': form.cleaned_data['pitch_message'],
                }
            )
            if created:
                messages.success(request, f'Your collaboration request for "{project.title}" has been submitted to {project.author.username}!')
            else:
                messages.info(request, 'You have already applied to join this project.')
    return redirect(project.get_absolute_url())


@login_required
def project_application_status_update(request, app_id, status):
    application = get_object_or_404(ProjectApplication, pk=app_id, project__author=request.user)
    if status in ['ACCEPTED', 'DECLINED']:
        application.status = status
        application.save()
        messages.success(request, f"Application updated to {status.capitalize()}.")
    return redirect(application.project.get_absolute_url())


@login_required
def project_add_comment(request, slug):
    project = get_object_or_404(Project, slug=slug)
    if request.method == 'POST':
        form = ProjectCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.project = project
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment posted.')
    return redirect(project.get_absolute_url())
