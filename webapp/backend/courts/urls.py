from django.urls import path
from . import views

urlpatterns = [
    path('', views.court_list, name='court-list'),
]
