import httpx
from typing import Optional
from app.core.config import settings


async def call_llm(
    prompt: str,
    system_prompt: Optional[str] = None,
    max_tokens: int = 2000,
    temperature: float = 0.8
) -> str:
    """Call LLM via llm-proxy."""
    messages = []
    
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    messages.append({"role": "user", "content": prompt})
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


BRAINROT_SYSTEM_PROMPT = """You are BrainrotBot 🧠💀, a Gen-Z content creator who makes studying actually bussin fr fr.

Your job is to transform boring study material into SHORT, ADDICTIVE learning content that hits different.

Rules:
1. Keep each "knowledge nugget" SUPER SHORT (under 100 words)
2. Use Gen-Z slang naturally but don't overdo it (no cap, fr, bussin, slay, lowkey, highkey, its giving, rent free)
3. Add relevant emojis 🔥💀📚
4. Make it funny but ACCURATE - no capping on the facts
5. Use analogies from TikTok culture, gaming, or memes
6. End with a hook that makes them want MORE

You're not dumbing things down - you're making them UNFORGETTABLE. The facts stay intact, the delivery goes crazy."""


async def generate_brainrot_content(text_chunk: str, language: str = "en") -> dict:
    """Generate brainrot-style learning content from a text chunk."""
    
    lang_instruction = ""
    if language != "en":
        lang_map = {
            "zh": "Chinese (Simplified)",
            "ja": "Japanese",
            "de": "German",
            "fr": "French",
            "ko": "Korean",
            "es": "Spanish"
        }
        lang_name = lang_map.get(language, "English")
        lang_instruction = f"\n\n⚠️ IMPORTANT: Generate ALL content in {lang_name}. Adapt the Gen-Z slang to what's popular in {lang_name}-speaking communities."
    
    prompt = f"""Transform this study material into brainrot-style content:{lang_instruction}

ORIGINAL CONTENT:
{text_chunk}

Generate a JSON response with this EXACT structure:
{{
  "title": "A catchy, memey title (with emoji)",
  "hook": "One-liner that grabs attention (under 15 words)",
  "nuggets": [
    {{
      "fact": "The actual fact/concept (accurate but rewording)",
      "vibe": "The brainrot explanation (funny, relatable, uses slang)",
      "emoji": "1-3 relevant emojis"
    }}
  ],
  "quiz": {{
    "question": "A quick quiz question about this content",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Why that answer is correct (brainrot style)"
  }},
  "tiktok_script": "A 30-second TikTok script that explains this (with timing notes)"
}}

Make it educational AND entertaining. No cap, this should slap. 🔥"""

    response = await call_llm(prompt, BRAINROT_SYSTEM_PROMPT)
    
    # Try to parse as JSON
    import json
    try:
        # Find JSON in response
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end > start:
            json_str = response[start:end]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    
    # Fallback structure
    return {
        "title": "Study Content 📚",
        "hook": "Let's learn something new!",
        "nuggets": [{
            "fact": text_chunk[:200],
            "vibe": "This is actually pretty interesting fr fr",
            "emoji": "🧠"
        }],
        "quiz": {
            "question": "Did you learn something?",
            "options": ["Yes", "No", "Maybe", "Idk"],
            "correct": 0,
            "explanation": "Learning is always a W"
        },
        "tiktok_script": "Hey! Let me tell you about this..."
    }
