import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Passion from '@/models/Passion';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const passions = await Passion.find({ userId: user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ passions });
  } catch (error) {
    console.error('Passions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passions' },
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

    const { title, description, category } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const passion = new Passion({
      id: uuidv4(),
      userId: user.id,
      title,
      description,
      category,
    });

    await passion.save();

    return NextResponse.json({ passion }, { status: 201 });
  } catch (error) {
    console.error('Passion creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create passion' },
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

    const { id, title, description, category } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const passion = await Passion.findOne({ id, userId: user.id });

    if (!passion) {
      return NextResponse.json(
        { error: 'Passion not found' },
        { status: 404 }
      );
    }

    if (title) passion.title = title;
    if (description !== undefined) passion.description = description;
    if (category !== undefined) passion.category = category;
    passion.updatedAt = new Date();

    await passion.save();

    return NextResponse.json({ passion });
  } catch (error) {
    console.error('Passion update error:', error);
    return NextResponse.json(
      { error: 'Failed to update passion' },
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
    const result = await Passion.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Passion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Passion delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete passion' },
      { status: 500 }
    );
  }
}
