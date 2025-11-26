'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book,
  StickyNote,
  Heart,
  Film,
  Lightbulb,
  CheckCircle2,
  CalendarDays, // New icon for schedules
  Rocket, // New icon for roadmaps/tasks
} from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator'; // Added Separator
import { toast } from 'sonner';
import Link from 'next/link'; // Added Link for navigation

// Define animation variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDashboardData(data.dashboard);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading your digital self...</p>
        </div>
      </div>
    );
  }

  const data = dashboardData || {};
  const userName = data.user?.name || 'User';

  return (
    <motion.div
      className="p-8 space-y-10" // Increased space for a cleaner layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* --- Header Section --- */}
      <motion.div variants={itemVariants}>
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Welcome back, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your personal data overview for the day.
        </p>
      </motion.div>

      {/* --- Daily Insight Card (Enhanced) --- */}
      {data.dailyInsight && (
        <motion.div variants={itemVariants}>
          <Card className="shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 border-none">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <Lightbulb className="h-6 w-6 text-yellow-300" />
                Daily Insight from EchoSelf
              </CardTitle>
            </div>
            <CardContent className="p-6 bg-card/90">
              <p className="text-base leading-relaxed text-foreground italic">
                "{data.dailyInsight}"
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Separator />

      {/* --- Stats Grid (Animated and Refined) --- */}
      <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Notes"
            value={data.counts?.notes || 0}
            description="Total notes created"
            icon={StickyNote}
            color="bg-yellow-500/10 text-yellow-600"
            delay={0.1} // Delay is handled by staggerChildren now, but kept for DashboardCard internal use if any
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Passions"
            value={data.counts?.passions || 0}
            description="Things you love"
            icon={Heart}
            color="bg-red-500/10 text-red-600"
            delay={0.2}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Movies Watched"
            value={data.counts?.moviesWatched || 0}
            description="Entertainment tracked"
            icon={Film}
            color="bg-purple-500/10 text-purple-600"
            delay={0.3}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Profile"
            value={`${data.profileCompletion || 0}%`}
            description="Profile completion"
            icon={CheckCircle2}
            color="bg-green-500/10 text-green-600"
            delay={0.4}
          />
        </motion.div>
      </motion.div>

      {/* --- Dual Section: Diary & Profile Progress --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Diary */}
        <motion.div variants={itemVariants}>
          <Link href="/diary" className="block h-full"> {/* Made the entire card a link */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  Today's Diary Entry
                </CardTitle>
                <CardDescription>Your mood and key thoughts for the day</CardDescription>
              </CardHeader>
              <CardContent>
                {data.todayDiary ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {/* More detailed emojis for moods */}
                        {data.todayDiary.mood === 'happy' && '😄'}
                        {data.todayDiary.mood === 'sad' && '😔'}
                        {data.todayDiary.mood === 'excited' && '🚀'}
                        {data.todayDiary.mood === 'stressed' && '🤯'}
                        {data.todayDiary.mood === 'neutral' && '🙂'}
                        {!data.todayDiary.mood && '✍️'}
                      </span>
                      <span className="text-lg font-bold capitalize text-foreground">
                        {data.todayDiary.mood || 'No mood recorded'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {data.todayDiary.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-base italic text-muted-foreground">
                    No diary entry yet today. Click to share your thoughts!
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Profile Completion */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Digital Profile Setup</CardTitle>
              <CardDescription>Complete your profile for a more accurate Digital Twin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm">Progress</span>
                <span className="text-lg text-primary">{data.profileCompletion || 0}%</span>
              </div>
              <Progress value={data.profileCompletion || 0} className="h-3" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${data.profileCompletion >= 30 ? 'text-green-500' : 'text-gray-400'}`} />
                  Basic info: Name, bio, birthday
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${data.profileCompletion >= 60 ? 'text-green-500' : 'text-gray-400'}`} />
                  Security: Enable 2FA for password vault
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${data.profileCompletion >= 90 ? 'text-green-500' : 'text-gray-400'}`} />
                  Personalization: Theme, location, goals
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- Bottom Row: Roadmap Tasks & Schedules --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Tasks */}
        {data.upcomingTasks && data.upcomingTasks.length > 0 && (
          <motion.div variants={itemVariants}>
            <Link href="/roadmaps" className="block h-full"> {/* Made the entire card a link */}
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-indigo-500" />
                    Upcoming Roadmap Milestones
                  </CardTitle>
                  <CardDescription>Tasks from your active learning journeys.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.upcomingTasks.slice(0, 4).map((task) => ( // Show max 4
                      <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-accent/30 hover:bg-accent transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          {task.day && <p className="text-xs text-muted-foreground">Roadmap Day {task.day}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Upcoming Schedules */}
        {data.upcomingSchedules && data.upcomingSchedules.length > 0 && (
          <motion.div variants={itemVariants}>
            <Link href="/schedules" className="block h-full"> {/* Made the entire card a link */}
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-teal-500" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Your next scheduled items.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.upcomingSchedules.slice(0, 4).map((schedule) => ( // Show max 4
                      <div key={schedule.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent transition-colors">
                        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: schedule.color || '#3b82f6' }}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{schedule.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.startTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}