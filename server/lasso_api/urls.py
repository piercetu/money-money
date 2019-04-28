from django.urls import include, path

from . import api

urlpatterns = [
    path('predict/', api.predict, name='predict')
]