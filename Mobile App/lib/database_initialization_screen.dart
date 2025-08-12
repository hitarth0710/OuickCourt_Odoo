import 'package:flutter/material.dart';
import 'firestore_setup_service.dart';

/// Database Initialization Screen
/// Use this screen to initialize your Firestore database with all collections and dummy data
class DatabaseInitializationScreen extends StatefulWidget {
  const DatabaseInitializationScreen({Key? key}) : super(key: key);

  @override
  State<DatabaseInitializationScreen> createState() => _DatabaseInitializationScreenState();
}

class _DatabaseInitializationScreenState extends State<DatabaseInitializationScreen> {
  bool _isInitializing = false;
  bool _isClearing = false;
  String _status = '';

  Future<void> _initializeDatabase() async {
    setState(() {
      _isInitializing = true;
      _status = 'Initializing database...';
    });

    try {
      await FirestoreSetupService.initializeDatabase();
      setState(() {
        _status = 'Database initialized successfully! ✅';
      });
    } catch (e) {
      setState(() {
        _status = 'Error initializing database: $e ❌';
      });
    }

    setState(() {
      _isInitializing = false;
    });
  }

  Future<void> _clearDatabase() async {
    setState(() {
      _isClearing = true;
      _status = 'Clearing database...';
    });

    try {
      await FirestoreSetupService.clearAllData();
      setState(() {
        _status = 'Database cleared successfully! 🗑️';
      });
    } catch (e) {
      setState(() {
        _status = 'Error clearing database: $e ❌';
      });
    }

    setState(() {
      _isClearing = false;
    });
  }

  Future<void> _showCollectionCounts() async {
    await FirestoreSetupService.printCollectionCounts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Database Setup'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(
              Icons.storage,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 20),
            const Text(
              'Firestore Database Setup',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            const Text(
              'Initialize your Firestore database with all collections and dummy data for the sports booking app.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            
            // Initialize Database Button
            ElevatedButton.icon(
              onPressed: _isInitializing || _isClearing ? null : _initializeDatabase,
              icon: _isInitializing 
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.rocket_launch),
              label: Text(_isInitializing ? 'Initializing...' : 'Initialize Database'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            
            const SizedBox(height: 15),
            
            // Clear Database Button
            ElevatedButton.icon(
              onPressed: _isInitializing || _isClearing ? null : () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Clear Database'),
                    content: const Text('Are you sure you want to clear all data? This action cannot be undone.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: TextButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Clear'),
                      ),
                    ],
                  ),
                );
                
                if (confirm == true) {
                  _clearDatabase();
                }
              },
              icon: _isClearing 
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.delete_forever),
              label: Text(_isClearing ? 'Clearing...' : 'Clear Database'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            
            const SizedBox(height: 15),
            
            // Show Collection Counts Button
            OutlinedButton.icon(
              onPressed: _showCollectionCounts,
              icon: const Icon(Icons.analytics),
              label: const Text('Show Collection Counts'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            
            const SizedBox(height: 30),
            
            // Status Text
            if (_status.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: _status.contains('Error') ? Colors.red.shade50 : Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _status.contains('Error') ? Colors.red : Colors.green,
                    width: 1,
                  ),
                ),
                child: Text(
                  _status,
                  style: TextStyle(
                    color: _status.contains('Error') ? Colors.red : Colors.green,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            
            const SizedBox(height: 20),
            
            // Database Structure Info
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: const SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Database Structure:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 10),
                      Text('📋 Sports (8 sports)'),
                      Text('👥 Users (5 users including venue owners)'),
                      Text('🏟️ Venues (8 venues across Bangalore)'),
                      Text('👤 Venue Owners (ownership relationships)'),
                      Text('📷 Venue Photos (2 photos per venue)'),
                      Text('🎯 Venue Sports (sport-venue mapping)'),
                      Text('🏟️ Courts (18+ courts across venues)'),
                      Text('⏰ Time Slots (30 days × 17 hours × 18 courts)'),
                      Text('📅 Bookings (5 sample bookings)'),
                      SizedBox(height: 15),
                      Text(
                        'Features:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 10),
                      Text('✅ Realistic dummy data'),
                      Text('✅ Proper relationships between entities'),
                      Text('✅ Time slot management'),
                      Text('✅ Booking system with availability'),
                      Text('✅ Venue search and filtering'),
                      Text('✅ Multi-sport support'),
                      Text('✅ Photo galleries for venues'),
                      Text('✅ User management system'),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
