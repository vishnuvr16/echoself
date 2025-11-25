'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Book, StickyNote, Heart, Film, Lightbulb, CheckCircle2 } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
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
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const data = dashboardData || {};

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Welcome back, {data.user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your digital self</p>
      </div>

      {/* Daily Insight */}
      {data.dailyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Daily Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{data.dailyInsight}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Notes"
          value={data.counts?.notes || 0}
          description="Total notes created"
          icon={StickyNote}
          color="bg-yellow-500/10 text-yellow-600"
          delay={0.1}
        />
        <DashboardCard
          title="Passions"
          value={data.counts?.passions || 0}
          description="Things you love"
          icon={Heart}
          color="bg-red-500/10 text-red-600"
          delay={0.2}
        />
        <DashboardCard
          title="Movies Watched"
          value={data.counts?.moviesWatched || 0}
          description="Entertainment tracked"
          icon={Film}
          color="bg-purple-500/10 text-purple-600"
          delay={0.3}
        />
        <DashboardCard
          title="Profile"
          value={`${data.profileCompletion || 0}%`}
          description="Profile completion"
          icon={CheckCircle2}
          color="bg-green-500/10 text-green-600"
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Diary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Today's Diary
              </CardTitle>
              <CardDescription>Your mood and thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              {data.todayDiary ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {data.todayDiary.mood === 'happy' && '😊'}
                      {data.todayDiary.mood === 'sad' && '😢'}
                      {data.todayDiary.mood === 'excited' && '🎉'}
                      {data.todayDiary.mood === 'stressed' && '😰'}
                      {data.todayDiary.mood === 'neutral' && '😐'}
                      {!data.todayDiary.mood && '📝'}
                    </span>
                    <span className="text-sm font-medium capitalize">
                      {data.todayDiary.mood || 'No mood'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {data.todayDiary.content}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No diary entry yet today. Start writing!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Setup</CardTitle>
              <CardDescription>Complete your profile to unlock all features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={data.profileCompletion || 0} />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Basic info: Name, bio, birthday</p>
                <p>✓ Security: Enable 2FA for password vault</p>
                <p>✓ Personalization: Theme, location</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Tasks */}
      {data.upcomingTasks && data.upcomingTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Roadmap Tasks</CardTitle>
              <CardDescription>Your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.upcomingTasks.map((task, index) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.day && <p className="text-xs text-muted-foreground">Day {task.day}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Schedules */}
      {data.upcomingSchedules && data.upcomingSchedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Your next events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.upcomingSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: schedule.color }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{schedule.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(schedule.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
