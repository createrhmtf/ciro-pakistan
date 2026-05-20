import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    print("Health Status Check:", res.status_code, res.json())
    assert res.status_code == 200

def test_analyze_crisis():
    payload = {
        "signals": [
            {
                "id": "sig_test_99",
                "source": "Twitter",
                "content": "F-7 sector main flood aagya hai, wasa k pipe phatne se. roads blocked hain!",
                "timestamp": "2026-05-20T12:00:00Z"
            }
        ]
    }
    print("Sending signals to analyze-crisis pipeline...")
    res = client.post("/api/analyze-crisis", json=payload)
    print("Analyze Crisis Status:", res.status_code)
    
    if res.status_code == 200:
        data = res.json()
        print("Success! Active Crises count:", len(data.get("crises", [])))
        print("Generated Alerts count:", len(data.get("alerts", [])))
        print("Agent traces count:", len(data.get("traces", [])))
        
        # Verify schema expectations
        assert len(data.get("crises", [])) > 0
        assert len(data.get("alerts", [])) > 0
        assert len(data.get("traces", [])) > 0
        print("Integration contract verified successfully.")
    else:
        print("Pipeline execution failed:", res.text)
        sys.exit(1)

if __name__ == "__main__":
    test_health()
    test_analyze_crisis()
