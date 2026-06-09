-- SmartAttend Database Schema
-- Запускается автоматически при первом старте PostgreSQL-контейнера

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Пользователи: студенты, преподаватели, администраторы
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  role          VARCHAR(10) NOT NULL CHECK (role IN ('student','teacher','admin')),
  full_name     VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  device_id     VARCHAR(255),
  is_active     BOOLEAN     DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Кафедры / Отделения
CREATE TABLE IF NOT EXISTS departments (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Учебные группы
CREATE TABLE IF NOT EXISTS groups (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(50)  UNIQUE NOT NULL,
  year          SMALLINT     NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Учебные дисциплины
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  code        VARCHAR(20)  UNIQUE NOT NULL,
  hours_total SMALLINT     NOT NULL DEFAULT 0
);

-- Зачисление студентов в группы
CREATE TABLE IF NOT EXISTS enrollments (
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_enroll_group ON enrollments(group_id);

-- Учебные занятия
CREATE TABLE IF NOT EXISTS classes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  room       VARCHAR(20),
  lat        DECIMAL(9,6),
  lng        DECIMAL(9,6),
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_starts  ON classes(starts_at);

-- Связь занятий с группами (many-to-many)
CREATE TABLE IF NOT EXISTS class_groups (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, group_id)
);

-- Одноразовые QR-токены
CREATE TABLE IF NOT EXISTS qr_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id   UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  used       BOOLEAN      DEFAULT FALSE,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qr_expires ON qr_tokens(expires_at);

-- Журнал посещаемости
CREATE TABLE IF NOT EXISTS attendance_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id     UUID NOT NULL REFERENCES classes(id),
  student_id   UUID NOT NULL REFERENCES users(id),
  status       VARCHAR(10) NOT NULL CHECK (status IN ('present','late','absent')),
  scanned_at   TIMESTAMPTZ DEFAULT NOW(),
  lat          DECIMAL(9,6),
  lng          DECIMAL(9,6),
  device_fp    VARCHAR(255),
  ip           VARCHAR(45),
  UNIQUE (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_attend_class   ON attendance_logs(class_id);
CREATE INDEX IF NOT EXISTS idx_attend_student ON attendance_logs(student_id);

-- Лог действий (аудит)
CREATE TABLE IF NOT EXISTS audit_log (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  action     VARCHAR(100) NOT NULL,
  details    JSONB,
  ip         VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
