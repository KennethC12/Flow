"use client"

import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"
import { NewTimeblockModal } from './modal'
import { useAuth } from '@/components/auth/auth-context'
import { useState, useEffect } from 'react'
import { getTasks, getCalendarEvents } from '@/server/db/queries'

interface TimeBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  type: 'task' | 'event'
  color: string
}

interface TimeBlockViewProps {
  selectedDate?: Date
}

export function TimeBlockView({ selectedDate }: TimeBlockViewProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update currentDate when selectedDate prop changes
  useEffect(() => {
    console.log('TimeBlockView: selectedDate prop changed:', selectedDate)
    if (selectedDate) {
      console.log('TimeBlockView: Setting currentDate to:', selectedDate)
      setCurrentDate(selectedDate)
    }
  }, [selectedDate])

  function getLocalDateString(date: Date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0')
  }

  const fetchTimeBlocks = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [tasks, events] = await Promise.all([
        getTasks(user.id),
        getCalendarEvents(user.id)
      ])

      console.log('Fetched tasks:', tasks)
      console.log('Fetched events:', events)

      // Convert tasks to time blocks
      const taskBlocks: TimeBlock[] = tasks
        .filter((task: any) => task.due_date)
        .map((task: any) => {
          const start = new Date(task.due_date!)
          const end = new Date(start.getTime() + 60 * 60 * 1000)
          return {
            id: task.id,
            title: task.title,
            startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: getLocalDateString(start),
            type: 'task',
            color: 'bg-blue-100 border-blue-300'
          }
        })

      // Convert calendar events to time blocks
      const eventBlocks: TimeBlock[] = events
        .filter((event: any) => event.start_time && event.end_time)
        .map((event: any) => {
          const start = new Date(event.start_time)
          const end = new Date(event.end_time!)
          return {
            id: event.id,
            title: event.title || 'Untitled Event',
            startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: getLocalDateString(start),
            type: 'event',
            color: 'bg-purple-100 border-purple-300'
          }
        })

      console.log('Converted task blocks:', taskBlocks)
      console.log('Converted event blocks:', eventBlocks)

      const allBlocks = [...taskBlocks, ...eventBlocks]
      console.log('All time blocks:', allBlocks)
      setTimeBlocks(allBlocks)
      setError(null)
    } catch (err) {
      console.error('Error fetching time blocks:', err)
      setError('Failed to fetch time blocks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeBlocks()
  }, [user])

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
  const todayStr = getLocalDateString(currentDate)
  const currentDayTimeBlocks = timeBlocks.filter(block => block.date === todayStr)

  console.log('Current day time blocks:', currentDayTimeBlocks)

  // Generate time slots for 24 hours
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i
    const ampm = hour === 0 ? "AM" : hour < 12 ? "AM" : "PM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${ampm}`
  })

  // Helper to get minutes since midnight
  function getMinutesSinceMidnight(timeStr: string, dateStr: string) {
    const d = new Date(`${dateStr} ${timeStr}`)
    return d.getHours() * 60 + d.getMinutes()
  }

  // Helper to assign columns to overlapping blocks
  function assignColumns(blocks: TimeBlock[]) {
    // Sort by start time
    const sorted = [...blocks].sort((a, b) => {
      const aStart = new Date(`${a.date} ${a.startTime}`).getTime();
      const bStart = new Date(`${b.date} ${b.startTime}`).getTime();
      return aStart - bStart;
    });

    const columns: TimeBlock[][] = [];
    const blockMeta: { block: TimeBlock; col: number; totalCols: number }[] = [];

    for (const block of sorted) {
      const blockStart = new Date(`${block.date} ${block.startTime}`).getTime();
      const blockEnd = new Date(`${block.date} ${block.endTime}`).getTime();

      // Find the first available column
      let col = 0;
      while (
        columns[col] &&
        columns[col].some(
          (b) =>
            blockStart < new Date(`${b.date} ${b.endTime}`).getTime() &&
            blockEnd > new Date(`${b.date} ${b.startTime}`).getTime()
        )
      ) {
        col++;
      }
      if (!columns[col]) columns[col] = [];
      columns[col].push(block);
      blockMeta.push({ block, col, totalCols: 0 }); // totalCols will be set later
    }

    // For each block, find how many columns overlap with it
    for (const meta of blockMeta) {
      const blockStart = new Date(`${meta.block.date} ${meta.block.startTime}`).getTime();
      const blockEnd = new Date(`${meta.block.date} ${meta.block.endTime}`).getTime();
      let maxCol = meta.col;
      for (const other of blockMeta) {
        if (other === meta) continue;
        const otherStart = new Date(`${other.block.date} ${other.block.startTime}`).getTime();
        const otherEnd = new Date(`${other.block.date} ${other.block.endTime}`).getTime();
        if (blockStart < otherEnd && blockEnd > otherStart) {
          if (other.col > maxCol) maxCol = other.col;
        }
      }
      meta.totalCols = maxCol + 1;
    }

    return blockMeta;
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4">Loading time blocks...</div>
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-4 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Time Blocks</h2>
        <NewTimeblockModal onTimeblockCreated={fetchTimeBlocks} />
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
          {assignColumns(currentDayTimeBlocks).map(({ block, col, totalCols }) => {
            const startMinutes = getMinutesSinceMidnight(block.startTime, block.date);
            const endMinutes = getMinutesSinceMidnight(block.endTime, block.date);
            const width = 100 / totalCols;
            const left = col * width;
            return (
              <div
                key={block.id}
                className={`absolute px-2 ${block.color} border-l-4 rounded-r-md`}
                style={{
                  top: `${startMinutes * 0.8}px`,
                  height: `${(endMinutes - startMinutes) * 0.8}px`,
                  width: `calc(${width}% - 4px)`,
                  left: `calc(${left}% + 2px)`,
                }}
              >
                <div className="h-full flex flex-col justify-center overflow-hidden">
                  <p className="font-medium text-sm truncate">{block.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {block.startTime} - {block.endTime}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
