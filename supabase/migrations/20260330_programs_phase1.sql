-- Fase 1: Fundação multi-programa no Cognia
-- Executar no Supabase SQL Editor

-- ─────────────────────────────────────────────────────
-- A) study_programs
-- ─────────────────────────────────────────────────────
CREATE TABLE study_programs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text        NOT NULL,
  description   text,
  category      text,
  level         text,                          -- 'iniciante' | 'intermediario' | 'avancado'
  status        text        DEFAULT 'active' NOT NULL, -- 'active' | 'paused' | 'completed' | 'archived'
  priority      text        DEFAULT 'media',  -- 'alta' | 'media' | 'baixa'
  target_date   date,
  weekly_hours  numeric(5,1),
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,
  archived_at   timestamptz
);

CREATE INDEX study_programs_user_id_idx ON study_programs (user_id);
ALTER TABLE study_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programs_own" ON study_programs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────
-- B) program_modules
-- ─────────────────────────────────────────────────────
CREATE TABLE program_modules (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id       uuid        REFERENCES study_programs(id) ON DELETE CASCADE NOT NULL,
  title            text        NOT NULL,
  description      text,
  sort_order       integer     DEFAULT 0 NOT NULL,
  estimated_hours  numeric(5,1),
  status           text        DEFAULT 'pending', -- 'pending' | 'active' | 'completed'
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX program_modules_program_id_idx ON program_modules (program_id);
ALTER TABLE program_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_via_program" ON program_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM study_programs sp
      WHERE sp.id = program_modules.program_id AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_programs sp
      WHERE sp.id = program_modules.program_id AND sp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────
-- C) program_items
-- ─────────────────────────────────────────────────────
CREATE TABLE program_items (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id          uuid        REFERENCES program_modules(id) ON DELETE CASCADE NOT NULL,
  item_type          text        DEFAULT 'lesson', -- 'lesson' | 'exercise' | 'project' | 'review'
  title              text        NOT NULL,
  description        text,
  source_kind        text,       -- 'video' | 'article' | 'book' | 'course' | 'practice'
  source_url         text,
  source_text        text,
  estimated_minutes  integer,
  due_date           date,
  sort_order         integer     DEFAULT 0 NOT NULL,
  status             text        DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
  is_delivery        boolean     DEFAULT false NOT NULL,
  created_at         timestamptz DEFAULT now() NOT NULL,
  updated_at         timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX program_items_module_id_idx ON program_items (module_id);
ALTER TABLE program_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items_via_module" ON program_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM program_modules pm
      JOIN study_programs sp ON sp.id = pm.program_id
      WHERE pm.id = program_items.module_id AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM program_modules pm
      JOIN study_programs sp ON sp.id = pm.program_id
      WHERE pm.id = program_items.module_id AND sp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────
-- D) program_sources
-- ─────────────────────────────────────────────────────
CREATE TABLE program_sources (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id     uuid        REFERENCES study_programs(id) ON DELETE CASCADE NOT NULL,
  source_type    text        NOT NULL, -- 'url' | 'text' | 'file' | 'questionnaire'
  label          text,
  source_url     text,
  raw_text       text,
  file_name      text,
  metadata_json  jsonb,
  created_at     timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX program_sources_program_id_idx ON program_sources (program_id);
ALTER TABLE program_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources_via_program" ON program_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM study_programs sp
      WHERE sp.id = program_sources.program_id AND sp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_programs sp
      WHERE sp.id = program_sources.program_id AND sp.user_id = auth.uid()
    )
  );
