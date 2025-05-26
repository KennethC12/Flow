import "server-only"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          university: string | null
          major: string | null
          graduation_year: number | null
          study_preferences: Json
          onboarding_completed: boolean
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          study_preferences?: Json
          onboarding_completed?: boolean
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          study_preferences?: Json
          onboarding_completed?: boolean
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
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
          subtasks: Json
          attachments: Json
          ai_generated: boolean
          parent_task_id: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          subject?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          difficulty_level?: number
          energy_required?: string
          tags?: string[]
          subtasks?: Json
          attachments?: Json
          ai_generated?: boolean
          parent_task_id?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          category?: string | null
          subject?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          difficulty_level?: number
          energy_required?: string
          tags?: string[]
          subtasks?: Json
          attachments?: Json
          ai_generated?: boolean
          parent_task_id?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          title: string | null
          subject: string | null
          duration_planned: number
          duration_actual: number | null
          start_time: string
          end_time: string | null
          completed: boolean
          interruptions: number
          focus_score: number | null
          mood_before: string | null
          mood_after: string | null
          productivity_rating: number | null
          notes: string | null
          related_task_id: string | null
          environment_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type?: string
          title?: string | null
          subject?: string | null
          duration_planned: number
          duration_actual?: number | null
          start_time: string
          end_time?: string | null
          completed?: boolean
          interruptions?: number
          focus_score?: number | null
          mood_before?: string | null
          mood_after?: string | null
          productivity_rating?: number | null
          notes?: string | null
          related_task_id?: string | null
          environment_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          title?: string | null
          subject?: string | null
          duration_planned?: number
          duration_actual?: number | null
          start_time?: string
          end_time?: string | null
          completed?: boolean
          interruptions?: number
          focus_score?: number | null
          mood_before?: string | null
          mood_after?: string | null
          productivity_rating?: number | null
          notes?: string | null
          related_task_id?: string | null
          environment_data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_task_completion_rate: {
        Args: {
          user_uuid: string
          days_back?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
