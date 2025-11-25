import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
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
    const movies = await Movie.find({ userId: user.id })
      .sort({ watchedDate: -1 });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Movies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
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

    const { title, type, rating, genre, watchedDate, notes, action } = await request.json();

    // Handle AI recommendation request
    if (action === 'recommend') {
      const openai = getOpenAIClient();
      if (!openai) {
        return NextResponse.json(
          { error: 'AI recommendations not available' },
          { status: 503 }
        );
      }

      await connectDB();
      const userMovies = await Movie.find({ userId: user.id })
        .sort({ watchedDate: -1 })
        .limit(20);

      const movieList = userMovies.map(m => `${m.title} (${m.genre?.join(', ')}) - Rating: ${m.rating}/10`).join('\n');

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a movie recommendation expert. Based on user watch history, suggest 5 movies or shows they might enjoy. Be specific and explain why.',
            },
            {
              role: 'user',
              content: `Based on my watch history, recommend movies/shows for me:\n${movieList}`,
            },
          ],
          temperature: 0.8,
        });

        const recommendations = response.choices[0].message.content;
        return NextResponse.json({ recommendations });
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
        return NextResponse.json(
          { error: 'Failed to generate recommendations' },
          { status: 500 }
        );
      }
    }

    // Regular movie creation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const movie = new Movie({
      id: uuidv4(),
      userId: user.id,
      title,
      type: type || 'movie',
      rating,
      genre: genre || [],
      watchedDate: watchedDate ? new Date(watchedDate) : new Date(),
      notes,
    });

    await movie.save();

    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Movie creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create movie entry' },
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
    const result = await Movie.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Movie delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
