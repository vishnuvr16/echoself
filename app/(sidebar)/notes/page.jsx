'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import VoiceRecorder from '@/components/VoiceRecorder';
import { toast } from 'sonner';

const colors = [
  '#fef3c7', '#fce7f3', '#ddd6fe', '#bfdbfe', '#a7f3d0', '#fed7aa',
];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', color: colors[0], tags: [] });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create note');
      
      toast.success('Note created!');
      setIsDialogOpen(false);
      setFormData({ title: '', content: '', color: colors[0], tags: [] });
      fetchNotes();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create note');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Note deleted');
      fetchNotes();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete note');
    }
  };

  const togglePin = async (note) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: note.id, pinned: !note.pinned }),
      });

      if (!response.ok) throw new Error('Failed to pin');
      fetchNotes();
    } catch (error) {
      console.error('Pin error:', error);
      toast.error('Failed to pin note');
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
          <h1 className="text-4xl font-bold">Notes</h1>
          <p className="text-muted-foreground mt-2">Quick thoughts and ideas</p>
        </div>
        <div className="flex gap-2">
          <VoiceRecorder onTranscript={handleVoiceTranscript} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Note</DialogTitle>
                <DialogDescription>Capture your thoughts and ideas</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Note title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Content</Label>
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  </div>
                  <Textarea
                    placeholder="What's on your mind?"
                    className="min-h-[150px]"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                        style={{ backgroundColor: color, borderColor: formData.color === color ? '#000' : color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Note</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full" style={{ backgroundColor: note.color }}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{note.title}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => togglePin(note)}
                      >
                        <Pin className={`h-3 w-3 ${note.pinned ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap line-clamp-6">{note.content}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
