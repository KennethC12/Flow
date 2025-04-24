"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TaskView } from "@/components/task-view"
import { CalendarView } from "@/components/calendar-view"
import { TimeBlockView } from "@/components/time-block-view"

type View = "tasks" | "calendar" | "timeblock"

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

  // Shared timeBlocks state that will be used by both Calendar and TimeBlock views
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: "1",
      title: "Deep Work",
      startTime: "09:00",
      endTime: "11:00",
      color: "bg-blue-100 border-blue-300",
      date: "2025-04-23", // Today's date
    },
    {
      id: "2",
      title: "Team Meeting",
      startTime: "11:30",
      endTime: "12:30",
      color: "bg-purple-100 border-purple-300",
      date: "2025-04-23", // Today's date
    },
    {
      id: "3",
      title: "Lunch Break",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-green-100 border-green-300",
      date: "2025-04-23", // Today's date
    },
    {
      id: "4",
      title: "Project Planning",
      startTime: "14:00",
      endTime: "16:00",
      color: "bg-yellow-100 border-yellow-300",
      date: "2025-04-23", // Today's date
    },
    {
      id: "5",
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-red-100 border-red-300",
      date: "2025-04-25", // Future date
    },
    {
      id: "6",
      title: "Product Demo",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-indigo-100 border-indigo-300",
      date: "2025-04-25", // Future date
    },
  ])

  useEffect(() => {
    // Event listener for navigating from calendar to timeblock view
    const handleNavigateToTimeBlock = (event: CustomEvent) => {
      const { date } = event.detail
      setCurrentDate(date)
      setCurrentView("timeblock")
    }

    // Add event listener
    window.addEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("navigateToTimeBlock", handleNavigateToTimeBlock as EventListener)
    }
  }, [])

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
