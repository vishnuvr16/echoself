import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Roadmap from '@/models/Roadmap';
import RoadmapTask from '@/models/RoadmapTask';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';
import { getGeminiClient } from '@/lib/gemini';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const roadmaps = await Roadmap.find({ userId: user.id })
      .sort({ createdAt: -1 });

    // Get tasks for each roadmap
    const roadmapsWithTasks = await Promise.all(
      roadmaps.map(async (roadmap) => {
        const tasks = await RoadmapTask.find({ roadmapId: roadmap.id })
          .sort({ order: 1 });
        return {
          ...roadmap.toObject(),
          tasks,
        };
      })
    );

    return NextResponse.json({ roadmaps: roadmapsWithTasks });
  } catch (error) {
    console.error('Roadmaps fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
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

    const { prompt, title } = await request.json();

    if (!prompt && !title) {
      return NextResponse.json(
        { error: 'Prompt or title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const roadmapId = uuidv4();
    let roadmapData = {
      id: roadmapId,
      userId: user.id,
      title: title || '',
      description: '',
      durationUnit: 'days',
      createdByAI: false,
    };

    let tasks = [];

    // --- AI GENERATION USING GEMINI ---
    if (prompt) {
      const gemini = getGeminiClient();

      if (gemini) {
        try {
          const aiPrompt = `
You are an AI that generates detailed learning roadmaps.

Return STRICT JSON ONLY. No explanation outside JSON.

Format:
{
  "title": "",
  "description": "",
  "duration": number,
  "durationUnit": "days" | "weeks" | "months",
  "tasks": [
    {
      "title": "",
      "description": "",
      "day": number,
      "week": number,
      "month": number
    }
  ]
}

User request:
"${prompt}"
          `;

          const result = await gemini.generateContent(aiPrompt);
          let text = result.response.text();

          // Remove possible markdown formatting
          text = text.replace(/```json|```/g, "").trim();

          const json = JSON.parse(text);

          roadmapData = {
            ...roadmapData,
            title: json.title,
            description: json.description,
            duration: json.duration,
            durationUnit: json.durationUnit,
            createdByAI: true,
          };

          tasks = json.tasks || [];

        } catch (aiErr) {
          console.error("Gemini AI Error:", aiErr);
        }
      }
    }

    const roadmap = new Roadmap(roadmapData);
    await roadmap.save();

    const savedTasks = await Promise.all(
      tasks.map(async (task, index) => {
        const roadmapTask = new RoadmapTask({
          id: uuidv4(),
          roadmapId: roadmap.id,
          userId: user.id,
          title: task.title,
          description: task.description,
          day: task.day,
          week: task.week,
          month: task.month,
          order: index,
        });

        return await roadmapTask.save();
      })
    );

    return NextResponse.json(
      { roadmap: { ...roadmap.toObject(), tasks: savedTasks } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Roadmap creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create roadmap' },
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
    await RoadmapTask.deleteMany({ roadmapId: id, userId: user.id });
    const result = await Roadmap.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Roadmap delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete roadmap' },
      { status: 500 }
    );
  }
}
