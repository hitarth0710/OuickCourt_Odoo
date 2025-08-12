import 'package:cloud_firestore/cloud_firestore.dart';

/// Firestore Service for CRUD operations
/// This service provides methods to interact with the Firestore database
class FirestoreService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ===== SPORTS METHODS =====

  /// Get all sports
  static Future<List<Map<String, dynamic>>> getAllSports() async {
    try {
      final QuerySnapshot snapshot = await _firestore.collection('sports').get();
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error getting sports: $e');
      return [];
    }
  }

  /// Get sport by ID
  static Future<Map<String, dynamic>?> getSportById(String sportId) async {
    try {
      final DocumentSnapshot snapshot = await _firestore.collection('sports').doc(sportId).get();
      if (snapshot.exists) {
        return {
          'id': snapshot.id,
          ...snapshot.data() as Map<String, dynamic>
        };
      }
      return null;
    } catch (e) {
      print('Error getting sport by ID: $e');
      return null;
    }
  }

  // ===== VENUES METHODS =====

  /// Get all venues
  static Future<List<Map<String, dynamic>>> getAllVenues() async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('venues')
          .where('is_approved', isEqualTo: true)
          .where('is_active', isEqualTo: true)
          .get();
      
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error getting venues: $e');
      return [];
    }
  }

  /// Get venues by sport
  static Future<List<Map<String, dynamic>>> getVenuesBySport(String sportName) async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('venues')
          .where('is_approved', isEqualTo: true)
          .where('is_active', isEqualTo: true)
          .where('supported_sports', arrayContains: sportName)
          .get();
      
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error getting venues by sport: $e');
      return [];
    }
  }

  /// Get venue by ID
  static Future<Map<String, dynamic>?> getVenueById(String venueId) async {
    try {
      final DocumentSnapshot snapshot = await _firestore.collection('venues').doc(venueId).get();
      if (snapshot.exists) {
        return {
          'id': snapshot.id,
          ...snapshot.data() as Map<String, dynamic>
        };
      }
      return null;
    } catch (e) {
      print('Error getting venue by ID: $e');
      return null;
    }
  }

  /// Get featured venues (top rated)
  static Future<List<Map<String, dynamic>>> getFeaturedVenues({int limit = 4}) async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('venues')
          .where('is_approved', isEqualTo: true)
          .where('is_active', isEqualTo: true)
          .limit(limit)
          .get();
      
      // Sort by rating in memory to avoid index requirements
      List<Map<String, dynamic>> venues = snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
      
      venues.sort((a, b) => (b['rating'] as num).compareTo(a['rating'] as num));
      
      return venues;
    } catch (e) {
      print('Error getting featured venues: $e');
      return [];
    }
  }

  // ===== BOOKING METHODS =====

  /// Create a new booking
  static Future<String?> createBooking(Map<String, dynamic> bookingData) async {
    try {
      // Add timestamp
      bookingData['created_at'] = FieldValue.serverTimestamp();
      bookingData['updated_at'] = FieldValue.serverTimestamp();
      
      print('🔄 Creating booking with data: ${bookingData.keys.toList()}');
      
      final DocumentReference docRef = await _firestore.collection('bookings').add(bookingData);
      print('✅ Booking created successfully with ID: ${docRef.id}');
      
      // Verify the booking was created
      final verifyDoc = await docRef.get();
      if (verifyDoc.exists) {
        print('✅ Booking verification successful');
        return docRef.id;
      } else {
        print('❌ Booking verification failed');
        return null;
      }
    } catch (e) {
      print('❌ Error creating booking: $e');
      return null;
    }
  }

  /// Get user bookings
  static Future<List<Map<String, dynamic>>> getUserBookings(String userId) async {
    try {
      print('🔄 Fetching bookings for user: $userId');
      
      // First, try to get all bookings to debug
      final allBookingsSnapshot = await _firestore.collection('bookings').get();
      print('🔍 Total bookings in database: ${allBookingsSnapshot.docs.length}');
      
      if (allBookingsSnapshot.docs.isNotEmpty) {
        for (var doc in allBookingsSnapshot.docs.take(3)) {
          final data = doc.data();
          print('  📋 Sample booking: user_id=${data['user_id']}, venue=${data['venue_name']}');
        }
      }
      
      final QuerySnapshot snapshot = await _firestore
          .collection('bookings')
          .where('user_id', isEqualTo: userId)
          .get();
      
      final bookings = snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
      
      // Sort by created_at manually to avoid Firestore index requirement
      bookings.sort((a, b) {
        try {
          final aTime = a['created_at'] as Timestamp?;
          final bTime = b['created_at'] as Timestamp?;
          
          if (aTime == null && bTime == null) return 0;
          if (aTime == null) return 1;
          if (bTime == null) return -1;
          
          return bTime.compareTo(aTime); // descending order
        } catch (e) {
          // Fallback to booking_id comparison if timestamps fail
          return (b['booking_id'] ?? '').toString().compareTo((a['booking_id'] ?? '').toString());
        }
      });
      
      print('✅ Found ${bookings.length} bookings for user');
      for (var booking in bookings) {
        print('  - Booking ID: ${booking['id']}, Venue: ${booking['venue_name']}, Sport: ${booking['sport']}');
      }
      
      return bookings;
    } catch (e) {
      print('❌ Error getting user bookings: $e');
      return [];
    }
  }

  /// Get venue bookings
  static Future<List<Map<String, dynamic>>> getVenueBookings(String venueId) async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('bookings')
          .where('venue_id', isEqualTo: venueId)
          .get();
      
      final bookings = snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
      
      // Sort manually to avoid index requirements
      bookings.sort((a, b) {
        try {
          final aTime = a['created_at'] as Timestamp?;
          final bTime = b['created_at'] as Timestamp?;
          
          if (aTime == null && bTime == null) return 0;
          if (aTime == null) return 1;
          if (bTime == null) return -1;
          
          return bTime.compareTo(aTime);
        } catch (e) {
          return (b['booking_id'] ?? '').toString().compareTo((a['booking_id'] ?? '').toString());
        }
      });
      
      return bookings;
    } catch (e) {
      print('Error getting venue bookings: $e');
      return [];
    }
  }

  /// Update booking status
  static Future<bool> updateBookingStatus(String bookingId, String status) async {
    try {
      await _firestore.collection('bookings').doc(bookingId).update({
        'status': status,
        'updated_at': FieldValue.serverTimestamp(),
      });
      print('✅ Booking status updated to: $status');
      return true;
    } catch (e) {
      print('❌ Error updating booking status: $e');
      return false;
    }
  }

  /// Cancel booking
  static Future<bool> cancelBooking(String bookingId) async {
    try {
      await _firestore.collection('bookings').doc(bookingId).update({
        'status': 'cancelled',
        'cancelled_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
      });
      print('✅ Booking cancelled successfully');
      return true;
    } catch (e) {
      print('❌ Error cancelling booking: $e');
      return false;
    }
  }

  /// Get booking by ID
  static Future<Map<String, dynamic>?> getBookingById(String bookingId) async {
    try {
      final DocumentSnapshot snapshot = await _firestore.collection('bookings').doc(bookingId).get();
      if (snapshot.exists) {
        return {
          'id': snapshot.id,
          ...snapshot.data() as Map<String, dynamic>
        };
      }
      return null;
    } catch (e) {
      print('❌ Error getting booking by ID: $e');
      return null;
    }
  }

  // ===== SEARCH METHODS =====

  /// Search venues by name or location
  static Future<List<Map<String, dynamic>>> searchVenues(String query) async {
    try {
      final String lowerQuery = query.toLowerCase();
      
      final QuerySnapshot snapshot = await _firestore
          .collection('venues')
          .where('is_approved', isEqualTo: true)
          .where('is_active', isEqualTo: true)
          .get();
      
      // Filter results based on name or location containing the query
      final filteredDocs = snapshot.docs.where((doc) {
        final data = doc.data() as Map<String, dynamic>;
        final name = (data['name'] as String? ?? '').toLowerCase();
        final location = (data['short_location'] as String? ?? '').toLowerCase();
        return name.contains(lowerQuery) || location.contains(lowerQuery);
      }).toList();
      
      return filteredDocs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error searching venues: $e');
      return [];
    }
  }

  // ===== USER PROFILE METHODS =====

  /// Get user profile by ID
  static Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final DocumentSnapshot snapshot = await _firestore.collection('users').doc(userId).get();
      if (snapshot.exists) {
        return {
          'id': snapshot.id,
          ...snapshot.data() as Map<String, dynamic>
        };
      }
      return null;
    } catch (e) {
      print('Error getting user profile: $e');
      return null;
    }
  }

  /// Update user profile
  static Future<bool> updateUserProfile(String userId, Map<String, dynamic> userData) async {
    try {
      // Create a copy of userData to avoid modifying the original
      final updatedData = Map<String, dynamic>.from(userData);
      updatedData['updated_at'] = FieldValue.serverTimestamp();
      
      await _firestore.collection('users').doc(userId).set(updatedData, SetOptions(merge: true));
      print('✅ User profile updated successfully');
      return true;
    } catch (e) {
      print('Error updating user profile: $e');
      return false;
    }
  }

  /// Create or update user profile
  static Future<bool> createUserProfile({
    required String userId,
    required String fullName,
    required String email,
    String? phone,
    String? avatarUrl,
  }) async {
    try {
      final userData = {
        'full_name': fullName,
        'email': email,
        'phone': phone ?? '',
        'avatar_url': avatarUrl ?? '',
        'role': 'user',
        'is_verified': false,
        'is_banned': false,
        'created_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
      };
      
      await _firestore.collection('users').doc(userId).set(userData, SetOptions(merge: true));
      print('✅ User profile created successfully');
      return true;
    } catch (e) {
      print('Error creating user profile: $e');
      return false;
    }
  }
}
