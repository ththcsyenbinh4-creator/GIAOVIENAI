-- =============================================
-- CLASSROOM AI - DATABASE SCHEMA
-- Supabase PostgreSQL
-- =============================================

-- =============================================
-- ENUM TYPES
-- =============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('teacher', 'student', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'fill_blank', 'matching', 'essay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('in_progress', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_type AS ENUM ('homework', 'quiz', 'exam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students enrollment (junction table)
CREATE TABLE public.class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_code TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Documents (uploaded materials)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    content_text TEXT,
    ai_summary TEXT,
    ai_lesson_plan JSONB,
    processing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments (homework/quiz/exam)
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    description TEXT,
    type assignment_type NOT NULL DEFAULT 'homework',
    duration_minutes INT,
    deadline TIMESTAMPTZ,
    is_randomize_questions BOOLEAN DEFAULT true,
    is_randomize_options BOOLEAN DEFAULT true,
    show_answers_after_submit BOOLEAN DEFAULT true,
    max_attempts INT DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions bank
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id),
    type question_type NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1.0,
    difficulty difficulty_level DEFAULT 'medium',
    tags TEXT[],
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions (bài làm của học sinh)
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question_order JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    status submission_status DEFAULT 'in_progress',
    attempt_number INT DEFAULT 1,
    log_data JSONB DEFAULT '[]',
    teacher_feedback TEXT,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers (câu trả lời từng câu)
CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_option_ids JSONB,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    ai_feedback TEXT,
    ai_suggested_score DECIMAL(5,2),
    teacher_score DECIMAL(5,2),
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_class_students_class ON public.class_students(class_id);
CREATE INDEX idx_class_students_student ON public.class_students(student_id);
CREATE INDEX idx_documents_class ON public.documents(class_id);
CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_assignments_deadline ON public.assignments(deadline);
CREATE INDEX idx_questions_assignment ON public.questions(assignment_id);
CREATE INDEX idx_questions_document ON public.questions(document_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_answers_submission ON public.answers(submission_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - USERS
-- =============================================

CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Teachers can view students in their classes"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_students cs
            JOIN public.classes c ON cs.class_id = c.id
            WHERE cs.student_id = users.id AND c.teacher_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - CLASSES
-- =============================================

CREATE POLICY "Teachers can manage own classes"
    ON public.classes FOR ALL
    USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view enrolled classes"
    ON public.classes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_students
            WHERE class_id = classes.id AND student_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - CLASS_STUDENTS
-- =============================================

CREATE POLICY "Teachers can manage students in their classes"
    ON public.class_students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE id = class_students.class_id AND teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view own enrollment"
    ON public.class_students FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can join classes"
    ON public.class_students FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- =============================================
-- RLS POLICIES - DOCUMENTS
-- =============================================

CREATE POLICY "Teachers can manage documents in their classes"
    ON public.documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE id = documents.class_id AND teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view documents in enrolled classes"
    ON public.documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_students cs
            JOIN public.classes c ON cs.class_id = c.id
            WHERE c.id = documents.class_id AND cs.student_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - ASSIGNMENTS
-- =============================================

CREATE POLICY "Teachers can manage assignments in their classes"
    ON public.assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE id = assignments.class_id AND teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view published assignments in enrolled classes"
    ON public.assignments FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM public.class_students
            WHERE class_id = assignments.class_id AND student_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - QUESTIONS
-- =============================================

CREATE POLICY "Teachers can manage questions"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.classes c ON a.class_id = c.id
            WHERE a.id = questions.assignment_id AND c.teacher_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.documents d
            JOIN public.classes c ON d.class_id = c.id
            WHERE d.id = questions.document_id AND c.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view questions in active assignments"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.class_students cs ON a.class_id = cs.class_id
            WHERE a.id = questions.assignment_id
            AND a.is_published = true
            AND cs.student_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - SUBMISSIONS
-- =============================================

CREATE POLICY "Students can manage own submissions"
    ON public.submissions FOR ALL
    USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and grade submissions in their classes"
    ON public.submissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            JOIN public.classes c ON a.class_id = c.id
            WHERE a.id = submissions.assignment_id AND c.teacher_id = auth.uid()
        )
    );

-- =============================================
-- RLS POLICIES - ANSWERS
-- =============================================

CREATE POLICY "Students can manage own answers"
    ON public.answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions s
            WHERE s.id = answers.submission_id AND s.student_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view and grade answers"
    ON public.answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.submissions s
            JOIN public.assignments a ON s.assignment_id = a.id
            JOIN public.classes c ON a.class_id = c.id
            WHERE s.id = answers.submission_id AND c.teacher_id = auth.uid()
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate submission score
CREATE OR REPLACE FUNCTION calculate_submission_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.submissions
    SET
        score = (SELECT COALESCE(SUM(points_earned), 0) FROM public.answers WHERE submission_id = NEW.submission_id),
        max_score = (SELECT COALESCE(SUM(q.points), 0) FROM public.answers a JOIN public.questions q ON a.question_id = q.id WHERE a.submission_id = NEW.submission_id)
    WHERE id = NEW.submission_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_score_on_answer
    AFTER INSERT OR UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION calculate_submission_score();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policies for documents
CREATE POLICY "Teachers can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM public.classes
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can view documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment below to insert sample data

/*
-- Sample teacher
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'teacher@demo.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    '{"full_name": "Cô Hạnh", "role": "teacher"}'::jsonb
);

-- Sample student
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'student@demo.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    '{"full_name": "Nguyễn Minh", "role": "student"}'::jsonb
);

-- Sample class
INSERT INTO public.classes (id, teacher_id, name, description, invite_code)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Lớp 8A',
    'Lớp Toán 8A - Năm học 2024-2025',
    'ABC12345'
);

-- Enroll student
INSERT INTO public.class_students (class_id, student_id, student_code)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'HS001'
);
*/
