from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def court_list(request):
    """
    Simple endpoint to test the API
    """
    return JsonResponse({
        'message': 'QuickCourt API is working!',
        'courts': []
    })
