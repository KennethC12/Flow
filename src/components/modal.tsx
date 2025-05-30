import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createTask, createStudySession, createCalendarEvent } from '@/server/db/queries'
import { useAuth } from '@/components/auth/auth-context'

// Modal for creating a new Task
interface NewTaskModalProps {
  onTaskCreated?: () => void
}

export function NewTaskModal({ onTaskCreated }: NewTaskModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found')
      return
    }
    
    if (!title.trim()) {
      console.error('Title is required')
      return
    }
    
    try {
      console.log('Creating task with:', { user_id: user.id, title, description, due_date: dueDate })
      const result = await createTask({
        user_id: user.id,
        title,
        description,
        due_date: dueDate,
        status: 'pending',
        priority: 'medium',
        category: null,
        subject: null,
        estimated_duration: null,
        actual_duration: null,
        difficulty_level: 1,
        energy_required: 'medium',
        tags: [],
        subtasks: {},
        attachments: {},
        ai_generated: false,
        parent_task_id: null,
        completed_at: null
      })
      console.log('Task created successfully:', result)
      setOpen(false)
      // Reset form
      setTitle('')
      setDescription('')
      setDueDate('')
      // Call the callback if provided
      onTaskCreated?.()
    } catch (error) {
      console.error('Failed to create task:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription>Fill out the details for your task.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
          <Input type="datetime-local" placeholder="Due Date" value={dueDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Modal for creating a new Calendar Event
interface NewEventModalProps {
  onEventCreated?: () => void
}

export function NewEventModal({ onEventCreated }: NewEventModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found for event creation')
      return
    }
    
    if (!title.trim() || !start || !end) {
      console.error('Title, start time, and end time are required for events')
      return
    }
    
    try {
      console.log('Creating event with:', { user_id: user.id, title, start_time: start, end_time: end })
      const result = await createCalendarEvent({
        user_id: user.id,
        title,
        description,
        start_time: start,
        end_time: end,
        // add other fields as needed
      })
      console.log('Event created successfully:', result)
      setOpen(false)
      // Reset form
      setTitle('')
      setStart('')
      setEnd('')
      setDescription('')
      // Call the callback if provided
      onEventCreated?.()
    } catch (error) {
      console.error('Failed to create event:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Event</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Calendar Event</DialogTitle>
          <DialogDescription>Enter event details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
          <Input type="datetime-local" placeholder="Start Time" value={start} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)} />
          <Input type="datetime-local" placeholder="End Time" value={end} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Modal for creating a new Timeblock
interface NewTimeblockModalProps {
  onTimeblockCreated?: () => void
}

export function NewTimeblockModal({ onTimeblockCreated }: NewTimeblockModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found for timeblock creation')
      return
    }
    
    if (!name.trim() || !start || !end) {
      console.error('Name, start time, and end time are required for timeblocks')
      return
    }
    
    try {
      console.log('Creating timeblock with:', { user_id: user.id, title: name, start_time: start, end_time: end })
      const result = await createStudySession({
        user_id: user.id,
        session_type: 'timeblock',
        title: name,
        subject: null,
        start_time: start,
        end_time: end,
        duration_planned: new Date(end).getTime() - new Date(start).getTime(),
        duration_actual: null,
        completed: false,
        interruptions: 0,
        focus_score: null,
        mood_before: null,
        mood_after: null,
        productivity_rating: null,
        notes: null,
        related_task_id: null,
        environment_data: {}
      })
      console.log('Timeblock created successfully:', result)
      setOpen(false)
      // Reset form
      setName('')
      setStart('')
      setEnd('')
      // Call the callback if provided
      onTimeblockCreated?.()
    } catch (error) {
      console.error('Failed to create timeblock:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Timeblock</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Timeblock</DialogTitle>
          <DialogDescription>Specify your timeblock.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
          <Input type="datetime-local" placeholder="Start" value={start} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStart(e.target.value)} />
          <Input type="datetime-local" placeholder="End" value={end} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnd(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Timeblock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
