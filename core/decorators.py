from django.http import HttpResponseForbidden, Http404
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.functional import wraps
from .models import Booking


def booking_participant_required(view_func):
    """Ensure the logged‑in user is either the client or freelancer of the booking.
    The view must receive ``booking_id`` as a keyword argument.
    """

    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        booking_id = kwargs.get('booking_id')
        if not booking_id:
            raise Http404('Booking ID not provided')
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user not in (booking.client, booking.freelancer):
            return HttpResponseForbidden('You are not a participant of this booking')
        # Optionally attach booking to request for downstream use
        request.booking = booking
        return view_func(request, *args, **kwargs)

    return _wrapped_view
