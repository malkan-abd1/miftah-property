
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  manager_hash text NOT NULL,
  employee_hash text NOT NULL,
  owner_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ref_no integer NOT NULL DEFAULT 0,
  title text,
  listing_type text,
  deed_type text,
  property_type text,
  status text NOT NULL DEFAULT 'متاح',
  governorate text,
  area text,
  address_details text,
  floor integer,
  has_roof boolean NOT NULL DEFAULT false,
  has_roof_garage boolean NOT NULL DEFAULT false,
  has_garden boolean NOT NULL DEFAULT false,
  is_duplex boolean NOT NULL DEFAULT false,
  is_suspended boolean NOT NULL DEFAULT false,
  has_salon boolean NOT NULL DEFAULT false,
  has_elevator24 boolean NOT NULL DEFAULT false,
  rooms integer,
  size numeric,
  facade text,
  direction text,
  finishing text,
  features text[] NOT NULL DEFAULT '{}',
  ownership_type text,
  ownership_notes text,
  partners integer,
  price numeric,
  currency text NOT NULL DEFAULT 'USD',
  price_period text,
  owner_name text,
  owner_phone text,
  office_name text,
  office_phone text,
  facebook_url text,
  notes text,
  rent_end_date date,
  photos text[] NOT NULL DEFAULT '{}',
  videos text[] NOT NULL DEFAULT '{}',
  is_direct boolean NOT NULL DEFAULT true,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE INDEX properties_workspace_idx ON public.properties(workspace_id);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_name text,
  actor_role text,
  action text NOT NULL,
  detail text,
  property_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX activity_logs_workspace_idx ON public.activity_logs(workspace_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_property_ref_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ref_no IS NULL OR NEW.ref_no = 0 THEN
    SELECT COALESCE(MAX(ref_no), 0) + 1 INTO NEW.ref_no
    FROM public.properties WHERE workspace_id = NEW.workspace_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER properties_ref_no BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_property_ref_no();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER properties_touch BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
