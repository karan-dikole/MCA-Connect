from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Q, Count
from .models import Question, Answer
from .forms import QuestionForm, AnswerForm
from apps.accounts.models import ActivityLog

def question_list_view(request):
    query = request.GET.get('q', '')
    status = request.GET.get('status', '') # solved, unsolved
    tag = request.GET.get('tag', '')
    sort = request.GET.get('sort', 'newest')

    questions = Question.objects.select_related('author').prefetch_related('answers', 'upvotes').annotate(
        answers_count=Count('answers'),
        upvotes_count=Count('upvotes')
    )

    if query:
        questions = questions.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(tags__icontains=query)
        )
    if status == 'solved':
        questions = questions.filter(is_solved=True)
    elif status == 'unsolved':
        questions = questions.filter(is_solved=False)
    if tag:
        questions = questions.filter(tags__icontains=tag)

    if sort == 'votes':
        questions = questions.order_by('-upvotes_count', '-created_at')
    elif sort == 'bounty':
        questions = questions.order_by('-bounty_points', '-created_at')
    elif sort == 'unanswered':
        questions = questions.filter(answers_count=0).order_by('-created_at')
    else:
        questions = questions.order_by('-created_at')

    total_questions = Question.objects.count()
    solved_questions = Question.objects.filter(is_solved=True).count()
    total_answers = Answer.objects.count()

    context = {
        'questions': questions,
        'total_questions': total_questions,
        'solved_questions': solved_questions,
        'total_answers': total_answers,
        'selected_status': status,
        'selected_tag': tag,
        'selected_sort': sort,
        'search_query': query,
    }
    return render(request, 'qa/question_list.html', context)


def question_detail_view(request, slug):
    question = get_object_or_404(
        Question.objects.select_related('author').prefetch_related(
            'answers__author', 'answers__upvotes', 'upvotes'
        ),
        slug=slug
    )

    # Increment views
    Question.objects.filter(pk=question.pk).update(views_count=question.views_count + 1)

    is_upvoted = False
    if request.user.is_authenticated:
        is_upvoted = question.upvotes.filter(pk=request.user.pk).exists()

    answer_form = AnswerForm()
    answers = question.answers.all()

    context = {
        'question': question,
        'answers': answers,
        'is_upvoted': is_upvoted,
        'answer_form': answer_form,
    }
    return render(request, 'qa/question_detail.html', context)


@login_required
def question_create_view(request):
    if request.method == 'POST':
        form = QuestionForm(request.POST)
        if form.is_valid():
            bounty = form.cleaned_data.get('bounty_points', 0)
            if bounty > request.user.reputation_points:
                messages.error(request, f"You only have {request.user.reputation_points} reputation points. Cannot offer {bounty} bounty.")
                return render(request, 'qa/question_form.html', {'form': form, 'title': 'Ask a Technical Question'})

            question = form.save(commit=False)
            question.author = request.user
            question.save()

            if bounty > 0:
                request.user.reputation_points -= bounty
                request.user.save(update_fields=['reputation_points'])

            # Activity log
            ActivityLog.objects.create(
                user=request.user,
                activity_type='ANSWER',
                title=f'Asked question: "{question.title}"',
                link=question.get_absolute_url()
            )

            messages.success(request, 'Your question has been posted to the community!')
            return redirect(question.get_absolute_url())
    else:
        form = QuestionForm()
    return render(request, 'qa/question_form.html', {'form': form, 'title': 'Ask a Technical Question'})


@login_required
def question_toggle_upvote(request, slug):
    question = get_object_or_404(Question, slug=slug)
    if question.upvotes.filter(pk=request.user.pk).exists():
        question.upvotes.remove(request.user)
        upvoted = False
    else:
        question.upvotes.add(request.user)
        upvoted = True
        if question.author != request.user:
            question.author.add_reputation(5)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'upvoted': upvoted, 'count': question.upvotes.count()})
    return redirect(question.get_absolute_url())


@login_required
def answer_create_view(request, slug):
    question = get_object_or_404(Question, slug=slug)
    if request.method == 'POST':
        form = AnswerForm(request.POST)
        if form.is_valid():
            answer = form.save(commit=False)
            answer.question = question
            answer.author = request.user
            answer.save()

            request.user.add_reputation(15)
            ActivityLog.objects.create(
                user=request.user,
                activity_type='ANSWER',
                title=f'Answered: "{question.title}"',
                link=question.get_absolute_url()
            )

            messages.success(request, 'Your answer has been posted! (+15 reputation points)')
    return redirect(question.get_absolute_url())


@login_required
def answer_toggle_upvote(request, answer_id):
    answer = get_object_or_404(Answer, pk=answer_id)
    if answer.upvotes.filter(pk=request.user.pk).exists():
        answer.upvotes.remove(request.user)
        upvoted = False
    else:
        answer.upvotes.add(request.user)
        upvoted = True
        if answer.author != request.user:
            answer.author.add_reputation(10)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'upvoted': upvoted, 'count': answer.upvotes.count()})
    return redirect(answer.question.get_absolute_url())


@login_required
def answer_accept_view(request, answer_id):
    answer = get_object_or_404(Answer, pk=answer_id)
    question = answer.question
    
    if question.author != request.user:
        messages.error(request, 'Only the author of the question can accept an answer.')
        return redirect(question.get_absolute_url())

    # Unaccept previous answers
    question.answers.all().update(is_accepted=False)
    answer.is_accepted = True
    answer.save()

    question.is_solved = True
    question.save()

    # Award bounty points + accepted answer bonus
    bonus = 25 + question.bounty_points
    answer.author.add_reputation(bonus)

    messages.success(request, f"Solution marked as accepted! {answer.author.username} awarded +{bonus} reputation points.")
    return redirect(question.get_absolute_url())
