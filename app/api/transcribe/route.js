import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('file');
    const targetRoute = formData.get('targetRoute');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    try {
      // Convert to File object for OpenAI
      const file = new File([await audioFile.arrayBuffer()], audioFile.name, {
        type: audioFile.type,
      });

      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
      });

      return NextResponse.json({
        text: transcription.text,
        targetRoute: targetRoute || null,
      });
    } catch (aiError) {
      console.error('Whisper transcription error:', aiError);
      return NextResponse.json(
        { error: aiError.message || 'Failed to transcribe audio' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}
