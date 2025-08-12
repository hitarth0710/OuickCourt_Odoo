import 'firestore_service.dart';
import 'auth_service.dart';

class TestBookingSystem {
  static Future<void> testBookingCreation() async {
    print('🧪 Testing Booking System...');
    
    try {
      // Check if user is authenticated
      final user = AuthService().currentUser;
      if (user == null) {
        print('❌ No user authenticated');
        return;
      }
      
      print('✅ User authenticated: ${user.email}');
      
      // Create a test booking
      final testBookingData = {
        'user_id': user.uid,
        'venue_id': 'test_venue_${DateTime.now().millisecondsSinceEpoch}',
        'venue_name': 'Test Venue',
        'venue_location': 'Test Location',
        'venue_image': '',
        'sport': 'Badminton',
        'court_id': 'court_1',
        'court_name': 'Court 1',
        'booking_date': DateTime.now().toIso8601String(),
        'start_time': '18:00',
        'end_time': '19:00',
        'duration_hours': 1,
        'price_per_hour': 500.0,
        'total_amount': 500.0,
        'status': 'confirmed',
        'payment_status': 'paid',
        'booking_id': 'QB${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        'user_name': user.displayName ?? user.email?.split('@')[0] ?? 'Test User',
        'user_email': user.email ?? '',
        'user_phone': '',
        'notes': 'Test booking',
      };
      
      print('🔄 Creating test booking...');
      final bookingId = await FirestoreService.createBooking(testBookingData);
      
      if (bookingId != null) {
        print('✅ Test booking created successfully: $bookingId');
        
        // Test retrieval
        print('🔄 Testing booking retrieval...');
        final userBookings = await FirestoreService.getUserBookings(user.uid);
        print('✅ Retrieved ${userBookings.length} bookings');
        
        // Test specific booking retrieval
        final specificBooking = await FirestoreService.getBookingById(bookingId);
        if (specificBooking != null) {
          print('✅ Specific booking retrieved: ${specificBooking['venue_name']}');
        } else {
          print('❌ Failed to retrieve specific booking');
        }
        
      } else {
        print('❌ Failed to create test booking');
      }
      
    } catch (e) {
      print('❌ Test failed with error: $e');
    }
  }
  
  static Future<void> testFirestoreConnection() async {
    print('🧪 Testing Firestore Connection...');
    
    try {
      // Try to read from venues collection
      final venues = await FirestoreService.getAllVenues();
      print('✅ Firestore connection successful. Found ${venues.length} venues');
      
      // Try to read from sports collection
      final sports = await FirestoreService.getAllSports();
      print('✅ Sports collection accessible. Found ${sports.length} sports');
      
    } catch (e) {
      print('❌ Firestore connection failed: $e');
    }
  }
}
