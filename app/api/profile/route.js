import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        bio: user.bio,
        birthday: user.birthday,
        location: user.location,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        voiceSettings: user.voiceSettings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    const { name, bio, birthday, location, theme, voiceSettings } = await request.json();

    await connectDB();

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : null;
    if (location !== undefined) user.location = location;
    if (theme !== undefined) user.theme = theme;
    if (voiceSettings !== undefined) user.voiceSettings = voiceSettings;
    user.updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        birthday: user.birthday,
        location: user.location,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        voiceSettings: user.voiceSettings,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
