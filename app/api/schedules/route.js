import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    await connectDB();
    
    let query = { userId: user.id };
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const schedules = await Schedule.find(query)
      .sort({ startTime: 1 });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Schedules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
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

    const body = await request.json();
    const { action, prompt } = body;

    // AI schedule optimization
    if (action === 'optimize' || action === 'suggest') {
      const openai = getOpenAIClient();
      if (!openai) {
        return NextResponse.json(
          { error: 'AI features not available' },
          { status: 503 }
        );
      }

      await connectDB();
      const existingSchedules = await Schedule.find({ userId: user.id })
        .sort({ startTime: 1 })
        .limit(50);

      const scheduleContext = existingSchedules.map(s => 
        `${s.title}: ${s.startTime} - ${s.endTime}`
      ).join('\n');

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a productivity expert that helps optimize schedules and suggests time management improvements.',
            },
            {
              role: 'user',
              content: prompt || `Analyze my schedule and suggest optimizations:\n${scheduleContext}`,
            },
          ],
          temperature: 0.7,
        });

        const suggestions = response.choices[0].message.content;
        return NextResponse.json({ suggestions });
      } catch (aiError) {
        console.error('AI schedule optimization error:', aiError);
        return NextResponse.json(
          { error: 'Failed to generate suggestions' },
          { status: 500 }
        );
      }
    }

    // Regular schedule creation
    const { title, description, startTime, endTime, allDay, recurring, reminders, color, category } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const schedule = new Schedule({
      id: uuidv4(),
      userId: user.id,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      allDay: allDay || false,
      recurring: recurring || { enabled: false },
      reminders: reminders || [],
      color: color || '#3b82f6',
      category,
    });

    await schedule.save();

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error('Schedule creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
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

    const { id, completed } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const schedule = await Schedule.findOne({ id, userId: user.id });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    if (completed !== undefined) schedule.completed = completed;
    schedule.updatedAt = new Date();

    await schedule.save();

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
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
    const result = await Schedule.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
