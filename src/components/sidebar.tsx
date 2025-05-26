"use client"

import { CalendarDays, CheckSquare, Clock, LogOut, User } from "lucide-react"
import { Button } from "../components/ui/button"
import { useAuth } from "../components/auth/auth-context"
import { supabase } from "../server/db"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

type View = "tasks" | "calendar" | "timeblock"

interface SidebarProps {
  currentView: View
  setCurrentView: (view: View) => void
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="w-64 border-r bg-muted/10 p-4 flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Flowtime</h1>
        <p className="text-sm text-muted-foreground">Your productivity hub</p>
      </div>

      <nav className="space-y-2 flex-1">
        <Button
          variant={currentView === "tasks" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setCurrentView("tasks")}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Tasks
        </Button>
        <Button
          variant={currentView === "calendar" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setCurrentView("calendar")}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Calendar
        </Button>
        <Button
          variant={currentView === "timeblock" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => setCurrentView("timeblock")}
        >
          <Clock className="mr-2 h-4 w-4" />
          Time Blocking
        </Button>
      </nav>

      <div className="mt-auto border-t pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              {user?.email?.split('@')[0] || 'Profile'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
