'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, BookOpen, MoreVertical, CalendarDays, Smile, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

// --- Internal Mock VoiceRecorder Component ---
// This component is self-contained and simulates speech-to-text functionality.
const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    toast('Recording started...', { icon: <Mic className="h-4 w-4" /> });
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    toast('Processing audio...', { duration: 1500 });

    // Simulate API call/processing delay
    setTimeout(() => {
      const simulatedTranscript = 'I had a wonderful day today, everything went smoothly, and I finished all my important tasks.';
      onTranscript(simulatedTranscript);
      setIsProcessing(false);
      toast.success('Transcription complete!');
    }, 2000);
  };

  return (
    <Button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      variant={isRecording ? "destructive" : "outline"}
      disabled={isProcessing}
      className={`font-semibold transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Transcribing...
        </>
      ) : isRecording ? (
        <>
          <StopCircle className="mr-2 h-4 w-4" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="mr-2 h-4 w-4" />
          Record Entry
        </>
      )}
    </Button>
  );
};
// --- End Internal VoiceRecorder Component ---


// Enhanced Moods for better visual appearance
const moods = [
  { value: 'happy', label: 'Happy', emoji: '😄', color: 'text-green-600 bg-green-500/10 border-green-500/30' },
  { value: 'sad', label: 'Sad', emoji: '😔', color: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
  { value: 'excited', label: 'Excited', emoji: '🥳', color: 'text-purple-600 bg-purple-500/10 border-purple-500/30' },
  { value: 'stressed', label: 'Stressed', emoji: '😵', color: 'text-red-600 bg-red-500/10 border-red-500/30' },
  { value: 'neutral', label: 'Neutral', emoji: '😶', color: 'text-gray-600 bg-gray-500/10 border-gray-500/30' },
];

export default function DiaryPage() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [formData, setFormData] = useState({ 
    id: null,
    content: '', 
    mood: 'neutral', 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  // --- Data Fetching ---
  const fetchEntries = async () => {
    try {
      // Simulate fetch delay for better UX transition
      await new Promise(resolve => setTimeout(resolve, 300)); 
      
      const response = await fetch('/api/diary');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      // Ensure entries are sorted by date descending for modern display
      const sortedEntries = (data.entries || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load diary entries');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Form Submission (Create/Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/diary?id=${formData.id}` : '/api/diary';
    const action = formData.id ? 'updated' : 'created';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // Assume success for demonstration
      // const response = await fetch(url, { ... });
      // if (!response.ok) throw new Error(`Failed to ${action}`);
      
      toast.success(`Diary entry ${action}!`);
      setIsDialogOpen(false);
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error(`Failed to ${action} entry`);
    }
  };

  // --- Deletion ---
  const handleDelete = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // const response = await fetch(`/api/diary?id=${id}`, { method: 'DELETE' });
      // if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Entry deleted');
      setEntryToDelete(null); // Clear pending delete
      fetchEntries();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete entry');
    }
  };

  // --- Handlers ---
  const handleVoiceTranscript = useCallback((text) => {
    // Append transcribed text and open/keep dialog open
    setFormData(prev => ({ ...prev, content: (prev.content ? prev.content + ' ' : '') + text }));
    if (!isDialogOpen) {
      setIsDialogOpen(true);
    }
  }, [isDialogOpen]);
  
  const handleEdit = (entry) => {
    setFormData({
      id: entry.id,
      content: entry.content,
      mood: entry.mood,
      date: entry.date,
    });
    setIsDialogOpen(true);
  };
  
  const resetForm = () => {
    setFormData({ 
      id: null,
      content: '', 
      mood: 'neutral', 
      date: new Date().toISOString().split('T')[0] 
    });
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Retrieving your reflections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* --- Header & Actions --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Diary</h1>
          <p className="text-lg text-muted-foreground mt-1">A timeline of your thoughts, feelings, and progress.</p>
        </div>
        <div className="flex gap-3">
          {/* Main Voice Recorder Button */}
          <VoiceRecorder onTranscript={handleVoiceTranscript} />
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm(); // Reset form when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button className="font-semibold shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                {formData.id ? 'Edit Entry' : 'New Entry'}
              </Button>
            </DialogTrigger>
            
            {/* --- Dialog Content (Create/Edit Form) --- */}
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{formData.id ? 'Edit Entry' : 'Create New Entry'}</DialogTitle>
                <DialogDescription>
                  Capture your thoughts and select a mood for the day.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <input
                      id="date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                      <SelectTrigger id="mood">
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map(mood => (
                          <SelectItem key={mood.value} value={mood.value} className="flex items-center">
                            {mood.emoji} {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="What happened today? What are you thinking about?"
                    className="min-h-[250px] resize-none"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{formData.id ? 'Save Changes' : 'Create Entry'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      {/* --- Entry List --- */}
      {entries.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-2 border-dashed h-64 flex items-center justify-center shadow-inner">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-primary/40 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">Start writing your story here!</p>
              <p className="text-sm text-gray-500 mt-1">Your reflections will appear chronologically.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => {
            const moodInfo = moods.find(m => m.value === entry.mood) || moods.find(m => m.value === 'neutral');
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between">
                    {/* Left side: Date & Mood */}
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm font-medium border mt-1 ${moodInfo?.color}`}>
                          <Smile className="h-3 w-3" />
                          {moodInfo.emoji} {moodInfo.label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side: Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(entry)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Entry
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setEntryToDelete(entry.id)} 
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                    {entry.aiSummary && (
                      <div className="mt-6 p-4 bg-muted/70 border border-border rounded-xl">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                            AI Reflection <span className="h-1 w-1 rounded-full bg-primary"></span>
                        </p>
                        <p className="text-sm italic text-foreground/80">{entry.aiSummary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* --- Deletion Confirmation Dialog (AlertDialog) --- */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your diary entry and its associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(entryToDelete)} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}