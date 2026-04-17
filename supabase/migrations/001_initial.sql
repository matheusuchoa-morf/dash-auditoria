-- Run these in your Supabase SQL editor before switching to supabaseRepository

CREATE TABLE instagram_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  instagram_handle text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'prata', 'ouro', 'platina')),
  overall_score integer NOT NULL,
  layers jsonb NOT NULL,
  kpis jsonb NOT NULL,
  ai_summary text,
  instagram_token_encrypted text
);

CREATE TABLE lp_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  page_url text NOT NULL,
  cro_score integer,
  findings jsonb,
  recommendations jsonb,
  ai_summary text
);

ALTER TABLE instagram_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_audits ENABLE ROW LEVEL SECURITY;

-- Students see only their own audits
CREATE POLICY "own_instagram_audits_select" ON instagram_audits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_instagram_audits_insert" ON instagram_audits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_lp_audits_select" ON lp_audits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "own_lp_audits_insert" ON lp_audits
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Mentors and admins see all audits
CREATE POLICY "mentor_instagram_view" ON instagram_audits
  FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('mentor', 'admin'));

CREATE POLICY "mentor_lp_view" ON lp_audits
  FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('mentor', 'admin'));

-- Function for mentor leaderboard
CREATE OR REPLACE FUNCTION get_students_latest_audit()
RETURNS TABLE(
  user_id uuid,
  email text,
  instagram_handle text,
  overall_score integer,
  tier text,
  total_audits bigint,
  last_audit_date timestamptz
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    u.id,
    u.email,
    a.instagram_handle,
    a.overall_score,
    a.tier,
    COUNT(*) OVER (PARTITION BY u.id) as total_audits,
    a.created_at
  FROM auth.users u
  JOIN instagram_audits a ON a.user_id = u.id
  WHERE a.created_at = (
    SELECT MAX(created_at) FROM instagram_audits WHERE user_id = u.id
  )
  AND (u.raw_user_meta_data ->> 'role') = 'student'
  ORDER BY a.overall_score DESC;
$$;
