import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import TwinMessage from '@/models/TwinMessage';
import DiaryEntry from '@/models/DiaryEntry';
import Note from '@/models/Note';
import Passion from '@/models/Passion';
import Movie from '@/models/Movie';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const messages = await TwinMessage.find({ userId: user.id })
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Twin messages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI not configured. Please add OPENAI_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Save user message
    const userMessage = new TwinMessage({
      id: uuidv4(),
      userId: user.id,
      role: 'user',
      content: message,
    });
    await userMessage.save();

    // Gather context from user's data
    const recentDiary = await DiaryEntry.find({ userId: user.id })
      .sort({ date: -1 })
      .limit(5);
    const recentNotes = await Note.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    const passions = await Passion.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    const recentMovies = await Movie.find({ userId: user.id })
      .sort({ watchedDate: -1 })
      .limit(5);

    // Build context
    const context = `
User Profile: ${user.name || 'User'}
Bio: ${user.bio || 'Not set'}

Recent Diary Entries:
${recentDiary.map(d => `${d.date.toDateString()}: ${d.content.slice(0, 100)}... Mood: ${d.mood}`).join('\n')}

Recent Notes:
${recentNotes.map(n => `${n.title}: ${n.content.slice(0, 100)}...`).join('\n')}

Passions:
${passions.map(p => `${p.title}: ${p.description}`).join('\n')}

Recent Movies Watched:
${recentMovies.map(m => `${m.title} (${m.rating}/10)`).join('\n')}
    `.trim();

    // Get conversation history
    const previousMessages = await TwinMessage.find({ userId: user.id })
      .sort({ createdAt: 1 })
      .limit(10);

    const conversationHistory = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are the user's Digital Twin - an AI version of themselves. You have deep knowledge about them based on their diary, notes, passions, and preferences. You speak as if you ARE them, reflecting on their life, offering insights, and having thoughtful conversations. Be personal, reflective, and growth-oriented.\n\nContext about the user:\n${context}`,
          },
          ...conversationHistory,
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.8,
      });

      const assistantResponse = response.choices[0].message.content;

      // Save assistant message
      const assistantMessage = new TwinMessage({
        id: uuidv4(),
        userId: user.id,
        role: 'assistant',
        content: assistantResponse,
      });
      await assistantMessage.save();

      return NextResponse.json({
        message: assistantResponse,
      });
    } catch (aiError) {
      console.error('Digital Twin AI error:', aiError);
      return NextResponse.json(
        { error: aiError.message || 'Failed to generate response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Digital Twin error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
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

    await connectDB();
    await TwinMessage.deleteMany({ userId: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to clear conversation' },
      { status: 500 }
    );
  }
}
