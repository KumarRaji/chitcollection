-- Add users table to existing database
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user
INSERT INTO users (username, password) 
VALUES ('vinoth', 'password')
ON CONFLICT (username) DO NOTHING;
