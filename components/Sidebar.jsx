'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Book, 
  StickyNote, 
  Heart, 
  Map, 
  Film,
  Lock,
  Calendar,
  User,
  Bot,
  LogOut,
  Sparkles // Added for a modern touch on the logo
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator'; // Added Separator for cleaner section division
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Digital Twin', href: '/twin', icon: Bot }, // Moved 'Digital Twin' up for emphasis
  { name: 'Schedules', href: '/schedules', icon: Calendar },
  { name: 'Roadmaps', href: '/roadmaps', icon: Map },
  { name: 'Passions', href: '/passions', icon: Heart },
  { name: 'Enjoyment', href: '/enjoyment', icon: Film },
];

const dataManagement = [
  { name: 'Diary', href: '/diary', icon: Book },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Passwords', href: '/passwords', icon: Lock },
];

const userSection = [
  { name: 'Profile', href: '/profile', icon: User },
];


export default function Sidebar() {
  const pathname = usePathname();

  const renderNavItems = (items) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200', // Increased gap, padding, and rounded corners
              isActive
                ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' // High-contrast, vibrant active state
                : 'text-muted-foreground hover:bg-accent hover:text-foreground' // Subtle hover state
            )}
          >
            <item.icon className="h-5 w-5" /> {/* Increased icon size */}
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/80 bg-background/95 backdrop-blur-md shadow-xl"> {/* Added blur, shadow, and specific background */}
      {/* --- Logo/Header Section --- */}
      <div className="flex h-16 items-center px-6">
        <Sparkles className="h-6 w-6 mr-2 text-blue-500" /> {/* Added a sparkle icon */}
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 bg-clip-text text-transparent tracking-tight"> {/* Enhanced gradient and font */}
          EchoSelf
        </h1>
      </div>
      <Separator className="bg-border/60" /> {/* Separator for a clean break */}

      {/* --- Navigation Content --- */}
      <ScrollArea className="flex-1 p-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <h3 className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground tracking-wider">
            Platform
          </h3>
          {renderNavItems(navigation)}
        </div>

        <Separator className="my-4 bg-border/60" />

        {/* Data Management Section */}
        <div className="mb-6">
          <h3 className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground tracking-wider">
            Data
          </h3>
          {renderNavItems(dataManagement)}
        </div>
        
        <Separator className="my-4 bg-border/60" />

        {/* User Section */}
        <div className="mb-6">
          <h3 className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground tracking-wider">
            Account
          </h3>
          {renderNavItems(userSection)}
        </div>
      </ScrollArea>

      {/* --- Sign Out Footer --- */}
      <div className="border-t border-border/60 p-4">
        <Button
          variant="secondary" // Changed to secondary for contrast/modern look
          className="w-full text-base font-semibold transition-transform hover:scale-[1.01] duration-150" // Added transition for interactivity
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-3 h-5 w-5" /> {/* Increased icon size */}
          Sign Out
        </Button>
      </div>
    </div>
  );
}