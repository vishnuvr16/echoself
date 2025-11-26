'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import VoiceRecorder from '@/components/VoiceRecorder';
import { toast } from 'sonner';

export default function PassionsPage() {
  const [passions, setPassions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '' });

  useEffect(() => {
    fetchPassions();
  }, []);

  const fetchPassions = async () => {
    try {
      const response = await fetch('/api/passions');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPassions(data.passions || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load passions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/passions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create passion');
      
      toast.success('Passion added!');
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', category: '' });
      fetchPassions();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create passion');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/passions?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('Passion removed');
      fetchPassions();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete passion');
    }
  };

  const handleVoiceTranscript = (text) => {
    setFormData(prev => ({ ...prev, description: prev.description + ' ' + text }));
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
          <h1 className="text-4xl font-bold">Passions</h1>
          <p className="text-muted-foreground mt-2">Things you love and care about</p>
        </div>
        <div className="flex gap-2">
          <VoiceRecorder onTranscript={handleVoiceTranscript} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Passion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Passion</DialogTitle>
                <DialogDescription>Share what you're passionate about</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Photography, Cooking, Music"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Hobby, Skill, Art"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Description</Label>
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
                  </div>
                  <Textarea
                    placeholder="Tell us why you love this..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Add Passion</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {passions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No passions added yet. Share what you love!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {passions.map((passion, index) => (
            <motion.div
              key={passion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        {passion.title}
                      </CardTitle>
                      {passion.category && (
                        <span className="text-xs text-muted-foreground mt-1">{passion.category}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(passion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{passion.description || 'No description'}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
