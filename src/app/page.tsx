'use client'

import { AuthForm } from '../components/auth/auth-form'
import { useAuth } from '../components/auth/auth-context'
import { supabase } from '../server/db'
import { Sidebar } from '../components/sidebar'
import { TaskView } from '../components/tasks'
import { CalendarView } from '../components/calendar-view'
import { TimeBlockView } from '../components/time-block-view'
import { useState, useEffect } from 'react'

type View = "tasks" | "calendar" | "timeblock"

type TimeBlock = {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  date: string
}

export default function Home() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<View>("tasks")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: "1",
      title: "Deep Work",
      startTime: "09:00",
      endTime: "11:00",
      color: "bg-blue-100 border-blue-300",
      date: "2025-04-23",
    },
    {
      id: "2",
      title: "Team Meeting",
      startTime: "11:30",
      endTime: "12:30",
      color: "bg-purple-100 border-purple-300",
      date: "2025-04-23",
    },
    {
      id: "3",
      title: "Lunch Break",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-green-100 border-green-300",
      date: "2025-04-23",
    },
  ])

  useEffect(() => {
    const handleNavigateToTimeBlock = (event: CustomEvent) => {
      const { date } = event.detail
      setCurrentDate(date)
      setCurrentView("timeblock")
    }

    window.addEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)

    return () => {
      window.removeEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <AuthForm />
      </main>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-auto p-4">
        {currentView === "tasks" && <TaskView />}
        {currentView === "calendar" && (
          <CalendarView
            timeBlocks={timeBlocks}
            setTimeBlocks={setTimeBlocks}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
        {currentView === "timeblock" && (
          <TimeBlockView
            timeBlocks={timeBlocks}
            setTimeBlocks={setTimeBlocks}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}
      </main>
    </div>
  )
}
