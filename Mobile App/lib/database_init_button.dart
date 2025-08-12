import 'package:flutter/material.dart';
import 'firestore_setup_service.dart';

/// Simple Database Initialization Widget
/// Add this to your app temporarily to initialize the Firestore database
/// Can be added as a button in any screen or as a development-only screen
class DatabaseInitButton extends StatefulWidget {
  const DatabaseInitButton({Key? key}) : super(key: key);

  @override
  State<DatabaseInitButton> createState() => _DatabaseInitButtonState();
}

class _DatabaseInitButtonState extends State<DatabaseInitButton> {
  bool _isInitializing = false;

  Future<void> _initializeDatabase() async {
    setState(() {
      _isInitializing = true;
    });

    try {
      await FirestoreSetupService.initializeDatabase();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Database initialized successfully! ✅'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error initializing database: $e ❌'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }

    setState(() {
      _isInitializing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: ElevatedButton.icon(
        onPressed: _isInitializing ? null : _initializeDatabase,
        icon: _isInitializing 
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.storage),
        label: Text(_isInitializing ? 'Initializing Database...' : 'Initialize Firestore Database'),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }
}

/// Quick setup function that can be called directly
Future<void> initializeFirestoreDatabase() async {
  try {
    print('🚀 Starting Firestore database initialization...');
    await FirestoreSetupService.initializeDatabase();
    print('✅ Database initialization completed successfully!');
  } catch (e) {
    print('❌ Error initializing database: $e');
    rethrow;
  }
}
