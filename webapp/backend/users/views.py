from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
import json
from .models import UserProfile, EmailOTP

@api_view(['GET'])
def user_profile(request):
    """
    Simple endpoint to test the users API
    """
    return JsonResponse({
        'message': 'Users API is working!',
        'user': None
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    Send OTP to email for verification
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        role = data.get('role', 'player')
        name = data.get('name', '')
        password = data.get('password', '')
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if admin credentials
        if email == 'krishdave1308@gmail.com' and password == 'QuickCourt_Odoo':
            # For admin, we don't need OTP verification
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': 'Admin',
                    'password': make_password(password)
                }
            )
            
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'admin', 'is_email_verified': True}
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Admin login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name,
                    'role': 'admin'
                },
                'skip_otp': True
            })

        # Delete any existing unused OTPs for this email
        EmailOTP.objects.filter(email=email, is_used=False).delete()
        
        # Create new OTP
        otp_instance = EmailOTP.objects.create(
            email=email,
            role=role,
            name=name,
            password=make_password(password) if password else None
        )
        
        # Send OTP email
        subject = 'QuickCourt - Email Verification Code'
        message = f'''
        Welcome to QuickCourt!
        
        Your email verification code is: {otp_instance.otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        QuickCourt Team
        '''
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'OTP sent successfully to your email'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP and complete registration/login
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp_code = data.get('otp')
        
        if not email or not otp_code:
            return JsonResponse({
                'success': False,
                'error': 'Email and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the OTP
        try:
            otp_instance = EmailOTP.objects.get(
                email=email,
                otp=otp_code,
                is_used=False
            )
        except EmailOTP.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Invalid OTP code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if OTP is expired
        if otp_instance.is_expired():
            return JsonResponse({
                'success': False,
                'error': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp_instance.is_used = True
        otp_instance.save()
        
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': otp_instance.name or 'User',
                'password': otp_instance.password or make_password('temp_password')
            }
        )
        
        # Create or update user profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': otp_instance.role,
                'is_email_verified': True
            }
        )
        
        if not created:
            profile.is_email_verified = True
            profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Email verified successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name,
                'role': profile.role
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP to email
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the latest OTP for this email
        try:
            latest_otp = EmailOTP.objects.filter(email=email).latest('created_at')
        except EmailOTP.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'No OTP request found for this email'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete existing unused OTPs
        EmailOTP.objects.filter(email=email, is_used=False).delete()
        
        # Create new OTP with same details
        new_otp = EmailOTP.objects.create(
            email=latest_otp.email,
            role=latest_otp.role,
            name=latest_otp.name,
            password=latest_otp.password
        )
        
        # Send new OTP email
        subject = 'QuickCourt - New Verification Code'
        message = f'''
        Your new email verification code is: {new_otp.otp}
        
        This code will expire in 10 minutes.
        
        Best regards,
        QuickCourt Team
        '''
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'New OTP sent successfully'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    """
    Get all users (admin only)
    """
    try:
        # Check if user is admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.select_related('userprofile').all()
        users_data = []
        
        for user in users:
            profile = getattr(user, 'userprofile', None)
            users_data.append({
                'id': user.id,
                'email': user.email,
                'name': user.first_name,
                'role': profile.role if profile else 'player',
                'is_approved': profile.is_approved if profile else True,
                'is_email_verified': profile.is_email_verified if profile else False,
                'created_at': user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
                'last_login': user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Never'
            })
        
        return JsonResponse({
            'success': True,
            'users': users_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """
    Approve or reject user (admin only)
    """
    try:
        # Check if user is admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = json.loads(request.body)
        approve = data.get('approve', True)
        
        target_user = User.objects.get(id=user_id)
        target_profile = UserProfile.objects.get(user=target_user)
        
        target_profile.is_approved = approve
        target_profile.save()
        
        return JsonResponse({
            'success': True,
            'message': f'User {"approved" if approve else "rejected"} successfully'
        })
        
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Delete user (admin only)
    """
    try:
        # Check if user is admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        target_user = User.objects.get(id=user_id)
        
        # Don't allow deleting admin users
        target_profile = UserProfile.objects.get(user=target_user)
        if target_profile.role == 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Cannot delete admin user'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        target_user.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_facilities(request):
    """
    Get facilities pending approval (admin only)
    """
    try:
        # Check if user is admin
        user_profile = UserProfile.objects.get(user=request.user)
        if user_profile.role != 'admin':
            return JsonResponse({
                'success': False,
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        from courts.models import Venue
        
        pending_venues = Venue.objects.filter(is_approved=False).select_related('facility_owner')
        venues_data = []
        
        for venue in pending_venues:
            venues_data.append({
                'id': venue.id,
                'venue_name': venue.venue_name,
                'facility_owner_name': venue.facility_owner_name,
                'phone_number': venue.phone_number,
                'address': venue.address,
                'created_at': venue.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'sports_available': venue.sports_available,
            })
        
        return JsonResponse({
            'success': True,
            'venues': venues_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
