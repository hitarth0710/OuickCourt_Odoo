import 'package:cloud_firestore/cloud_firestore.dart';

/// Firestore Database Setup Service
/// This service creates all the required collections and populates them with dummy data
class FirestoreSetupService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Initialize the entire database with all collections and dummy data
  static Future<void> initializeDatabase() async {
    try {
      print('🚀 Starting Firestore database initialization...');
      
      // Create collections in order (dependencies first)
      await _createSportsCollection();
      await _createUsersCollection();
      await _createVenuesCollection();
      await _createVenueOwnersCollection();
      await _createVenuePhotosCollection();
      await _createVenueSportsCollection();
      await _createCourtsCollection();
      await _createTimeSlotsCollection();
      await _createBookingsCollection();
      
      print('✅ Firestore database initialization completed successfully!');
    } catch (e) {
      print('❌ Error initializing database: $e');
      throw e;
    }
  }

  /// Create Sports Collection
  static Future<void> _createSportsCollection() async {
    print('📋 Creating sports collection...');
    
    final sports = [
      {'id': 1, 'name': 'Badminton'},
      {'id': 2, 'name': 'Football'},
      {'id': 3, 'name': 'Tennis'},
      {'id': 4, 'name': 'Basketball'},
      {'id': 5, 'name': 'Cricket'},
      {'id': 6, 'name': 'Table Tennis'},
      {'id': 7, 'name': 'Swimming'},
      {'id': 8, 'name': 'Squash'},
    ];

    for (var sport in sports) {
      await _firestore.collection('sports').doc('sport_${sport['id']}').set(sport);
    }
    print('✅ Sports collection created with ${sports.length} sports');
  }

  /// Create Users Collection
  static Future<void> _createUsersCollection() async {
    print('👥 Creating users collection...');
    
    final users = [
      {
        'id': 1,
        'full_name': 'John Doe',
        'email': 'john.doe@example.com',
        'password_hash': 'hashed_password_123', // In real app, this would be properly hashed
        'role': 'user',
        'avatar_url': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        'phone': '+91 9876543210',
        'is_verified': true,
        'is_banned': false,
        'date_joined': FieldValue.serverTimestamp(),
      },
      {
        'id': 2,
        'full_name': 'Jane Smith',
        'email': 'jane.smith@example.com',
        'password_hash': 'hashed_password_456',
        'role': 'venue_owner',
        'avatar_url': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        'phone': '+91 9876543211',
        'is_verified': true,
        'is_banned': false,
        'date_joined': FieldValue.serverTimestamp(),
      },
      {
        'id': 3,
        'full_name': 'Mike Johnson',
        'email': 'mike.johnson@example.com',
        'password_hash': 'hashed_password_789',
        'role': 'admin',
        'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        'phone': '+91 9876543212',
        'is_verified': true,
        'is_banned': false,
        'date_joined': FieldValue.serverTimestamp(),
      },
      {
        'id': 4,
        'full_name': 'Sarah Wilson',
        'email': 'sarah.wilson@example.com',
        'password_hash': 'hashed_password_101',
        'role': 'user',
        'avatar_url': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        'phone': '+91 9876543213',
        'is_verified': true,
        'is_banned': false,
        'date_joined': FieldValue.serverTimestamp(),
      },
      {
        'id': 5,
        'full_name': 'David Brown',
        'email': 'david.brown@example.com',
        'password_hash': 'hashed_password_102',
        'role': 'venue_owner',
        'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        'phone': '+91 9876543214',
        'is_verified': true,
        'is_banned': false,
        'date_joined': FieldValue.serverTimestamp(),
      },
    ];

    for (var user in users) {
      await _firestore.collection('users').doc('user_${user['id']}').set(user);
    }
    print('✅ Users collection created with ${users.length} users');
  }

  /// Create Venues Collection
  static Future<void> _createVenuesCollection() async {
    print('🏟️ Creating venues collection...');
    
    final venues = [
      {
        'id': 1,
        'name': 'Elite Badminton Center',
        'description': 'Premium badminton facility with 6 courts and professional coaching available.',
        'address': 'MG Road, Bangalore, Karnataka 560001',
        'short_location': 'MG Road, Bangalore',
        'rating': 4.8,
        'starting_price_per_hour': 800.0,
        'amenities': {
          'ac': true,
          'parking': true,
          'equipment': true,
          'changing_room': true,
          'coaching': true,
          'cafeteria': false,
          'wifi': true,
          'first_aid': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543220',
        'contact_email': 'info@elitebadminton.com',
        'operating_hours': '6:00 AM - 11:00 PM',
      },
      {
        'id': 2,
        'name': 'Champions Football Turf',
        'description': 'Full-size football turf with artificial grass and professional lighting.',
        'address': 'Koramangala, Bangalore, Karnataka 560034',
        'short_location': 'Koramangala, Bangalore',
        'rating': 4.6,
        'starting_price_per_hour': 1200.0,
        'amenities': {
          'floodlights': true,
          'changing_room': true,
          'water': true,
          'first_aid': true,
          'parking': true,
          'equipment': false,
          'wifi': false,
          'cafeteria': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543221',
        'contact_email': 'info@championsfootball.com',
        'operating_hours': '6:00 AM - 12:00 AM',
      },
      {
        'id': 3,
        'name': 'Ace Tennis Academy',
        'description': 'Professional tennis courts with experienced coaches and equipment rental.',
        'address': 'Indiranagar, Bangalore, Karnataka 560038',
        'short_location': 'Indiranagar, Bangalore',
        'rating': 4.7,
        'starting_price_per_hour': 600.0,
        'amenities': {
          'coach_available': true,
          'equipment': true,
          'parking': true,
          'cafeteria': true,
          'changing_room': true,
          'pro_shop': true,
          'wifi': true,
          'first_aid': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543222',
        'contact_email': 'info@acetennis.com',
        'operating_hours': '5:30 AM - 10:30 PM',
      },
      {
        'id': 4,
        'name': 'Pro Basketball Arena',
        'description': 'Indoor basketball court with professional scoreboard and sound system.',
        'address': 'HSR Layout, Bangalore, Karnataka 560102',
        'short_location': 'HSR Layout, Bangalore',
        'rating': 4.5,
        'starting_price_per_hour': 500.0,
        'amenities': {
          'indoor': true,
          'sound_system': true,
          'scoreboard': true,
          'locker_room': true,
          'ac': true,
          'parking': true,
          'wifi': true,
          'first_aid': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543223',
        'contact_email': 'info@probasketball.com',
        'operating_hours': '6:00 AM - 11:00 PM',
      },
      {
        'id': 5,
        'name': 'Victory Cricket Ground',
        'description': 'Full cricket ground with pavilion and all necessary equipment.',
        'address': 'Electronic City, Bangalore, Karnataka 560100',
        'short_location': 'Electronic City, Bangalore',
        'rating': 4.9,
        'starting_price_per_hour': 2000.0,
        'amenities': {
          'full_ground': true,
          'pavilion': true,
          'equipment': true,
          'parking': true,
          'practice_nets': true,
          'cafeteria': true,
          'first_aid': true,
          'wifi': false,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543224',
        'contact_email': 'info@victorycricket.com',
        'operating_hours': '6:00 AM - 9:00 PM',
      },
      {
        'id': 6,
        'name': 'Premier Badminton Club',
        'description': 'Modern badminton club with 8 courts and professional coaching.',
        'address': 'Whitefield, Bangalore, Karnataka 560066',
        'short_location': 'Whitefield, Bangalore',
        'rating': 4.4,
        'starting_price_per_hour': 750.0,
        'amenities': {
          'ac': true,
          'equipment': true,
          'coaching': true,
          'cafeteria': true,
          'parking': true,
          'changing_room': true,
          'wifi': true,
          'first_aid': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543225',
        'contact_email': 'info@premierbadminton.com',
        'operating_hours': '6:00 AM - 11:00 PM',
      },
      {
        'id': 7,
        'name': 'City Football Complex',
        'description': '3 football turfs of different sizes for 5v5, 7v7, and 11v11 matches.',
        'address': 'Marathahalli, Bangalore, Karnataka 560037',
        'short_location': 'Marathahalli, Bangalore',
        'rating': 4.3,
        'starting_price_per_hour': 1000.0,
        'amenities': {
          'multiple_turfs': true,
          'floodlights': true,
          'parking': true,
          'refreshments': true,
          'changing_room': true,
          'first_aid': true,
          'wifi': false,
          'equipment': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543226',
        'contact_email': 'info@cityfootball.com',
        'operating_hours': '6:00 AM - 12:00 AM',
      },
      {
        'id': 8,
        'name': 'Grand Tennis Club',
        'description': 'Premium tennis club with both clay and hard courts available.',
        'address': 'Jayanagar, Bangalore, Karnataka 560011',
        'short_location': 'Jayanagar, Bangalore',
        'rating': 4.8,
        'starting_price_per_hour': 900.0,
        'amenities': {
          'clay_courts': true,
          'hard_courts': true,
          'pro_shop': true,
          'restaurant': true,
          'coaching': true,
          'equipment': true,
          'parking': true,
          'wifi': true,
        },
        'is_approved': true,
        'is_active': true,
        'created_at': FieldValue.serverTimestamp(),
        'contact_phone': '+91 9876543227',
        'contact_email': 'info@grandtennis.com',
        'operating_hours': '5:30 AM - 10:30 PM',
      },
    ];

    for (var venue in venues) {
      await _firestore.collection('venues').doc('venue_${venue['id']}').set(venue);
    }
    print('✅ Venues collection created with ${venues.length} venues');
  }

  /// Create Venue Owners Collection
  static Future<void> _createVenueOwnersCollection() async {
    print('👤 Creating venue_owners collection...');
    
    final venueOwners = [
      {'id': 1, 'venue_id': 1, 'owner_id': 2}, // Jane Smith owns Elite Badminton Center
      {'id': 2, 'venue_id': 2, 'owner_id': 5}, // David Brown owns Champions Football Turf
      {'id': 3, 'venue_id': 3, 'owner_id': 2}, // Jane Smith owns Ace Tennis Academy
      {'id': 4, 'venue_id': 4, 'owner_id': 5}, // David Brown owns Pro Basketball Arena
      {'id': 5, 'venue_id': 5, 'owner_id': 2}, // Jane Smith owns Victory Cricket Ground
      {'id': 6, 'venue_id': 6, 'owner_id': 5}, // David Brown owns Premier Badminton Club
      {'id': 7, 'venue_id': 7, 'owner_id': 2}, // Jane Smith owns City Football Complex
      {'id': 8, 'venue_id': 8, 'owner_id': 5}, // David Brown owns Grand Tennis Club
    ];

    for (var venueOwner in venueOwners) {
      await _firestore.collection('venue_owners').doc('vo_${venueOwner['id']}').set(venueOwner);
    }
    print('✅ Venue owners collection created with ${venueOwners.length} entries');
  }

  /// Create Venue Photos Collection
  static Future<void> _createVenuePhotosCollection() async {
    print('📷 Creating venue_photos collection...');
    
    final venuePhotos = [
      // Elite Badminton Center
      {'id': 1, 'venue_id': 1, 'photo_url': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop'},
      {'id': 2, 'venue_id': 1, 'photo_url': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'},
      
      // Champions Football Turf
      {'id': 3, 'venue_id': 2, 'photo_url': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'},
      {'id': 4, 'venue_id': 2, 'photo_url': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'},
      
      // Ace Tennis Academy
      {'id': 5, 'venue_id': 3, 'photo_url': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop'},
      {'id': 6, 'venue_id': 3, 'photo_url': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop'},
      
      // Pro Basketball Arena
      {'id': 7, 'venue_id': 4, 'photo_url': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop'},
      {'id': 8, 'venue_id': 4, 'photo_url': 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=600&fit=crop'},
      
      // Victory Cricket Ground
      {'id': 9, 'venue_id': 5, 'photo_url': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop'},
      {'id': 10, 'venue_id': 5, 'photo_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'},
      
      // Premier Badminton Club
      {'id': 11, 'venue_id': 6, 'photo_url': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop'},
      {'id': 12, 'venue_id': 6, 'photo_url': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'},
      
      // City Football Complex
      {'id': 13, 'venue_id': 7, 'photo_url': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop'},
      {'id': 14, 'venue_id': 7, 'photo_url': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'},
      
      // Grand Tennis Club
      {'id': 15, 'venue_id': 8, 'photo_url': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop'},
      {'id': 16, 'venue_id': 8, 'photo_url': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=600&fit=crop'},
    ];

    for (var photo in venuePhotos) {
      await _firestore.collection('venue_photos').doc('photo_${photo['id']}').set(photo);
    }
    print('✅ Venue photos collection created with ${venuePhotos.length} photos');
  }

  /// Create Venue Sports Collection (Many-to-Many relationship)
  static Future<void> _createVenueSportsCollection() async {
    print('🎯 Creating venue_sports collection...');
    
    final venueSports = [
      {'id': 1, 'venue_id': 1, 'sport_id': 1}, // Elite Badminton Center - Badminton
      {'id': 2, 'venue_id': 2, 'sport_id': 2}, // Champions Football Turf - Football
      {'id': 3, 'venue_id': 3, 'sport_id': 3}, // Ace Tennis Academy - Tennis
      {'id': 4, 'venue_id': 4, 'sport_id': 4}, // Pro Basketball Arena - Basketball
      {'id': 5, 'venue_id': 5, 'sport_id': 5}, // Victory Cricket Ground - Cricket
      {'id': 6, 'venue_id': 6, 'sport_id': 1}, // Premier Badminton Club - Badminton
      {'id': 7, 'venue_id': 7, 'sport_id': 2}, // City Football Complex - Football
      {'id': 8, 'venue_id': 8, 'sport_id': 3}, // Grand Tennis Club - Tennis
      
      // Some venues support multiple sports
      {'id': 9, 'venue_id': 3, 'sport_id': 6}, // Ace Tennis Academy - Table Tennis
      {'id': 10, 'venue_id': 7, 'sport_id': 4}, // City Football Complex - Basketball
    ];

    for (var venueSport in venueSports) {
      await _firestore.collection('venue_sports').doc('vs_${venueSport['id']}').set(venueSport);
    }
    print('✅ Venue sports collection created with ${venueSports.length} entries');
  }

  /// Create Courts Collection
  static Future<void> _createCourtsCollection() async {
    print('🏟️ Creating courts collection...');
    
    final courts = [
      // Elite Badminton Center Courts
      {'id': 1, 'venue_id': 1, 'sport_id': 1, 'name': 'Court A', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 2, 'venue_id': 1, 'sport_id': 1, 'name': 'Court B', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 3, 'venue_id': 1, 'sport_id': 1, 'name': 'Court C', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 4, 'venue_id': 1, 'sport_id': 1, 'name': 'Court D', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 5, 'venue_id': 1, 'sport_id': 1, 'name': 'Court E', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 6, 'venue_id': 1, 'sport_id': 1, 'name': 'Court F', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      
      // Champions Football Turf Courts
      {'id': 7, 'venue_id': 2, 'sport_id': 2, 'name': 'Main Turf', 'price_per_hour': 1200.0, 'operating_hours_start': '06:00', 'operating_hours_end': '24:00', 'is_active': true},
      {'id': 8, 'venue_id': 2, 'sport_id': 2, 'name': 'Side Turf', 'price_per_hour': 1000.0, 'operating_hours_start': '06:00', 'operating_hours_end': '24:00', 'is_active': true},
      
      // Ace Tennis Academy Courts
      {'id': 9, 'venue_id': 3, 'sport_id': 3, 'name': 'Court 1', 'price_per_hour': 600.0, 'operating_hours_start': '05:30', 'operating_hours_end': '22:30', 'is_active': true},
      {'id': 10, 'venue_id': 3, 'sport_id': 3, 'name': 'Court 2', 'price_per_hour': 600.0, 'operating_hours_start': '05:30', 'operating_hours_end': '22:30', 'is_active': true},
      {'id': 11, 'venue_id': 3, 'sport_id': 3, 'name': 'Court 3', 'price_per_hour': 600.0, 'operating_hours_start': '05:30', 'operating_hours_end': '22:30', 'is_active': true},
      {'id': 12, 'venue_id': 3, 'sport_id': 3, 'name': 'Court 4', 'price_per_hour': 600.0, 'operating_hours_start': '05:30', 'operating_hours_end': '22:30', 'is_active': true},
      
      // Pro Basketball Arena Courts
      {'id': 13, 'venue_id': 4, 'sport_id': 4, 'name': 'Court A', 'price_per_hour': 500.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      {'id': 14, 'venue_id': 4, 'sport_id': 4, 'name': 'Court B', 'price_per_hour': 500.0, 'operating_hours_start': '06:00', 'operating_hours_end': '23:00', 'is_active': true},
      
      // Victory Cricket Ground Courts
      {'id': 15, 'venue_id': 5, 'sport_id': 5, 'name': 'Main Ground', 'price_per_hour': 2000.0, 'operating_hours_start': '06:00', 'operating_hours_end': '21:00', 'is_active': true},
      {'id': 16, 'venue_id': 5, 'sport_id': 5, 'name': 'Practice Net 1', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '21:00', 'is_active': true},
      {'id': 17, 'venue_id': 5, 'sport_id': 5, 'name': 'Practice Net 2', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '21:00', 'is_active': true},
      {'id': 18, 'venue_id': 5, 'sport_id': 5, 'name': 'Practice Net 3', 'price_per_hour': 800.0, 'operating_hours_start': '06:00', 'operating_hours_end': '21:00', 'is_active': true},
    ];

    for (var court in courts) {
      await _firestore.collection('courts').doc('court_${court['id']}').set(court);
    }
    print('✅ Courts collection created with ${courts.length} courts');
  }

  /// Create Time Slots Collection
  static Future<void> _createTimeSlotsCollection() async {
    print('⏰ Creating time_slots collection...');
    
    final timeSlots = <Map<String, dynamic>>[];
    final DateTime today = DateTime.now();
    
    // Generate time slots for next 30 days for each court
    for (int courtId = 1; courtId <= 18; courtId++) {
      for (int dayOffset = 0; dayOffset < 30; dayOffset++) {
        final DateTime date = today.add(Duration(days: dayOffset));
        
        // Generate slots from 6 AM to 11 PM (17 hours)
        for (int hour = 6; hour <= 22; hour++) {
          final slotId = timeSlots.length + 1;
          final isAvailable = DateTime.now().isBefore(date.add(Duration(hours: hour)));
          
          timeSlots.add({
            'id': slotId,
            'court_id': courtId,
            'date': '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
            'start_time': '${hour.toString().padLeft(2, '0')}:00',
            'end_time': '${(hour + 1).toString().padLeft(2, '0')}:00',
            'is_available': isAvailable,
            'is_blocked': false,
          });
        }
      }
    }

    // Add time slots in batches to avoid timeout
    const batchSize = 500;
    for (int i = 0; i < timeSlots.length; i += batchSize) {
      final batch = _firestore.batch();
      final end = (i + batchSize < timeSlots.length) ? i + batchSize : timeSlots.length;
      
      for (int j = i; j < end; j++) {
        final docRef = _firestore.collection('time_slots').doc('slot_${timeSlots[j]['id']}');
        batch.set(docRef, timeSlots[j]);
      }
      
      await batch.commit();
      print('📅 Created time slots batch ${i ~/ batchSize + 1}/${(timeSlots.length / batchSize).ceil()}');
    }
    
    print('✅ Time slots collection created with ${timeSlots.length} slots');
  }

  /// Create Bookings Collection
  static Future<void> _createBookingsCollection() async {
    print('📅 Creating bookings collection...');
    
    final bookings = [
      {
        'id': 1,
        'user_id': 1,
        'court_id': 1,
        'date': '2025-08-15',
        'start_time': '18:00',
        'end_time': '19:00',
        'total_price': 800.0,
        'status': 'confirmed',
        'created_at': FieldValue.serverTimestamp(),
      },
      {
        'id': 2,
        'user_id': 4,
        'court_id': 7,
        'date': '2025-08-16',
        'start_time': '19:00',
        'end_time': '20:00',
        'total_price': 1200.0,
        'status': 'confirmed',
        'created_at': FieldValue.serverTimestamp(),
      },
      {
        'id': 3,
        'user_id': 1,
        'court_id': 9,
        'date': '2025-08-17',
        'start_time': '07:00',
        'end_time': '08:00',
        'total_price': 600.0,
        'status': 'pending',
        'created_at': FieldValue.serverTimestamp(),
      },
      {
        'id': 4,
        'user_id': 4,
        'court_id': 13,
        'date': '2025-08-18',
        'start_time': '20:00',
        'end_time': '21:00',
        'total_price': 500.0,
        'status': 'confirmed',
        'created_at': FieldValue.serverTimestamp(),
      },
      {
        'id': 5,
        'user_id': 1,
        'court_id': 15,
        'date': '2025-08-20',
        'start_time': '16:00',
        'end_time': '18:00',
        'total_price': 4000.0,
        'status': 'confirmed',
        'created_at': FieldValue.serverTimestamp(),
      },
    ];

    for (var booking in bookings) {
      await _firestore.collection('bookings').doc('booking_${booking['id']}').set(booking);
    }
    print('✅ Bookings collection created with ${bookings.length} bookings');
  }

  /// Clear all collections (use with caution)
  static Future<void> clearAllData() async {
    print('🗑️ Clearing all Firestore data...');
    
    final collections = [
      'sports', 'users', 'venues', 'venue_owners', 'venue_photos', 
      'venue_sports', 'courts', 'time_slots', 'bookings'
    ];
    
    for (String collection in collections) {
      final snapshot = await _firestore.collection(collection).get();
      for (var doc in snapshot.docs) {
        await doc.reference.delete();
      }
      print('🗑️ Cleared $collection collection');
    }
    
    print('✅ All data cleared successfully');
  }

  /// Get collection counts for verification
  static Future<void> printCollectionCounts() async {
    print('📊 Collection Counts:');
    
    final collections = [
      'sports', 'users', 'venues', 'venue_owners', 'venue_photos', 
      'venue_sports', 'courts', 'time_slots', 'bookings'
    ];
    
    for (String collection in collections) {
      final snapshot = await _firestore.collection(collection).get();
      print('📋 $collection: ${snapshot.docs.length} documents');
    }
  }
}
