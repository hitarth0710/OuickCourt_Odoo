from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.user_profile, name='user-profile'),
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('resend-otp/', views.resend_otp, name='resend-otp'),
]
