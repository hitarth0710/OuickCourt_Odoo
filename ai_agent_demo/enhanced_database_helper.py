import sqlite3
from datetime import datetime, date, time
from typing import List, Dict, Optional, Tuple
import json

class SportsBookingDB:
    def __init__(self, db_path: str = "sports_booking.db"):
        self.db_path = db_path
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # This allows dict-like access to rows
        return conn
    
    def search_courts_by_sport(self, sport_name: str, date_str: str = None, 
                              start_time: str = None, end_time: str = None) -> List[Dict]:
        """Search for available courts by sport and time slot"""
        if not date_str:
            date_str = datetime.now().strftime('%Y-%m-%d')
        
        conn = self.get_connection()
        try:
            query = """
            SELECT 
                c.id as court_id,
                c.name as court_name,
                c.price_per_hour,
                c.operating_hours_start,
                c.operating_hours_end,
                v.id as venue_id,
                v.name as venue_name,
                v.address,
                v.short_location,
                s.name as sport_name
            FROM court c
            JOIN venue v ON c.venue_id = v.id
            JOIN sport s ON c.sport_id = s.id
            WHERE s.name LIKE ? 
                AND c.is_active = 1 
                AND v.is_active = 1 
                AND v.is_approved = 1
            """
            
            results = conn.execute(query, (f'%{sport_name}%',)).fetchall()
            return [dict(row) for row in results]
        finally:
            conn.close()
    
    def check_court_availability(self, court_id: int, date_str: str, 
                                start_time: str, end_time: str) -> bool:
        """Check if a court is available for booking"""
        conn = self.get_connection()
        try:
            # Check for existing bookings that overlap
            query = """
            SELECT COUNT(*) as count
            FROM booking
            WHERE court_id = ? 
                AND date = ?
                AND status != 'cancelled'
                AND (
                    (start_time < ? AND end_time > ?) OR
                    (start_time < ? AND end_time > ?) OR
                    (start_time >= ? AND end_time <= ?)
                )
            """
            
            result = conn.execute(query, (
                court_id, date_str, 
                start_time, start_time,
                end_time, end_time,
                start_time, end_time
            )).fetchone()
            
            return result['count'] == 0
        finally:
            conn.close()
    
    def create_booking(self, user_id: int, court_id: int, date_str: str,
                      start_time: str, end_time: str) -> Optional[int]:
        """Create a new booking"""
        conn = self.get_connection()
        try:
            # Calculate total price
            court_info = conn.execute(
                "SELECT price_per_hour FROM court WHERE id = ?", 
                (court_id,)
            ).fetchone()
            
            if not court_info:
                return None
            
            # Calculate duration in hours
            start_dt = datetime.strptime(start_time, '%H:%M')
            end_dt = datetime.strptime(end_time, '%H:%M')
            duration = (end_dt - start_dt).seconds / 3600
            total_price = court_info['price_per_hour'] * duration
            
            # Insert booking
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO booking (user_id, court_id, date, start_time, end_time, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, court_id, date_str, start_time, end_time, total_price))
            
            booking_id = cursor.lastrowid
            conn.commit()
            return booking_id
        finally:
            conn.close()
    
    def get_user_bookings(self, user_id: int) -> List[Dict]:
        """Get all bookings for a user"""
        conn = self.get_connection()
        try:
            query = """
            SELECT 
                b.*,
                c.name as court_name,
                v.name as venue_name,
                v.address,
                s.name as sport_name
            FROM booking b
            JOIN court c ON b.court_id = c.id
            JOIN venue v ON c.venue_id = v.id
            JOIN sport s ON c.sport_id = s.id
            WHERE b.user_id = ?
            ORDER BY b.date DESC, b.start_time DESC
            """
            
            results = conn.execute(query, (user_id,)).fetchall()
            return [dict(row) for row in results]
        finally:
            conn.close()
    
    def cancel_booking(self, booking_id: int, user_id: int) -> bool:
        """Cancel a booking"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE booking 
                SET status = 'cancelled' 
                WHERE id = ? AND user_id = ? AND status != 'cancelled'
            """, (booking_id, user_id))
            
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()
    
    def get_sports(self) -> List[Dict]:
        """Get all available sports"""
        conn = self.get_connection()
        try:
            results = conn.execute("SELECT * FROM sport").fetchall()
            return [dict(row) for row in results]
        finally:
            conn.close()
    
    def add_sample_data(self):
        """Add some sample data for testing"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            
            # Add sports
            sports = ['Badminton', 'Tennis', 'Basketball', 'Football', 'Cricket']
            for sport in sports:
                cursor.execute("INSERT OR IGNORE INTO sport (name) VALUES (?)", (sport,))
            
            # Add a sample user
            cursor.execute("""
                INSERT OR IGNORE INTO user (id, full_name, email, password_hash, role)
                VALUES (1, 'John Doe', 'john@example.com', 'hashed_password', 'customer')
            """)
            
            # Add sample venue
            cursor.execute("""
                INSERT OR IGNORE INTO venue (id, name, description, address, short_location, 
                                           starting_price_per_hour, is_approved, is_active)
                VALUES (1, 'Sports Complex A', 'Great sports facility', 
                        '123 Main St, City', 'Downtown', 50.0, 1, 1)
            """)
            
            # Add sample courts
            badminton_sport_id = cursor.execute("SELECT id FROM sport WHERE name = 'Badminton'").fetchone()[0]
            tennis_sport_id = cursor.execute("SELECT id FROM sport WHERE name = 'Tennis'").fetchone()[0]
            
            cursor.execute("""
                INSERT OR IGNORE INTO court (id, venue_id, sport_id, name, price_per_hour, 
                                           operating_hours_start, operating_hours_end)
                VALUES (1, 1, ?, 'Court 1', 60.0, '06:00', '22:00')
            """, (badminton_sport_id,))
            
            cursor.execute("""
                INSERT OR IGNORE INTO court (id, venue_id, sport_id, name, price_per_hour, 
                                           operating_hours_start, operating_hours_end)
                VALUES (2, 1, ?, 'Tennis Court 1', 70.0, '06:00', '22:00')
            """, (tennis_sport_id,))
            
            conn.commit()
            print("✅ Sample data added successfully")
        finally:
            conn.close()
