import asyncio
import edge_tts
import base64
from pathlib import Path
from typing import Optional

# Voice mapping for different languages
VOICE_MAP = {
    'en': 'en-US-AriaNeural',
    'hi': 'hi-IN-SwaraNeural',
    'ta': 'ta-IN-PallaviNeural',
    'te': 'te-IN-ShrutiNeural',
    'bn': 'bn-IN-TanishaaNeural',
    'mr': 'mr-IN-AarohiNeural',
    'gu': 'gu-IN-DhwaniNeural',
    'kn': 'kn-IN-SapnaNeural',
    'ml': 'ml-IN-SobhanaNeural',
    'pa': 'pa-IN-JalandharNeural',
}

async def text_to_speech_base64(text: str, language: str = 'en') -> Optional[str]:
    """
    Convert text to speech using Edge TTS and return as base64 encoded MP3.
    """
    try:
        voice = VOICE_MAP.get(language, 'en-US-AriaNeural')
        
        # Create a communicate instance
        communicate = edge_tts.Communicate(text, voice)
        
        # Collect audio data
        audio_data = b''
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        # Encode to base64
        if audio_data:
            return base64.b64encode(audio_data).decode('utf-8')
        return None
    except Exception as e:
        print(f"TTS Error: {e}")
        return None
