-- Seed data for GoDrive Academy demo (Stop Start Academy)
-- This creates functional demo data for testing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  state_code TEXT NOT NULL,
  score INTEGER,
  total_questions INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  state_code TEXT NOT NULL,
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed some demo questions for California (CA)
INSERT INTO public.questions (state_code, category, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
VALUES
  ('CA', 'Signs', 'What does a red octagonal sign mean?', 'Yield', 'Stop', 'Caution', 'No Parking', 'B', 'A red octagonal (8-sided) sign always means STOP. You must come to a complete stop at the stop line.'),
  ('CA', 'Signs', 'What does a yellow diamond sign indicate?', 'Warning', 'Railroad crossing', 'School zone', 'Construction', 'A', 'Yellow diamond-shaped signs warn drivers of upcoming hazards or changes in road conditions.'),
  ('CA', 'Right of Way', 'At a 4-way stop, who has the right of way?', 'The first vehicle to arrive', 'The largest vehicle', 'Vehicles on the right', 'Vehicles going straight', 'A', 'At a 4-way stop, the first vehicle to arrive at the intersection has the right of way.'),
  ('CA', 'Speed Limits', 'What is the speed limit in a residential area unless otherwise posted?', '20 mph', '25 mph', '30 mph', '35 mph', 'B', 'The speed limit in residential areas is 25 mph unless otherwise posted.'),
  ('CA', 'Parking', 'How far from a fire hydrant must you park?', '5 feet', '10 feet', '15 feet', '20 feet', 'C', 'You must park at least 15 feet away from a fire hydrant.'),
  ('CA', 'Safety', 'When must you use your headlights?', 'Only at night', 'When visibility is less than 1000 feet', 'During rain, fog, or snow', 'Both B and C', 'D', 'You must use headlights when visibility is less than 1000 feet and during adverse weather conditions.'),
  ('CA', 'Lane Usage', 'What is a center left-turn lane used for?', 'Passing', 'Making left turns only', 'Emergency stopping', 'Carpools', 'B', 'A center left-turn lane is used by traffic moving in both directions to make left turns only.'),
  ('CA', 'Signals', 'You must signal at least how many feet before turning?', '50 feet', '75 feet', '100 feet', '150 feet', 'C', 'You must signal at least 100 feet before turning in California.'),
  ('CA', 'Right of Way', 'Who has the right of way at an unmarked crosswalk?', 'Vehicles', 'Pedestrians', 'Whoever arrives first', 'Larger vehicles', 'B', 'Pedestrians always have the right of way at marked or unmarked crosswalks.'),
  ('CA', 'Speed Limits', 'What is the maximum speed limit on a California highway unless posted otherwise?', '55 mph', '65 mph', '70 mph', '75 mph', 'B', 'The maximum speed limit on California highways is 65 mph unless otherwise posted.');

-- Seed some demo questions for Texas (TX)
INSERT INTO public.questions (state_code, category, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
VALUES
  ('TX', 'Signs', 'What color are construction zone signs?', 'Yellow', 'Orange', 'Red', 'Blue', 'B', 'Construction zone signs are orange to alert drivers of work zones ahead.'),
  ('TX', 'Speed Limits', 'What is the maximum speed limit on Texas rural interstates?', '70 mph', '75 mph', '80 mph', '85 mph', 'C', 'The maximum speed limit on Texas rural interstate highways is 80 mph, with some sections allowing 85 mph.'),
  ('TX', 'Right of Way', 'At a flashing red light, you must:', 'Slow down', 'Stop, then proceed when safe', 'Proceed with caution', 'Yield to cross traffic', 'B', 'A flashing red light means the same as a stop sign - you must stop and proceed when safe.'),
  ('TX', 'Safety', 'When are you required to move over for emergency vehicles?', 'Always', 'Only at night', 'Only on highways', 'Only if safe', 'A', 'Texas Move Over law requires you to move over or slow down for stopped emergency vehicles.'),
  ('TX', 'Parking', 'Within how many feet of a crosswalk must you not park?', '10 feet', '15 feet', '20 feet', '25 feet', 'C', 'You must not park within 20 feet of a crosswalk in Texas.');

-- Grant access to authenticated users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Practice sessions policies
CREATE POLICY "Users can view their own sessions" ON public.practice_sessions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own sessions" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Questions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view questions" ON public.questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
