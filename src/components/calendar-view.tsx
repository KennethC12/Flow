"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"
import { NewEventModal } from './modal'
import { useAuth } from '@/components/auth/auth-context'
import { useState, useEffect } from 'react'
import { getTasks, getCalendarEvents } from '@/server/db/queries'

interface CalendarItem {
  id: string
  title: string
  date: string
  type: 'task' | 'event'
  color: string
}

export function CalendarView() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendarItems = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [tasks, events] = await Promise.all([
        getTasks(user.id),
        getCalendarEvents(user.id)
      ])

      // Convert tasks to calendar items
      const taskItems: CalendarItem[] = tasks
        .filter(task => task.due_date)
        .map(task => ({
          id: task.id,
          title: task.title,
          date: new Date(task.due_date!).toISOString().split('T')[0],
          type: 'task',
          color: 'bg-blue-100 text-blue-800'
        }))

      // Convert events to calendar items
      const eventItems: CalendarItem[] = events
        .filter(event => event.start_time)
        .map(event => ({
          id: event.id,
          title: event.title || 'Untitled Event',
          date: new Date(event.start_time).toISOString().split('T')[0],
          type: 'event',
          color: 'bg-purple-100 text-purple-800'
        }))

      setCalendarItems([...taskItems, ...eventItems])
      setError(null)
    } catch (err) {
      setError('Failed to fetch calendar items')
      console.error('Error fetching calendar items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalendarItems()
  }, [user])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthName = currentDate.toLocaleString("default", { month: "long" })
  const year = currentDate.getFullYear()

  // Function to format date as YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  // Function to get items for a specific day
  const getItemsForDay = (day: number) => {
    const dateString = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day)
    return calendarItems.filter((item) => item.date === dateString)
  }

  // Add this to the beginning of the CalendarView component
  const handleDayClick = (dayDate: Date) => {
    setCurrentDate(dayDate)
    // Navigate to timeblock view when clicking on a day
    window.dispatchEvent(new CustomEvent("navigateToTimeBlock", { detail: { date: dayDate } }))
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4">Loading calendar...</div>
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-4 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <NewEventModal onEventCreated={fetchCalendarItems} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-medium">
          {monthName} {year}
        </h3>
        <Button variant="outline" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-medium text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 p-1 border rounded-md bg-muted/10"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          const today = new Date()
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()

          const dayItems = getItemsForDay(day)

          // Create a new date object for this day
          const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

          return (
            <div
              key={day}
              className={`h-24 p-1 border rounded-md ${
                isToday ? "bg-primary/10 border-primary" : "bg-background"
              } overflow-hidden cursor-pointer hover:bg-muted/20 transition-colors`}
              onClick={() => handleDayClick(dayDate)}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</span>
              </div>
              <div className="mt-1 space-y-1">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`text-xs p-1 ${item.color} rounded truncate`}
                    title={`${item.title} (${item.type})`}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
