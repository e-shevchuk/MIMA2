from django.urls import path

from . import views

app_name = 'polls'
urlpatterns = [
    # Url: /polls/
    path('', views.IndexView.as_view(), name = 'index'),
    # Url: /polls/
    path('<int:pk>/', views.DetailView.as_view(), name = 'detail'),
    # Url: /polls/5/
    path('<int:pk>/results/', views.ResultView.as_view(), name = 'results'),
    # Url: /polls/5/results
    path('<int:question_id>/vote/', views.vote, name = 'vote'),
    # Url: /polls/5/vote
]