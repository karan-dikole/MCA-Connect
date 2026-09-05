import requests
import json
import sys

BASE_DJANGO = "http://127.0.0.1:8000"
BASE_VITE = "http://localhost:5173"

def run_tests():
    passed = 0
    failed = 0
    print("=== STARTING MCA CONNECT FULL CRUD & RBAC TEST SUITE ===\n")

    # 1. Test Global Stats API
    try:
        r = requests.get(f"{BASE_DJANGO}/api/stats/")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "articles_count" in data and "mentors_count" in data
        print("[PASS] [1/14] /api/stats/ returned valid schema:", data)
        passed += 1
    except Exception as e:
        print("[FAIL] [1/14] /api/stats/ failed:", e)
        failed += 1

    # 2. Test Resume Matcher
    try:
        r_bad = requests.post(f"{BASE_DJANGO}/api/ai/resume-matcher/", json={"resume_text": "", "job_desc": ""})
        assert r_bad.status_code == 400
        payload = {
            "resume_text": "MCA Student with Python, Django, React, SQL, Git, and Algorithms.",
            "job_desc": "Looking for SDE with Python, Django, React, AWS, Docker, Kubernetes, SQL."
        }
        r = requests.post(f"{BASE_DJANGO}/api/ai/resume-matcher/", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "match_score" in data and "roadmap_tasks" in data
        print(f"[PASS] [2/14] /api/ai/resume-matcher/ passed. Score: {data['match_score']}%")
        passed += 1
    except Exception as e:
        print("[FAIL] [2/14] /api/ai/resume-matcher/ failed:", e)
        failed += 1

    # 3. Test Code Explainer
    try:
        code_payload = {
            "code": "def binary_search(arr, t):\n    l, r = 0, len(arr)-1\n    while l <= r:\n        m = (l+r)//2\n        if arr[m] == t: return m\n        elif arr[m] < t: l = m + 1\n        else: r = m - 1\n    return -1",
            "language": "python"
        }
        r = requests.post(f"{BASE_DJANGO}/api/ai/code-explainer/", json=code_payload)
        assert r.status_code == 200
        data = r.json()
        assert "time_complexity" in data
        print(f"[PASS] [3/14] /api/ai/code-explainer/ passed. Time: {data['time_complexity']}")
        passed += 1
    except Exception as e:
        print("[FAIL] [3/14] /api/ai/code-explainer/ failed:", e)
        failed += 1

    # 4. Test Flashcards
    try:
        r = requests.post(f"{BASE_DJANGO}/api/ai/flashcards/", json={"topic": "DBMS"})
        assert r.status_code == 200
        data = r.json()
        assert len(data.get("cards", [])) > 0
        print(f"[PASS] [4/14] /api/ai/flashcards/ passed. Generated {len(data['cards'])} cards")
        passed += 1
    except Exception as e:
        print("[FAIL] [4/14] /api/ai/flashcards/ failed:", e)
        failed += 1

    # Sessions for testing Student and Mentor RBAC
    s_student = requests.Session()
    s_mentor = requests.Session()

    # 5. Test Auth: Student Login (Ananya)
    try:
        r_log_s = s_student.post(f"{BASE_DJANGO}/api/auth/login/", json={"username": "ananya_roy", "password": "pass1234"})
        assert r_log_s.status_code == 200 and r_log_s.json()["user"]["role"] == "STUDENT"
        print("[PASS] [5/14] Student login (Ananya - Role: STUDENT) succeeded!")
        passed += 1
    except Exception as e:
        print("[FAIL] [5/14] Student login failed:", e)
        failed += 1

    # 6. Test Auth: Mentor Login (Rahul)
    try:
        r_log_m = s_mentor.post(f"{BASE_DJANGO}/api/auth/login/", json={"username": "rahul_verma", "password": "pass1234"})
        assert r_log_m.status_code == 200 and r_log_m.json()["user"]["role"] == "ALUMNI"
        print("[PASS] [6/14] Mentor login (Rahul - Role: ALUMNI) succeeded!")
        passed += 1
    except Exception as e:
        print("[FAIL] [6/14] Mentor login failed:", e)
        failed += 1

    # 7. Test Q&A CRUD: Student Asks Question & Mentor Answers
    q_id = None
    try:
        # Student creates question
        r_q = s_student.post(f"{BASE_DJANGO}/api/qa/questions/", json={
            "title": "How to optimize tree queries in Django?",
            "content": "Trying to query hierarchical categories without N+1 queries.",
            "language": "python",
            "tags": "django, orm, tree"
        })
        assert r_q.status_code == 200 and r_q.json()["success"] == True
        q_id = r_q.json()["id"]

        # Mentor posts answer
        r_ans = s_mentor.post(f"{BASE_DJANGO}/api/qa/questions/{q_id}/", json={
            "action": "answer",
            "content": "Use django-mptt or prefetch_related with selected parent/child keys to achieve O(1) query count."
        })
        assert r_ans.status_code == 200 and r_ans.json()["success"] == True

        # Upvote question
        r_up = s_student.post(f"{BASE_DJANGO}/api/qa/questions/{q_id}/", json={"action": "upvote"})
        assert r_up.status_code == 200

        print(f"[PASS] [7/14] Q&A CRUD (Student asked question #{q_id}, Mentor answered & upvoted) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [7/14] Q&A CRUD failed:", e)
        failed += 1

    # 8. Test Projects CRUD: Student Showcases Project & Likes
    proj_id = None
    try:
        r_p = s_student.post(f"{BASE_DJANGO}/api/projects/", json={
            "title": "Cloud Resume Matcher ATS",
            "tagline": "AI semantic resume gap analyzer",
            "description": "Full-stack application built with Django and React.",
            "tech_stack": "Django, React, Docker, Postgres",
            "category": "WEB",
            "github_url": "https://github.com/example/ats",
            "is_looking_for_teammates": True,
            "roles_needed": "UI Designer"
        })
        assert r_p.status_code == 200 and r_p.json()["success"] == True
        proj_id = r_p.json()["id"]

        # Mentor likes student project
        r_like = s_mentor.post(f"{BASE_DJANGO}/api/projects/{proj_id}/")
        assert r_like.status_code == 200 and r_like.json()["likes_count"] >= 1

        print(f"[PASS] [8/14] Projects CRUD (Student created project #{proj_id}, Mentor liked) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [8/14] Projects CRUD failed:", e)
        failed += 1

    # 9. Test Interview Placement Share CRUD
    try:
        r_int = s_student.post(f"{BASE_DJANGO}/api/interviews/", json={
            "company_name": "Microsoft",
            "role_applied": "Software Engineer",
            "batch_year": 2025,
            "offer_status": "OFFERED",
            "difficulty": "HARD",
            "compensation_details": "44 LPA",
            "rounds_count": 4,
            "summary": "4 rounds covering Advanced DSA, Low Level Design, and behavioral fit.",
            "questions_asked": "LRU Cache, Alien Dictionary, System Architecture",
            "tips_for_juniors": "Focus on clean modular code and communication."
        })
        assert r_int.status_code == 200 and r_int.json()["success"] == True
        print("[PASS] [9/14] Interviews CRUD (Shared Microsoft placement log) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [9/14] Interviews CRUD failed:", e)
        failed += 1

    # 10. Test Mentorship Booking: Student Books Session
    booking_id = None
    try:
        # Get mentor user id
        r_mentors = requests.get(f"{BASE_DJANGO}/api/mentorship/mentors/").json()
        mentor_user_id = r_mentors[0]["user_id"]

        # Student books
        r_book = s_student.post(f"{BASE_DJANGO}/api/mentorship/book/", json={
            "mentor_user_id": mentor_user_id,
            "session_type": "MOCK_INTERVIEW",
            "requested_date": "2026-09-12",
            "requested_time": "6:00 PM - 7:00 PM IST",
            "student_notes": "Preparing for Microsoft SDE-1 interview, need mock DSA round."
        })
        assert r_book.status_code == 200 and r_book.json()["success"] == True
        booking_id = r_book.json()["booking_id"]
        print(f"[PASS] [10/14] Mentorship Booking (Student booked session #{booking_id}) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [10/14] Mentorship Booking failed:", e)
        failed += 1

    # 11. Test Mentorship Portal: Mentor Confirms with Google Meet Link
    try:
        # Mentor checks incoming sessions
        r_my_m = s_mentor.get(f"{BASE_DJANGO}/api/mentorship/my-sessions/")
        assert r_my_m.status_code == 200 and r_my_m.json()["is_mentor"] == True
        assert len(r_my_m.json()["sessions"]) > 0

        # Mentor confirms session with meet link
        r_conf = s_mentor.post(f"{BASE_DJANGO}/api/mentorship/sessions/{booking_id}/update-status/", json={
            "status": "CONFIRMED",
            "meeting_link": "https://meet.google.com/abc-defg-hij"
        })
        assert r_conf.status_code == 200 and r_conf.json()["status"] == "CONFIRMED"

        # Student verifies confirmed session has meeting link
        r_my_s = s_student.get(f"{BASE_DJANGO}/api/mentorship/my-sessions/")
        confirmed_s = [s for s in r_my_s.json()["sessions"] if s["id"] == booking_id][0]
        assert confirmed_s["status"] == "CONFIRMED" and "meet.google.com" in confirmed_s["meeting_link"]

        print(f"[PASS] [11/14] Mentorship RBAC Portal (Mentor approved session #{booking_id} with Meet Link) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [11/14] Mentorship RBAC Portal failed:", e)
        failed += 1

    # 12. Test Knowledge Guide Publishing (RBAC: Forbidden for Student, Allowed for Mentor)
    try:
        # Student tries to publish official guide -> Expect 403 Forbidden
        r_forbidden = s_student.post(f"{BASE_DJANGO}/api/knowledge/articles/", json={
            "title": "Unauthorized Student Guide",
            "summary": "Should be rejected",
            "content": "Not allowed",
        })
        assert r_forbidden.status_code == 403, f"Expected 403, got {r_forbidden.status_code}"

        # Mentor publishes guide -> Expect 200 OK
        r_allowed = s_mentor.post(f"{BASE_DJANGO}/api/knowledge/articles/", json={
            "title": "Mastering Distributed Systems: Consensus & Paxos",
            "category": "Cloud & Distributed Systems",
            "difficulty": "ADVANCED",
            "summary": "Comprehensive guide on distributed consensus algorithms and Paxos.",
            "content": "# Paxos & Raft\n\nConsensus algorithms ensure fault-tolerant state machine replication.",
            "tags": "distributed systems, cloud, azure, paxos"
        })
        assert r_allowed.status_code == 200 and r_allowed.json()["success"] == True
        print("[PASS] [12/14] Knowledge RBAC (Student blocked with 403, Mentor published guide) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [12/14] Knowledge RBAC failed:", e)
        failed += 1

    # 13. Test Cleanup: Delete Question, Answer, Interview, Article, Session, and Mentor Profile Removal
    art_id = r_allowed.json()["id"]
    try:
        # Delete question
        r_del_q = s_student.delete(f"{BASE_DJANGO}/api/qa/questions/{q_id}/")
        assert r_del_q.status_code == 200 and r_del_q.json()["success"] == True

        # Delete project
        r_del_p = s_student.delete(f"{BASE_DJANGO}/api/projects/{proj_id}/")
        assert r_del_p.status_code == 200 and r_del_p.json()["success"] == True

        # Delete article (as mentor)
        r_del_art = s_mentor.delete(f"{BASE_DJANGO}/api/knowledge/articles/{art_id}/")
        assert r_del_art.status_code == 200 and r_del_art.json()["success"] == True

        # Cancel/delete mentorship session (as student)
        r_del_sess = s_student.delete(f"{BASE_DJANGO}/api/mentorship/sessions/{booking_id}/")
        assert r_del_sess.status_code == 200 and r_del_sess.json()["success"] == True

        print("[PASS] [13/15] Resource Deletion CRUD (Deleted test question, project, article, and cancelled session) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [13/15] Resource Deletion failed:", e)
        failed += 1

    # 14. Test Undo/Delete Mentor Profile
    try:
        import time
        ts = int(time.time())
        # Create a temp session for a user with mentor profile, then undo/delete mentor profile
        s_temp = requests.Session()
        r_reg = s_temp.post(f"{BASE_DJANGO}/api/auth/register/", json={
            "username": f"mistaken_mentor_{ts}",
            "email": f"mistaken_{ts}@mca.edu",
            "password": "pass1234",
            "first_name": "Test",
            "last_name": "Mentor",
            "role": "ALUMNI"
        })
        assert r_reg.status_code == 200
        r_remove = s_temp.post(f"{BASE_DJANGO}/api/mentorship/profile/remove/")
        assert r_remove.status_code == 200 and r_remove.json()["success"] == True
        assert r_remove.json()["user"]["role"] == "STUDENT"
        print("[PASS] [14/15] Undo/Delete Mentor Profile (Account successfully reverted to MCA Student) passed!")
        passed += 1
    except Exception as e:
        print("[FAIL] [14/15] Undo/Delete Mentor Profile failed:", e)
        failed += 1

    # 15. Test Vite Dev Server Proxy directly
    try:
        r = requests.get(f"{BASE_VITE}/api/stats/")
        assert r.status_code == 200
        print(f"[PASS] [15/15] Vite proxy -> Django (/api/stats/ via {BASE_VITE}) passed!")
        passed += 1
    except Exception as e:
        print(f"[FAIL] [15/15] Vite proxy test failed: {e}")
        failed += 1

    print(f"\n==========================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print(f"==========================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()

