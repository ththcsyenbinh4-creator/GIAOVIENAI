export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'teacher' | 'student' | 'admin';
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'teacher' | 'student' | 'admin';
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'teacher' | 'student' | 'admin';
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          invite_code: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          invite_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          invite_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          student_code: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          student_code?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          student_code?: string | null;
          joined_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          class_id: string;
          uploaded_by: string;
          title: string;
          file_url: string;
          file_type: string | null;
          content_text: string | null;
          ai_summary: string | null;
          ai_lesson_plan: Json | null;
          processing_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          uploaded_by: string;
          title: string;
          file_url: string;
          file_type?: string | null;
          content_text?: string | null;
          ai_summary?: string | null;
          ai_lesson_plan?: Json | null;
          processing_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          uploaded_by?: string;
          title?: string;
          file_url?: string;
          file_type?: string | null;
          content_text?: string | null;
          ai_summary?: string | null;
          ai_lesson_plan?: Json | null;
          processing_status?: string;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          class_id: string;
          created_by: string;
          title: string;
          description: string | null;
          type: 'homework' | 'quiz' | 'exam';
          duration_minutes: number | null;
          deadline: string | null;
          is_randomize_questions: boolean;
          is_randomize_options: boolean;
          show_answers_after_submit: boolean;
          max_attempts: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          type?: 'homework' | 'quiz' | 'exam';
          duration_minutes?: number | null;
          deadline?: string | null;
          is_randomize_questions?: boolean;
          is_randomize_options?: boolean;
          show_answers_after_submit?: boolean;
          max_attempts?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          type?: 'homework' | 'quiz' | 'exam';
          duration_minutes?: number | null;
          deadline?: string | null;
          is_randomize_questions?: boolean;
          is_randomize_options?: boolean;
          show_answers_after_submit?: boolean;
          max_attempts?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          assignment_id: string | null;
          document_id: string | null;
          type: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
          content: string;
          options: Json | null;
          correct_answer: string | null;
          explanation: string | null;
          points: number;
          difficulty: 'easy' | 'medium' | 'hard';
          tags: string[] | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id?: string | null;
          document_id?: string | null;
          type: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
          content: string;
          options?: Json | null;
          correct_answer?: string | null;
          explanation?: string | null;
          points?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          tags?: string[] | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string | null;
          document_id?: string | null;
          type?: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
          content?: string;
          options?: Json | null;
          correct_answer?: string | null;
          explanation?: string | null;
          points?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          tags?: string[] | null;
          order_index?: number;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          question_order: Json | null;
          started_at: string;
          submitted_at: string | null;
          score: number | null;
          max_score: number | null;
          status: 'in_progress' | 'submitted' | 'graded';
          attempt_number: number;
          log_data: Json;
          teacher_feedback: string | null;
          graded_at: string | null;
          graded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          question_order?: Json | null;
          started_at?: string;
          submitted_at?: string | null;
          score?: number | null;
          max_score?: number | null;
          status?: 'in_progress' | 'submitted' | 'graded';
          attempt_number?: number;
          log_data?: Json;
          teacher_feedback?: string | null;
          graded_at?: string | null;
          graded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          question_order?: Json | null;
          started_at?: string;
          submitted_at?: string | null;
          score?: number | null;
          max_score?: number | null;
          status?: 'in_progress' | 'submitted' | 'graded';
          attempt_number?: number;
          log_data?: Json;
          teacher_feedback?: string | null;
          graded_at?: string | null;
          graded_by?: string | null;
          created_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          submission_id: string;
          question_id: string;
          answer_text: string | null;
          selected_option_ids: Json | null;
          is_correct: boolean | null;
          points_earned: number;
          ai_feedback: string | null;
          ai_suggested_score: number | null;
          teacher_score: number | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          question_id: string;
          answer_text?: string | null;
          selected_option_ids?: Json | null;
          is_correct?: boolean | null;
          points_earned?: number;
          ai_feedback?: string | null;
          ai_suggested_score?: number | null;
          teacher_score?: number | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          question_id?: string;
          answer_text?: string | null;
          selected_option_ids?: Json | null;
          is_correct?: boolean | null;
          points_earned?: number;
          ai_feedback?: string | null;
          ai_suggested_score?: number | null;
          teacher_score?: number | null;
          answered_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'teacher' | 'student' | 'admin';
      question_type: 'multiple_choice' | 'fill_blank' | 'matching' | 'essay';
      difficulty_level: 'easy' | 'medium' | 'hard';
      submission_status: 'in_progress' | 'submitted' | 'graded';
      assignment_type: 'homework' | 'quiz' | 'exam';
    };
  };
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Convenience types
export type User = Tables<'users'>;
export type Class = Tables<'classes'>;
export type ClassStudent = Tables<'class_students'>;
export type Document = Tables<'documents'>;
export type Assignment = Tables<'assignments'>;
export type Question = Tables<'questions'>;
export type Submission = Tables<'submissions'>;
export type Answer = Tables<'answers'>;
