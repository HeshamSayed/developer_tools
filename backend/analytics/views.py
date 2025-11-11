from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ToolUsage


class AnalyticsDashboardView(APIView):
    """Analytics dashboard data"""

    def get(self, request):
        # Get date range (last 30 days)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)

        # Most popular tools
        popular_tools = ToolUsage.objects.filter(
            created_at__gte=start_date
        ).values('tool_slug').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Success rate
        total_usage = ToolUsage.objects.filter(created_at__gte=start_date).count()
        successful_usage = ToolUsage.objects.filter(created_at__gte=start_date, success=True).count()
        success_rate = (successful_usage / total_usage * 100) if total_usage > 0 else 0

        # Average processing time
        avg_processing_time = ToolUsage.objects.filter(
            created_at__gte=start_date,
            success=True
        ).aggregate(Avg('processing_time'))['processing_time__avg'] or 0

        # Daily usage counts
        daily_usage = {}
        for i in range(30):
            date = start_date + timedelta(days=i)
            count = ToolUsage.objects.filter(
                created_at__date=date.date()
            ).count()
            daily_usage[date.strftime('%Y-%m-%d')] = count

        return Response({
            'success': True,
            'data': {
                'popular_tools': list(popular_tools),
                'total_usage': total_usage,
                'success_rate': round(success_rate, 2),
                'avg_processing_time': round(avg_processing_time, 2),
                'daily_usage': daily_usage
            }
        })
