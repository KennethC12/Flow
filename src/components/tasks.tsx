"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Check, Calendar, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { NewTaskModal } from './modal'
import { getTasks, updateTask, deleteTask as deleteTaskFromDb } from '@/server/db/queries'
import { useAuth } from '@/components/auth/auth-context'

interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: string
  priority: string
  category: string | null
  subject: string | null
  due_date: string | null
  estimated_duration: number | null
  actual_duration: number | null
  difficulty_level: number
  energy_required: string
  tags: string[]
  subtasks: any
  attachments: any
  ai_generated: boolean
  parent_task_id: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export function TaskView() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    if (!user) return
    try {
      setLoading(true)
      const fetchedTasks = await getTasks(user.id)
      setTasks(fetchedTasks)
      setError(null)
    } catch (err) {
      setError('Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user])

  const toggleTaskCompletion = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      await updateTask(id, { status: newStatus })
      await fetchTasks() // Refresh the task list
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromDb(id)
      await fetchTasks() // Refresh the task list
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-4">Loading tasks...</div>
  }

  if (error) {
    return <div className="max-w-4xl mx-auto p-4 text-red-500">{error}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <NewTaskModal onTaskCreated={fetchTasks} />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center p-3 border rounded-lg ${task.status === 'completed' ? "bg-muted/20" : "bg-background"}`}
          >
            <Checkbox 
              checked={task.status === 'completed'} 
              onCheckedChange={() => toggleTaskCompletion(task.id, task.status)} 
              className="mr-3" 
            />
            <div className="flex-1">
              <p className={`${task.status === 'completed' ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              {task.due_date && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(task.due_date).toLocaleDateString()}
                  {task.priority && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleTaskCompletion(task.id, task.status)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as {task.status === 'completed' ? "incomplete" : "complete"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Set due date
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Clock className="mr-2 h-4 w-4" />
                  Add to time block
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => deleteTask(task.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}
