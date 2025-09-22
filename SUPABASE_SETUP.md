# Supabase Integration Guide for PM Internship Scheme

This guide explains how to connect your PM Internship portal to Supabase for production-ready database functionality.

## Database Schema

### Tables to Create in Supabase

#### 1. users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    qualification VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. user_profiles
```sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255),
    guardian_name VARCHAR(255),
    category VARCHAR(50),
    mobile_number VARCHAR(20),
    email_address VARCHAR(255),
    house_no VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    state VARCHAR(100),
    district VARCHAR(100),
    block VARCHAR(100),
    village VARCHAR(100),
    zip_code VARCHAR(20),
    qualification VARCHAR(100),
    course VARCHAR(255),
    specialization VARCHAR(255),
    institution VARCHAR(255),
    year_of_passing INTEGER,
    marks VARCHAR(20),
    skills TEXT,
    preferred_location VARCHAR(255),
    preferred_industry VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. internships
```sql
CREATE TABLE internships (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500),
    location VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('paid', 'unpaid')),
    sector VARCHAR(100),
    area VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    opportunities INTEGER NOT NULL,
    description TEXT,
    qualifications VARCHAR(255),
    course VARCHAR(255),
    specialization VARCHAR(255),
    skills TEXT,
    preferred_gender VARCHAR(20),
    salary VARCHAR(100),
    duration VARCHAR(50),
    is_top_company BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. applications
```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    internship_id VARCHAR(20) REFERENCES internships(id) ON DELETE CASCADE,
    introduction TEXT,
    strengths TEXT,
    outcomes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, internship_id)
);
```

#### 5. grievances
```sql
CREATE TABLE grievances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    related_internship_id VARCHAR(20) REFERENCES internships(id) ON DELETE SET NULL,
    contact_preference VARCHAR(20) DEFAULT 'email',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

### 2. Create Database Tables
1. Go to SQL Editor in your Supabase dashboard
2. Run the SQL commands above to create all tables

### 3. Set Up Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust as needed)
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can read own profiles" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow all users to read internships
CREATE POLICY "Anyone can read internships" ON internships FOR SELECT USING (true);

-- Allow users to manage their own applications
CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (auth.uid()::text = user_id::text);

-- Allow users to manage their own grievances
CREATE POLICY "Users can manage own grievances" ON grievances FOR ALL USING (auth.uid()::text = user_id::text);
```

### 4. Update Configuration
1. Open `apiService.js`
2. Replace the configuration:
```javascript
config: {
    baseUrl: 'YOUR_SUPABASE_PROJECT_URL', // e.g., https://xxxxx.supabase.co
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    isDevelopment: false // Set to false for production
},
```

### 5. Sample Data
Insert some sample internships:
```sql
INSERT INTO internships (id, title, company, location, type, sector, opportunities, description, is_top_company) VALUES
('INT001', 'Software Development Intern', 'Tech Corp India', 'Bangalore, Karnataka', 'paid', 'Information Technology', 25, 'Work on web applications using modern technologies', true),
('INT002', 'Digital Marketing Intern', 'Marketing Solutions Ltd', 'Mumbai, Maharashtra', 'paid', 'Marketing & Sales', 15, 'Assist in digital marketing campaigns and social media management', false),
('INT003', 'Financial Analyst Intern', 'Finance Hub India', 'New Delhi, Delhi', 'unpaid', 'Banking & Finance', 10, 'Support financial analysis and reporting activities', true);
```

## Environment Variables (Optional)

Create a `.env` file for secure configuration:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then update your JavaScript to use environment variables if needed.

## Authentication Enhancement

For production, consider implementing Supabase Auth instead of custom authentication:

```javascript
// Example of Supabase Auth integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@email.com',
    password: 'password'
});

// Register
const { data, error } = await supabase.auth.signUp({
    email: 'user@email.com',
    password: 'password'
});
```

## Testing the Integration

1. Set `isDevelopment: false` in `apiService.js`
2. Update the Supabase credentials
3. Test all functionality:
   - User registration and login
   - Profile management
   - Internship browsing and applications
   - Grievance submission

## Deployment

After Supabase integration:
1. Deploy your HTML files to a web server (Vercel, Netlify, etc.)
2. Ensure CORS is properly configured in Supabase
3. Test all functionality in production environment

## Security Considerations

1. Never expose your Supabase service role key in frontend code
2. Use Row Level Security policies to protect user data
3. Validate all inputs on both frontend and backend
4. Implement proper authentication flows
5. Use HTTPS in production

## Support

If you encounter issues during setup:
1. Check Supabase documentation
2. Verify your database schema matches exactly
3. Test API calls in Supabase API explorer
4. Check browser console for errors

## Fairness & Allocation Extensions

### Diversity Statistics View
```sql
-- Aggregate applications by category and location for monitoring representation
CREATE OR REPLACE VIEW diversity_stats AS
SELECT 
  up.category,
  up.state,
  up.district,
  COUNT(a.id) AS applications_count
FROM user_profiles up
LEFT JOIN applications a ON a.user_id = up.user_id
GROUP BY up.category, up.state, up.district;
```

### Participation Limit (at most 1 completed internship)

Add status to applications if not present and a completed flag, or manage via status transitions.

```sql
-- Ensure applications has status including 'completed'
ALTER TABLE applications 
  ALTER COLUMN status TYPE VARCHAR(20);

-- Optional: track per-user completed count via a materialized view or function
CREATE OR REPLACE FUNCTION get_participation_count(p_user_id BIGINT)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM applications 
  WHERE user_id = p_user_id AND status = 'completed';
$$ LANGUAGE SQL STABLE;
```

Frontend should consult a secure RPC or view; maintain RLS accordingly.

### Dynamic Capacity: remaining_slots

```sql
-- Add remaining_slots to internships
ALTER TABLE internships ADD COLUMN IF NOT EXISTS remaining_slots INTEGER;

-- Initialize remaining_slots = opportunities for existing rows
UPDATE internships SET remaining_slots = opportunities WHERE remaining_slots IS NULL;

-- On application create (pending) decrement remaining_slots if available
CREATE OR REPLACE FUNCTION decrement_remaining_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.internship_id IS NOT NULL THEN
    UPDATE internships
      SET remaining_slots = GREATEST(remaining_slots - 1, 0)
      WHERE id = NEW.internship_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_decrement ON applications;
CREATE TRIGGER trg_applications_decrement
AFTER INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION decrement_remaining_slots();

-- On application withdrawal or rejection, increment remaining_slots
CREATE OR REPLACE FUNCTION increment_remaining_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.internship_id IS NOT NULL THEN
    UPDATE internships
      SET remaining_slots = LEAST(remaining_slots + 1, opportunities)
      WHERE id = OLD.internship_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_delete_increment ON applications;
CREATE TRIGGER trg_applications_delete_increment
AFTER DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION increment_remaining_slots();

-- On status change from pending to withdrawn/rejected -> increment
CREATE OR REPLACE FUNCTION adjust_slots_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('pending','reviewed') AND NEW.status IN ('withdrawn','rejected') THEN
    UPDATE internships
      SET remaining_slots = LEAST(remaining_slots + 1, opportunities)
      WHERE id = NEW.internship_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_status_adjust ON applications;
CREATE TRIGGER trg_applications_status_adjust
AFTER UPDATE OF status ON applications
FOR EACH ROW EXECUTE FUNCTION adjust_slots_on_status_change();
```

### RLS considerations
Ensure appropriate policies allow reading `diversity_stats`, and that slot adjustments happen via triggers without exposing service keys on the frontend.