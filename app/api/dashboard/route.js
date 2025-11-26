import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DiaryEntry from '@/models/DiaryEntry';
import Note from '@/models/Note';
import Passion from '@/models/Passion';
import Roadmap from '@/models/Roadmap';
import RoadmapTask from '@/models/RoadmapTask';
import Movie from '@/models/Movie';
import Schedule from '@/models/Schedule';
import { getCurrentUser } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDiary = await DiaryEntry.findOne({
      userId: user.id,
      date: { $gte: today, $lt: tomorrow },
    });

    const recentNotes = await Note.countDocuments({ userId: user.id });
    const passionsCount = await Passion.countDocuments({ userId: user.id });
    const moviesCount = await Movie.countDocuments({ userId: user.id });

    // Get upcoming tasks from roadmaps
    const upcomingTasks = await RoadmapTask.find({
      userId: user.id,
      completed: false,
    })
      .sort({ day: 1, week: 1, order: 1 })
      .limit(5);

    // Get upcoming schedules
    const upcomingSchedules = await Schedule.find({
      userId: user.id,
      startTime: { $gte: new Date() },
      completed: false,
    })
      .sort({ startTime: 1 })
      .limit(5);

    // Profile completion percentage
    let completionScore = 0;
    if (user.name) completionScore += 20;
    if (user.bio) completionScore += 20;
    if (user.birthday) completionScore += 15;
    if (user.location) completionScore += 15;
    if (user.twoFactorEnabled) completionScore += 30;

    // Generate daily insight with AI
    let dailyInsight = 'Start your day by reflecting on your goals!';
    const openai = getOpenAIClient();
    if (openai) {
      try {
        const recentDiary = await DiaryEntry.find({ userId: user.id })
          .sort({ date: -1 })
          .limit(3);
        
        const diaryContext = recentDiary
          .map(d => `${d.date.toDateString()}: ${d.content.slice(0, 100)}... Mood: ${d.mood}`)
          .join('\n');

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a personal growth coach. Provide one inspiring daily insight based on recent diary entries. Keep it brief (2-3 sentences).',
            },
            {
              role: 'user',
              content: `Recent diary entries:\n${diaryContext}`,
            },
          ],
          temperature: 0.8,
        });

        dailyInsight = response.choices[0].message.content;
      } catch (aiError) {
        console.error('Daily insight generation error:', aiError);
      }
    }

    return NextResponse.json({
      dashboard: {
        todayDiary: todayDiary ? { mood: todayDiary.mood, content: todayDiary.content.slice(0, 150) } : null,
        counts: {
          notes: recentNotes,
          passions: passionsCount,
          moviesWatched: moviesCount,
        },
        upcomingTasks,
        upcomingSchedules,
        profileCompletion: completionScore,
        dailyInsight,
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
