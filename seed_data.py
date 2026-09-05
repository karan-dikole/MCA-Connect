import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mca_connect.settings')
django.setup()

from apps.accounts.models import User, Badge, UserBadge, ActivityLog
from apps.knowledge.models import Category, Article, Roadmap, ArticleComment, Bookmark
from apps.interviews.models import Company, InterviewExperience, InterviewComment
from apps.projects.models import Project, ProjectApplication, ProjectComment
from apps.qa.models import Question, Answer
from apps.mentorship.models import MentorProfile, MentorshipBooking

def run_seed():
    print("Seeding MCA Connect Database...")

    # 1. Create Badges
    badges_data = [
        ('Newcomer', 'newcomer', '🌱', 'Joined the MCA Connect community', 0),
        ('Knowledge Contributor', 'knowledge-contributor', '📚', 'Published technical articles and guides', 70),
        ('Interview Pioneer', 'interview-pioneer', '💼', 'Shared real interview experiences with junior batches', 100),
        ('Code Architect', 'code-architect', '💻', 'Showcased open-source and collaborative projects', 120),
        ('Problem Solver', 'problem-solver', '🎯', 'Solved community technical questions', 150),
        ('Master Mentor', 'master-mentor', '🌟', 'Conducted verified 1-on-1 alumni mentorship sessions', 200),
    ]
    for name, slug, icon, desc, pts in badges_data:
        Badge.objects.get_or_create(slug=slug, defaults={'name': name, 'icon': icon, 'description': desc, 'points_required': pts})

    # 2. Create Users
    # Admin
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'first_name': 'MCA Connect',
            'last_name': 'Admin',
            'email': 'admin@mcaconnect.edu',
            'role': 'ADMIN',
            'headline': 'Platform Lead & Coordinator',
            'is_staff': True,
            'is_superuser': True,
            'reputation_points': 500,
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()

    # Alumni 1: Rahul (Microsoft)
    rahul, _ = User.objects.get_or_create(
        username='rahul_verma',
        defaults={
            'first_name': 'Rahul',
            'last_name': 'Verma',
            'email': 'rahul.verma@microsoft.com',
            'role': 'ALUMNI',
            'headline': 'Software Engineer 2 @ Microsoft | MCA 2022 | Cloud & Distributed Systems',
            'bio': 'MCA Alumnus passionate about mentoring juniors on Data Structures, System Design, and Azure Cloud Architecture.',
            'company': 'Microsoft',
            'designation': 'Software Engineer 2',
            'batch_year': 2022,
            'skills': 'C++, C#, Python, Distributed Systems, Azure, Kubernetes, Microservices',
            'areas_of_interest': 'Cloud Computing, System Design, Scalable Backends',
            'github_url': 'https://github.com',
            'linkedin_url': 'https://linkedin.com',
            'reputation_points': 340,
            'is_mentor_available': True,
            'is_verified_alumni': True,
        }
    )
    rahul.set_password('pass1234')
    rahul.save()

    # Alumni 2: Priya (Google)
    priya, _ = User.objects.get_or_create(
        username='priya_nair',
        defaults={
            'first_name': 'Priya',
            'last_name': 'Nair',
            'email': 'priyanair@google.com',
            'role': 'ALUMNI',
            'headline': 'Software Engineer @ Google | MCA 2023 | Ex-Amazon Intern | DSA Enthusiast',
            'bio': 'Cracked Google SWE off-campus. Here to guide MCA students on LeetCode patterns and behavioral interview prep.',
            'company': 'Google',
            'designation': 'Software Engineer',
            'batch_year': 2023,
            'skills': 'Java, Python, Algorithms, Graph Theory, System Architecture, Go',
            'areas_of_interest': 'Algorithms, High Performance Computing, AI Infrastructure',
            'github_url': 'https://github.com',
            'linkedin_url': 'https://linkedin.com',
            'reputation_points': 410,
            'is_mentor_available': True,
            'is_verified_alumni': True,
        }
    )
    priya.set_password('pass1234')
    priya.save()

    # Student 1: Ananya
    ananya, _ = User.objects.get_or_create(
        username='ananya_roy',
        defaults={
            'first_name': 'Ananya',
            'last_name': 'Roy',
            'email': 'ananya.mca25@college.edu',
            'role': 'STUDENT',
            'headline': 'MCA 2025 | Full-Stack Web Dev (Django & React) | Preparing for SDE Roles',
            'bio': 'Final year MCA student passionate about building scalable web applications and participating in open-source hackathons.',
            'batch_year': 2025,
            'semester': 4,
            'skills': 'Python, Django, React, TypeScript, PostgreSQL, Docker, Git',
            'areas_of_interest': 'Web Development, REST APIs, Microservices',
            'github_url': 'https://github.com',
            'reputation_points': 180,
        }
    )
    ananya.set_password('pass1234')
    ananya.save()

    # Student 2: Rohan
    rohan, _ = User.objects.get_or_create(
        username='rohan_mehta',
        defaults={
            'first_name': 'Rohan',
            'last_name': 'Mehta',
            'email': 'rohan.mca26@college.edu',
            'role': 'STUDENT',
            'headline': 'MCA 2026 | Competitive Programmer (CodeChef 4★) | DSA & Algorithms',
            'bio': '1st year MCA student exploring machine learning pipelines and graph algorithms.',
            'batch_year': 2026,
            'semester': 2,
            'skills': 'C++, Python, Data Structures, Dynamic Programming, SQL',
            'areas_of_interest': 'Competitive Programming, Machine Learning',
            'reputation_points': 110,
        }
    )
    rohan.set_password('pass1234')
    rohan.save()

    # Mentor Profiles
    MentorProfile.objects.get_or_create(
        user=rahul,
        defaults={
            'headline': 'Senior SDE @ Microsoft | Cloud Architecture & Mock Technical Interviews',
            'expertise_areas': 'System Design, Cloud & Azure, Microservices, Resume Review, SDE Interview Prep',
            'years_of_experience': 4,
            'about': 'I provide structured 1-on-1 mock interviews simulating real Microsoft/Amazon technical rounds, offer deep resume critiques, and guide on cloud transitions.',
            'offers_resume_review': True,
            'offers_mock_interview': True,
            'offers_career_guidance': True,
            'is_active': True,
        }
    )

    MentorProfile.objects.get_or_create(
        user=priya,
        defaults={
            'headline': 'SWE @ Google | LeetCode Strategy, FAANG Prep & Behavioral Excellence',
            'expertise_areas': 'DSA Mastery, Graph Algorithms, Dynamic Programming, Behavioral STAR method',
            'years_of_experience': 3,
            'about': 'Struggling with Medium/Hard DSA problems or Google STAR behavioral rounds? Let us jump on a call and build an actionable prep plan.',
            'offers_resume_review': True,
            'offers_mock_interview': True,
            'offers_career_guidance': True,
            'is_active': True,
        }
    )

    # 3. Knowledge Categories
    cat_dsa, _ = Category.objects.get_or_create(name='Data Structures & Algorithms', defaults={'slug': 'dsa', 'icon': '⚡', 'description': 'Trees, Graphs, Dynamic Programming, and algorithmic optimization.'})
    cat_dbms, _ = Category.objects.get_or_create(name='DBMS & SQL Optimization', defaults={'slug': 'dbms', 'icon': '🗄️', 'description': 'Relational design, Normalization, ACID transactions, and indexing internals.'})
    cat_os, _ = Category.objects.get_or_create(name='Operating Systems & Concurrency', defaults={'slug': 'os', 'icon': '💻', 'description': 'Processes, threads, memory paging, deadlocks, and IPC.'})
    cat_web, _ = Category.objects.get_or_create(name='Web Development & Frameworks', defaults={'slug': 'web-dev', 'icon': '🌐', 'description': 'Full-stack development with Django, React, REST APIs, and authentication.'})
    cat_sys, _ = Category.objects.get_or_create(name='System Design & Scalability', defaults={'slug': 'system-design', 'icon': '🏗️', 'description': 'Load balancers, caching strategies, horizontal scaling, and message queues.'})

    # Articles
    Article.objects.get_or_create(
        slug='mastering-dynamic-programming-patterns',
        defaults={
            'title': 'Mastering Dynamic Programming Patterns for MCA Placement Drives',
            'author': priya,
            'category': cat_dsa,
            'difficulty': 'ADVANCED',
            'summary': 'A practical breakdown of the 5 fundamental DP patterns: 0/1 Knapsack, Longest Common Subsequence, Palindromic Substring, Matrix Chain, and State Machine.',
            'tags': 'dsa, dynamic-programming, algorithms, interview-prep',
            'is_featured': True,
            'views_count': 142,
            'content': """# Mastering Dynamic Programming: The 5 Fundamental Patterns

Dynamic Programming (DP) is often considered the most intimidating topic in MCA placement technical rounds. However, **over 85% of DP problems** fall into one of 5 standard patterns.

---

## 1. The 0/1 Knapsack Pattern

Given weights and values of `N` items, determine maximum value that fits in capacity `W`.

### Tabulation Code in Python:
```python
def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(values[i-1] + dp[i-1][w - weights[i-1]], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]

    return dp[n][W]
```

### Key Variations:
1. **Subset Sum Problem**: Does a subset sum equal `K`?
2. **Partition Equal Subset Sum**: Target sum is `total_sum // 2`.
3. **Coin Change (Unbounded)**: Repetition allowed.

---

## 2. Longest Common Subsequence (LCS)

Used in text diffing, DNA sequencing, and shortest common supersequence problems.

```python
def lcs(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]
```

---

## Summary Cheat Sheet:
- **State Definition:** What variables uniquely define a subproblem?
- **Base Case:** Smallest trivial input (e.g. `n = 0` or `w = 0`).
- **Transition:** Recurrence relation linking current state to previous states.
"""
        }
    )

    Article.objects.get_or_create(
        slug='database-indexing-b-trees-and-acid-in-depth',
        defaults={
            'title': 'Database Indexing Under the Hood: B-Trees, LSM-Trees & ACID Transactions',
            'author': rahul,
            'category': cat_dbms,
            'difficulty': 'INTERMEDIATE',
            'summary': 'Why are B+ Trees preferred over Binary Search Trees in PostgreSQL/MySQL? A comprehensive technical dive into disk I/O, write-ahead logging (WAL), and isolation levels.',
            'tags': 'dbms, sql, indexing, b-trees, acid, database',
            'is_featured': True,
            'views_count': 189,
            'content': """# Deep Dive into Database Indexing & ACID Guarantees

In software engineering interviews, questions about database indexing and transaction isolation are standard. Let's look under the hood.

---

## Why Databases Use B+ Trees Instead of Red-Black / AVL Trees

1. **Disk Block Alignment:** Disk reads occur in blocks (typically 4KB or 8KB). A B+ Tree node has a high branching factor (e.g., 100-500 keys per node), reducing tree height to 3 or 4 levels for millions of records.
2. **Sequential Range Scans:** In a B+ Tree, leaf nodes form a doubly linked list. Traversing `WHERE salary BETWEEN 50000 AND 100000` is simply a sequential pointer traversal!

```
               [ 50 | 100 ]
             /      |      \\
      [ 10 | 30 ] [ 60 | 80 ] [ 120 | 150 ]
        |    |      |    |       |     |
      [Leaf Nodes connected as Linked List -> -> ->]
```

---

## Transaction Isolation Levels

| Isolation Level | Dirty Reads | Non-Repeatable Reads | Phantom Reads |
| :--- | :--- | :--- | :--- |
| **Read Uncommitted** | Possible | Possible | Possible |
| **Read Committed** (Default in Postgres) | Prevented | Possible | Possible |
| **Repeatable Read** (Default in MySQL) | Prevented | Prevented | Possible |
| **Serializable** | Prevented | Prevented | Prevented |

> 💡 **Tip for MCA Viva/Interviews:** Mention Write-Ahead Logging (WAL) when asked how databases ensure **Durability** during system crashes!
"""
        }
    )

    # Roadmaps
    Roadmap.objects.get_or_create(
        slug='fullstack-python-django-roadmap',
        defaults={
            'title': 'Full-Stack Python & Django Engineering Roadmap',
            'target_role': 'Full-Stack Developer / Backend Engineer',
            'icon': '🐍',
            'summary': 'Comprehensive roadmap covering Python internals, Django ORM, REST Framework, PostgreSQL, Docker containerization, and AWS deployment.',
            'difficulty': 'Beginner to Advanced',
            'content': """# Phase 1: Python Core & OOP Foundations
- Python Data Model (Dunder methods, Iterators, Generators)
- Concurrency (`asyncio`, `threading`, `multiprocessing`)
- Clean Code & PEP 8 Standards

# Phase 2: Django & Architecture
- Django MVT pattern, ORM query optimization (`select_related`, `prefetch_related`)
- Django REST Framework (Serializers, ViewSets, JWT Authentication)
- Middleware & Custom Context Processors

# Phase 3: Database & Caching
- PostgreSQL Schema Design & Indexing
- Redis Caching & Celery Background Task Queue

# Phase 4: DevOps & Cloud
- Dockerizing Django + Nginx + Gunicorn
- CI/CD with GitHub Actions
- Cloud Deployment on AWS EC2 / DigitalOcean
"""
        }
    )

    Roadmap.objects.get_or_create(
        slug='cloud-devops-engineer-roadmap',
        defaults={
            'title': 'Cloud & DevOps Engineer Roadmap for MCA Grads',
            'target_role': 'DevOps / Cloud Platform Engineer',
            'icon': '☁️',
            'summary': 'Master Linux systems, Docker containerization, Kubernetes orchestration, Infrastructure as Code (Terraform), and AWS/GCP services.',
            'difficulty': 'Intermediate to Advanced',
            'content': """# 1. Linux & Networking Mastery
- Linux internals, systemd, bash scripting, file permissions
- TCP/IP, DNS, SSL/TLS certificates, HTTP/2 & WebSockets

# 2. Containerization & Orchestration
- Docker: Multi-stage builds, container security
- Kubernetes: Pods, Deployments, Services, Ingress, Helm charts

# 3. Infrastructure as Code (IaC) & CI/CD
- Terraform: Modules, State management on S3
- GitHub Actions & GitLab CI pipelines
- Monitoring: Prometheus & Grafana dashboards
"""
        }
    )

    # 4. Companies & Interview Experiences
    comp_amazon, _ = Company.objects.get_or_create(
        slug='amazon',
        defaults={'name': 'Amazon', 'tier': 'TIER1', 'industry': 'Cloud Computing & E-Commerce', 'description': 'Global cloud (AWS) and digital commerce leader.'}
    )
    comp_msft, _ = Company.objects.get_or_create(
        slug='microsoft',
        defaults={'name': 'Microsoft', 'tier': 'TIER1', 'industry': 'Software, Cloud & Enterprise AI', 'description': 'Pioneering developer tools, Azure cloud, and modern enterprise software.'}
    )
    comp_tcs, _ = Company.objects.get_or_create(
        slug='tcs-digital',
        defaults={'name': 'TCS (Digital Cadre)', 'tier': 'SERVICE', 'industry': 'IT Services & Digital Transformation', 'description': 'Premier digital engineering track at Tata Consultancy Services.'}
    )

    InterviewExperience.objects.get_or_create(
        slug='amazon-sde-1-on-campus-experience',
        defaults={
            'title': 'Amazon SDE-1 On-Campus Placement Experience (4 Rounds Breakdown)',
            'author': priya,
            'company': comp_amazon,
            'role_applied': 'Software Development Engineer 1',
            'batch_year': 2023,
            'experience_type': 'ON_CAMPUS',
            'offer_status': 'OFFERED',
            'difficulty': 'HARD',
            'compensation_details': '28 - 32 LPA CTC',
            'rounds_count': 4,
            'summary': 'Applied through the campus hiring drive. The process consisted of 1 Online Assessment and 3 virtual technical/behavioral rounds focusing on Amazon Leadership Principles (LPs) and Data Structures.',
            'rounds_breakdown': """### Round 1: Online Assessment (90 Mins)
- **Question 1 (Medium):** Subtree with maximum average (Tree Traversal).
- **Question 2 (Hard):** Minimum operations to deliver packages across Amazon fulfillment centers (Graph BFS + Priority Queue).
- **Work Style Assessment:** 20 behavioral scenarios matching Leadership Principles.

### Round 2: Technical Interview 1 (60 Mins)
- Deep discussion on MCA Capstone Project architecture.
- Live coding problem: Design and implement an **LRU Cache** using HashMap and Doubly Linked List from scratch.
- LP Questions: *"Tell me about a time you faced an ambiguous requirement."*

### Round 3: Technical Interview 2 (60 Mins)
- Problem 1: Word Ladder II (BFS with shortest path reconstruction).
- Problem 2: Course Schedule (Topological Sort / Cycle detection in directed graph).

### Round 4: Bar Raiser & Hiring Manager (60 Mins)
- High-level System Design: Design an image thumbnail generator service with S3 and SQS.
- 30 minutes dedicated to Leadership Principles (*Customer Obsession, Ownership, Bias for Action*).
""",
            'questions_asked': """1. Implement LRU Cache (get and put in O(1)).
2. Word Ladder II (BFS).
3. Detect cycle in Directed Graph.
4. Tell me about a time you had a technical disagreement with a teammate and how you resolved it.""",
            'tips_for_juniors': """1. **Do not ignore Leadership Principles (LPs):** Amazon weights LP answers equally with coding! Prepare 2 STAR-method stories for every LP.
2. **Communicate your thought process out loud:** Don't jump straight into code. Clarify constraints and discuss time/space complexities first.
3. Practice writing code without IDE autocomplete.""",
        }
    )

    # 5. Projects
    Project.objects.get_or_create(
        slug='algovisualizer-interactive-dsa-platform',
        defaults={
            'title': 'AlgoVisualizer: Interactive 3D Algorithm Platform',
            'author': ananya,
            'tagline': 'Interactive real-time visualization of Graph, Tree, and Sorting algorithms with step-by-step memory animation.',
            'category': 'WEB',
            'tech_stack': 'Django, React, Canvas API, TypeScript, WebSockets',
            'github_url': 'https://github.com/mca-connect/algovisualizer',
            'live_demo_url': 'https://algovisualizer-demo.vercel.app',
            'is_looking_for_teammates': True,
            'roles_needed': 'UI/UX Designer, React Frontend Engineer',
            'description': """# AlgoVisualizer

AlgoVisualizer is an open-source educational platform designed to help MCA students conceptualize complex algorithms visually.

### Key Features:
- Real-time Graph Traversal (Dijkstra, A*, BFS, DFS).
- Tree Rebalancing Visualizer (AVL Trees, Red-Black Trees).
- Custom speed controls and step-by-step code debugger highlighting lines as execution progresses.

### Architecture:
- **Backend:** Django REST Framework API for saving custom graphs and sharing problem test cases.
- **Frontend:** React + HTML5 Canvas API with hardware acceleration.

Looking for collaborators to add 3D Graph layout support!
"""
        }
    )

    Project.objects.get_or_create(
        slug='ai-healthpulse-predictive-diagnostics',
        defaults={
            'title': 'HealthPulse AI: Clinical Predictive Diagnostics',
            'author': rohan,
            'tagline': 'Machine learning platform predicting cardiac risk factors using multi-modal patient datasets.',
            'category': 'AI_ML',
            'tech_stack': 'Python, FastAPI, PyTorch, Scikit-Learn, Docker, Next.js',
            'github_url': 'https://github.com/mca-connect/healthpulse',
            'is_looking_for_teammates': True,
            'roles_needed': 'Backend FastAPI Engineer, Medical Data Specialist',
            'description': """# HealthPulse AI

An MCA research project leveraging ensemble machine learning models to detect early onset cardiovascular markers.

### Highlights:
- 94.2% validation accuracy on benchmark datasets.
- Fully containerized microservice architecture.
"""
        }
    )

    # 6. Technical Q&A Questions
    q1, _ = Question.objects.get_or_create(
        slug='how-to-optimize-django-orm-n-plus-one-queries',
        defaults={
            'title': 'How to completely eliminate the N+1 query problem in Django ORM with nested ForeignKeys?',
            'author': ananya,
            'language': 'python',
            'tags': 'django, orm, performance, postgresql, database',
            'bounty_points': 20,
            'is_solved': True,
            'content': """I have an `Article` model with a `Category` ForeignKey and `Author` User model, plus a ManyToMany relation to `tags`.

When rendering a list of 50 articles with author avatars and category icons, Django executes over 100+ separate SQL queries!

How can I optimize this in my Django view to fetch all related objects in only 1 or 2 queries?""",
            'code_snippet': """# Current slow query in view:
articles = Article.objects.filter(is_published=True)
# In template:
# {{ article.author.username }} -> triggers extra SELECT query per row!
# {{ article.category.name }}  -> triggers extra SELECT query per row!"""
        }
    )

    # Answer to Question 1
    Answer.objects.get_or_create(
        question=q1,
        author=rahul,
        defaults={
            'is_accepted': True,
            'content': """Use **`select_related`** for single-valued relationships (ForeignKey / OneToOne) and **`prefetch_related`** for multi-valued relationships (ManyToMany / Reverse ForeignKeys).

### Optimized Query:
```python
articles = Article.objects.filter(is_published=True).select_related(
    'author',
    'category'
).prefetch_related(
    'upvotes',
    'comments__author'
)
```

### Explanation:
1. `select_related('author', 'category')` performs an SQL `INNER JOIN` or `LEFT OUTER JOIN` in a single SQL query!
2. `prefetch_related('comments__author')` executes 1 additional query with `WHERE id IN (...)` and joins them in Python memory.

This reduces 100+ queries down to **just 2 queries**, increasing response speed by 10x!""",
        }
    )

    # Activity Logs
    ActivityLog.objects.get_or_create(
        user=priya,
        activity_type='EXPERIENCE',
        title='Shared Amazon SDE-1 Interview Experience',
        link='/interviews/amazon-sde-1-on-campus-experience/'
    )
    ActivityLog.objects.get_or_create(
        user=rahul,
        activity_type='ARTICLE',
        title='Published article: "Database Indexing Under the Hood"',
        link='/knowledge/database-indexing-b-trees-and-acid-in-depth/'
    )
    ActivityLog.objects.get_or_create(
        user=ananya,
        activity_type='PROJECT',
        title='Showcased project: "AlgoVisualizer"',
        link='/projects/algovisualizer-interactive-dsa-platform/'
    )

    print("MCA Connect database successfully seeded with realistic profiles, articles, placement archives, projects, and Q&A!")

if __name__ == '__main__':
    run_seed()
