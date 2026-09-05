from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib import messages
from django.db.models import Q, Count
from .models import Category, Article, ArticleComment, Bookmark, Roadmap
from .forms import ArticleForm, ArticleCommentForm
from apps.accounts.models import ActivityLog

def article_list_view(request):
    query = request.GET.get('q', '')
    category_slug = request.GET.get('category', '')
    difficulty = request.GET.get('difficulty', '')
    sort = request.GET.get('sort', 'newest')

    articles = Article.objects.filter(is_published=True).select_related('author', 'category').annotate(
        upvote_total=Count('upvotes'),
        comments_total=Count('comments')
    )

    if query:
        articles = articles.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(tags__icontains=query) |
            Q(summary__icontains=query)
        )
    if category_slug:
        articles = articles.filter(category__slug=category_slug)
    if difficulty:
        articles = articles.filter(difficulty=difficulty)

    if sort == 'top':
        articles = articles.order_by('-upvote_total', '-created_at')
    elif sort == 'views':
        articles = articles.order_by('-views_count')
    else:
        articles = articles.order_by('-created_at')

    categories = Category.objects.annotate(articles_count=Count('articles')).all()
    featured_articles = Article.objects.filter(is_published=True, is_featured=True)[:3]
    recent_roadmaps = Roadmap.objects.all()[:4]

    user_bookmarks = []
    if request.user.is_authenticated:
        user_bookmarks = list(request.user.bookmarks.values_list('article_id', flat=True))

    context = {
        'articles': articles,
        'categories': categories,
        'featured_articles': featured_articles,
        'recent_roadmaps': recent_roadmaps,
        'selected_category': category_slug,
        'selected_difficulty': difficulty,
        'selected_sort': sort,
        'search_query': query,
        'user_bookmarks': user_bookmarks,
    }
    return render(request, 'knowledge/article_list.html', context)


def article_detail_view(request, slug):
    article = get_object_or_404(
        Article.objects.select_related('author', 'category').prefetch_related('comments__author', 'upvotes'),
        slug=slug
    )
    
    # Increment views
    Article.objects.filter(pk=article.pk).update(views_count=article.views_count + 1)
    
    is_bookmarked = False
    is_upvoted = False
    if request.user.is_authenticated:
        is_bookmarked = Bookmark.objects.filter(user=request.user, article=article).exists()
        is_upvoted = article.upvotes.filter(pk=request.user.pk).exists()

    comment_form = ArticleCommentForm()
    related_articles = Article.objects.filter(category=article.category).exclude(pk=article.pk)[:3]

    context = {
        'article': article,
        'is_bookmarked': is_bookmarked,
        'is_upvoted': is_upvoted,
        'comment_form': comment_form,
        'related_articles': related_articles,
    }
    return render(request, 'knowledge/article_detail.html', context)


@login_required
def article_create_view(request):
    if request.method == 'POST':
        form = ArticleForm(request.POST)
        if form.is_valid():
            article = form.save(commit=False)
            article.author = request.user
            article.save()
            
            # Reputation award & activity
            request.user.add_reputation(20)
            ActivityLog.objects.create(
                user=request.user,
                activity_type='ARTICLE',
                title=f'Published article: "{article.title}"',
                link=article.get_absolute_url()
            )
            
            messages.success(request, 'Your article has been published successfully! (+20 reputation points)')
            return redirect(article.get_absolute_url())
    else:
        form = ArticleForm()
    return render(request, 'knowledge/article_form.html', {'form': form, 'title': 'Share New Tech Article'})


@login_required
def article_edit_view(request, slug):
    article = get_object_or_404(Article, slug=slug, author=request.user)
    if request.method == 'POST':
        form = ArticleForm(request.POST, instance=article)
        if form.is_valid():
            form.save()
            messages.success(request, 'Article updated successfully.')
            return redirect(article.get_absolute_url())
    else:
        form = ArticleForm(instance=article)
    return render(request, 'knowledge/article_form.html', {'form': form, 'title': 'Edit Article', 'is_edit': True})


@login_required
def article_toggle_upvote(request, slug):
    article = get_object_or_404(Article, slug=slug)
    if article.upvotes.filter(pk=request.user.pk).exists():
        article.upvotes.remove(request.user)
        upvoted = False
    else:
        article.upvotes.add(request.user)
        upvoted = True
        if article.author != request.user:
            article.author.add_reputation(5)

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'upvoted': upvoted, 'count': article.upvotes.count()})
    return redirect(article.get_absolute_url())


@login_required
def article_toggle_bookmark(request, slug):
    article = get_object_or_404(Article, slug=slug)
    bookmark, created = Bookmark.objects.get_or_create(user=request.user, article=article)
    if not created:
        bookmark.delete()
        bookmarked = False
    else:
        bookmarked = True

    if request.headers.get('x-requested-with') == 'XMLHttpRequest' or request.GET.get('ajax'):
        return JsonResponse({'bookmarked': bookmarked})
    return redirect(article.get_absolute_url())


@login_required
def add_comment_view(request, slug):
    article = get_object_or_404(Article, slug=slug)
    if request.method == 'POST':
        form = ArticleCommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.article = article
            comment.author = request.user
            comment.save()
            messages.success(request, 'Comment posted.')
    return redirect(article.get_absolute_url())


def category_detail_view(request, slug):
    category = get_object_or_404(Category, slug=slug)
    articles = Article.objects.filter(category=category, is_published=True).select_related('author')
    return render(request, 'knowledge/category_detail.html', {'category': category, 'articles': articles})


def roadmaps_list_view(request):
    roadmaps = Roadmap.objects.all()
    return render(request, 'knowledge/roadmaps_list.html', {'roadmaps': roadmaps})


def roadmap_detail_view(request, slug):
    roadmap = get_object_or_404(Roadmap, slug=slug)
    return render(request, 'knowledge/roadmap_detail.html', {'roadmap': roadmap})
