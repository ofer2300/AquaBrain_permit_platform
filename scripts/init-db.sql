-- Building Permit Platform - Database Initialization Script
-- PostgreSQL 16 compatible

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'architect', 'engineer', 'reviewer', 'citizen');
CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_requested');
CREATE TYPE submission_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE submission_result AS ENUM ('pass', 'fail', 'conditional_pass');
CREATE TYPE document_type AS ENUM ('taba', 'survey_plan', 'accordion', 'section', 'elevation', 'other');
CREATE TYPE violation_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    plot_number VARCHAR(50),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status project_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    document_type document_type DEFAULT 'other',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT file_size_positive CHECK (file_size > 0)
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status submission_status DEFAULT 'pending',
    result submission_result,
    ai_score NUMERIC(5, 2),
    ai_confidence NUMERIC(5, 4),
    processing_time_seconds NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT ai_score_range CHECK (ai_score >= 0 AND ai_score <= 100),
    CONSTRAINT ai_confidence_range CHECK (ai_confidence >= 0 AND ai_confidence <= 1)
);

-- Violations table
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    rule_id VARCHAR(50) NOT NULL,
    rule_name_he VARCHAR(255),
    rule_name_en VARCHAR(255),
    severity violation_severity NOT NULL,
    category VARCHAR(50),
    description TEXT NOT NULL,
    recommendation TEXT,
    evidence JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    document_classification VARCHAR(100),
    classification_confidence NUMERIC(5, 4),
    extracted_dimensions JSONB DEFAULT '{}'::jsonb,
    validation_results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT classification_confidence_range CHECK (classification_confidence >= 0 AND classification_confidence <= 1)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_document_type ON files(document_type);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_violations_submission_id ON violations(submission_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_analysis_results_submission_id ON analysis_results(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- JSONB indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_metadata_gin ON projects USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_files_metadata_gin ON files USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata_gin ON submissions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_analysis_results_dimensions_gin ON analysis_results USING gin(extracted_dimensions);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_address_trgm ON projects USING gin(address gin_trgm_ops);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, is_verified)
VALUES (
    'admin@building-permit.local',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample data for development
INSERT INTO users (email, password_hash, name, role, is_verified)
VALUES
    ('architect@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test Architect', 'architect', true),
    ('engineer@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test Engineer', 'engineer', true)
ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
    RAISE NOTICE 'Default admin user: admin@building-permit.local';
    RAISE NOTICE 'Default password: admin123';
END
$$;
