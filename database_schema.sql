-- DATABASE SCHEMA FOR PORTFOLIO PROJECT

-- 1. Profile Table
CREATE TABLE profile (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    full_name TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    image_url TEXT,
    bio TEXT,
    about_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial empty profile
INSERT INTO profile (full_name, role, email) VALUES ('Your Name', 'Creative Developer', 'your@email.com');

-- 2. Projects Table
CREATE TABLE projects (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT,
    live_url TEXT,
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Skills Table
CREATE TABLE skills (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    icon_class TEXT, -- e.g., 'fab fa-react'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Social Links Table
CREATE TABLE social_links (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    icon_class TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Messages Table (for contact form)
CREATE TABLE messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Configuration
-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Public can read everything except messages
CREATE POLICY "Public can view profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can view skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public can view social_links" ON social_links FOR SELECT USING (true);

-- Public can insert messages (contact form)
CREATE POLICY "Public can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Authenticated Admin can do everything
CREATE POLICY "Admin full access on profile" ON profile FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on projects" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on skills" ON skills FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on social_links" ON social_links FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on messages" ON messages FOR ALL TO authenticated USING (true);
