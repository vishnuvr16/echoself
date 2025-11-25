import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import DiaryEntry from '@/models/DiaryEntry';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const entries = await DiaryEntry.find({ userId: user.id })
      .sort({ date: -1 })
      .limit(100);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Diary fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, date, mood } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate AI summary and mood detection
    let aiSummary = '';
    let detectedMood = mood;

    const openai = getOpenAIClient();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes diary entries and detects mood. Respond in JSON format with {"summary": "...", "mood": "happy/sad/neutral/excited/stressed"}',
            },
            {
              role: 'user',
              content: `Summarize this diary entry and detect the mood: ${content}`,
            },
          ],
          temperature: 0.7,
        });

        const result = JSON.parse(response.choices[0].message.content);
        aiSummary = result.summary;
        if (!detectedMood) {
          detectedMood = result.mood;
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
      }
    }

    const entry = new DiaryEntry({
      id: uuidv4(),
      userId: user.id,
      content,
      date: date ? new Date(date) : new Date(),
      mood: detectedMood,
      aiSummary,
    });

    await entry.save();

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Diary creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, content, mood } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: 'ID and content are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const entry = await DiaryEntry.findOne({ id, userId: user.id });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    entry.content = content;
    if (mood) entry.mood = mood;
    entry.updatedAt = new Date();

    await entry.save();

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Diary update error:', error);
    return NextResponse.json(
      { error: 'Failed to update diary entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await DiaryEntry.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Diary delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete diary entry' },
      { status: 500 }
    );
  }
}
