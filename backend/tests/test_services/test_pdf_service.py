import pytest
from app.services.pdf_service import extract_text_from_pdf, split_into_chunks, get_pdf_info


def test_split_into_chunks_empty():
    """Test splitting empty text."""
    chunks = split_into_chunks("")
    assert chunks == []


def test_split_into_chunks_single():
    """Test splitting text that fits in one chunk."""
    text = "This is a short text."
    chunks = split_into_chunks(text, max_chunk_size=100)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_split_into_chunks_multiple():
    """Test splitting text into multiple chunks."""
    text = "Paragraph one.\n\nParagraph two.\n\nParagraph three."
    chunks = split_into_chunks(text, max_chunk_size=30)
    assert len(chunks) >= 2


def test_split_into_chunks_preserves_content():
    """Test that splitting preserves all content."""
    paragraphs = ["First paragraph.", "Second paragraph.", "Third paragraph."]
    text = "\n\n".join(paragraphs)
    chunks = split_into_chunks(text, max_chunk_size=1000)
    
    # All paragraphs should be in the chunks
    combined = " ".join(chunks)
    for para in paragraphs:
        assert para in combined
