CREATE TABLE public.request_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'طلب عقار',
  intro text,
  is_active boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.request_forms TO service_role;
ALTER TABLE public.request_forms ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER request_forms_touch BEFORE UPDATE ON public.request_forms
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_request_forms_workspace ON public.request_forms(workspace_id);

ALTER TABLE public.client_requests
  ADD COLUMN form_id uuid REFERENCES public.request_forms(id) ON DELETE SET NULL,
  ADD COLUMN source text NOT NULL DEFAULT 'مكتب',
  ADD COLUMN selected_property_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  ADD COLUMN sent_at timestamptz;