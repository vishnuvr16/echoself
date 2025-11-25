'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import VoiceRecorder from '@/components/VoiceRecorder';
import { toast } from 'sonner';

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await fetch('/api/roadmaps');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRoadmaps(data.roadmaps || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load roadmaps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');
      
      toast.success('Roadmap created!');
      setIsDialogOpen(false);
      setPrompt('');
      fetchRoadmaps();
    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!confirm('Delete this roadmap?')) return;
    
    try {
      const response = await fetch(`/api/roadmaps?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Roadmap deleted');
      fetchRoadmaps();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete roadmap');
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const response = await fetch('/api/roadmaps/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });

      if (!response.ok) throw new Error('Failed to update');
      fetchRoadmaps();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update task');
    }
  };

  const handleVoiceTranscript = (text) => {
    setPrompt(prev => prev + ' ' + text);
    setIsDialogOpen(true);
  };

  const groupTasksByPeriod = (tasks, durationUnit) => {
    if (durationUnit === 'days') {
      return tasks.reduce((acc, task) => {
        const day = task.day || 1;
        if (!acc[day]) acc[day] = [];
        acc[day].push(task);
        return acc;
      }, {});
    } else if (durationUnit === 'weeks') {
      return tasks.reduce((acc, task) => {
        const week = task.week || 1;
        if (!acc[week]) acc[week] = [];
        acc[week].push(task);
        return acc;
      }, {});
    }
    return { 1: tasks };
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Roadmaps</h1>
          <p className="text-muted-foreground mt-2">AI-generated learning paths</p>
        </div>
        <div className="flex gap-2">
          <VoiceRecorder onTranscript={handleVoiceTranscript} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Roadmap
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Roadmap</DialogTitle>
                <DialogDescription>
                  Tell AI what you want to learn and it will create a structured plan
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>What do you want to learn?</Label>
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  </div>
                  <Textarea
                    placeholder="e.g., Create a roadmap to learn React in 10 days"
                    className="min-h-[100px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Roadmap'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {roadmaps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No roadmaps yet. Let AI create your learning path!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((roadmap, index) => {
            const groupedTasks = groupTasksByPeriod(roadmap.tasks || [], roadmap.durationUnit);
            const totalTasks = roadmap.tasks?.length || 0;
            const completedTasks = roadmap.tasks?.filter(t => t.completed).length || 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{roadmap.title}</CardTitle>
                        <CardDescription>
                          {roadmap.duration} {roadmap.durationUnit} • {completedTasks}/{totalTasks} tasks completed
                        </CardDescription>
                        {roadmap.description && (
                          <p className="text-sm text-muted-foreground mt-2">{roadmap.description}</p>
                        )}
                        <div className="mt-3">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRoadmap(roadmap.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(groupedTasks).length > 3 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {Object.entries(groupedTasks).map(([period, tasks]) => (
                          <AccordionItem key={period} value={period}>
                            <AccordionTrigger>
                              {roadmap.durationUnit === 'weeks' ? `Week ${period}` : `Day ${period}`}
                              {' '}({tasks.filter(t => t.completed).length}/{tasks.length} completed)
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {tasks.map(task => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                                    onClick={() => handleToggleTask(task)}
                                  >
                                    {task.completed ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="space-y-2">
                        {roadmap.tasks.map(task => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                            onClick={() => handleToggleTask(task)}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
