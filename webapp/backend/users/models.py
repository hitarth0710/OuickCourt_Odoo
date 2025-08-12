from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
import string

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('player', 'Player'),
        ('facility', 'Facility Owner'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='player')
    is_email_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)  # Add this field
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.role}"

class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    role = models.CharField(max_length=20, choices=UserProfile.ROLE_CHOICES, default='player')
    name = models.CharField(max_length=100, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True)  # Store hashed password
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = self.generate_otp()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    @staticmethod
    def generate_otp():
        return ''.join(random.choices(string.digits, k=6))

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP for {self.email} - {self.otp}"
