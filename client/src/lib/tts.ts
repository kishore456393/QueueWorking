export async function playTextToSpeech(text: string, language: string = 'en'): Promise<void> {
  try {
    const response = await fetch('http://127.0.0.1:8000/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const data = await response.json();
    
    if (data.audio_b64) {
      // Convert base64 to blob
      const audioData = atob(data.audio_b64);
      const bytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        bytes[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      await audio.play();
      
      // Cleanup
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } else {
      console.error('TTS error:', data.error);
    }
  } catch (error) {
    console.error('Failed to play TTS:', error);
  }
}
