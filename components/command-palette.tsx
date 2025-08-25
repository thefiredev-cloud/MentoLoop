"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  FileText,
  Home,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  Sparkles,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Heart,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:bg-muted/50"
      >
        <Search className="h-4 w-4" />
        <span>Quick search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3">
          <Sparkles className="mr-2 h-4 w-4 text-yellow-400 animate-pulse" />
          <CommandInput placeholder="Type a command or search..." />
        </div>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
              className="cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/student-intake"))}
              className="cursor-pointer"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>For Students</span>
              <CommandShortcut>New</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/preceptor-intake"))}
              className="cursor-pointer"
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>For Preceptors</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/institutions"))}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>For Institutions</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Resources">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/help"))}
              className="cursor-pointer"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help Center</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/blog"))}
              className="cursor-pointer"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Blog</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/resources"))}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Resources</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Account">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/billing"))}
              className="cursor-pointer"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => console.log("Logout"))}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}