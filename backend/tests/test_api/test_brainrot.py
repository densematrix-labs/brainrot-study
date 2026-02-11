import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import io


@pytest.mark.asyncio
async def test_get_tokens_new_user(client: AsyncClient):
    """Test getting tokens for a new user - should create free trial."""
    response = await client.get(
        "/api/v1/tokens",
        headers={"X-Device-Id": "test-device-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_tokens"] == 2  # Free trial
    assert data["remaining_tokens"] == 2
    assert data["has_free_trial"] is True


@pytest.mark.asyncio
async def test_get_tokens_existing_user(client: AsyncClient):
    """Test getting tokens for an existing user."""
    device_id = "test-device-002"
    
    # First call creates free trial
    await client.get("/api/v1/tokens", headers={"X-Device-Id": device_id})
    
    # Second call should return same tokens
    response = await client.get("/api/v1/tokens", headers={"X-Device-Id": device_id})
    assert response.status_code == 200
    data = response.json()
    assert data["total_tokens"] == 2
    assert data["remaining_tokens"] == 2


@pytest.mark.asyncio
async def test_upload_invalid_file(client: AsyncClient):
    """Test uploading non-PDF file."""
    response = await client.post(
        "/api/v1/upload",
        files={"file": ("test.txt", b"hello world", "text/plain")},
        headers={"X-Device-Id": "test-device-003"}
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_valid_pdf(client: AsyncClient):
    """Test uploading a valid PDF."""
    # Create a minimal valid PDF
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF"""
    
    response = await client.post(
        "/api/v1/upload",
        files={"file": ("test.pdf", pdf_content, "application/pdf")},
        headers={"X-Device-Id": "test-device-004"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "filename" in data


@pytest.mark.asyncio
async def test_convert_no_tokens(client: AsyncClient):
    """Test convert without tokens returns 402."""
    device_id = "test-device-exhausted"
    
    # Get free trial
    await client.get("/api/v1/tokens", headers={"X-Device-Id": device_id})
    
    # Use both free tokens by mocking LLM
    with patch("app.services.llm_service.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = '{"title": "Test", "hook": "Test", "nuggets": [], "quiz": {"question": "Q", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "E"}, "tiktok_script": "S"}'
        
        # Use first token
        await client.post(
            "/api/v1/convert",
            json={"text": "Test content 1", "language": "en"},
            headers={"X-Device-Id": device_id}
        )
        
        # Use second token
        await client.post(
            "/api/v1/convert",
            json={"text": "Test content 2", "language": "en"},
            headers={"X-Device-Id": device_id}
        )
    
    # Third attempt should fail
    response = await client.post(
        "/api/v1/convert",
        json={"text": "Test content 3", "language": "en"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 402


@pytest.mark.asyncio
async def test_convert_success(client: AsyncClient):
    """Test successful conversion."""
    device_id = "test-device-convert"
    
    # Mock LLM response
    mock_response = '{"title": "🧠 Test Title", "hook": "No cap this is lit", "nuggets": [{"fact": "Test fact", "vibe": "It be like that fr", "emoji": "🔥"}], "quiz": {"question": "What?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Because yes"}, "tiktok_script": "POV: youre learning"}'
    
    with patch("app.services.llm_service.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = mock_response
        
        response = await client.post(
            "/api/v1/convert",
            json={"text": "Test content about biology", "language": "en"},
            headers={"X-Device-Id": device_id}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "content" in data
    assert data["remaining_tokens"] == 1  # Started with 2, used 1


@pytest.mark.asyncio
async def test_error_response_format(client: AsyncClient):
    """Test that error responses have correct format (not [object Object])."""
    device_id = "test-device-error-format"
    
    # Exhaust free trial
    with patch("app.services.llm_service.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = '{"title": "T", "hook": "H", "nuggets": [], "quiz": {"question": "Q", "options": ["A","B","C","D"], "correct": 0, "explanation": "E"}, "tiktok_script": "S"}'
        await client.post("/api/v1/convert", json={"text": "1", "language": "en"}, headers={"X-Device-Id": device_id})
        await client.post("/api/v1/convert", json={"text": "2", "language": "en"}, headers={"X-Device-Id": device_id})
    
    # Now tokens are exhausted, should get 402
    response = await client.post(
        "/api/v1/convert",
        json={"text": "3", "language": "en"},
        headers={"X-Device-Id": device_id}
    )
    
    assert response.status_code == 402
    data = response.json()
    
    # Verify detail is a string, not an object
    detail = data.get("detail")
    assert isinstance(detail, str), f"Error detail should be string, got: {type(detail)}"
    assert "[object Object]" not in str(detail)
    assert "No tokens remaining" in detail
