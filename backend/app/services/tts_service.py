import edge_tts
import asyncio
from typing import Optional
import io


VOICE_MAP = {
    "en": "en-US-AriaNeural",  # Young, energetic voice
    "zh": "zh-CN-XiaoxiaoNeural",
    "ja": "ja-JP-NanamiNeural", 
    "de": "de-DE-KatjaNeural",
    "fr": "fr-FR-DeniseNeural",
    "ko": "ko-KR-SunHiNeural",
    "es": "es-ES-ElviraNeural",
}


async def generate_tts(text: str, language: str = "en") -> bytes:
    """Generate TTS audio from text using Edge TTS."""
    voice = VOICE_MAP.get(language, VOICE_MAP["en"])
    
    communicate = edge_tts.Communicate(text, voice, rate="+10%")
    
    audio_data = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
    
    return audio_data.getvalue()


async def get_available_voices() -> list:
    """Get list of available voices."""
    voices = await edge_tts.list_voices()
    return [v for v in voices if v["Locale"].startswith(("en", "zh", "ja", "de", "fr", "ko", "es"))]
