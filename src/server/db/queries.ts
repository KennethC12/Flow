import { supabase } from './index'
import type { Database } from './schema'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Task = Tables['tasks']['Row']
type StudySession = Tables['study_sessions']['Row']
type UserWorkout = Tables['user_workouts']['Row']

// User queries
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as User
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as User
}

// Task queries
export async function getTasks(userId: string, filters?: {
  status?: string
  priority?: string
  category?: string
  subject?: string
}) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
  
  if (filters) {
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.priority) query = query.eq('priority', filters.priority)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.subject) query = query.eq('subject', filters.subject)
  }
  
  const { data, error } = await query.order('due_date', { ascending: true })
  
  if (error) throw error
  return data as Task[]
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  
  if (error) throw error
  return data as Task
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  
  if (error) throw error
  return data as Task
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  
  if (error) throw error
}

// Study session queries
export async function getStudySessions(userId: string, filters?: {
  session_type?: string
  subject?: string
  completed?: boolean
}) {
  let query = supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
  
  if (filters) {
    if (filters.session_type) query = query.eq('session_type', filters.session_type)
    if (filters.subject) query = query.eq('subject', filters.subject)
    if (filters.completed !== undefined) query = query.eq('completed', filters.completed)
  }
  
  const { data, error } = await query.order('start_time', { ascending: false })
  
  if (error) throw error
  return data as StudySession[]
}

export async function createStudySession(session: Omit<StudySession, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(session)
    .select()
    .single()
  
  if (error) throw error
  return data as StudySession
}

export async function updateStudySession(sessionId: string, updates: Partial<StudySession>) {
  const { data, error } = await supabase
    .from('study_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data as StudySession
}

// Analytics queries
export async function getTaskCompletionRate(userId: string, daysBack: number = 30) {
  const { data, error } = await supabase
    .rpc('calculate_task_completion_rate', {
      user_uuid: userId,
      days_back: daysBack
    })
  
  if (error) throw error
  return data as number
}

export async function getStudyAnalytics(userId: string, timePeriod: 'daily' | 'weekly' | 'monthly') {
  const { data, error } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('time_period', timePeriod)
    .order('date_recorded', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createCalendarEvent(event: {
  user_id: string,
  title: string,
  description?: string,
  event_type?: string,
  subject?: string,
  location?: string,
  start_time: string,
  end_time: string,
  is_all_day?: boolean,
  color?: string,
  related_task_id?: string
}) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([event])
    .select()
  if (error) throw error
  return data[0]
}

export async function getCalendarEvents(userId: string) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function createUserWorkout(workout: Omit<UserWorkout, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) {
  const { data, error } = await supabase
    .from('user_workouts')
    .insert([workout])
    .select()
    .single();
  if (error) throw error;
  return data as UserWorkout;
}

export async function completeUserWorkout(workoutId: string) {
  const { data, error } = await supabase
    .from('user_workouts')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', workoutId)
    .select()
    .single();
  if (error) throw error;
  return data as UserWorkout;
}

export async function getUserWorkoutsForWeek(userId: string, weekStart: string, weekEnd: string) {
  const { data, error } = await supabase
    .from('user_workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('workout_date', weekStart)
    .lte('workout_date', weekEnd)
    .order('workout_date', { ascending: true });
  if (error) throw error;
  return data as UserWorkout[];
}

export async function updateUserWorkoutProgress(workoutId: string, setProgress: number, notes: string) {
  const { data, error } = await supabase
    .from('user_workouts')
    .update({ 
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', workoutId)
    .select()
    .single();
  if (error) throw error;
  return data as UserWorkout;
}

export async function deleteUserWorkout(workoutId: string) {
  const { error } = await supabase
    .from('user_workouts')
    .delete()
    .eq('id', workoutId);
  if (error) throw error;
}
