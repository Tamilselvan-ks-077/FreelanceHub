from core.models import Notification, Message

def global_vars(request):
    if request.user.is_authenticated:
        return {
            'unread_notifications_count': Notification.objects.filter(user=request.user, is_read=False).count(),
            'unread_messages_count': Message.objects.filter(recipient=request.user, is_read=False).count()
        }
    return {
        'unread_notifications_count': 0,
        'unread_messages_count': 0
    }
