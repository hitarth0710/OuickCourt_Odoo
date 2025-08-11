#!/usr/bin/env python3

import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from enhanced_database_helper import SportsBookingDB

# Load environment variables
load_dotenv()

class GoogleLLMBookingAgent:
    def __init__(self):
        self.db_helper = SportsBookingDB()
        
        # Configure Google AI
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
        genai.configure(api_key=api_key)
        
        # Use Gemini 2.0 Flash model (latest, fastest model)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        print("🤖 Google Gemini Sports Booking Agent initialized!")
        print("💬 Using Google's Gemini AI for natural language processing")

    def extract_booking_info(self, user_input):
        """Use Google Gemini to extract booking information from natural language"""
        
        # Create a detailed prompt for Gemini
        prompt = f"""
You are a sports booking assistant. Extract booking information from the user's request and return a JSON response.

User request: "{user_input}"

Available sports in our database: badminton, tennis, basketball, football

Extract and return ONLY a JSON object with these fields:
- "sport": the sport name (must be one from the list above)
- "time_start": start time in HH:MM format (24-hour)  
- "time_end": end time in HH:MM format (24-hour)
- "action": either "book", "cancel", "search", or "check_availability"
- "confidence": your confidence level (0.0-1.0)

Examples of good responses:
{{"sport": "badminton", "time_start": "18:00", "time_end": "19:00", "action": "book", "confidence": 0.9}}
{{"sport": "tennis", "time_start": "14:00", "time_end": "16:00", "action": "search", "confidence": 0.8}}

Return ONLY the JSON object, no other text.
"""

        try:
            # Generate response using Gemini
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            print(f"🧠 Gemini AI response: {response_text}")
            
            # Try to parse the JSON response
            try:
                booking_info = json.loads(response_text)
                return booking_info
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    booking_info = json.loads(json_match.group())
                    return booking_info
                else:
                    raise ValueError("Could not extract valid JSON from AI response")
                    
        except Exception as e:
            print(f"❌ Error with Gemini AI: {e}")
            # Fallback to pattern matching
            return self._fallback_extraction(user_input)

    def _fallback_extraction(self, user_input):
        """Fallback pattern matching if AI fails"""
        user_input = user_input.lower()
        
        # Detect sport
        sport = None
        if 'badminton' in user_input:
            sport = 'badminton'
        elif 'tennis' in user_input:
            sport = 'tennis'
        elif 'basketball' in user_input:
            sport = 'basketball'
        elif 'football' in user_input:
            sport = 'football'
        
        # Detect action
        action = 'book'  # default
        if 'cancel' in user_input:
            action = 'cancel'
        elif 'search' in user_input or 'find' in user_input or 'available' in user_input:
            action = 'search'
        elif 'check' in user_input:
            action = 'check_availability'
        
        # Extract time (simple patterns)
        time_start = None
        time_end = None
        
        # Pattern: "6-7pm", "18:00-19:00", "between 6 and 7"
        time_patterns = [
            r'(\d{1,2})-(\d{1,2})(?:pm|am)?',
            r'(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})',
            r'between (\d{1,2}) and (\d{1,2})',
            r'from (\d{1,2}) to (\d{1,2})'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, user_input)
            if match:
                if len(match.groups()) == 2:
                    start_hour = int(match.group(1))
                    end_hour = int(match.group(2))
                    # Convert to 24-hour format if needed
                    if 'pm' in user_input and start_hour < 12:
                        start_hour += 12
                        end_hour += 12
                    time_start = f"{start_hour:02d}:00"
                    time_end = f"{end_hour:02d}:00"
                    break
        
        # If no specific time found and it's a booking, suggest default time
        if action == 'book' and not time_start:
            # Default to next available hour (simple example)
            current_hour = datetime.now().hour
            if current_hour < 18:
                time_start = "18:00"  # 6 PM
                time_end = "19:00"    # 7 PM
            else:
                time_start = f"{current_hour + 1:02d}:00"
                time_end = f"{current_hour + 2:02d}:00"
        
        return {
            "sport": sport,
            "time_start": time_start,
            "time_end": time_end,
            "action": action,
            "confidence": 0.7  # Higher confidence for better fallback
        }

    def process_booking_request(self, user_input):
        """Main method to process booking requests"""
        print(f"🎯 Processing: '{user_input}'")
        print("🧠 Using Google Gemini AI to understand your request...")
        
        # Extract booking info using AI
        booking_info = self.extract_booking_info(user_input)
        
        if not booking_info.get('sport'):
            return "❌ I couldn't identify which sport you want to book. Please specify: badminton, tennis, basketball, or football."
        
        sport = booking_info['sport']
        action = booking_info.get('action', 'book')
        confidence = booking_info.get('confidence', 0.5)
        
        print(f"🎪 Detected sport: {sport}")
        print(f"🎬 Action: {action}")
        print(f"🎯 AI Confidence: {confidence:.1%}")
        
        if action == 'search':
            # Search for available courts
            courts = self.db_helper.search_courts_by_sport(sport)
            if courts:
                result = f"🏟️ Found {len(courts)} {sport} courts:\n\n"
                for court in courts:
                    venue_name = court['venue_name']  # Dict access for enhanced DB
                    court_name = court['court_name']   
                    hourly_rate = court['price_per_hour']  
                    result += f"🎾 {court_name} at {venue_name}\n"
                    result += f"   💰 Rate: ${hourly_rate}/hour\n\n"
                return result
            else:
                return f"❌ No {sport} courts found in our database."
        
        elif action == 'book':
            time_start = booking_info.get('time_start')
            time_end = booking_info.get('time_end')
            
            # If no specific time, use the defaults from fallback
            if not time_start or not time_end:
                if booking_info.get('confidence', 0) >= 0.7:  # Fallback provided defaults
                    time_start = booking_info.get('time_start', '18:00')
                    time_end = booking_info.get('time_end', '19:00')
                else:
                    return f"❌ I need specific times to book a {sport} court. Please specify when you'd like to play (e.g., 'from 6-7pm' or 'between 14:00 and 16:00')."
            
            # First, find all courts of this sport
            all_courts = self.db_helper.search_courts_by_sport(sport)
            
            if not all_courts:
                return f"❌ No {sport} courts found in our database."
            
            # Check availability for each court and book the first available one
            for court in all_courts:
                court_id = court['court_id']
                
                # Check if this court is available at the requested time
                is_available = self.db_helper.check_court_availability(
                    court_id=court_id,
                    date_str='2025-08-11',  # Today's date
                    start_time=time_start,
                    end_time=time_end
                )
                
                if is_available:
                    # Book this available court
                    booking_result = self.db_helper.create_booking(
                        user_id=1,  # Default user
                        court_id=court_id,
                        date_str='2025-08-11',  # Today's date
                        start_time=time_start,
                        end_time=time_end
                    )
                    
                    if booking_result:
                        court_name = court['court_name']
                        venue_name = court['venue_name']
                        return f"✅ Successfully booked {court_name} at {venue_name} for {sport} from {time_start} to {time_end}! 🎾"
                    else:
                        return "❌ Booking failed during database transaction. Please try again."
            
            # If we get here, no courts were available
            return f"❌ No {sport} courts available from {time_start} to {time_end}. All courts are booked during that time."
        
        elif action == 'check_availability':
            time_start = booking_info.get('time_start')
            time_end = booking_info.get('time_end')
            
            if not time_start or not time_end:
                return f"❌ I need both start and end times to check availability for {sport} courts. Please specify the time range."
            
            # Find all courts of this sport
            all_courts = self.db_helper.search_courts_by_sport(sport)
            
            if not all_courts:
                return f"❌ No {sport} courts found in our database."
            
            available_courts = []
            for court in all_courts:
                court_id = court['court_id']
                is_available = self.db_helper.check_court_availability(
                    court_id=court_id,
                    date_str='2025-08-11',
                    start_time=time_start,
                    end_time=time_end
                )
                
                if is_available:
                    available_courts.append(court)
            
            if available_courts:
                result = f"✅ {len(available_courts)} {sport} courts available from {time_start} to {time_end}:\n\n"
                for court in available_courts:
                    result += f"🎾 {court['court_name']} at {court['venue_name']}\n"
                    result += f"   💰 Rate: ${court['price_per_hour']}/hour\n\n"
                return result
            else:
                return f"❌ No {sport} courts available from {time_start} to {time_end}."
        
        else:
            return f"🤔 I'm not sure how to {action} a {sport} court. Try asking to book, search, or check availability."

def main():
    """Main function to run the Google LLM booking agent"""
    try:
        agent = GoogleLLMBookingAgent()
        
        print("\n" + "="*60)
        print("🚀 GOOGLE GEMINI SPORTS BOOKING AGENT")
        print("="*60)
        print("💡 Examples:")
        print("   • 'book a badminton court between 6-7pm'")
        print("   • 'find tennis courts available'")
        print("   • 'search for basketball courts'")
        print("   • 'book tennis from 14:00 to 16:00'")
        print("📝 Type 'quit' to exit")
        print("="*60)
        
        while True:
            try:
                user_input = input("\n🎯 What would you like to do? ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Thank you for using the Google Gemini Sports Booking Agent!")
                    break
                
                if not user_input:
                    continue
                
                # Process the booking request
                response = agent.process_booking_request(user_input)
                print(f"\n🤖 {response}")
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
    
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        print("🔍 Make sure your GOOGLE_API_KEY is set correctly in the .env file")

if __name__ == "__main__":
    main()
