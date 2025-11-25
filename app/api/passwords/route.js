import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import PasswordItem from '@/models/PasswordItem';
import { getCurrentUser } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA must be enabled to access password vault' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reveal = searchParams.get('reveal') === 'true';

    await connectDB();
    const passwords = await PasswordItem.find({ userId: user.id })
      .sort({ createdAt: -1 });

    const passwordsResponse = passwords.map(pwd => ({
      id: pwd.id,
      service: pwd.service,
      username: pwd.username,
      category: pwd.category,
      url: pwd.url,
      notes: pwd.notes,
      password: reveal ? decrypt(pwd.encryptedPassword) : '••••••••',
      createdAt: pwd.createdAt,
      updatedAt: pwd.updatedAt,
    }));

    return NextResponse.json({ passwords: passwordsResponse });
  } catch (error) {
    console.error('Passwords fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passwords' },
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

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA must be enabled to use password vault' },
        { status: 403 }
      );
    }

    const { service, username, password, category, url, notes } = await request.json();

    if (!service || !password) {
      return NextResponse.json(
        { error: 'Service and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const passwordItem = new PasswordItem({
      id: uuidv4(),
      userId: user.id,
      service,
      username,
      encryptedPassword: encrypt(password),
      category: category || 'personal',
      url,
      notes,
    });

    await passwordItem.save();

    return NextResponse.json(
      {
        password: {
          id: passwordItem.id,
          service: passwordItem.service,
          username: passwordItem.username,
          category: passwordItem.category,
          url: passwordItem.url,
          notes: passwordItem.notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Password creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create password' },
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

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA must be enabled to manage password vault' },
        { status: 403 }
      );
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
    const result = await PasswordItem.deleteOne({ id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Password not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete password' },
      { status: 500 }
    );
  }
}
