'use client'

import { AuthForm } from '../components/auth/auth-form'
import { useAuth } from '../components/auth/auth-context'
import { supabase } from '../server/db'
import { Sidebar } from '../components/sidebar'
import { TaskView } from '../components/tasks'
import { CalendarView } from '../components/calendar-view'
import { TimeBlockView } from '../components/time-block-view'
import { WorkoutView } from '../components/workout-view'
import { useState, useEffect } from 'react'

type View = "tasks" | "calendar" | "timeblock" | "workout"

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
        {currentView === "calendar" && (<CalendarView/>)}
        {currentView === "timeblock" && (<TimeBlockView/>)}
        {currentView === "workout" && (<WorkoutView/>)}
      </main>
    </div>
  )
}
