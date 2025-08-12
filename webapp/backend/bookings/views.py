from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['GET'])
def booking_list(request):
    """
    Simple endpoint to test the bookings API
    """
    return JsonResponse({
        'message': 'Bookings API is working!',
        'bookings': []
    })
