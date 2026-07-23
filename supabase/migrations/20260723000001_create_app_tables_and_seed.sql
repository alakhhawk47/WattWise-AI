-- Migration: Create Application Tables (Classrooms, Alerts, AI Recommendations, Reports) & Seed Data
-- Description: Schema for classrooms, alerts, ai_recommendations, and reports with RLS and seed data.

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES DEFINITION
-- ============================================================================

-- 1.1 Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  building TEXT NOT NULL DEFAULT 'Block A',
  floor INT NOT NULL DEFAULT 1,
  capacity INT NOT NULL DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'high-usage')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 AI Recommendations Table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  recommendation TEXT NOT NULL,
  estimated_savings TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4 Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('Weekly', 'Monthly', 'Carbon', 'Audit')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users (read-only frontend access)
CREATE POLICY "Allow public read access to classrooms" ON public.classrooms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to recommendations" ON public.ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reports" ON public.reports FOR SELECT USING (true);

-- Allow authenticated users to update/resolve alerts & recommendations status
CREATE POLICY "Allow authenticated users to update alerts" ON public.alerts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update recommendations" ON public.ai_recommendations FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- 3. SEED DATA
-- ============================================================================

-- Clean existing seed data safely if re-running
TRUNCATE public.alerts, public.ai_recommendations, public.classrooms, public.reports RESTART IDENTITY CASCADE;

-- Insert 12 Classrooms
INSERT INTO public.classrooms (id, room_code, building, floor, capacity, status) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Room 101', 'Block A', 1, 45, 'normal'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Room 102', 'Block A', 1, 40, 'warning'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Room 103', 'Block A', 1, 50, 'high-usage'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Room 104', 'Block A', 1, 35, 'normal'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Room 201', 'Block B', 2, 60, 'normal'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Room 202', 'Block B', 2, 55, 'high-usage'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Room 203', 'Block B', 2, 45, 'warning'),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'Room 301', 'Block C', 3, 50, 'normal'),
  ('a1b2c3d4-0009-4000-8000-000000000009', 'Room 302', 'Block C', 3, 40, 'normal'),
  ('a1b2c3d4-0010-4000-8000-000000000010', 'Room 303', 'Block C', 3, 30, 'warning'),
  ('a1b2c3d4-0011-4000-8000-000000000011', 'Room 401', 'Block D', 4, 75, 'normal'),
  ('a1b2c3d4-0012-4000-8000-000000000012', 'Room 402', 'Block D', 4, 80, 'high-usage');

-- Insert 16 Alerts
INSERT INTO public.alerts (classroom_id, severity, title, description, resolved, created_at) VALUES
  ('a1b2c3d4-0003-4000-8000-000000000003', 'critical', 'Extreme Power Spike Detected', 'Room 103 power usage exceeded expected load by 165% with only 4 occupants.', false, now() - INTERVAL '10 minutes'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'critical', 'Unattended AC & Lighting On', 'Room 202 HVAC and projectors running continuously after class completion.', false, now() - INTERVAL '25 minutes'),
  ('a1b2c3d4-0012-4000-8000-000000000012', 'critical', 'Overloaded Electrical Load', 'Room 402 power draw hit 4.8 kW during peak lab hours.', false, now() - INTERVAL '45 minutes'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'warning', 'Low Occupancy High Energy Draw', 'Room 102 ceiling fans and main lighting left ON with 0 occupancy.', false, now() - INTERVAL '1 hour'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'warning', 'High Room Temperature', 'Room 203 temperature at 29.5°C — HVAC cooling inefficiency reported.', false, now() - INTERVAL '1.5 hours'),
  ('a1b2c3d4-0010-4000-8000-000000000010', 'warning', 'After-Hours Energy Activity', 'Room 303 detected active device load at 20:45 PM outside timetable.', false, now() - INTERVAL '2 hours'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'info', 'Efficiency Milestone Achieved', 'Room 101 maintained sub-1.0 kW usage throughout the morning session.', true, now() - INTERVAL '3 hours'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'info', 'Auto-standby Activated', 'Room 104 lighting dimmed automatically following 15 minutes of zero motion.', true, now() - INTERVAL '4 hours'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'info', 'Sensor Calibration Completed', 'Room 201 occupancy and ambient sensors successfully re-calibrated.', true, now() - INTERVAL '5 hours'),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'info', 'Scheduled Maintenance Checked', 'Room 301 fan regulators inspected during weekly routine audit.', true, now() - INTERVAL '6 hours'),
  ('a1b2c3d4-0009-4000-8000-000000000009', 'warning', 'Humidity Threshold Exceeded', 'Room 302 humidity reached 78% — ventilation adjustment suggested.', false, now() - INTERVAL '7 hours'),
  ('a1b2c3d4-0011-4000-8000-000000000011', 'info', 'Solar Offset Contribution', 'Room 401 powered 40% via rooftop solar array during peak noon hours.', true, now() - INTERVAL '8 hours'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'warning', 'Thermal Comfort Warning', 'Room 103 ambient temperature spiked above 30°C.', false, now() - INTERVAL '10 hours'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'warning', 'Unusual Motion Pattern', 'Room 202 motion sensor triggered outside academic hours.', false, now() - INTERVAL '12 hours'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'info', 'Filter Change Recorded', 'Room 203 air filtration unit serviced by maintenance crew.', true, now() - INTERVAL '14 hours'),
  ('a1b2c3d4-0012-4000-8000-000000000012', 'warning', 'High Baseline Power Draw', 'Room 402 continuous idle consumption remains high at 1.8 kW.', false, now() - INTERVAL '16 hours');

-- Insert 15 AI Recommendations
INSERT INTO public.ai_recommendations (classroom_id, priority, recommendation, estimated_savings, status, created_at) VALUES
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Critical', 'Automate HVAC and lighting cutoff in Room 103 when occupancy drops below 5 students.', '1.8 kWh/day', 'pending', now() - INTERVAL '15 minutes'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Critical', 'Schedule automated power-down for Room 202 AV equipment during lunch hour breaks.', '2.4 kWh/day', 'pending', now() - INTERVAL '30 minutes'),
  ('a1b2c3d4-0012-4000-8000-000000000012', 'High', 'Stagger computer lab startup in Room 402 to prevent high peak surge currents.', '3.1 kWh/day', 'pending', now() - INTERVAL '1 hour'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'High', 'Install smart motion-sensing light switches in Room 102 to eliminate empty-room waste.', '1.2 kWh/day', 'pending', now() - INTERVAL '2 hours'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Medium', 'Reset HVAC thermostat target in Room 203 from 21°C to eco-friendly 24°C standard.', '1.5 kWh/day', 'pending', now() - INTERVAL '3 hours'),
  ('a1b2c3d4-0010-4000-8000-000000000010', 'Medium', 'Enforce automatic after-hours socket isolation in Room 303 after 19:00 PM.', '0.9 kWh/day', 'pending', now() - INTERVAL '4 hours'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Low', 'Room 101 operating at peak efficiency — use as baseline template for Block A rooms.', '0.4 kWh/day', 'applied', now() - INTERVAL '5 hours'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Low', 'Upgrade overhead fluorescent tubes in Room 104 to high-efficiency LED arrays.', '0.8 kWh/day', 'applied', now() - INTERVAL '6 hours'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Low', 'Optimize natural day-lighting utilization in Room 201 south-facing windows.', '0.6 kWh/day', 'applied', now() - INTERVAL '8 hours'),
  ('a1b2c3d4-0008-4000-8000-000000000008', 'Medium', 'Adjust ceiling fan speed settings to sync with ambient temperature in Room 301.', '0.7 kWh/day', 'pending', now() - INTERVAL '10 hours'),
  ('a1b2c3d4-0009-4000-8000-000000000009', 'Low', 'Inspect window seal insulation in Room 302 to improve thermal retention.', '0.5 kWh/day', 'pending', now() - INTERVAL '12 hours'),
  ('a1b2c3d4-0011-4000-8000-000000000011', 'Medium', 'Maximize solar inverter scheduling for high-draw equipment in Room 401.', '2.0 kWh/day', 'applied', now() - INTERVAL '14 hours'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'High', 'Implement smart power strips for peripheral equipment in Room 102.', '1.1 kWh/day', 'pending', now() - INTERVAL '16 hours'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Critical', 'Deploy predictive pre-cooling logic for Room 103 prior to afternoon lectures.', '2.2 kWh/day', 'pending', now() - INTERVAL '18 hours'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'High', 'Rebalance electrical circuit distribution across Block B second floor.', '2.8 kWh/day', 'pending', now() - INTERVAL '20 hours');

-- Insert 10 Reports
INSERT INTO public.reports (title, report_type, generated_at, download_url, created_at) VALUES
  ('Weekly Campus Energy Consumption Breakdown', 'Weekly', now() - INTERVAL '2 days', 'https://wattwise.ai/reports/weekly-2026-w29.pdf', now() - INTERVAL '2 days'),
  ('Monthly Carbon Offset & Sustainability Executive Summary', 'Monthly', now() - INTERVAL '5 days', 'https://wattwise.ai/reports/monthly-2026-07.pdf', now() - INTERVAL '5 days'),
  ('Campus Carbon Footprint & Emissions Avoidance Report', 'Carbon', now() - INTERVAL '10 days', 'https://wattwise.ai/reports/carbon-q2-2026.pdf', now() - INTERVAL '10 days'),
  ('Automated Anomaly Audit & Incident Resolution Log', 'Audit', now() - INTERVAL '15 days', 'https://wattwise.ai/reports/audit-july-2026.pdf', now() - INTERVAL '15 days'),
  ('Block A & B HVAC Energy Efficiency Analysis', 'Weekly', now() - INTERVAL '18 days', 'https://wattwise.ai/reports/hvac-block-ab.pdf', now() - INTERVAL '18 days'),
  ('Mid-Year Sustainability Performance Index', 'Monthly', now() - INTERVAL '22 days', 'https://wattwise.ai/reports/midyear-2026.pdf', now() - INTERVAL '22 days'),
  ('Classroom Occupancy vs Energy Draw Correlation Report', 'Audit', now() - INTERVAL '25 days', 'https://wattwise.ai/reports/occupancy-energy-corr.pdf', now() - INTERVAL '25 days'),
  ('Renewable Solar Energy Integration & Impact Audit', 'Carbon', now() - INTERVAL '30 days', 'https://wattwise.ai/reports/solar-impact-june.pdf', now() - INTERVAL '30 days'),
  ('Quarterly Energy Budget & Cost Variance Analysis', 'Monthly', now() - INTERVAL '35 days', 'https://wattwise.ai/reports/quarterly-cost-q2.pdf', now() - INTERVAL '35 days'),
  ('Facility Maintenance & Smart Sensor Reliability Audit', 'Audit', now() - INTERVAL '40 days', 'https://wattwise.ai/reports/sensor-reliability.pdf', now() - INTERVAL '40 days');
