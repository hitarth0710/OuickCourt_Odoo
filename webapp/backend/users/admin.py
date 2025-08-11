from django.contrib import admin
from .models import UserProfile, EmailOTP

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'is_email_verified', 'created_at']
    list_filter = ['role', 'is_email_verified']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp', 'role', 'is_used', 'created_at', 'expires_at']
    list_filter = ['role', 'is_used', 'created_at']
    search_fields = ['email']
    readonly_fields = ['otp', 'created_at', 'expires_at']
