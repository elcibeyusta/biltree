"""
Custom exception handlers for DRF.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': {}
        }

        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['details'] = exc.detail
                custom_response_data['message'] = exc.detail.get('message', 'Validation error')
            elif isinstance(exc.detail, list):
                custom_response_data['message'] = exc.detail[0] if exc.detail else 'An error occurred'
                custom_response_data['details'] = {'errors': exc.detail}
            else:
                custom_response_data['message'] = str(exc.detail)

        response.data = custom_response_data

    return response

