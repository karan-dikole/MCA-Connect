import os
from django.core.management.base import BaseCommand
from apps.accounts.models import User
from apps.knowledge.models import Category, Article, Roadmap
from apps.interviews.models import Company, InterviewExperience
from apps.projects.models import Project
from apps.qa.models import Question, Answer
from apps.mentorship.models import MentorProfile

class Command(BaseCommand):
    help = 'Seeds initial demo accounts, study guides, roadmaps, placement debriefs, and project showcase for live production.'

    def handle(self, *args, **options):
        self.stdout.write("Starting MCA Connect production data seeding...")

        # 1. Admin Superuser
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mca.edu',
                'first_name': 'MCA',
                'last_name': 'Admin',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()
        self.stdout.write("  [OK] Admin account: admin / admin123")

        # 2. Mentor (Rahul Verma)
        mentor_user, created = User.objects.get_or_create(
            username='rahul_verma',
            defaults={
                'email': 'rahul.verma@alumni.mca.edu',
                'first_name': 'Rahul',
                'last_name': 'Verma',
                'role': 'ALUMNI',
                'company': 'Microsoft',
                'headline': 'Software Engineer II at Microsoft',
                'is_mentor_available': True,
                'reputation_points': 450,
            }
        )
        mentor_user.set_password('pass1234')
        mentor_user.role = 'ALUMNI'
        mentor_user.is_mentor_available = True
        mentor_user.save()

        MentorProfile.objects.update_or_create(
            user=mentor_user,
            defaults={
                'headline': 'Software Engineer II at Microsoft | Cloud & Distributed Systems',
                'expertise_areas': 'Distributed Systems, System Design, Python, Azure, DSA',
                'about': 'MCA Senior (Batch of 2023) passionate about helping juniors crack tier-1 product tech interviews and scale high-throughput architectures.',
                'years_of_experience': 3,
                'offers_mock_interview': True,
                'offers_resume_review': True,
                'offers_career_guidance': True,
                'preferred_meeting_tool': 'Google Meet',
                'is_active': True,
            }
        )
        self.stdout.write("  [OK] Mentor account: rahul_verma / pass1234")

        # 3. Student (Ananya Roy)
        student_user, created = User.objects.get_or_create(
            username='ananya_roy',
            defaults={
                'email': 'ananya.roy@mca.edu',
                'first_name': 'Ananya',
                'last_name': 'Roy',
                'role': 'STUDENT',
                'headline': 'Final Year MCA Student | Full Stack & AI Enthusiast',
                'reputation_points': 120,
            }
        )
        student_user.set_password('pass1234')
        student_user.role = 'STUDENT'
        student_user.save()
        self.stdout.write("  [OK] Student account: ananya_roy / pass1234")

        # 4. Categories & Study Guides
        from django.utils.text import slugify
        cat_sys, _ = Category.objects.get_or_create(slug='system-design', defaults={'name': 'System Design', 'description': 'High-level and low-level architecture patterns.'})
        cat_dsa, _ = Category.objects.get_or_create(slug='dsa-algorithms', defaults={'name': 'DSA & Algorithms', 'description': 'Data structures, algorithm design, and coding rounds.'})
        cat_web, _ = Category.objects.get_or_create(slug='web-full-stack', defaults={'name': 'Web & Full Stack', 'description': 'Modern web development, Django, React, and APIs.'})

        Article.objects.get_or_create(
            title='Mastering Distributed Systems: Consensus, Raft & Eventual Consistency',
            defaults={
                'author': mentor_user,
                'category': cat_sys,
                'difficulty': 'ADVANCED',
                'summary': 'A comprehensive, high-yield guide for MCA students on distributed consensus algorithms, the CAP theorem, and scalable databases.',
                'content': """### Introduction to Distributed Systems

When designing modern cloud architectures, single-node systems quickly become bottlenecks.

#### 1. The CAP Theorem
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every request receives a non-error response.
- **Partition Tolerance**: The system continues to operate despite network failures.

#### 2. Consensus with Raft & Paxos
In leader-based consensus like Raft, heartbeat intervals and log replication guarantee that all nodes agree on state transitions.

#### 3. Key Takeaway for Interviews
Focus on trade-offs between strong consistency and high availability when designing large-scale web services.
""",
                'tags': 'system-design, distributed-systems, cloud, architecture',
                'views_count': 342,
            }
        )

        # 5. Roadmaps
        Roadmap.objects.get_or_create(
            title='Full-Stack Software Engineer Roadmap (2026 Edition)',
            defaults={
                'target_role': 'Full Stack Developer',
                'difficulty': 'INTERMEDIATE',
                'summary': 'Complete step-by-step master plan for MCA students from basic programming to deploying cloud-native web apps.',
                'icon': 'Roadmap',
                'content': """### Step 1: Programming Fundamentals & Core DSA
- Master Python / TypeScript and fundamental data structures (Arrays, HashMaps, Trees, Graphs).

### Step 2: Modern Backend & APIs
- Django REST Framework, database schema design, indexing, and authentication.

### Step 3: Modern Reactive Frontend
- React 19, TypeScript, state management, and responsive CSS architecture.

### Step 4: Cloud & Deployment
- Docker, CI/CD pipelines, PostgreSQL, and serverless hosting (Vercel + Render).
""",
            }
        )

        # 6. Placement Debrief
        msft, _ = Company.objects.get_or_create(name='Microsoft', defaults={'website': 'https://microsoft.com'})
        InterviewExperience.objects.get_or_create(
            company=msft,
            author=mentor_user,
            role_applied='Software Development Engineer (SDE-1)',
            defaults={
                'batch_year': 2024,
                'offer_status': 'OFFERED',
                'difficulty': 'MEDIUM',
                'compensation_details': 'Rs 24 LPA + Stocks',
                'rounds_count': 4,
                'summary': '4 rounds consisting of Online Coding Assessment, 2 Technical DSA & System rounds, and 1 Hiring Manager Behavioral round.',
                'rounds_breakdown': """- Round 1: OA on HackerRank (2 DSA problems on Graphs and Dynamic Programming).
- Round 2: Live coding - Tree traversals and LRU Cache implementation.
- Round 3: Low-Level Design of a Rate Limiter with concurrency safety.
- Round 4: Techno-behavioral interview with Director of Engineering.""",
                'questions_asked': '1. Implement an LRU Cache with O(1) get and put.\n2. Design a thread-safe rate limiter token bucket algorithm.',
                'tips_for_juniors': 'Practice explaining your thought process out loud while writing clean, modular code.',
            }
        )

        # 7. Project Showcase
        Project.objects.get_or_create(
            title='Aurora AI Resume Intelligence & Matcher',
            defaults={
                'author': student_user,
                'tagline': 'AI-driven resume parsing and skill gap analyzer for engineering candidates.',
                'description': 'Engineered with Django REST, React, and Gemini AI. Analyzes resumes against tech job descriptions in real-time.',
                'category': 'AI',
                'tech_stack': 'Django, React, TypeScript, Gemini AI, TailwindCSS',
                'github_url': 'https://github.com/karan-dikole/MCA-Connect',
                'live_demo_url': 'https://mca-connect.vercel.app',
                'is_looking_for_teammates': True,
                'roles_needed': 'Frontend Engineer, UI/UX Designer',
            }
        )

        self.stdout.write(self.style.SUCCESS("[SUCCESS] MCA Connect production seed completed successfully!"))
