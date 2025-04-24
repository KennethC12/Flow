"use client"

import type React from "react"

import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "../components/ui/button"
import type { TimeBlock } from "./dashboard"

interface CalendarViewProps {
  timeBlocks: TimeBlock[]
  setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
}

export function CalendarView({ timeBlocks, setTimeBlocks, currentDate, setCurrentDate }: CalendarViewProps) {
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

  // Function to get timeblocks for a specific day
  const getTimeBlocksForDay = (day: number) => {
    const dateString = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day)
    return timeBlocks.filter((block) => block.date === dateString)
  }

  // Add this to the beginning of the CalendarView component
  const handleDayClick = (dayDate: Date) => {
    setCurrentDate(dayDate)
    // Navigate to timeblock view when clicking on a day
    window.dispatchEvent(new CustomEvent("navigateToTimeBlock", { detail: { date: dayDate } }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
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

          const dayTimeBlocks = getTimeBlocksForDay(day)

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
                {dayTimeBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`text-xs p-1 ${block.color} rounded truncate`}
                    title={`${block.title} - ${block.startTime} to ${block.endTime}`}
                  >
                    {block.startTime} - {block.title}
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
