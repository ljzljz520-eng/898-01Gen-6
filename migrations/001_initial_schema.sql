-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('photographer', 'model')),
    real_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(100),
    styles TEXT,
    bio TEXT,
    credit_score INTEGER DEFAULT 100,
    sample_photos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 档期表
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    style TEXT NOT NULL,
    fee INTEGER DEFAULT 0,
    fee_type VARCHAR(20) NOT NULL DEFAULT 'negotiable' CHECK (fee_type IN ('free', 'paid', 'negotiable')),
    fee_note TEXT,
    duration VARCHAR(100),
    work_requirements TEXT,
    contact VARCHAR(100),
    description TEXT,
    sample_photos TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'booked', 'expired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 拍摄计划表
CREATE TABLE IF NOT EXISTS shooting_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER REFERENCES schedules(id),
    requester_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    shooting_date DATE NOT NULL,
    shooting_location VARCHAR(255),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME
);

-- 取消记录表
CREATE TABLE IF NOT EXISTS cancellation_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shooting_plan_id INTEGER NOT NULL REFERENCES shooting_plans(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    hours_before_shooting INTEGER NOT NULL,
    credit_deducted INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shooting_plan_id INTEGER REFERENCES shooting_plans(id),
    uploader_id INTEGER NOT NULL REFERENCES users(id),
    photographer_id INTEGER REFERENCES users(id),
    model_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'both', 'public')),
    photographer_confirmed BOOLEAN DEFAULT 0,
    model_confirmed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 授权表
CREATE TABLE IF NOT EXISTS authorizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER NOT NULL REFERENCES works(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('private', 'both', 'public')),
    confirmed BOOLEAN DEFAULT 0,
    confirmed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_city ON schedules(city);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_shooting_plans_requester ON shooting_plans(requester_id);
CREATE INDEX IF NOT EXISTS idx_shooting_plans_recipient ON shooting_plans(recipient_id);
CREATE INDEX IF NOT EXISTS idx_shooting_plans_status ON shooting_plans(status);
CREATE INDEX IF NOT EXISTS idx_works_shooting_plan ON works(shooting_plan_id);
CREATE INDEX IF NOT EXISTS idx_works_visibility ON works(visibility);
CREATE INDEX IF NOT EXISTS idx_cancellation_records_plan ON cancellation_records(shooting_plan_id);
CREATE INDEX IF NOT EXISTS idx_authorizations_work ON authorizations(work_id);
