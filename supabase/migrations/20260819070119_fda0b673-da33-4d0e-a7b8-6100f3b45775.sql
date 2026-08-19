CREATE TABLE public.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ref_no integer NOT NULL DEFAULT 0,
  client_name text NOT NULL,
  client_phone text,
  contact_method text,
  listing_type text,
  property_type text,
  governorate text,
  area text,
  min_price numeric,
  max_price numeric,
  currency text NOT NULL DEFAULT 'USD',
  min_size numeric,
  max_size numeric,
  rooms integer,
  finishing text,
  facade text,
  features text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'جديد',
  notes text,
  next_followup date,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_requests TO service_role;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.request_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.client_requests(id) ON DELETE CASCADE,
  note text NOT NULL,
  actor_name text,
  next_followup date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.request_followups TO service_role;
ALTER TABLE public.request_followups ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.client_requests(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.set_request_ref_no()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.ref_no IS NULL OR NEW.ref_no = 0 THEN
    SELECT COALESCE(MAX(ref_no), 0) + 1 INTO NEW.ref_no
    FROM public.client_requests WHERE workspace_id = NEW.workspace_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_requests_ref_no BEFORE INSERT ON public.client_requests
FOR EACH ROW EXECUTE FUNCTION public.set_request_ref_no();

CREATE TRIGGER client_requests_touch BEFORE UPDATE ON public.client_requests
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_client_requests_ws ON public.client_requests(workspace_id);
CREATE INDEX idx_request_followups_req ON public.request_followups(request_id);