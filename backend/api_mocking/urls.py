from django.urls import path
from . import views

urlpatterns = [
    # Dashboard stats
    path('stats/', views.dashboard_stats, name='mock-stats'),

    # Mock Apps
    path('apps/', views.MockAppListCreate.as_view(), name='app-list-create'),
    path('apps/<uuid:pk>/', views.MockAppDetail.as_view(), name='app-detail'),

    # Mock Collections
    path('collections/', views.MockCollectionListCreate.as_view(), name='collection-list-create'),
    path('collections/<uuid:pk>/', views.MockCollectionDetail.as_view(), name='collection-detail'),

    # Mock Environments
    path('environments/', views.MockEnvironmentListCreate.as_view(), name='environment-list-create'),
    path('environments/<uuid:pk>/', views.MockEnvironmentDetail.as_view(), name='environment-detail'),

    # Mock Endpoints
    path('endpoints/', views.MockEndpointListCreate.as_view(), name='endpoint-list-create'),
    path('endpoints/<uuid:pk>/', views.MockEndpointDetail.as_view(), name='endpoint-detail'),
    path('endpoints/<uuid:pk>/toggle/', views.MockEndpointToggleActive.as_view(), name='endpoint-toggle'),
    path('endpoints/<uuid:pk>/reset/', views.MockEndpointResetCounter.as_view(), name='endpoint-reset'),
    path('endpoints/<uuid:pk>/stats/', views.MockEndpointStats.as_view(), name='endpoint-stats'),
    path('endpoints/<uuid:pk>/logs/', views.MockEndpointLogs.as_view(), name='endpoint-logs'),
    path('endpoints/<uuid:endpoint_id>/snippet/', views.get_code_snippet, name='endpoint-snippet'),
    path('endpoints/<uuid:endpoint_id>/openapi/', views.export_openapi, name='endpoint-openapi'),

    # Mock Responses
    path('responses/', views.MockResponseListCreate.as_view(), name='response-list-create'),
    path('responses/<uuid:pk>/', views.MockResponseDetail.as_view(), name='response-detail'),

    # Mock Scenarios
    path('scenarios/', views.MockScenarioListCreate.as_view(), name='scenario-list-create'),
    path('scenarios/<uuid:pk>/', views.MockScenarioDetail.as_view(), name='scenario-detail'),

    # Request Logs
    path('logs/', views.MockRequestList.as_view(), name='log-list'),
    path('logs/<uuid:pk>/', views.MockRequestDetail.as_view(), name='log-detail'),

    # Public mock execution endpoint (no authentication required)
    # Support both with and without trailing slash to avoid POST redirect issues
    path('execute/<uuid:endpoint_id>/', views.execute_mock, name='mock-execute'),
    path('execute/<uuid:endpoint_id>', views.execute_mock, name='mock-execute-no-slash'),
    path('execute/<uuid:endpoint_id>/<path:path>/', views.execute_mock, name='mock-execute-path'),
    path('execute/<uuid:endpoint_id>/<path:path>', views.execute_mock, name='mock-execute-path-no-slash'),
]
