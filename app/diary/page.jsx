'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoiceRecorder from '@/components/VoiceRecorder';
import { toast } from 'sonner';
import { format } from 'date-fns';

const moods = [
  { value: 'happy', label: 'Happy 😊', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'sad', label: 'Sad 😢', color: 'bg-blue-100 text-blue-800' },
  { value: 'excited', label: 'Excited 🎉', color: 'bg-purple-100 text-purple-800' },
  { value: 'stressed', label: 'Stressed 😰', color: 'bg-red-100 text-red-800' },
  { value: 'neutral', label: 'Neutral 😐', color: 'bg-gray-100 text-gray-800' },
];

export default function DiaryPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/diary');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load diary entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create entry');
      
      toast.success('Diary entry created!');
      setIsDialogOpen(false);
      setFormData({ content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });
      fetchEntries();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    
    try {
      const response = await fetch(`/api/diary?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Entry deleted');
      fetchEntries();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleVoiceTranscript = (text) => {
    setFormData(prev => ({ ...prev, content: prev.content + ' ' + text }));
    setIsDialogOpen(true);
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
          <h1 className="text-4xl font-bold">Diary</h1>
          <p className="text-muted-foreground mt-2">Your personal thoughts and reflections</p>
        </div>
        <div className="flex gap-2">
          <VoiceRecorder onTranscript={handleVoiceTranscript} targetRoute="diary" />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Diary Entry</DialogTitle>
                <DialogDescription>Write about your day, thoughts, and feelings</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map(mood => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Content</Label>
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  </div>
                  <Textarea
                    placeholder="How was your day?"
                    className="min-h-[200px]"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No diary entries yet. Start writing your story!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => {
            const moodInfo = moods.find(m => m.value === entry.mood);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                        {entry.mood && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${moodInfo?.color}`}>
                            {moodInfo?.label}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                    {entry.aiSummary && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary:</p>
                        <p className="text-sm">{entry.aiSummary}</p>
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
