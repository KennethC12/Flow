"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExternalLink, Play, Clock, Target, Repeat, Plus, Trash2 } from "lucide-react"
import { getUserWorkoutsForWeek, createUserWorkout, completeUserWorkout, updateUserWorkoutProgress, deleteUserWorkout } from "@/server/db/queries"
import { useAuth } from "@/components/auth/auth-context"

interface Exercise {
  id: string
  user_id: string
  exercise_name: string
  workout_date: string
  sets: number
  completed: boolean
  duration_minutes: number | null
  video_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

// Default workout templates
const workoutTemplates = [
  {
    name: "Push-ups",
    youtubeLink: "https://youtube.com/watch?v=IODxDxX7oi4",
    sets: 3,
    reps: 15,
    type: "strength",
    muscleGroup: "Chest",
  },
  {
    name: "Plank",
    youtubeLink: "https://youtube.com/watch?v=pSHjTRCQxIw",
    duration: "60 seconds",
    type: "strength",
    muscleGroup: "Core",
  },
  {
    name: "Squats",
    youtubeLink: "https://youtube.com/watch?v=aclHkVaku9U",
    sets: 4,
    reps: 20,
    type: "strength",
    muscleGroup: "Legs",
  },
  {
    name: "Jumping Jacks",
    youtubeLink: "https://youtube.com/watch?v=c4DAnQ6DtF8",
    duration: "45 seconds",
    type: "cardio",
    muscleGroup: "Full Body",
  },
]

function getWeekRange(date: Date) {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return [
    start.toISOString().split("T")[0],
    end.toISOString().split("T")[0]
  ]
}

export function WorkoutView() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({})
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  
  // Create exercise form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newExercise, setNewExercise] = useState({
    exercise_name: "",
    sets: 3,
    duration_minutes: null as number | null,
    video_url: "",
    workout_date: new Date().toISOString().split('T')[0]
  })

  const fetchExercises = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [weekStart, weekEnd] = getWeekRange(new Date())
      const data = await getUserWorkoutsForWeek(user.id, weekStart, weekEnd)
      setExercises(data)
      
      // Update completed states from database
      const completed = new Set<string>()
      const savedProgress: Record<string, number> = {}
      
      data.forEach(exercise => {
        if (exercise.completed) {
          completed.add(exercise.id)
        }
        
        // Load saved set progress from notes field
        if (exercise.notes) {
          try {
            const progressData = JSON.parse(exercise.notes)
            if (progressData.setProgress) {
              savedProgress[exercise.id] = progressData.setProgress
            }
          } catch (e) {
            // Ignore invalid JSON in notes
          }
        }
      })
      
      setCompletedExercises(completed)
      setCompletedSets(savedProgress)
    } catch (err) {
      console.error("Failed to fetch exercises:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [user])

  const handleCreateExercise = async () => {
    if (!user || !newExercise.exercise_name.trim()) return
    
    try {
      await createUserWorkout({
        user_id: user.id,
        exercise_name: newExercise.exercise_name,
        workout_date: newExercise.workout_date,
        sets: newExercise.sets,
        completed: false,
        duration_minutes: newExercise.duration_minutes,
        video_url: newExercise.video_url || null,
        notes: null
      })
      
      setCreateDialogOpen(false)
      setNewExercise({
        exercise_name: "",
        sets: 3,
        duration_minutes: null,
        video_url: "",
        workout_date: new Date().toISOString().split('T')[0]
      })
      fetchExercises()
    } catch (error) {
      console.error('Failed to create exercise:', error)
    }
  }

  const handleSetComplete = async (exerciseId: string, setNumber: number) => {
    const newProgress = Math.max(completedSets[exerciseId] || 0, setNumber)
    
    setCompletedSets((prev) => ({
      ...prev,
      [exerciseId]: newProgress,
    }))

    // Save progress to database
    try {
      const exercise = exercises.find(e => e.id === exerciseId)
      if (exercise) {
        const progressData = { setProgress: newProgress }
        await updateUserWorkoutProgress(exerciseId, newProgress, JSON.stringify(progressData))
        
        // If all sets are completed, mark the exercise as completed
        if (newProgress >= exercise.sets) {
          await completeUserWorkout(exerciseId)
          fetchExercises() // Refresh to get updated completion status
        }
      }
    } catch (error) {
      console.error('Failed to save set progress:', error)
    }
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await deleteUserWorkout(exerciseId)
      fetchExercises() // Refresh the list
    } catch (error) {
      console.error('Failed to delete exercise:', error)
    }
  }

  const handleExerciseComplete = async (exerciseId: string) => {
    try {
      await completeUserWorkout(exerciseId)
      fetchExercises() // Refresh to get updated completion status
    } catch (error) {
      console.error('Failed to complete exercise:', error)
    }
  }

  const getProgress = (exercise: Exercise) => {
    if (exercise.sets > 0) {
      const completed = completedSets[exercise.id] || 0
      return (completed / exercise.sets) * 100
    }
    return exercise.completed ? 100 : 0
  }

  const isExerciseFullyCompleted = (exercise: Exercise) => {
    if (exercise.sets > 0) {
      const completed = completedSets[exercise.id] || 0
      return completed >= exercise.sets
    }
    return exercise.completed
  }

  const getTotalCompletedExercises = () => {
    return exercises.filter(exercise => isExerciseFullyCompleted(exercise)).length
  }

  const getTypeColor = (exercise: Exercise) => {
    // Determine type based on duration vs sets
    if (exercise.duration_minutes) {
      return "bg-red-100 text-red-800" // cardio
    } else if (exercise.sets > 0) {
      return "bg-blue-100 text-blue-800" // strength  
    }
    return "bg-green-100 text-green-800" // flexibility
  }

  const getExerciseType = (exercise: Exercise) => {
    if (exercise.duration_minutes) return "cardio"
    if (exercise.sets > 0) return "strength"
    return "flexibility"
  }

  const useTemplate = (template: any) => {
    setNewExercise({
      exercise_name: template.name,
      sets: template.sets || 1,
      duration_minutes: template.duration ? parseInt(template.duration) : null,
      video_url: template.youtubeLink || "",
      workout_date: new Date().toISOString().split('T')[0]
    })
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading workouts...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Workout Tracker</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workout
        </Button>
      </div>

      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={`transition-all duration-200 ${
              isExerciseFullyCompleted(exercise) ? "bg-green-50 border-green-200" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className={`text-xl ${isExerciseFullyCompleted(exercise) ? 'line-through text-muted-foreground' : ''}`}>
                    {exercise.exercise_name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(exercise)}>{getExerciseType(exercise)}</Badge>
                    <Badge variant="outline">{exercise.workout_date}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {exercise.video_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(exercise.video_url!, "_blank")}
                      className="flex items-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                {exercise.sets > 0 && (
                  <div className="flex items-center gap-1">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <span>{exercise.sets} sets</span>
                  </div>
                )}
                {exercise.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{exercise.duration_minutes} minutes</span>
                  </div>
                )}
              </div>

              {exercise.sets > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sets Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedSets[exercise.id] || 0}/{exercise.sets}
                    </span>
                  </div>
                  <Progress value={getProgress(exercise)} className="h-2" />
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: exercise.sets }, (_, i) => (
                      <Button
                        key={i}
                        variant={completedSets[exercise.id] > i ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSetComplete(exercise.id, i + 1)}
                        className="min-w-[60px]"
                      >
                        Set {i + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Progress value={getProgress(exercise)} className="h-2" />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={exercise.id}
                      checked={exercise.completed}
                      onCheckedChange={() => handleExerciseComplete(exercise.id)}
                    />
                    <label
                      htmlFor={exercise.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mark as completed
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No exercises for this week yet.</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Exercise
          </Button>
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">
            {getTotalCompletedExercises()} / {exercises.length} exercises completed
          </span>
        </div>
      </div>

      {/* Create Workout Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {workoutTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useTemplate(template)}
                    className="text-xs"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <Input
              placeholder="Exercise name"
              value={newExercise.exercise_name}
              onChange={(e) => setNewExercise({...newExercise, exercise_name: e.target.value})}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Sets"
                min={1}
                value={newExercise.sets}
                onChange={(e) => setNewExercise({...newExercise, sets: Number(e.target.value)})}
              />
              <Input
                type="number"
                placeholder="Duration (min)"
                value={newExercise.duration_minutes || ""}
                onChange={(e) => setNewExercise({...newExercise, duration_minutes: e.target.value ? Number(e.target.value) : null})}
              />
            </div>
            
            <Input
              placeholder="YouTube URL (optional)"
              value={newExercise.video_url}
              onChange={(e) => setNewExercise({...newExercise, video_url: e.target.value})}
            />
            
            <Input
              type="date"
              value={newExercise.workout_date}
              onChange={(e) => setNewExercise({...newExercise, workout_date: e.target.value})}
            />
            
            <Button onClick={handleCreateExercise} className="w-full">
              Add Exercise
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WorkoutView