import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/*
  ── SQL to run in your Supabase SQL editor ──────────────────────────

  create table sensor_readings (
    id          uuid          default gen_random_uuid() primary key,
    station_id  text          not null,
    device_id   text          not null,
    firmware    text,
    uptime_s    bigint,
    battery_pct integer,
    signal_rssi integer,
    ph_mv       integer,
    tds_mv      integer,
    turb_v      numeric(6,3),
    do_v        numeric(6,3),
    ph          numeric(4,2),
    tds         numeric(6,1),
    turbidity   numeric(6,3),
    do_mgl      numeric(5,2),
    quality_score integer,
    status      text          default 'NOMINAL',
    checksum    text,
    created_at  timestamptz   default now()
  );

  -- If the table already exists, add the DO columns:
  -- alter table sensor_readings add column do_v   numeric(6,3);
  -- alter table sensor_readings add column do_mgl numeric(5,2);

  alter table sensor_readings enable row level security;
  create policy "anon_read"   on sensor_readings for select to anon using (true);
  create policy "anon_insert" on sensor_readings for insert to anon with check (true);

  alter publication supabase_realtime add table sensor_readings;

  ────────────────────────────────────────────────────────────────────
*/
