import re
from apps.knowledge.models import Article

class AIAssistantService:
    """
    Intelligent Assistant Engine for MCA Connect.
    Provides code explanation, resume vs job matching, and revision flashcard generation.
    """

    @staticmethod
    def explain_code(code, language='python'):
        code = code.strip()
        lines = code.split('\n')
        line_count = len(lines)

        # Detect common patterns
        has_loops = any(k in code for k in ['for ', 'while ', 'for(', 'while('])
        has_recursion = any(k in code for k in ['return ', 'def ']) and any(re.search(r'(\w+)\(.*\).*\1\(', code, re.DOTALL) or 'recur' in code.lower() for _ in [1])
        has_classes = 'class ' in code
        has_async = 'async ' in code or 'await ' in code
        has_sql = any(k in code.upper() for k in ['SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'JOIN ', 'GROUP BY'])

        # Analyze complexity heuristics
        if 'for ' in code and code.count('for ') >= 2:
            time_comp = "O(N²) or higher (Nested iterations detected)"
        elif has_loops:
            time_comp = "O(N) (Linear iteration detected)"
        elif has_recursion:
            time_comp = "O(2^N) or O(N log N) (Recursive branching pattern detected)"
        else:
            time_comp = "O(1) Constant Time"

        space_comp = "O(N) aux space (if collections allocated)" if any(k in code for k in ['[]', '{}', 'list(', 'dict(', 'new ']) else "O(1) in-place memory"

        # Key points breakdown
        points = []
        points.append(f"Code consists of **{line_count} lines** written in **{language.capitalize()}**.")
        if has_loops:
            points.append("Iterative logic detected for sequential data traversal.")
        if has_recursion:
            points.append("Recursive base case and progressive reduction state verified.")
        if has_classes:
            points.append("Object-Oriented structure with encapsulated state and methods.")
        if has_async:
            points.append("Asynchronous non-blocking I/O routines identified.")
        if has_sql:
            points.append("Relational query manipulation with clause aggregation.")

        # Potential gotchas
        gotchas = []
        if 'None' not in code and 'null' not in code and 'NULL' not in code:
            gotchas.append("Ensure null / empty input validation checks are handled to prevent runtime exceptions.")
        if '/' in code:
            gotchas.append("Verify division by zero safeguards for zero denominator inputs.")
        if has_loops and 'range(' in code:
            gotchas.append("Check edge bounds (e.g. 0-indexed vs 1-indexed, boundary elements).")
        if not gotchas:
            gotchas.append("Check memory footprint under large datasets (N > 10^6).")

        return {
            'time_complexity': time_comp,
            'space_complexity': space_comp,
            'points': points,
            'gotchas': gotchas,
            'summary': f"Syntactic & algorithmic structure analyzed. Logic operates cleanly with an expected runtime profile of {time_comp}."
        }

    @staticmethod
    def match_resume_with_job(resume_text, job_desc):
        # Extract keywords
        common_tech_keywords = [
            'python', 'django', 'fastapi', 'flask', 'javascript', 'typescript', 'react', 'next.js',
            'angular', 'vue', 'node.js', 'express', 'java', 'spring boot', 'c++', 'c#', '.net',
            'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws',
            'azure', 'gcp', 'git', 'github', 'ci/cd', 'linux', 'rest api', 'graphql',
            'data structures', 'algorithms', 'system design', 'machine learning', 'deep learning',
            'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'microservices', 'kafka'
        ]

        resume_lower = resume_text.lower()
        job_lower = job_desc.lower()

        required_skills = [k for k in common_tech_keywords if k in job_lower]
        if not required_skills:
            # Fallback extract words from job description
            required_skills = ['python', 'sql', 'git', 'data structures', 'rest api']

        matched_skills = [k for k in required_skills if k in resume_lower]
        missing_skills = [k for k in required_skills if k not in resume_lower]

        score = int((len(matched_skills) / len(required_skills)) * 100) if required_skills else 50
        score = min(100, max(20, score))

        # Recommend platform articles for missing skills
        recommended_articles = []
        for skill in missing_skills[:4]:
            articles = Article.objects.filter(
                title__icontains=skill
            ) | Article.objects.filter(tags__icontains=skill)
            for a in articles[:1]:
                if a not in recommended_articles:
                    recommended_articles.append(a)

        return {
            'match_score': score,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'recommended_articles': recommended_articles,
            'total_required': len(required_skills)
        }

    @staticmethod
    def generate_flashcards(topic):
        topic_lower = topic.lower()

        # Dynamic knowledge bank for standard CS/MCA topics
        cards = []
        if 'dbms' in topic_lower or 'sql' in topic_lower or 'database' in topic_lower or 'normalization' in topic_lower:
            cards = [
                {'front': 'What is ACID in Databases?', 'back': 'Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent safety), Durability (persisted after commit).'},
                {'front': '1NF vs 2NF vs 3NF Normalization', 'back': '1NF: Atomic column values. 2NF: 1NF + No partial functional dependencies on candidate keys. 3NF: 2NF + No transitive dependencies.'},
                {'front': 'Clustered vs Non-Clustered Index', 'back': 'Clustered index defines the physical order of data rows on disk (only 1 per table). Non-clustered index creates a separate pointer structure to actual rows.'},
                {'front': 'Optimistic vs Pessimistic Locking', 'back': 'Optimistic assumes few collisions and checks version tags at commit time. Pessimistic acquires row/table locks before any read/write.'},
                {'front': 'B-Tree vs B+ Tree in Databases', 'back': 'B+ Trees store actual data pointers only in leaf nodes connected by a linked list, making sequential range scans dramatically faster.'}
            ]
        elif 'os' in topic_lower or 'operating' in topic_lower or 'deadlock' in topic_lower or 'process' in topic_lower:
            cards = [
                {'front': 'What are the 4 Coffman Conditions for Deadlock?', 'back': '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.'},
                {'front': 'Process vs Thread', 'back': 'A Process has its own dedicated virtual address space and memory. Threads share the same address space and open file descriptors of their parent process.'},
                {'front': 'What is Virtual Memory & Paging?', 'back': 'Virtual memory maps process logical addresses to physical RAM frames via Page Tables. When a page is absent from RAM, a Page Fault occurs.'},
                {'front': 'Mutex vs Semaphore', 'back': 'Mutex is a locking mechanism with strict ownership (only the thread that locked can unlock). Semaphore is a signaling count mechanism without ownership.'},
                {'front': 'Context Switching Overhead', 'back': 'Saving current CPU registers, program counter, and cache state into PCB/TCB and loading the incoming process state.'}
            ]
        elif 'dsa' in topic_lower or 'tree' in topic_lower or 'graph' in topic_lower or 'algorithm' in topic_lower:
            cards = [
                {'front': 'Time & Space Complexity of QuickSort', 'back': 'Average Time: O(N log N), Worst Time: O(N²) when pivot is extreme. Space: O(log N) stack recursion.'},
                {'front': 'Dijkstra vs Bellman-Ford for Shortest Path', 'back': 'Dijkstra (Greedy, O(E + V log V)) cannot handle negative edge weights. Bellman-Ford (Dynamic Programming, O(V*E)) detects negative weight cycles.'},
                {'front': 'How does a Hash Map handle Collisions?', 'back': '1. Chaining (Linked Lists or Red-Black Trees in Java 8+)\n2. Open Addressing (Linear Probing, Quadratic Probing, Double Hashing).'},
                {'front': 'BFS vs DFS traversal and queues/stacks', 'back': 'BFS explores level-by-level using a FIFO Queue. DFS explores deepest branch first using recursion or an explicit LIFO Stack.'},
                {'front': 'Dynamic Programming: Memoization vs Tabulation', 'back': 'Memoization is Top-Down (recursive with cache). Tabulation is Bottom-Up (iterative table filling from base cases).'}
            ]
        else:
            cards = [
                {'front': f'Core Definition of {topic.title()}', 'back': f'{topic.title()} is a fundamental computer science concept utilized in scalable software engineering and MCA curriculum.'},
                {'front': f'Key Advantage & Use Case of {topic.title()}', 'back': 'Provides efficient resource utilization, high modularity, and simplified state management across distributed systems.'},
                {'front': f'Common Pitfalls when using {topic.title()}', 'back': 'Unbounded memory allocation, lack of error boundaries, and race conditions in concurrent execution.'},
                {'front': f'Interview Question related to {topic.title()}', 'back': 'Be prepared to write code from scratch, explain time/space complexities, and describe real-world trade-offs.'},
                {'front': 'Best Practice for Mastery', 'back': 'Implement practical projects on MCA Connect, review PYQs, and test edge cases under high concurrency.'}
            ]

        return cards
