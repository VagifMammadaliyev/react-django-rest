import json

from django.shortcuts import render
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator

from rest_framework import views
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from rest_framework.decorators import (
    api_view, permission_classes, throttle_classes)

from api_v0.permissions import IsOwnerOrReadOnly
from api_v0.pagination import WordTabsPagination
from api_v0.models import Word
from api_v0.serializers import WordSerializer
from api_v0.throttling import TwicePerDayUserThrottle


def signin(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            response =  JsonResponse({
                'username': username
            })
        else:
            response =  JsonResponse({
                'username': None
            })

        return response
    else:
        return JsonResponse({
            'detail': 'This method is not allowed'
        }, status=status.HTTP_400_BAD_REQUEST)

def signout(request):
    logout(request)
    return JsonResponse({
        'detaul': 'Logged out'
    })

def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password1 = data.get('password1')
        password2 = data.get('password2')

        form = UserCreationForm({
            'username': username,
            'password1': password1,
            'password2': password2
        })

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password2']
            User = get_user_model()

            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password2'])
            return JsonResponse({
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse({
                'errors': [item for key in form.errors.keys() for item in form.errors[key]]
            })

    else:
        return JsonResponse({
            'detail': 'This method is not allowed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def check_session_auth(request):
    return Response({
        'is_authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_words_list(request, format=None):
    words = request.user.word_set.all().order_by('-created_on')
    serializer = WordSerializer(words, many=True)
    return Response(serializer.data)

class ListWords(views.APIView):
    queryset = Word.objects.all().order_by('-created_on')
    serializer_class = WordSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = WordTabsPagination

    def get(self, request, format=None):
        page = self.paginate_queryset(self.queryset)

        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(self.queryset, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = WordSerializer(data=request.data)

        if serializer.is_valid():
            word = serializer.save(author=request.user)
            return Response(WordSerializer(word).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def get_throttles(self):
        if self.request.method == 'POST':
            self.throttle_classes = [TwicePerDayUserThrottle]
        return super().get_throttles()

    @property
    def paginator(self):
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    def paginate_queryset(self, queryset):
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        return self.paginator.get_paginated_response(data)


class RetrieveDestroyWord(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        try:
            word = Word.objects.get(pk=pk)
        except Word.DoesNotExist:
            return None

        return word

    def get(self, request, pk, format=None):
        word = self.get_object(pk)

        if not word:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = WordSerializer(word)
        return Response(serializer.data)

    def delete(self, request, pk, format=None):
        word = self.get_object(pk)

        if not word:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if word.author.username == request.user.username:
            word.delete()
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_204_NO_CONTENT)
