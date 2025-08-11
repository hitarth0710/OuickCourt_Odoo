import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'auth_service.dart';
import 'booking_page.dart';

class VenuesPage extends StatefulWidget {
  final AuthService authService;
  final String cityName;

  const VenuesPage({
    super.key, 
    required this.authService,
    this.cityName = 'Bangalore',
  });

  @override
  State<VenuesPage> createState() => _VenuesPageState();
}

class _VenuesPageState extends State<VenuesPage> with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  
  String _selectedSport = 'All';
  String _sortBy = 'name'; // name, price, rating
  String _sortOrder = 'asc'; // asc, desc
  double _minPrice = 0;
  double _maxPrice = 5000;
  double _minRating = 0;
  List<Map<String, dynamic>> _filteredVenues = [];
  List<Map<String, dynamic>> _allVenues = [];

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));
    
    _initializeVenues();
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _initializeVenues() {
    // Extended sample data for venues
    _allVenues = [
      {
        'name': 'Elite Badminton Center',
        'location': 'MG Road, ${widget.cityName}',
        'price': '₹800/hour',
        'sport': 'Badminton',
        'rating': 4.8,
        'imageUrl': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop',
        'facilities': ['AC', 'Parking', 'Equipment', 'Changing Room'],
        'description': 'Premium badminton facility with 6 courts and professional coaching available.',
      },
      {
        'name': 'Champions Football Turf',
        'location': 'Koramangala, ${widget.cityName}',
        'price': '₹1200/hour',
        'sport': 'Football',
        'rating': 4.6,
        'imageUrl': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
        'facilities': ['Floodlights', 'Changing Room', 'Water', 'First Aid'],
        'description': 'Full-size football turf with artificial grass and professional lighting.',
      },
      {
        'name': 'Ace Tennis Academy',
        'location': 'Indiranagar, ${widget.cityName}',
        'price': '₹600/hour',
        'sport': 'Tennis',
        'rating': 4.7,
        'imageUrl': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=250&fit=crop',
        'facilities': ['Coach Available', 'Equipment', 'Parking', 'Cafeteria'],
        'description': 'Professional tennis courts with experienced coaches and equipment rental.',
      },
      {
        'name': 'Pro Basketball Arena',
        'location': 'HSR Layout, ${widget.cityName}',
        'price': '₹500/hour',
        'sport': 'Basketball',
        'rating': 4.5,
        'imageUrl': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
        'facilities': ['Indoor', 'Sound System', 'Scoreboard', 'Locker Room'],
        'description': 'Indoor basketball court with professional scoreboard and sound system.',
      },
      {
        'name': 'Victory Cricket Ground',
        'location': 'Electronic City, ${widget.cityName}',
        'price': '₹2000/hour',
        'sport': 'Cricket',
        'rating': 4.9,
        'imageUrl': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop',
        'facilities': ['Full Ground', 'Pavilion', 'Equipment', 'Parking'],
        'description': 'Full cricket ground with pavilion and all necessary equipment.',
      },
      {
        'name': 'Premier Badminton Club',
        'location': 'Whitefield, ${widget.cityName}',
        'price': '₹750/hour',
        'sport': 'Badminton',
        'rating': 4.4,
        'imageUrl': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop',
        'facilities': ['AC', 'Equipment', 'Coaching', 'Cafeteria'],
        'description': 'Modern badminton club with 8 courts and professional coaching.',
      },
      {
        'name': 'City Football Complex',
        'location': 'Marathahalli, ${widget.cityName}',
        'price': '₹1000/hour',
        'sport': 'Football',
        'rating': 4.3,
        'imageUrl': 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
        'facilities': ['Multiple Turfs', 'Floodlights', 'Parking', 'Refreshments'],
        'description': '3 football turfs of different sizes for 5v5, 7v7, and 11v11 matches.',
      },
      {
        'name': 'Grand Tennis Club',
        'location': 'Jayanagar, ${widget.cityName}',
        'price': '₹900/hour',
        'sport': 'Tennis',
        'rating': 4.8,
        'imageUrl': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=250&fit=crop',
        'facilities': ['Clay Courts', 'Hard Courts', 'Pro Shop', 'Restaurant'],
        'description': 'Premium tennis club with both clay and hard courts available.',
      },
      {
        'name': 'Urban Basketball Court',
        'location': 'BTM Layout, ${widget.cityName}',
        'price': '₹400/hour',
        'sport': 'Basketball',
        'rating': 4.2,
        'imageUrl': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
        'facilities': ['Outdoor', 'Floodlights', 'Parking', 'Water'],
        'description': 'Outdoor basketball court with quality flooring and lighting.',
      },
      {
        'name': 'Royal Cricket Academy',
        'location': 'Hebbal, ${widget.cityName}',
        'price': '₹1800/hour',
        'sport': 'Cricket',
        'rating': 4.6,
        'imageUrl': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop',
        'facilities': ['Nets', 'Coaching', 'Equipment', 'Video Analysis'],
        'description': 'Cricket academy with nets, coaching, and video analysis facilities.',
      },
    ];
    
    _filteredVenues = List.from(_allVenues);
  }

  void _filterVenues() {
    setState(() {
      _filteredVenues = _allVenues.where((venue) {
        // Search filter
        bool matchesSearch = venue['name']
            .toString()
            .toLowerCase()
            .contains(_searchController.text.toLowerCase()) ||
            venue['location']
            .toString()
            .toLowerCase()
            .contains(_searchController.text.toLowerCase());
        
        // Sport filter
        bool matchesSport = _selectedSport == 'All' || venue['sport'] == _selectedSport;
        
        // Price filter
        double venuePrice = double.tryParse(venue['price'].toString().replaceAll(RegExp(r'[₹/hour,]'), '')) ?? 0;
        bool matchesPrice = venuePrice >= _minPrice && venuePrice <= _maxPrice;
        
        // Rating filter
        bool matchesRating = venue['rating'] >= _minRating;
        
        return matchesSearch && matchesSport && matchesPrice && matchesRating;
      }).toList();
      
      // Sort venues
      _filteredVenues.sort((a, b) {
        int result = 0;
        switch (_sortBy) {
          case 'name':
            result = a['name'].toString().compareTo(b['name'].toString());
            break;
          case 'price':
            double priceA = double.tryParse(a['price'].toString().replaceAll(RegExp(r'[₹/hour,]'), '')) ?? 0;
            double priceB = double.tryParse(b['price'].toString().replaceAll(RegExp(r'[₹/hour,]'), '')) ?? 0;
            result = priceA.compareTo(priceB);
            break;
          case 'rating':
            result = a['rating'].compareTo(b['rating']);
            break;
        }
        return _sortOrder == 'asc' ? result : -result;
      });
    });
  }

  bool _hasActiveFilters() {
    return _selectedSport != 'All' ||
           _sortBy != 'name' ||
           _sortOrder != 'asc' ||
           _minPrice != 0 ||
           _maxPrice != 5000 ||
           _minRating != 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1B2432),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Venues in ${widget.cityName}',
                            style: GoogleFonts.poppins(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            '${_filteredVenues.length} venues found',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Search and Filter Section
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      // Search Bar
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: (value) => _filterVenues(),
                          style: GoogleFonts.inter(color: const Color(0xFF1B2432)),
                          decoration: InputDecoration(
                            hintText: 'Search venues...',
                            hintStyle: GoogleFonts.inter(color: Colors.grey[500]),
                            prefixIcon: const Icon(Icons.search, color: Color(0xFF15823E)),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, color: Colors.grey),
                                    onPressed: () {
                                      _searchController.clear();
                                      _filterVenues();
                                    },
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: Color(0xFF15823E), width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                        ),
                      ),
                      
                      const SizedBox(width: 12),
                      
                      // Filter Button
                      Container(
                        decoration: BoxDecoration(
                          color: _hasActiveFilters() ? const Color(0xFF15823E) : Colors.grey[300],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Stack(
                          children: [
                            IconButton(
                              onPressed: _showFilterDialog,
                              icon: Icon(
                                Icons.tune,
                                color: _hasActiveFilters() ? Colors.white : Colors.grey[600],
                                size: 24,
                              ),
                              tooltip: 'Filters',
                            ),
                            if (_hasActiveFilters())
                              Positioned(
                                top: 8,
                                right: 8,
                                child: Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Colors.orange,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Venues List
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(25),
                      topRight: Radius.circular(25),
                    ),
                  ),
                  child: _filteredVenues.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: _filteredVenues.length,
                          itemBuilder: (context, index) {
                            return _buildVenueCard(_filteredVenues[index], index);
                          },
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No venues found',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filters',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVenueCard(Map<String, dynamic> venue, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Venue Image
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
            child: Stack(
              children: [
                Container(
                  height: 180,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: NetworkImage(venue['imageUrl']),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Container(
                  height: 180,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.3),
                      ],
                    ),
                  ),
                ),
                // Sport and Rating badges
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF15823E),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getSportIcon(venue['sport']),
                          color: Colors.white,
                          size: 12,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          venue['sport'],
                          style: GoogleFonts.inter(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.star,
                          color: Colors.amber,
                          size: 12,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          venue['rating'].toString(),
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 10,
                            color: const Color(0xFF1B2432),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Venue Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name and Price
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            venue['name'],
                            style: GoogleFonts.poppins(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1B2432),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(
                                Icons.location_on,
                                color: Colors.grey[500],
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  venue['location'],
                                  style: GoogleFonts.inter(
                                    color: Colors.grey[600],
                                    fontSize: 12,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF15823E).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        venue['price'],
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF15823E),
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Description
                Text(
                  venue['description'],
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: Colors.grey[600],
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                const SizedBox(height: 12),
                
                // Facilities
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: (venue['facilities'] as List<String>).take(4).map((facility) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        facility,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: Colors.grey[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                
                const SizedBox(height: 16),
                
                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          _showVenueDetails(venue);
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF15823E)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        child: Text(
                          'View Details',
                          style: GoogleFonts.inter(
                            color: const Color(0xFF15823E),
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BookingPage(venue: venue),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF15823E),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        child: Text(
                          'Book Now',
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showVenueDetails(Map<String, dynamic> venue) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
        ),
        child: Column(
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Venue Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        venue['imageUrl'],
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Venue Info
                    Text(
                      venue['name'],
                      style: GoogleFonts.poppins(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    
                    const SizedBox(height: 8),
                    
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          color: Colors.grey[500],
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            venue['location'],
                            style: GoogleFonts.inter(
                              color: Colors.grey[600],
                              fontSize: 14,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF15823E).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 14,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                venue['rating'].toString(),
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF1B2432),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    Text(
                      'Description',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    
                    const SizedBox(height: 8),
                    
                    Text(
                      venue['description'],
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.grey[600],
                        height: 1.5,
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    Text(
                      'Facilities',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    
                    const SizedBox(height: 8),
                    
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: (venue['facilities'] as List<String>).map((facility) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF15823E).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            facility,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: const Color(0xFF15823E),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Price and Book Button
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Starting from',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              Text(
                                venue['price'],
                                style: GoogleFonts.poppins(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFF15823E),
                                ),
                              ),
                            ],
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BookingPage(venue: venue),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF15823E),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                            child: Text(
                              'Book Now',
                              style: GoogleFonts.inter(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: Text(
                'Filter Venues',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1B2432),
                ),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sport Filter
                    Text(
                      'Sport',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: ['All', 'Badminton', 'Football', 'Tennis', 'Basketball', 'Cricket'].map((sport) {
                        return FilterChip(
                          label: Text(
                            sport,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: sport == _selectedSport ? Colors.white : const Color(0xFF1B2432),
                            ),
                          ),
                          selected: sport == _selectedSport,
                          onSelected: (selected) {
                            setDialogState(() {
                              _selectedSport = sport;
                            });
                          },
                          backgroundColor: Colors.grey[100],
                          selectedColor: const Color(0xFF15823E),
                          checkmarkColor: Colors.white,
                          side: BorderSide.none,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        );
                      }).toList(),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Sort By
                    Text(
                      'Sort By',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _sortBy,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            items: [
                              DropdownMenuItem(value: 'name', child: Text('Name', style: GoogleFonts.inter(fontSize: 12))),
                              DropdownMenuItem(value: 'price', child: Text('Price', style: GoogleFonts.inter(fontSize: 12))),
                              DropdownMenuItem(value: 'rating', child: Text('Rating', style: GoogleFonts.inter(fontSize: 12))),
                            ],
                            onChanged: (value) {
                              setDialogState(() {
                                _sortBy = value!;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _sortOrder,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 3, vertical: 8),
                            ),
                            items: [
                              DropdownMenuItem(value: 'asc', child: Text('Low to High', style: GoogleFonts.inter(fontSize: 12))),
                              DropdownMenuItem(value: 'desc', child: Text('High to Low', style: GoogleFonts.inter(fontSize: 12))),
                            ],
                            onChanged: (value) {
                              setDialogState(() {
                                _sortOrder = value!;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Price Range
                    Text(
                      'Price Range (₹/hour)',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    const SizedBox(height: 8),
                    RangeSlider(
                      values: RangeValues(_minPrice, _maxPrice),
                      min: 0,
                      max: 5000,
                      divisions: 50,
                      activeColor: const Color(0xFF15823E),
                      labels: RangeLabels(
                        '₹${_minPrice.round()}',
                        '₹${_maxPrice.round()}',
                      ),
                      onChanged: (RangeValues values) {
                        setDialogState(() {
                          _minPrice = values.start;
                          _maxPrice = values.end;
                        });
                      },
                    ),
                    Text(
                      '₹${_minPrice.round()} - ₹${_maxPrice.round()}',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Minimum Rating
                    Text(
                      'Minimum Rating',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Slider(
                      value: _minRating,
                      min: 0,
                      max: 5,
                      divisions: 10,
                      activeColor: const Color(0xFF15823E),
                      label: _minRating.toStringAsFixed(1),
                      onChanged: (value) {
                        setDialogState(() {
                          _minRating = value;
                        });
                      },
                    ),
                    Text(
                      '${_minRating.toStringAsFixed(1)} stars and above',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    // Reset filters
                    setDialogState(() {
                      _selectedSport = 'All';
                      _sortBy = 'name';
                      _sortOrder = 'asc';
                      _minPrice = 0;
                      _maxPrice = 5000;
                      _minRating = 0;
                    });
                  },
                  child: Text(
                    'Reset',
                    style: GoogleFonts.inter(
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _filterVenues();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF15823E),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    'Apply Filters',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  IconData _getSportIcon(String sport) {
    switch (sport.toLowerCase()) {
      case 'badminton':
        return Icons.sports_tennis;
      case 'football':
        return Icons.sports_soccer;
      case 'tennis':
        return Icons.sports_tennis;
      case 'basketball':
        return Icons.sports_basketball;
      case 'cricket':
        return Icons.sports_cricket;
      default:
        return Icons.sports;
    }
  }
}
