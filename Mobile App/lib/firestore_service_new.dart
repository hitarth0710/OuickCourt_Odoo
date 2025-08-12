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
          .orderBy('rating', descending: true)
          .limit(limit)
          .get();
      
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
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
      
      final DocumentReference docRef = await _firestore.collection('bookings').add(bookingData);
      print('✅ Booking created with ID: ${docRef.id}');
      return docRef.id;
    } catch (e) {
      print('Error creating booking: $e');
      return null;
    }
  }

  /// Get user bookings
  static Future<List<Map<String, dynamic>>> getUserBookings(String userId) async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('bookings')
          .where('user_id', isEqualTo: userId)
          .orderBy('created_at', descending: true)
          .get();
      
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error getting user bookings: $e');
      return [];
    }
  }

  /// Get venue bookings
  static Future<List<Map<String, dynamic>>> getVenueBookings(String venueId) async {
    try {
      final QuerySnapshot snapshot = await _firestore
          .collection('bookings')
          .where('venue_id', isEqualTo: venueId)
          .orderBy('created_at', descending: true)
          .get();
      
      return snapshot.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>
      }).toList();
    } catch (e) {
      print('Error getting venue bookings: $e');
      return [];
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
}
