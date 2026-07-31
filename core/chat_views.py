from django.shortcuts import render
from django.http import JsonResponse, HttpResponseForbidden, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from .decorators import booking_participant_required
from .models import ChatRoom, ChatMessage

# Render chat UI for a booking (secure)
@booking_participant_required
def chat_room_view(request, booking_id):
    """Display the chat room for a given booking. Only participants may access."""
    room = request.booking.chat_room
    messages_qs = room.messages.select_related('sender').order_by('timestamp')
    return render(request, 'core/chat_room.html', {
        'room': room,
        'messages': messages_qs,
    })

# Send a new message via AJAX (POST)
@csrf_exempt
@booking_participant_required
def chat_send_message(request, booking_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    content = request.POST.get('content', '').strip()
    if not content:
        return JsonResponse({'error': 'Empty content'}, status=400)
    msg = ChatMessage.objects.create(
        room=request.booking.chat_room,
        sender=request.user,
        content=content,
    )
    return JsonResponse({
        'id': msg.id,
        'sender': msg.sender.username,
        'content': msg.content,
        'timestamp': msg.timestamp.isoformat(),
    })

# Poll for new messages since a given timestamp (GET)
@booking_participant_required
def chat_fetch_messages(request, booking_id):
    since = request.GET.get('since')
    qs = request.booking.chat_room.messages.select_related('sender').order_by('timestamp')
    if since:
        dt = parse_datetime(since)
        if dt:
            qs = qs.filter(timestamp__gt=dt)
    msgs = [{
        'id': m.id,
        'sender': m.sender.username,
        'content': m.content,
        'timestamp': m.timestamp.isoformat(),
    } for m in qs]
    return JsonResponse({'messages': msgs})
