-- ============================================================
-- Class Companion — PostgreSQL Schema
-- ============================================================

-- USERS
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  student_id  TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  avatar_url  TEXT,
  phone       TEXT,
  whatsapp    TEXT,
  skills      TEXT[] DEFAULT '{}',
  department  TEXT NOT NULL,
  batch       TEXT NOT NULL,
  section     TEXT NOT NULL DEFAULT 'A',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- COURSES
CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  instructor    TEXT NOT NULL,
  total_classes INTEGER NOT NULL DEFAULT 40,
  credit_hours  INTEGER NOT NULL DEFAULT 3
);

-- SCHEDULE SLOTS
CREATE TABLE schedule_slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  UUID REFERENCES courses(id) ON DELETE CASCADE,
  day        TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  room       TEXT NOT NULL
);

-- ATTENDANCE
CREATE TABLE attendance (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID REFERENCES courses(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status     TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  UNIQUE (user_id, course_id, date)
);

-- CLASS TESTS
CREATE TABLE class_tests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES users(id),
  marks_total INTEGER NOT NULL DEFAULT 20,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- TEST VOTES (upvote/downvote)
CREATE TABLE test_votes (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id  UUID REFERENCES class_tests(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  vote     TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  UNIQUE (test_id, user_id)
);

-- TEST MARKS
CREATE TABLE test_marks (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id  UUID REFERENCES class_tests(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  marks    INTEGER NOT NULL,
  UNIQUE (test_id, user_id)
);

-- DEADLINES
CREATE TABLE deadlines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        TIMESTAMPTZ NOT NULL,
  submission_link TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- DEADLINE COMPLETIONS
CREATE TABLE deadline_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id  UUID REFERENCES deadlines(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (deadline_id, user_id)
);

-- EVENTS
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  fee_amount  INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- EVENT PAYMENTS
CREATE TABLE event_payments (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  paid      BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at   DATE,
  UNIQUE (event_id, user_id)
);

-- NOTES (peer resources)
CREATE TABLE notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  file_url     TEXT,
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- NOTE VOTES
CREATE TABLE note_votes (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id  UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  vote     TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  UNIQUE (note_id, user_id)
);

-- TEAM POSTS
CREATE TABLE team_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('project', 'hackathon', 'study-group')),
  created_by    UUID REFERENCES users(id),
  max_members   INTEGER NOT NULL DEFAULT 4,
  whatsapp_link TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- WAKE-UP CALL PRIORITIES
CREATE TABLE wake_up_priorities (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  priority  INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  UNIQUE (user_id, friend_id)
);

-- ============================================================
-- Row-Level Security (RLS) Policies — sketch
-- ============================================================
-- ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read all attendance" ON attendance FOR SELECT USING (true);
-- CREATE POLICY "Users can insert own attendance" ON attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Admins can insert any" ON attendance FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
