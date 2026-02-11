import fitz  # PyMuPDF
from typing import List
import re


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text content from PDF bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_parts = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        if text.strip():
            text_parts.append(text)
    
    doc.close()
    return "\n\n".join(text_parts)


def split_into_chunks(text: str, max_chunk_size: int = 2000) -> List[str]:
    """Split text into manageable chunks for processing."""
    # Split by paragraphs first
    paragraphs = re.split(r'\n\s*\n', text)
    
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        if len(current_chunk) + len(para) + 2 <= max_chunk_size:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = para[:max_chunk_size]  # Truncate if single para is too long
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks


def get_pdf_info(pdf_bytes: bytes) -> dict:
    """Get basic info about the PDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    info = {
        "page_count": len(doc),
        "metadata": doc.metadata,
    }
    doc.close()
    return info
