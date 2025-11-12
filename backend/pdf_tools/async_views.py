"""
Async API views for PDF processing with Celery task management.

These views handle document conversion requests asynchronously,
providing immediate task IDs and status tracking endpoints.
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from celery.result import AsyncResult
from .tasks import (
    pdf_to_word_task,
    word_to_pdf_task,
    pdf_to_excel_task,
    excel_to_pdf_task,
    generate_pdf_task,
    create_excel_task
)


@api_view(['POST'])
def pdf_to_word_async(request):
    """
    Start async PDF to Word conversion

    Returns task ID immediately, client polls for result
    """
    try:
        pdf_data = request.data.get('pdf')

        if not pdf_data:
            return Response(
                {'error': 'PDF data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Start async task
        task = pdf_to_word_task.delay(pdf_data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': 'We are processing your request. Please wait...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def word_to_pdf_async(request):
    """Start async Word to PDF conversion"""
    try:
        docx_data = request.data.get('docx')

        if not docx_data:
            return Response(
                {'error': 'DOCX data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task = word_to_pdf_task.delay(docx_data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': 'We are processing your request. Please wait...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def pdf_to_excel_async(request):
    """Start async PDF to Excel conversion"""
    try:
        pdf_data = request.data.get('pdf')

        if not pdf_data:
            return Response(
                {'error': 'PDF data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task = pdf_to_excel_task.delay(pdf_data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': 'We are processing your request. Extracting tables from PDF...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def excel_to_pdf_async(request):
    """Start async Excel to PDF conversion"""
    try:
        excel_data = request.data.get('excel')

        if not excel_data:
            return Response(
                {'error': 'Excel data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task = excel_to_pdf_task.delay(excel_data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': 'We are processing your request. Converting spreadsheet to PDF...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def generate_pdf_async(request):
    """Start async PDF generation from template"""
    try:
        template_type = request.data.get('template_type', 'invoice')
        data = request.data.get('data', {})

        task = generate_pdf_task.delay(template_type, data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': f'We are processing your request. Generating {template_type} PDF...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_excel_async(request):
    """Start async Excel file creation"""
    try:
        sheets_data = request.data.get('sheets', [])

        if not sheets_data:
            return Response(
                {'error': 'Sheet data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task = create_excel_task.delay(sheets_data)

        return Response({
            'success': True,
            'task_id': task.id,
            'status': 'processing',
            'message': 'We are processing your request. Creating Excel file...',
            'status_url': f'/api/pdf-tools/task-status/{task.id}/'
        }, status=status.HTTP_202_ACCEPTED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def task_status(request, task_id):
    """
    Check status of an async task

    Returns:
        - PENDING: Task is waiting to be processed
        - STARTED: Task has started processing
        - SUCCESS: Task completed successfully (includes result)
        - FAILURE: Task failed (includes error)
        - RETRY: Task is being retried
    """
    try:
        task_result = AsyncResult(task_id)

        response_data = {
            'task_id': task_id,
            'status': task_result.state,
        }

        if task_result.state == 'PENDING':
            response_data['message'] = 'Your request is in the queue...'
            response_data['progress'] = 0

        elif task_result.state == 'STARTED':
            response_data['message'] = 'Processing your request...'
            response_data['progress'] = 50

        elif task_result.state == 'SUCCESS':
            result = task_result.result
            response_data['message'] = 'Processing complete! Your file is ready.'
            response_data['progress'] = 100
            response_data['result'] = result
            response_data['download_ready'] = True

        elif task_result.state == 'FAILURE':
            response_data['message'] = 'Processing failed. Please try again.'
            response_data['progress'] = 0
            response_data['error'] = str(task_result.info)
            response_data['download_ready'] = False

        elif task_result.state == 'RETRY':
            response_data['message'] = 'Retrying... Please wait.'
            response_data['progress'] = 25

        return Response(response_data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
def cancel_task(request, task_id):
    """
    Cancel a running task

    Useful if user wants to abort a long-running conversion
    """
    try:
        task_result = AsyncResult(task_id)

        if task_result.state in ['PENDING', 'STARTED', 'RETRY']:
            task_result.revoke(terminate=True)
            return Response({
                'success': True,
                'message': 'Task cancelled successfully',
                'task_id': task_id
            })
        else:
            return Response({
                'success': False,
                'message': f'Task cannot be cancelled. Current state: {task_result.state}',
                'task_id': task_id
            })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def queue_status(request):
    """
    Get overall queue statistics

    Useful for monitoring system load
    """
    try:
        from celery import current_app

        # Get queue statistics
        inspect = current_app.control.inspect()

        active_tasks = inspect.active()
        scheduled_tasks = inspect.scheduled()
        reserved_tasks = inspect.reserved()

        total_active = sum(len(tasks) for tasks in (active_tasks or {}).values())
        total_scheduled = sum(len(tasks) for tasks in (scheduled_tasks or {}).values())
        total_reserved = sum(len(tasks) for tasks in (reserved_tasks or {}).values())

        return Response({
            'active_tasks': total_active,
            'scheduled_tasks': total_scheduled,
            'reserved_tasks': total_reserved,
            'total_queued': total_active + total_scheduled + total_reserved,
            'status': 'healthy' if total_active + total_scheduled < 100 else 'busy'
        })

    except Exception as e:
        return Response(
            {'error': str(e), 'status': 'unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
