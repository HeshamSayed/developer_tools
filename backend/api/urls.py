from django.urls import path, include
from api.views.sitemap import SitemapView
from analytics.views import AnalyticsDashboardView

urlpatterns = [
    path('tools/', include('api.tools_urls')),
    path('sitemap.xml', SitemapView.as_view(), name='sitemap'),
    path('analytics/dashboard', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]
