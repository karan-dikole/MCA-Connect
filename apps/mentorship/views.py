from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import MentorProfile, MentorshipBooking
from .forms import MentorProfileForm, MentorshipBookingForm
from apps.accounts.models import ActivityLog, User

def mentor_list_view(request):
    query = request.GET.get('q', '')
    domain = request.GET.get('domain', '')

    mentors = MentorProfile.objects.filter(is_active=True).select_related('user')

    if query:
        mentors = mentors.filter(
            Q(headline__icontains=query) |
            Q(expertise_areas__icontains=query) |
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__company__icontains=query)
        )
    if domain:
        mentors = mentors.filter(expertise_areas__icontains=domain)

    context = {
        'mentors': mentors,
        'selected_domain': domain,
        'search_query': query,
    }
    return render(request, 'mentorship/mentor_list.html', context)


@login_required
def mentor_profile_setup_view(request):
    profile, created = MentorProfile.objects.get_or_create(
        user=request.user,
        defaults={'headline': request.user.headline or f"{request.user.role} Mentor"}
    )
    if request.method == 'POST':
        form = MentorProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            request.user.is_mentor_available = True
            request.user.save(update_fields=['is_mentor_available'])
            messages.success(request, 'Your Mentor profile is active! Students can now request 1-on-1 sessions.')
            return redirect('mentorship:mentor_list')
    else:
        form = MentorProfileForm(instance=profile)
    return render(request, 'mentorship/mentor_form.html', {'form': form, 'title': 'Mentor Profile Settings'})


@login_required
def book_mentor_session_view(request, mentor_id):
    mentor_user = get_object_or_404(User, pk=mentor_id)
    if mentor_user == request.user:
        messages.warning(request, 'You cannot book a mentorship session with yourself.')
        return redirect('mentorship:mentor_list')

    if request.method == 'POST':
        form = MentorshipBookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.mentor = mentor_user
            booking.student = request.user
            booking.save()

            messages.success(request, f'Mentorship request submitted to {mentor_user.get_full_name() or mentor_user.username}! You will be notified once confirmed.')
            return redirect('mentorship:my_sessions')
    else:
        form = MentorshipBookingForm()

    context = {
        'form': form,
        'mentor_user': mentor_user,
    }
    return render(request, 'mentorship/book_session.html', context)


@login_required
def my_sessions_view(request):
    as_student = MentorshipBooking.objects.filter(student=request.user).select_related('mentor')
    as_mentor = MentorshipBooking.objects.filter(mentor=request.user).select_related('student')

    context = {
        'as_student': as_student,
        'as_mentor': as_mentor,
    }
    return render(request, 'mentorship/my_sessions.html', context)


@login_required
def update_session_status(request, booking_id, status):
    booking = get_object_or_404(MentorshipBooking, pk=booking_id)
    if booking.mentor != request.user and booking.student != request.user:
        messages.error(request, 'Unauthorized action.')
        return redirect('mentorship:my_sessions')

    if status in ['CONFIRMED', 'COMPLETED', 'CANCELLED']:
        booking.status = status
        meeting_link = request.POST.get('meeting_link', '')
        if meeting_link:
            booking.meeting_link = meeting_link
        booking.save()

        if status == 'COMPLETED':
            booking.mentor.add_reputation(40)
            ActivityLog.objects.create(
                user=booking.mentor,
                activity_type='MENTORSHIP',
                title=f'Completed 1-on-1 mentorship session with {booking.student.username}',
                link=''
            )

        messages.success(request, f"Session status updated to {status.capitalize()}.")
    return redirect('mentorship:my_sessions')
