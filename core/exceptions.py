import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Comprehensive global DRF exception handler.
    Catches validation errors, HTTP 404, DRF APIExceptions, and uncaught 500 exceptions.
    Prevents leaking internal stack traces in production while logging all errors.
    """
    # Call REST framework's default exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    view_name = context.get('view', None)
    view_name_str = view_name.__class__.__name__ if view_name else 'UnknownView'

    if response is not None:
        # Standardize error format: ensure 'error' key exists
        data = response.data
        if isinstance(data, dict):
            if 'error' not in data:
                if 'detail' in data:
                    data['error'] = str(data['detail'])
                else:
                    # Collect first validation error message
                    first_msg = next(iter(data.values()), 'Validation error')
                    if isinstance(first_msg, list) and len(first_msg) > 0:
                        data['error'] = str(first_msg[0])
                    else:
                        data['error'] = str(first_msg)
        elif isinstance(data, list) and len(data) > 0:
            response.data = {'error': str(data[0]), 'errors': data}

        response.data['status_code'] = response.status_code
        return response

    # Handle Django's native ValidationError
    if isinstance(exc, DjangoValidationError):
        logger.warning(f"Django validation error in {view_name_str}: {exc}")
        if hasattr(exc, 'message_dict'):
            errors = exc.message_dict
            first_err = next(iter(errors.values()), ['Invalid data'])[0]
            return Response({'error': first_err, 'errors': errors, 'status_code': 400}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': str(exc.messages[0] if hasattr(exc, 'messages') else exc), 'status_code': 400}, status=status.HTTP_400_BAD_REQUEST)

    # Handle Django's Http404
    if isinstance(exc, Http404):
        return Response({'error': 'Resource not found.', 'status_code': 404}, status=status.HTTP_404_NOT_FOUND)

    # Unhandled 500 error: log stack trace and return sanitized error response
    logger.exception(f"Unhandled server error in {view_name_str}: {exc}")
    return Response(
        {
            'error': 'An internal server error occurred. Our engineering team has been notified.',
            'status_code': 500,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
