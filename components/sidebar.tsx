"use client"

import { CalendarDays, CheckSquare, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

type View = "tasks" | "calendar" | "timeblock"

interface SidebarProps {
  currentView: View
  setCurrentView: (view: View) => void
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
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

      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
