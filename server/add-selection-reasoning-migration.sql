-- Migration to add selection_reasoning column to projects table
-- Run this in your Supabase SQL editor

ALTER TABLE "projects" 
ADD COLUMN IF NOT EXISTS "selection_reasoning" TEXT;

-- Note: Update the selection_reasoning field for each project in Supabase dashboard
-- This field will contain project-specific text explaining why the project was selected

