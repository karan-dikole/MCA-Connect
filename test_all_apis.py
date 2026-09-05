import requests
import json
import sys

BASE_DJANGO = "http://127.0.0.1:8000"
BASE_VITE = "http://localhost:5173"

def run_tests():
    passed = 0
    failed = 0
    print("=== STARTING MCA CONNECT END-TO-END SUITE ===\n")

    # 1. Test Global Stats API
    try:
        r = requests.get(f"{BASE_DJANGO}/api/stats/")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        assert "articles_count" in data and "mentors_count" in data
        print("[PASS] [1/9] /api/stats/ returned valid schema:", data)
        passed += 1
    except Exception as e:
        print("[FAIL] [1/9] /api/stats/ failed:", e)
        failed += 1

    # 2. Test Resume Matcher
    try:
        # 2a. Bad Request Test
        r_bad = requests.post(f"{BASE_DJANGO}/api/ai/resume-matcher/", json={"resume_text": "", "job_desc": ""})
        assert r_bad.status_code == 400
        # 2b. Valid Match Test
        payload = {
            "resume_text": "MCA Student with Python, Django, React, SQL, Git, and Algorithms.",
            "job_desc": "Looking for SDE with Python, Django, React, AWS, Docker, Kubernetes, SQL."
        }
        r = requests.post(f"{BASE_DJANGO}/api/ai/resume-matcher/", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "match_score" in data
        assert "matched_skills" in data and "missing_skills" in data
        assert "roadmap_tasks" in data and "matched_categorized" in data
        print(f"[PASS] [2/9] /api/ai/resume-matcher/ passed. Score: {data['match_score']}%, Matched: {data['matched_skills']}, Missing: {data['missing_skills']}")
        passed += 1
    except Exception as e:
        print("[FAIL] [2/9] /api/ai/resume-matcher/ failed:", e)
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
        assert "time_complexity" in data and "points" in data
        print(f"[PASS] [3/9] /api/ai/code-explainer/ passed. Time: {data['time_complexity']}")
        passed += 1
    except Exception as e:
        print("[FAIL] [3/9] /api/ai/code-explainer/ failed:", e)
        failed += 1

    # 4. Test Flashcards
    try:
        r = requests.post(f"{BASE_DJANGO}/api/ai/flashcards/", json={"topic": "DBMS"})
        assert r.status_code == 200
        data = r.json()
        assert len(data.get("cards", [])) > 0
        print(f"[PASS] [4/9] /api/ai/flashcards/ passed. Generated {len(data['cards'])} cards for topic '{data['topic']}'")
        passed += 1
    except Exception as e:
        print("[FAIL] [4/9] /api/ai/flashcards/ failed:", e)
        failed += 1

    # 5. Test Knowledge Hub Articles & Roadmaps
    try:
        r_art = requests.get(f"{BASE_DJANGO}/api/knowledge/articles/")
        r_road = requests.get(f"{BASE_DJANGO}/api/knowledge/roadmaps/")
        assert r_art.status_code == 200 and r_road.status_code == 200
        print("[PASS] [5/9] /api/knowledge/ passed. Articles: {len(r_art.json())}, Roadmaps: {len(r_road.json())}")
        passed += 1
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"[FAIL] [5/9] /api/knowledge/ failed: {e}")
        failed += 1

    # 6. Test Interviews
    try:
        r = requests.get(f"{BASE_DJANGO}/api/interviews/")
        assert r.status_code == 200
        print(f"[PASS] [6/9] /api/interviews/ passed. Logs found: {len(r.json())}")
        passed += 1
    except Exception as e:
        print("[FAIL] [6/9] /api/interviews/ failed:", e)
        failed += 1

    # 7. Test Projects
    try:
        r = requests.get(f"{BASE_DJANGO}/api/projects/")
        assert r.status_code == 200
        print(f"[PASS] [7/9] /api/projects/ passed. Projects found: {len(r.json())}")
        passed += 1
    except Exception as e:
        print("[FAIL] [7/9] /api/projects/ failed:", e)
        failed += 1

    # 8. Test Mentors
    try:
        r = requests.get(f"{BASE_DJANGO}/api/mentorship/mentors/")
        assert r.status_code == 200
        print(f"[PASS] [8/9] /api/mentorship/mentors/ passed. Active mentors: {len(r.json())}")
        passed += 1
    except Exception as e:
        print("[FAIL] [8/9] /api/mentorship/mentors/ failed:", e)
        failed += 1

    # 9. Test Vite Dev Server Proxy directly
    try:
        r = requests.get(f"{BASE_VITE}/api/stats/")
        assert r.status_code == 200
        print(f"[PASS] [9/10] Vite proxy -> Django (/api/stats/ via {BASE_VITE}) passed!")
        passed += 1
    except Exception as e:
        print(f"[FAIL] [9/10] Vite proxy test failed: {e}")
        failed += 1

    # 10. Test Authentication APIs
    try:
        s = requests.Session()
        # Me when guest
        r_me = s.get(f"{BASE_DJANGO}/api/auth/me/")
        assert r_me.status_code == 200 and r_me.json()["authenticated"] == False
        # Login
        r_login = s.post(f"{BASE_DJANGO}/api/auth/login/", json={"username": "ananya_roy", "password": "pass1234"})
        assert r_login.status_code == 200 and r_login.json()["success"] == True
        # Me when logged in
        r_me_auth = s.get(f"{BASE_DJANGO}/api/auth/me/")
        assert r_me_auth.status_code == 200 and r_me_auth.json()["authenticated"] == True
        # Logout
        r_logout = s.post(f"{BASE_DJANGO}/api/auth/logout/")
        assert r_logout.status_code == 200 and r_logout.json()["success"] == True
        print("[PASS] [10/10] /api/auth/ (login, me, logout session lifecycle) passed!")
        passed += 1
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"[FAIL] [10/10] /api/auth/ failed: {e}")
        failed += 1

    print(f"\n==========================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print(f"==========================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
