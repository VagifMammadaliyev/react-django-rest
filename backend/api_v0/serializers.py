from rest_framework import serializers
from api_v0.models import Word


class WordSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Word
        fields = ['id', 'title', 'author', 'definition']
