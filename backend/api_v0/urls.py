from django.urls import path, include
from rest_framework import generics
from rest_framework.urlpatterns import format_suffix_patterns

from api_v0 import views

urlpatterns = [
    path('signin/', views.signin, name='login'),
    path('signup/', views.signup, name='register'),
    path('signout/', views.signout, name='logout'),
    path('check-session-auth', views.check_session_auth, name='check'),
    path('words/', views.ListWords.as_view(), name='word-list'),
    path('word/<int:pk>', views.RetrieveDestroyWord.as_view(), name='word-detail'),
    path('my-words/', views.user_words_list, name='my-word-list'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
