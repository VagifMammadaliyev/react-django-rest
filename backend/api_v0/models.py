from django.db import models
from django.contrib.auth import get_user_model


class Word(models.Model):
    title = models.CharField(max_length=50)
    author = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
    )
    definition = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
