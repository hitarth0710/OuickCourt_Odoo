import 'package:cloud_firestore/cloud_firestore.dart';

/// Simple Database Setup Script
/// Run this once to create basic data for testing
class DatabaseSetupScript {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Create minimal test data
  static Future<void> createBasicData() async {
    try {
      print('🚀 Creating basic test data...');
      
      // Create some sports
      await _createBasicSports();
      await _createBasicVenues();
      
      print('✅ Basic data created successfully!');
    } catch (e) {
      print('❌ Error creating basic data: $e');
      throw e;
    }
  }

  static Future<void> _createBasicSports() async {
    print('📋 Creating basic sports...');
    
    final sports = [
      {'name': 'Badminton', 'description': 'Indoor racquet sport'},
      {'name': 'Football', 'description': 'Outdoor team sport'},
      {'name': 'Tennis', 'description': 'Racquet sport with net'},
      {'name': 'Basketball', 'description': 'Indoor/outdoor hoop sport'},
    ];

    for (int i = 0; i < sports.length; i++) {
      await _firestore.collection('sports').doc('sport_${i + 1}').set({
        ...sports[i],
        'created_at': FieldValue.serverTimestamp(),
      });
    }
    print('✅ Created ${sports.length} sports');
  }

  static Future<void> _createBasicVenues() async {
    print('🏟️ Creating basic venues...');
    
    final venues = [
      {
        'name': 'Elite Badminton Center',
        'description': 'Premium badminton facility with multiple courts.',
        'address': 'MG Road, Bangalore, Karnataka 560001',
        'short_location': 'MG Road, Bangalore',
        'rating': 4.8,
        'starting_price_per_hour': 800.0,
        'is_approved': true,
        'is_active': true,
        'contact_phone': '+91 9876543220',
        'contact_email': 'info@elitebadminton.com',
        'operating_hours': '6:00 AM - 11:00 PM',
        'amenities': ['AC', 'Parking', 'Equipment Rental', 'Changing Room'],
        'photos': [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        ],
        'supported_sports': ['Badminton'],
      },
      {
        'name': 'Champions Football Turf',
        'description': 'Full-size football turf with professional lighting.',
        'address': 'Koramangala, Bangalore, Karnataka 560034',
        'short_location': 'Koramangala, Bangalore',
        'rating': 4.6,
        'starting_price_per_hour': 1200.0,
        'is_approved': true,
        'is_active': true,
        'contact_phone': '+91 9876543221',
        'contact_email': 'info@championsfootball.com',
        'operating_hours': '6:00 AM - 12:00 AM',
        'amenities': ['Floodlights', 'Changing Room', 'Parking', 'Cafeteria'],
        'photos': [
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
          'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400',
        ],
        'supported_sports': ['Football'],
      },
      {
        'name': 'Ace Tennis Academy',
        'description': 'Professional tennis courts with coaching available.',
        'address': 'Indiranagar, Bangalore, Karnataka 560038',
        'short_location': 'Indiranagar, Bangalore',
        'rating': 4.7,
        'starting_price_per_hour': 600.0,
        'is_approved': true,
        'is_active': true,
        'contact_phone': '+91 9876543222',
        'contact_email': 'info@acetennis.com',
        'operating_hours': '6:00 AM - 10:00 PM',
        'amenities': ['Coach Available', 'Equipment Rental', 'Parking', 'Pro Shop'],
        'photos': [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
          'https://images.unsplash.com/photo-1544737151350-6bd967556742?w=400',
        ],
        'supported_sports': ['Tennis'],
      },
      {
        'name': 'Urban Basketball Courts',
        'description': 'Modern indoor basketball courts with air conditioning.',
        'address': 'HSR Layout, Bangalore, Karnataka 560102',
        'short_location': 'HSR Layout, Bangalore',
        'rating': 4.5,
        'starting_price_per_hour': 500.0,
        'is_approved': true,
        'is_active': true,
        'contact_phone': '+91 9876543223',
        'contact_email': 'info@urbanbasketball.com',
        'operating_hours': '6:00 AM - 11:00 PM',
        'amenities': ['AC', 'Equipment Available', 'Parking', 'Water Facility'],
        'photos': [
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        ],
        'supported_sports': ['Basketball'],
      },
    ];

    for (int i = 0; i < venues.length; i++) {
      await _firestore.collection('venues').doc('venue_${i + 1}').set({
        ...venues[i],
        'created_at': FieldValue.serverTimestamp(),
      });
    }
    print('✅ Created ${venues.length} venues');
  }
}
