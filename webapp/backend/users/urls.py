from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.user_profile, name='user-profile'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path('admin/users/', views.get_all_users, name='get_all_users'),
    path('admin/users/<int:user_id>/approve/', views.approve_user, name='approve_user'),
    path('admin/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('admin/facilities/pending/', views.get_pending_facilities, name='get_pending_facilities'),
]
