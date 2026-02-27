CREATE DATABASE chit_collection;

\c chit_collection;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password) VALUES ('vinoth', 'password');

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    member_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    phone VARCHAR(20),
    aadhaar VARCHAR(20),
    address TEXT,
    photo_url VARCHAR(500),
    chit_amount DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    collection_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_number ON members(member_number);
CREATE INDEX idx_member_collections ON collections(member_id);
CREATE INDEX idx_collection_date ON collections(collection_date);
