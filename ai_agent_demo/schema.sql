-- schema.sql

-- Turn on foreign key support
PRAGMA foreign_keys = ON;

-- Table for users
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'owner', 'customer')),
    avatar_url TEXT,
    phone TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0, 1)),
    is_banned INTEGER NOT NULL DEFAULT 0 CHECK(is_banned IN (0, 1)),
    date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table for one-time passcodes
CREATE TABLE otp_verification (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used INTEGER NOT NULL DEFAULT 0 CHECK(is_used IN (0, 1)),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Table for sports
CREATE TABLE sport (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Table for venues
CREATE TABLE venue (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    short_location TEXT,
    rating REAL,
    starting_price_per_hour REAL,
    amenities TEXT, -- Storing JSON as TEXT
    is_approved INTEGER NOT NULL DEFAULT 0 CHECK(is_approved IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for venue owners
CREATE TABLE venue_owner (
    id INTEGER PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venue(id),
    FOREIGN KEY (owner_id) REFERENCES user(id)
);

-- Table for venue photos
CREATE TABLE venue_photo (
    id INTEGER PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venue(id)
);

-- Junction table for sports available at a venue
CREATE TABLE venue_sport (
    id INTEGER PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    sport_id INTEGER NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venue(id),
    FOREIGN KEY (sport_id) REFERENCES sport(id)
);

-- Table for individual courts
CREATE TABLE court (
    id INTEGER PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    sport_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price_per_hour REAL NOT NULL,
    operating_hours_start TIME,
    operating_hours_end TIME,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    FOREIGN KEY (venue_id) REFERENCES venue(id),
    FOREIGN KEY (sport_id) REFERENCES sport(id)
);

-- Table for court time slots (can be pre-generated)
CREATE TABLE time_slot (
    id INTEGER PRIMARY KEY,
    court_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1 CHECK(is_available IN (0, 1)),
    is_blocked INTEGER NOT NULL DEFAULT 0 CHECK(is_blocked IN (0, 1)),
    FOREIGN KEY (court_id) REFERENCES court(id)
);

-- Table for bookings
CREATE TABLE booking (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    court_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'pending')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (court_id) REFERENCES court(id)
);

-- Table for payments
CREATE TABLE payment (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK(payment_status IN ('paid', 'pending', 'failed')),
    transaction_id TEXT,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(id)
);

-- Table for reviews
CREATE TABLE review (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    venue_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (venue_id) REFERENCES venue(id)
);

-- Table for user reports
CREATE TABLE report (
    id INTEGER PRIMARY KEY,
    reporter_id INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES user(id)
);

-- Table for admin approval logs
CREATE TABLE facility_approval_log (
    id INTEGER PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    comments TEXT,
    action_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venue(id),
    FOREIGN KEY (admin_id) REFERENCES user(id)
);

-- Table for caching statistics
CREATE TABLE booking_stats_cache (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    total_bookings INTEGER NOT NULL,
    total_earnings REAL NOT NULL,
    sport_id INTEGER,
    FOREIGN KEY (sport_id) REFERENCES sport(id)
);

-- sqlite3 --version