"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Check, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  priority?: "low" | "medium" | "high"
}

export function TaskView() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      completed: false,
      dueDate: "2025-04-25",
      priority: "high",
    },
    {
      id: "2",
      title: "Schedule team meeting",
      completed: false,
      dueDate: "2025-04-24",
      priority: "medium",
    },
    {
      id: "3",
      title: "Review quarterly goals",
      completed: true,
      dueDate: "2025-04-23",
      priority: "low",
    },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const addTask = () => {
    if (newTaskTitle.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="flex mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask()
          }}
          className="mr-2"
        />
        <Button onClick={addTask}>Add</Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center p-3 border rounded-lg ${task.completed ? "bg-muted/20" : "bg-background"}`}
          >
            <Checkbox checked={task.completed} onCheckedChange={() => toggleTaskCompletion(task.id)} className="mr-3" />
            <div className="flex-1">
              <p className={`${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
              {task.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString()}
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
                <DropdownMenuItem onClick={() => toggleTaskCompletion(task.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as {task.completed ? "incomplete" : "complete"}
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
