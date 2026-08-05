-- Create student_absences table to store marked absences in Supabase
CREATE TABLE IF NOT EXISTS student_absences (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lecture_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, lecture_id)
);
