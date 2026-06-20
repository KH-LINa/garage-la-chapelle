export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_image: string | null
          order_index: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_image?: string | null
          order_index?: number
          is_published?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          cover_image?: string | null
          order_index?: number
          is_published?: boolean
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string | null
          video_url: string | null
          order_index: number
          duration_minutes: number | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content?: string | null
          video_url?: string | null
          order_index?: number
          duration_minutes?: number | null
          is_published?: boolean
        }
        Update: {
          title?: string
          content?: string | null
          video_url?: string | null
          order_index?: number
          duration_minutes?: number | null
          is_published?: boolean
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          title: string
          questions: Json
          passing_score: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          questions: Json
          passing_score?: number
        }
        Update: {
          title?: string
          questions?: Json
          passing_score?: number
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          quiz_score: number | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
        }
        Update: {
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Quiz = Database['public']['Tables']['quizzes']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
}
