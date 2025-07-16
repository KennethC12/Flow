"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../components/sidebar"
import { TaskView } from "./tasks"
import { CalendarView } from "../components/calendar-view"
import { TimeBlockView } from "../components/time-block-view"
import { WorkoutView } from "../components/workout-view"

type View = "tasks" | "calendar" | "timeblock" | "workout"

export interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  date: string // Add date field to track which day the timeblock belongs to
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("tasks")
  const [currentDate, setCurrentDate] = useState(new Date())

  console.log('Dashboard component rendering, currentView:', currentView)

  useEffect(() => {
    console.log('Dashboard: useEffect running')
    // Event listener for navigating from calendar to timeblock view
    const handleNavigateToTimeBlock = (event: CustomEvent) => {
      console.log('Dashboard received navigateToTimeBlock event:', event.detail)
      const { date } = event.detail
      console.log('Date from event:', date)
      const newDate = new Date(date)
      console.log('Converted date:', newDate)
      setCurrentDate(newDate)
      setCurrentView("timeblock")
    }

    console.log('Dashboard: Setting up event listener for navigateToTimeBlock')
    // Add event listener
    window.addEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)

    // Clean up
    return () => {
      console.log('Dashboard: Cleaning up event listener')
      window.removeEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-auto p-4">
        {currentView === "tasks" && <TaskView />}
        {currentView === "calendar" && <CalendarView />}
        {currentView === "timeblock" && <TimeBlockView selectedDate={currentDate} />}
        {currentView === "workout" && <WorkoutView />}
      </main>
    </div>
  )
}
