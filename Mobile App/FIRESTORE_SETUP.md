# Firestore Database Setup

This document explains how to set up your Firestore database for the sports booking app with all the required collections and dummy data.

## 🗄️ Database Structure

The database includes the following collections:

### Core Collections
- **sports** (8 sports): Badminton, Football, Tennis, Basketball, Cricket, etc.
- **users** (5 users): Including regular users, venue owners, and admin
- **venues** (8 venues): Sports venues across Bangalore with complete details
- **venue_owners**: Ownership relationships between users and venues
- **venue_photos**: Photo galleries for each venue
- **venue_sports**: Many-to-many mapping between venues and sports
- **courts** (18+ courts): Individual courts within venues
- **time_slots** (9,180+ slots): 30 days × 17 hours × 18 courts of availability
- **bookings** (5 sample bookings): Example booking data

## 🚀 Quick Setup

### Option 1: Use the Database Initialization Button (Recommended)

1. **Add the button to any screen temporarily:**
   ```dart
   import 'database_init_button.dart';
   
   // Add this widget to your screen:
   const DatabaseInitButton()
   ```

2. **Or call the function directly:**
   ```dart
   import 'database_init_button.dart';
   
   // Call this function:
   await initializeFirestoreDatabase();
   ```

### Option 2: Use the Full Initialization Screen

1. **Navigate to the database initialization screen:**
   ```dart
   import 'database_initialization_screen.dart';
   
   Navigator.push(
     context,
     MaterialPageRoute(
       builder: (context) => const DatabaseInitializationScreen(),
     ),
   );
   ```

### Option 3: Direct Service Call

1. **Call the setup service directly:**
   ```dart
   import 'firestore_setup_service.dart';
   
   // Initialize the entire database
   await FirestoreSetupService.initializeDatabase();
   ```

## 📊 Sample Data Included

### Venues
- **Elite Badminton Center** (MG Road) - 6 courts
- **Champions Football Turf** (Koramangala) - 2 turfs
- **Ace Tennis Academy** (Indiranagar) - 4 courts
- **Pro Basketball Arena** (HSR Layout) - 2 courts
- **Victory Cricket Ground** (Electronic City) - Full ground + nets
- **Premier Badminton Club** (Whitefield) - 8 courts
- **City Football Complex** (Marathahalli) - 3 turfs
- **Grand Tennis Club** (Jayanagar) - Premium courts

### Users
- Regular users for testing bookings
- Venue owners managing venues
- Admin user for management

### Features
- ✅ Realistic venue data with ratings, amenities, pricing
- ✅ Time slot management with availability tracking
- ✅ Booking system with confirmed/pending status
- ✅ Photo galleries for each venue
- ✅ Multi-sport support per venue
- ✅ Proper relationships between all entities

## 🔧 Usage with Your App

After initialization, you can use the `FirestoreService` to interact with the data:

```dart
import 'firestore_service.dart';

// Get all venues
final venues = await FirestoreService.getAllVenues();

// Get venues by sport
final badmintonVenues = await FirestoreService.getVenuesBySport(1);

// Get available time slots
final timeSlots = await FirestoreService.getAvailableTimeSlots('court_1', '2025-08-15');

// Create a booking
final bookingId = await FirestoreService.createBooking(
  userId: 1,
  courtId: 'court_1',
  date: '2025-08-15',
  startTime: '18:00',
  endTime: '19:00',
  totalPrice: 800.0,
);

// Search venues
final searchResults = await FirestoreService.searchVenues('badminton');
```

## 🗑️ Clear Database

To clear all data:
```dart
await FirestoreSetupService.clearAllData();
```

## 📈 Verify Setup

To check collection counts:
```dart
await FirestoreSetupService.printCollectionCounts();
```

## 🔧 Troubleshooting

1. **Make sure Firebase is properly initialized** in your `main()` function
2. **Ensure Firestore is enabled** in your Firebase console
3. **Check Firestore rules** allow read/write operations
4. **Verify internet connection** during initialization

## 🎯 Integration with Existing Code

The database structure is designed to work seamlessly with your existing booking flow in `booking_page.dart` and venue display in `venues_page.dart`. The data structure matches the hardcoded data you currently have, making migration smooth.

## 📝 Notes

- Time slots are generated for the next 30 days
- All venues are pre-approved and active
- Sample bookings show different statuses (confirmed, pending)
- Images use Unsplash URLs for realistic photos
- Phone numbers and emails are fictional for demo purposes
