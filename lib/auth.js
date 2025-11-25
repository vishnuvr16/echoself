import { getServerSession } from 'next-auth';
import connectDB from './mongodb';
import User from '@/models/User';

export async function getCurrentUser() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return null;
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function require2FA() {
  const user = await requireAuth();
  
  if (!user.twoFactorEnabled) {
    throw new Error('2FA is required for this action');
  }
  
  return user;
}
