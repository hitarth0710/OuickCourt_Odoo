import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BookingPage extends StatefulWidget {
  final Map<String, dynamic> venue;

  const BookingPage({super.key, required this.venue});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  int _currentStep = 0;
  
  // Booking data
  String _selectedSport = '';
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 18, minute: 0);
  int _duration = 1; // in hours
  String _selectedCourt = '';
  
  // Available data
  List<String> _availableSports = [];
  List<String> _availableCourts = [];
  List<TimeOfDay> _availableTimeSlots = [];

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  void _initializeData() {
    // Initialize sports based on venue
    String venueSport = widget.venue['sport'];
    _availableSports = [venueSport];
    
    if (venueSport == 'Football') {
      _availableSports.addAll(['5v5 Football', '7v7 Football', '11v11 Football']);
    } else if (venueSport == 'Tennis') {
      _availableSports.addAll(['Singles Tennis', 'Doubles Tennis']);
    } else if (venueSport == 'Badminton') {
      _availableSports.addAll(['Singles Badminton', 'Doubles Badminton']);
    }
    
    _selectedSport = _availableSports.first;
    
    // Initialize courts
    _availableCourts = _generateCourts(venueSport);
    _selectedCourt = _availableCourts.first;
    
    // Initialize time slots
    _availableTimeSlots = _generateTimeSlots();
  }

  List<String> _generateCourts(String sport) {
    switch (sport.toLowerCase()) {
      case 'badminton':
        return ['Court A', 'Court B', 'Court C', 'Court D', 'Court E', 'Court F'];
      case 'tennis':
        return ['Court 1', 'Court 2', 'Court 3', 'Court 4'];
      case 'football':
        return ['Turf 1', 'Turf 2', 'Main Ground'];
      case 'basketball':
        return ['Court A', 'Court B'];
      case 'cricket':
        return ['Main Ground', 'Practice Net 1', 'Practice Net 2', 'Practice Net 3'];
      default:
        return ['Court 1', 'Court 2', 'Court 3'];
    }
  }

  List<TimeOfDay> _generateTimeSlots() {
    List<TimeOfDay> slots = [];
    for (int hour = 6; hour <= 22; hour++) {
      slots.add(TimeOfDay(hour: hour, minute: 0));
      if (hour < 22) {
        slots.add(TimeOfDay(hour: hour, minute: 30));
      }
    }
    return slots;
  }

  double _calculateTotalPrice() {
    double basePrice = double.tryParse(
      widget.venue['price'].toString().replaceAll(RegExp(r'[₹/hour,]'), '')
    ) ?? 0;
    return basePrice * _duration;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1B2432),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1B2432),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Book ${widget.venue['name']}',
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          // Progress Indicator
          Container(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: List.generate(6, (index) {
                return Expanded(
                  child: Container(
                    margin: EdgeInsets.only(right: index < 5 ? 8 : 0),
                    height: 4,
                    decoration: BoxDecoration(
                      color: index <= _currentStep 
                          ? const Color(0xFF15823E) 
                          : Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),

          // Content
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(25),
                  topRight: Radius.circular(25),
                ),
              ),
              child: _buildStepContent(),
            ),
          ),

          // Bottom Navigation
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() {
                          _currentStep--;
                        });
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF15823E)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(
                        'Back',
                        style: GoogleFonts.inter(
                          color: const Color(0xFF15823E),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 16),
                Expanded(
                  flex: _currentStep == 0 ? 1 : 2,
                  child: ElevatedButton(
                    onPressed: _currentStep < 5 ? _nextStep : _completeBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF15823E),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(
                      _currentStep < 4 
                          ? 'Continue' 
                          : _currentStep == 4 
                              ? 'Proceed to Payment' 
                              : 'Back to Home',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildSportSelection();
      case 1:
        return _buildDateSelection();
      case 2:
        return _buildTimeSelection();
      case 3:
        return _buildCourtSelection();
      case 4:
        return _buildBookingSummary();
      case 5:
        return _buildConfirmation();
      default:
        return Container();
    }
  }

  Widget _buildSportSelection() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Sport',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose the sport you want to play',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.builder(
              itemCount: _availableSports.length,
              itemBuilder: (context, index) {
                String sport = _availableSports[index];
                bool isSelected = sport == _selectedSport;
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF15823E).withOpacity(0.1) : Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF15823E) : Colors.grey[300]!,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF15823E) : Colors.grey[300],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _getSportIcon(sport),
                        color: isSelected ? Colors.white : Colors.grey[600],
                        size: 24,
                      ),
                    ),
                    title: Text(
                      sport,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? const Color(0xFF15823E) : const Color(0xFF1B2432),
                      ),
                    ),
                    subtitle: Text(
                      _getSportDescription(sport),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                    trailing: Icon(
                      isSelected ? Icons.check_circle : Icons.circle_outlined,
                      color: isSelected ? const Color(0xFF15823E) : Colors.grey[400],
                    ),
                    onTap: () {
                      setState(() {
                        _selectedSport = sport;
                      });
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelection() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Date',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose your preferred date',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Theme(
                data: ThemeData.light().copyWith(
                  colorScheme: const ColorScheme.light(
                    primary: Colors.white, // Selected date background
                    onPrimary: Color(0xFF15823E), // Selected date text (white on green)
                    surface: Colors.white, // Calendar background
                    onSurface: Colors.black, // Unselected date text (black)
                    secondary: Color(0xFF15823E), // Today indicator
                    onSecondary: Colors.white, // Today text
                    tertiary: Color(0xFF15823E), // Additional green accent
                    onTertiary: Colors.white,
                  ),
                  textTheme: const TextTheme(
                    bodyLarge: TextStyle(color: Colors.black), // Unselected dates
                    bodyMedium: TextStyle(color: Colors.black), // Unselected dates
                    labelLarge: TextStyle(color: Colors.white), // Selected date text
                    titleMedium: TextStyle(color: Colors.black), // Month/year text
                    titleSmall: TextStyle(color: Colors.black), // Day labels
                  ),
                ),
                child: CalendarDatePicker(
                  key: ValueKey(_selectedDate), // Force rebuild when date changes
                  initialDate: _selectedDate,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                  currentDate: _selectedDate, // Explicitly set current selected date
                  onDateChanged: (date) {
                    setState(() {
                      _selectedDate = date;
                    });
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF15823E).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.calendar_today,
                  color: Color(0xFF15823E),
                  size: 20,
                ),
                const SizedBox(width: 12),
                Text(
                  'Selected: ${_formatDate(_selectedDate)}',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF15823E),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeSelection() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Time & Duration',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose start time and duration',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 32),

          // Duration Selection
          Text(
            'Duration',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [1, 2, 3, 4].map((hours) {
              bool isSelected = hours == _duration;
              return Expanded(
                child: Container(
                  margin: EdgeInsets.only(right: hours < 4 ? 8 : 0),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _duration = hours;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF15823E) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF15823E) : Colors.grey[300]!,
                        ),
                      ),
                      child: Text(
                        '$hours ${hours == 1 ? 'Hour' : 'Hours'}',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? Colors.white : const Color(0xFF1B2432),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 24),

          // Start Time Selection
          Text(
            'Start Time',
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 2.5,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _availableTimeSlots.length,
              itemBuilder: (context, index) {
                TimeOfDay timeSlot = _availableTimeSlots[index];
                bool isSelected = timeSlot.hour == _startTime.hour && timeSlot.minute == _startTime.minute;
                bool isAvailable = _isTimeSlotAvailable(timeSlot);
                
                return InkWell(
                  onTap: isAvailable ? () {
                    setState(() {
                      _startTime = timeSlot;
                    });
                  } : null,
                  child: Container(
                    decoration: BoxDecoration(
                      color: !isAvailable 
                          ? Colors.grey[200]
                          : isSelected 
                              ? const Color(0xFF15823E) 
                              : Colors.grey[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: !isAvailable 
                            ? Colors.grey[300]!
                            : isSelected 
                                ? const Color(0xFF15823E) 
                                : Colors.grey[300]!,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        _formatTimeOfDay(timeSlot),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: !isAvailable 
                              ? Colors.grey[500]
                              : isSelected 
                                  ? Colors.white 
                                  : const Color(0xFF1B2432),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourtSelection() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Court',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Choose your preferred court',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.builder(
              itemCount: _availableCourts.length,
              itemBuilder: (context, index) {
                String court = _availableCourts[index];
                bool isSelected = court == _selectedCourt;
                bool isAvailable = _isCourtAvailable(court);
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: !isAvailable 
                        ? Colors.grey[100]
                        : isSelected 
                            ? const Color(0xFF15823E).withOpacity(0.1) 
                            : Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: !isAvailable 
                          ? Colors.grey[300]!
                          : isSelected 
                              ? const Color(0xFF15823E) 
                              : Colors.grey[300]!,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: !isAvailable 
                            ? Colors.grey[300]
                            : isSelected 
                                ? const Color(0xFF15823E) 
                                : Colors.grey[300],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.sports_tennis,
                        color: !isAvailable 
                            ? Colors.grey[500]
                            : isSelected 
                                ? Colors.white 
                                : Colors.grey[600],
                        size: 24,
                      ),
                    ),
                    title: Text(
                      court,
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: !isAvailable 
                            ? Colors.grey[500]
                            : isSelected 
                                ? const Color(0xFF15823E) 
                                : const Color(0xFF1B2432),
                      ),
                    ),
                    subtitle: Text(
                      isAvailable ? 'Available' : 'Booked',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: isAvailable ? Colors.green[600] : Colors.red[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    trailing: Icon(
                      !isAvailable 
                          ? Icons.block
                          : isSelected 
                              ? Icons.check_circle 
                              : Icons.circle_outlined,
                      color: !isAvailable 
                          ? Colors.red[400]
                          : isSelected 
                              ? const Color(0xFF15823E) 
                              : Colors.grey[400],
                    ),
                    onTap: isAvailable ? () {
                      setState(() {
                        _selectedCourt = court;
                      });
                    } : null,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingSummary() {
    double totalPrice = _calculateTotalPrice();
    
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Booking Summary',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Review your booking details',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 32),

          // Venue Info
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    widget.venue['imageUrl'],
                    width: 80,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 80,
                        height: 60,
                        decoration: BoxDecoration(
                          color: const Color(0xFF15823E).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.sports,
                          color: Color(0xFF15823E),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.venue['name'],
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1B2432),
                        ),
                      ),
                      Text(
                        widget.venue['location'],
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Booking Details
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: Column(
                      children: [
                        _buildSummaryRow('Sport', _selectedSport),
                        _buildSummaryRow('Date', _formatDate(_selectedDate)),
                        _buildSummaryRow('Time', '${_formatTimeOfDay(_startTime)} - ${_formatTimeOfDay(_getEndTime())}'),
                        _buildSummaryRow('Duration', '$_duration ${_duration == 1 ? 'Hour' : 'Hours'}'),
                        _buildSummaryRow('Court', _selectedCourt),
                        const Divider(),
                        _buildSummaryRow('Total Amount', '₹${totalPrice.toStringAsFixed(0)}', isTotal: true),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 16),

                  // Terms and Conditions
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Booking Terms',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.blue[700],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '• Cancellation allowed up to 2 hours before booking time\n• Full refund for cancellations before 24 hours\n• 50% refund for cancellations within 24 hours',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: Colors.blue[700],
                            height: 1.3,
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
    );
  }

  Widget _buildConfirmation() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF15823E).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle,
              size: 60,
              color: Color(0xFF15823E),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Booking Confirmed!',
            style: GoogleFonts.poppins(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF15823E),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Your booking has been successfully confirmed.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Booking ID: #QB${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1B2432),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: SingleChildScrollView(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Text(
                      'Booking Details',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B2432),
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildSummaryRow('Venue', widget.venue['name']),
                    _buildSummaryRow('Sport', _selectedSport),
                    _buildSummaryRow('Date & Time', '${_formatDate(_selectedDate)} \n  at  ${_formatTimeOfDay(_startTime)}'),
                    _buildSummaryRow('Court', _selectedCourt),
                    _buildSummaryRow('Amount Paid', '₹${_calculateTotalPrice().toStringAsFixed(0)}'),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
              color: isTotal ? const Color(0xFF1B2432) : Colors.grey[600],
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: isTotal ? const Color(0xFF15823E) : const Color(0xFF1B2432),
            ),
          ),
        ],
      ),
    );
  }

  void _nextStep() {
    if (_currentStep < 5) {
      setState(() {
        _currentStep++;
      });
    }
  }

  void _completeBooking() {
    if (_currentStep == 4) {
      // Simulate payment and booking completion
      setState(() {
        _currentStep = 5;
      });
    } else if (_currentStep == 5) {
      // Navigate back to home from confirmation page
      Navigator.popUntil(context, (route) => route.isFirst);
    }
  }

  bool _isTimeSlotAvailable(TimeOfDay timeSlot) {
    // Simulate some booked slots
    List<TimeOfDay> bookedSlots = [
      const TimeOfDay(hour: 18, minute: 30),
      const TimeOfDay(hour: 20, minute: 0),
    ];
    
    return !bookedSlots.any((slot) => 
      slot.hour == timeSlot.hour && slot.minute == timeSlot.minute
    );
  }

  bool _isCourtAvailable(String court) {
    // Simulate some courts being booked
    List<String> bookedCourts = ['Court B', 'Turf 2'];
    return !bookedCourts.contains(court);
  }

  TimeOfDay _getEndTime() {
    int totalMinutes = _startTime.hour * 60 + _startTime.minute + (_duration * 60);
    int endHour = (totalMinutes ~/ 60) % 24;
    int endMinute = totalMinutes % 60;
    return TimeOfDay(hour: endHour, minute: endMinute);
  }

  String _formatDate(DateTime date) {
    List<String> months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatTimeOfDay(TimeOfDay time) {
    String period = time.hour >= 12 ? 'PM' : 'AM';
    int hour = time.hour > 12 ? time.hour - 12 : time.hour;
    if (hour == 0) hour = 12;
    String minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute $period';
  }

  IconData _getSportIcon(String sport) {
    switch (sport.toLowerCase()) {
      case 'badminton':
      case 'singles badminton':
      case 'doubles badminton':
        return Icons.sports_tennis;
      case 'football':
      case '5v5 football':
      case '7v7 football':
      case '11v11 football':
        return Icons.sports_soccer;
      case 'tennis':
      case 'singles tennis':
      case 'doubles tennis':
        return Icons.sports_tennis;
      case 'basketball':
        return Icons.sports_basketball;
      case 'cricket':
        return Icons.sports_cricket;
      default:
        return Icons.sports;
    }
  }

  String _getSportDescription(String sport) {
    switch (sport.toLowerCase()) {
      case 'badminton':
        return 'Standard badminton court';
      case 'singles badminton':
        return 'Singles play format';
      case 'doubles badminton':
        return 'Doubles play format';
      case 'football':
        return 'Standard football turf';
      case '5v5 football':
        return 'Small sided game';
      case '7v7 football':
        return 'Medium sized game';
      case '11v11 football':
        return 'Full field game';
      case 'tennis':
        return 'Standard tennis court';
      case 'singles tennis':
        return 'Singles play format';
      case 'doubles tennis':
        return 'Doubles play format';
      case 'basketball':
        return 'Full court basketball';
      case 'cricket':
        return 'Cricket ground booking';
      default:
        return 'Sport facility booking';
    }
  }
}
