import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RoadmapTask from '@/models/RoadmapTask';
import { getCurrentUser } from '@/lib/auth';

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
    const task = await RoadmapTask.findOne({ id, userId: user.id });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    if (completed !== undefined) task.completed = completed;
    task.updatedAt = new Date();

    await task.save();

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
