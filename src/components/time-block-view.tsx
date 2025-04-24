"use client"

import type React from "react"

import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "../components/ui/button"
import type { TimeBlock } from "./dashboard"

interface TimeBlockViewProps {
  timeBlocks: TimeBlock[]
  setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
}

export function TimeBlockView({ timeBlocks, setTimeBlocks, currentDate, setCurrentDate }: TimeBlockViewProps) {
  const prevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  // Format date as YYYY-MM-DD for filtering
  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  // Filter timeblocks for the current day
  const currentDayTimeBlocks = timeBlocks.filter((block) => block.date === formatDateString(currentDate))

  // Generate time slots from 8 AM to 8 PM
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Time Blocking</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Time Block
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={prevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-medium">{formatDate(currentDate)}</h3>
        <Button variant="outline" onClick={nextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex border rounded-lg overflow-hidden">
        {/* Time labels */}
        <div className="w-20 bg-muted/10 border-r">
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className="h-12 flex items-center justify-center text-xs text-muted-foreground border-b last:border-b-0"
            >
              {time}
            </div>
          ))}
        </div>

        {/* Time blocks */}
        <div className="flex-1 relative" style={{ height: `${timeSlots.length * 48}px` }}>
          {/* Hour grid lines */}
          {timeSlots.map((_, index) => (
            <div
              key={index}
              className="absolute w-full border-b border-gray-100"
              style={{ top: `${index * 48}px` }}
            ></div>
          ))}

          {/* Time blocks */}
          {currentDayTimeBlocks.map((block) => {
            return (
              <div
                key={block.id}
                className={`absolute w-full px-2 ${block.color} border-l-4 rounded-r-md`}
                style={{
                  top: `${((Number.parseInt(block.startTime.split(":")[0]) - 8) * 60 + Number.parseInt(block.startTime.split(":")[1])) * 0.8}px`,
                  height: `${
                    (Number.parseInt(block.endTime.split(":")[0]) * 60 +
                      Number.parseInt(block.endTime.split(":")[1]) -
                      (Number.parseInt(block.startTime.split(":")[0]) * 60 +
                        Number.parseInt(block.startTime.split(":")[1]))) *
                    0.8
                  }px`,
                }}
              >
                <div className="h-full flex flex-col justify-center overflow-hidden">
                  <p className="font-medium text-sm truncate">{block.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {block.startTime} - {block.endTime}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
