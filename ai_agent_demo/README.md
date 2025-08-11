# 🎾 Google Gemini Sports Booking Agent

An intelligent, AI-powered sports court booking system that leverages Google's Gemini AI for natural language processing and SQLite for data persistence. This system understands conversational booking requests and automatically manages court reservations.

## 🌟 Features

### 🧠 **AI-Powered Natural Language Understanding**
- **Google Gemini 2.0 Flash Integration** - Uses Google's latest and fastest AI model
- **Conversational Interface** - Understands natural language like "book me a badminton court between 6-7pm"
- **Smart Intent Recognition** - Automatically detects booking actions: book, search, cancel, check availability
- **Context Awareness** - Maintains conversation flow and understands follow-up requests
- **High Confidence Scoring** - AI provides confidence levels for each interpretation (typically 90%+)

### 🏟️ **Comprehensive Booking System**
- **Multi-Sport Support** - Badminton, Tennis, Basketball, Football courts
- **Real-Time Availability Checking** - Prevents double bookings with overlap detection
- **Automatic Pricing Calculation** - Calculates costs based on hourly rates and duration
- **Smart Court Assignment** - Finds and books the first available court automatically
- **Booking Status Management** - Handles active, cancelled, and completed bookings

### 🗄️ **Robust Database Architecture**
- **SQLite Database** - Lightweight, serverless, reliable data storage
- **Comprehensive Schema** - Users, venues, courts, sports, bookings, and OTP verification
- **Foreign Key Constraints** - Ensures data integrity and referential consistency
- **Role-Based Access** - Support for admin, owner, and customer user roles
- **Audit Trail** - Timestamps and status tracking for all operations

## 📋 Technical Architecture

### 🏗️ **Project Structure**
```
sport2/
├── google_llm_agent.py          # 🤖 Main AI agent with Gemini integration
├── enhanced_database_helper.py  # 🗄️ Database operations and business logic
├── schema.sql                   # 📋 Complete database schema definition
├── sports_booking.db           # 💾 SQLite database file
├── .env                        # 🔑 Environment variables and API keys
├── requirements.txt            # 📦 Python dependencies
└── README.md                   # 📖 This documentation
```

### 🔧 **Core Components**

#### **GoogleLLMBookingAgent** (`google_llm_agent.py`)
The main AI agent that provides the conversational interface:
- **Natural Language Processing** - Processes user requests using Google Gemini
- **Information Extraction** - Extracts sport type, time slots, and booking actions
- **Response Generation** - Provides helpful, contextual responses
- **Error Handling** - Graceful fallbacks when AI processing fails

#### **SportsBookingDB** (`enhanced_database_helper.py`)
The database engine that manages all data operations:
- **Court Search** - `search_courts_by_sport()` with filtering and joining
- **Availability Checking** - `check_court_availability()` with overlap detection
- **Booking Management** - `create_booking()` with automatic pricing
- **User Management** - `get_user_bookings()` and cancellation support

## 🚀 Installation & Setup

### **Prerequisites**
- Python 3.8 or higher
- Google API key with Generative AI access

### **1. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **2. Configure API Key**
Update your `.env` file with your Google API key:
```env
GOOGLE_API_KEY=your_google_api_key_here
```

### **3. Initialize Database** (Optional)
The system will automatically create the database if it doesn't exist. To manually initialize:
```python
from enhanced_database_helper import SportsBookingDB
db = SportsBookingDB()
db.add_sample_data()
```

### **4. Run the Agent**
```bash
python google_llm_agent.py
```

## 💬 Usage Guide

### **Basic Commands**
- **Book a court**: `"book me a badminton court between 6-7pm"`
- **Search courts**: `"tennis"` or `"find tennis courts"`
- **Check availability**: `"check availability for badminton at 5-6pm"`
- **Specific time booking**: `"book tennis court from 14:00 to 16:00"`
- **General inquiry**: `"what courts are available?"`

### **Example Conversation**
```
🎯 What would you like to do? book badminton court at 7-8pm

🧠 Gemini AI response: {"sport": "badminton", "time_start": "19:00", "time_end": "20:00", "action": "book", "confidence": 0.95}

🤖 ✅ Successfully booked Court 1 at Sports Complex A for badminton from 19:00 to 20:00! 🎾

🎯 What would you like to do? tennis

🤖 🏟️ Found 1 tennis courts:
    🎾 Tennis Court 1 at Sports Complex A
       💰 Rate: $70.0/hour
```

## 🗃️ Database Schema

### **Core Tables**
- **`user`** - User accounts with role-based access (admin, owner, customer)
- **`sport`** - Available sports types (badminton, tennis, basketball, football)
- **`venue`** - Sports facilities with location and approval status
- **`court`** - Individual courts with pricing and operating hours
- **`booking`** - Reservation records with status and pricing
- **`otp_verification`** - One-time passcodes for user verification

### **Key Relationships**
```sql
court → venue (many-to-one)
court → sport (many-to-one)  
booking → user (many-to-one)
booking → court (many-to-one)
```

## 🤖 AI Processing Flow

### **1. Natural Language Understanding**
```python
User Input: "book me a badminton court between 6-7pm"
       ↓
Gemini AI Processing
       ↓
Extracted Info: {
    "sport": "badminton",
    "time_start": "18:00", 
    "time_end": "19:00",
    "action": "book",
    "confidence": 0.95
}
```

### **2. Business Logic Processing**
```python
Database Query → Check Availability → Create Booking → Confirm Response
```

### **3. Response Generation**
```
✅ Successfully booked Court 1 at Sports Complex A for badminton from 18:00 to 19:00! 🎾
```

## 🔒 Configuration & Security

### **Environment Variables**
```env
GOOGLE_API_KEY=your_google_api_key_here    # Required: Google Gemini API access
DATABASE_PATH=sports_booking.db            # Optional: Custom database path
```

### **API Key Security**
- Store API keys in `.env` file (never commit to version control)
- Use environment-specific configurations
- Implement proper error handling for authentication failures

## 📊 Performance & Scalability

### **AI Model Performance**
- **Model**: Google Gemini 2.0 Flash (latest, fastest available)
- **Response Time**: Typically 1-3 seconds for natural language processing
- **Accuracy**: 90%+ confidence in intent recognition
- **Fallback**: Pattern-matching backup when AI fails

### **Database Performance**
- **Engine**: SQLite with optimized queries
- **Indexing**: Primary keys and foreign key constraints
- **Concurrency**: Row-level locking for booking operations
- **Scalability**: Suitable for small to medium-scale deployments

## 🛠️ Development & Customization

### **Adding New Sports**
```python
# In enhanced_database_helper.py
sports = ['Badminton', 'Tennis', 'Basketball', 'Football', 'YourNewSport']
```

### **Customizing AI Prompts**
Modify the prompt in `extract_booking_info()` method to change AI behavior:
```python
prompt = f"""
You are a sports booking assistant...
Available sports: {your_custom_sports_list}
"""
```

### **Extending Database Schema**
Add new tables or fields to `schema.sql` and update corresponding helper methods.

## 🧪 Testing & Debugging

### **Manual Testing**
```bash
python google_llm_agent.py
```

### **Debug Mode**
The agent provides detailed logging:
- AI processing steps and confidence scores
- Database query results
- Error messages with context

### **Common Issues**
- **API Key Errors**: Ensure `GOOGLE_API_KEY` is set correctly in `.env`
- **Database Errors**: Check file permissions for SQLite database
- **Import Errors**: Verify all dependencies are installed via `requirements.txt`

## 🤝 Contributing

This project demonstrates modern AI integration patterns:
- **Clean Architecture** - Separation of AI, business logic, and data layers
- **Error Handling** - Graceful degradation when services fail
- **Extensibility** - Easy to add new sports, venues, or AI providers
- **Documentation** - Comprehensive inline documentation and examples

## 📄 License & Credits

**Powered by:**
- Google Gemini 2.0 Flash AI
- SQLite Database Engine  
- Python 3.8+ Runtime

---

*🎾 Built with ❤️ for intelligent sports booking experiences*
