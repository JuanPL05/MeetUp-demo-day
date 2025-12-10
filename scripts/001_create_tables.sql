-- Create tables for Pitch Day evaluation app
-- This script will be executed to set up the database schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    text TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("blockId") REFERENCES blocks(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "programId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("programId") REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY ("teamId") REFERENCES teams(id) ON DELETE CASCADE
);

-- Judges table
CREATE TABLE IF NOT EXISTS judges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    "judgeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY ("judgeId") REFERENCES judges(id) ON DELETE CASCADE,
    FOREIGN KEY ("projectId") REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY ("questionId") REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE ("judgeId", "projectId", "questionId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_block_id ON questions("blockId");
CREATE INDEX IF NOT EXISTS idx_projects_program_id ON projects("programId");
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects("teamId");
CREATE INDEX IF NOT EXISTS idx_evaluations_judge_id ON evaluations("judgeId");
CREATE INDEX IF NOT EXISTS idx_evaluations_project_id ON evaluations("projectId");
CREATE INDEX IF NOT EXISTS idx_evaluations_question_id ON evaluations("questionId");
