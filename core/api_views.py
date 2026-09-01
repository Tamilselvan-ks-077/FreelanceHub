"""
core/api_views.py
-----------------
Django REST Framework API views for the FreelanceHub React SPA.
All endpoints use session-based authentication — no JWT needed.
"""

import uuid
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q, Avg, Sum

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import (
    Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment,
    ActivityLog, ChatRoom, ChatMessage,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def booking_to_dict(booking):
    invoice_data = None
    try:
        inv = booking.invoice
        invoice_data = {
            'id': inv.id,
            'amount': float(inv.amount),
            'status': inv.status,
            'issued_at': inv.issued_at.isoformat(),
        }
    except Invoice.DoesNotExist:
        pass

    return {
        'id': booking.id,
        'client': {
            'id': booking.client.id,
            'username': booking.client.username,
            'full_name': booking.client.get_full_name() or booking.client.username,
        },
        'freelancer': {
            'id': booking.freelancer.id,
            'username': booking.freelancer.username,
            'full_name': booking.freelancer.get_full_name() or booking.freelancer.username,
        },
        'start_date': booking.start_date.isoformat(),
        'end_date': booking.end_date.isoformat(),
        'description': booking.description or '',
        'status': booking.status,
        'created_at': booking.created_at.isoformat(),
        'invoice': invoice_data,
    }


def message_to_dict(msg):
    return {
        'id': msg.id,
        'sender': msg.sender.username,
        'recipient': msg.recipient.username,
        'body': msg.body,
        'is_read': msg.is_read,
        'created_at': msg.created_at.isoformat(),
        'attachment': msg.attachment.url if msg.attachment else None,
    }


def notification_to_dict(n):
    return {
        'id': n.id,
        'verb': n.verb,
        'description': n.description or '',
        'notification_type': n.notification_type,
        'is_read': n.is_read,
        'created_at': n.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not username or not password:
        return Response({'error': 'Username and password required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=401)

    login(request, user)
    try:
        role = user.profile.role
    except Exception:
        role = 'client'

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': role,
        'is_staff': user.is_staff,
        'full_name': user.get_full_name() or user.username,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def api_logout(request):
    logout(request)
    return Response({'message': 'Logged out.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_signup(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    role = request.data.get('role', 'client')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    profile = user.profile
    if role in ('freelancer', 'client'):
        profile.role = role
        profile.save(update_fields=['role'])

    login(request, user)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': profile.role,
        'is_staff': user.is_staff,
        'full_name': user.get_full_name() or user.username,
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_me(request):
    user = request.user
    try:
        profile = user.profile
        role = profile.role
        profile_id = profile.id
        avatar = request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None
    except Exception:
        role = 'client'
        profile_id = None
        avatar = None

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': role,
        'profile_id': profile_id,
        'is_staff': user.is_staff,
        'full_name': user.get_full_name() or user.username,
        'avatar': avatar,
        'unread_notifications': Notification.objects.filter(user=user, is_read=False).count(),
        'unread_messages': Message.objects.filter(recipient=user, is_read=False).count(),
    })


# ---------------------------------------------------------------------------
# PROFILE
# ---------------------------------------------------------------------------

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_profile(request):
    user = request.user
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found.'}, status=404)

    if request.method == 'GET':
        skills = [fs.skill.name for fs in profile.skills.select_related('skill').all()]
        portfolio = [
            {
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'image': request.build_absolute_uri(p.image.url) if p.image else None,
                'video_url': p.video_url,
                'external_link': p.external_link,
                'created_at': p.created_at.isoformat(),
            }
            for p in profile.portfolio_items.all()
        ]
        return Response({
            'id': profile.id,
            'username': user.username,
            'email': user.email,
            'full_name': profile.full_name or '',
            'bio': profile.bio or '',
            'role': profile.role,
            'hourly_rate': float(profile.hourly_rate) if profile.hourly_rate else None,
            'location': profile.location or '',
            'availability': profile.availability,
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
            'github_url': profile.github_url or '',
            'linkedin_url': profile.linkedin_url or '',
            'website_url': profile.website_url or '',
            'skills': skills,
            'portfolio': portfolio,
        })

    data = request.data
    profile.full_name = data.get('full_name', profile.full_name)
    profile.bio = data.get('bio', profile.bio)
    profile.location = data.get('location', profile.location)
    profile.availability = data.get('availability', profile.availability)
    profile.github_url = data.get('github_url', profile.github_url)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.website_url = data.get('website_url', profile.website_url)

    rate = data.get('hourly_rate')
    if rate is not None:
        try:
            profile.hourly_rate = float(rate)
        except (ValueError, TypeError):
            pass

    if 'profile_picture' in request.FILES:
        profile.profile_picture = request.FILES['profile_picture']

    profile.save()

    if 'skills' in data:
        skill_names = data.getlist('skills') if hasattr(data, 'getlist') else data.get('skills', [])
        if isinstance(skill_names, str):
            skill_names = [s.strip() for s in skill_names.split(',') if s.strip()]
        FreelancerSkill.objects.filter(profile=profile).delete()
        for name in skill_names:
            if name:
                skill_obj, _ = Skill.objects.get_or_create(name=name.strip())
                FreelancerSkill.objects.get_or_create(profile=profile, skill=skill_obj)

    return Response({'message': 'Profile updated.'})


# ---------------------------------------------------------------------------
# FREELANCER DIRECTORY
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def api_freelancers(request):
    profiles = Profile.objects.filter(
        role='freelancer'
    ).select_related('user').prefetch_related('skills__skill', 'portfolio_items')

    q = request.GET.get('q', '').strip()
    if q:
        profiles = profiles.filter(
            Q(user__username__icontains=q) |
            Q(full_name__icontains=q) |
            Q(bio__icontains=q) |
            Q(location__icontains=q) |
            Q(skills__skill__name__icontains=q)
        ).distinct()

    skill = request.GET.get('skill', '').strip()
    if skill:
        profiles = profiles.filter(skills__skill__name__iexact=skill)

    location = request.GET.get('location', '').strip()
    if location:
        profiles = profiles.filter(location__icontains=location)

    try:
        min_rate = float(request.GET.get('min_rate', 0) or 0)
        if min_rate:
            profiles = profiles.filter(hourly_rate__gte=min_rate)
    except ValueError:
        pass

    try:
        max_rate = float(request.GET.get('max_rate', 0) or 0)
        if max_rate:
            profiles = profiles.filter(hourly_rate__lte=max_rate)
    except ValueError:
        pass

    avail = request.GET.get('availability', '').strip()
    if avail:
        profiles = profiles.filter(availability=avail)

    page = max(int(request.GET.get('page', 1) or 1), 1)
    per_page = 12
    total = profiles.count()
    offset = (page - 1) * per_page
    profiles = profiles[offset:offset + per_page]

    data = []
    for profile in profiles:
        avg = Review.objects.filter(reviewee=profile.user).aggregate(avg=Avg('rating'))['avg']
        is_fav = False
        if request.user.is_authenticated:
            is_fav = Favourite.objects.filter(user=request.user, freelancer=profile).exists()
        skills = [fs.skill.name for fs in profile.skills.all()]

        data.append({
            'id': profile.id,
            'username': profile.user.username,
            'full_name': profile.full_name or profile.user.get_full_name() or profile.user.username,
            'bio': (profile.bio or '')[:160],
            'location': profile.location or '',
            'hourly_rate': float(profile.hourly_rate) if profile.hourly_rate else None,
            'availability': profile.availability,
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
            'skills': skills[:5],
            'avg_rating': round(float(avg), 1) if avg else None,
            'review_count': Review.objects.filter(reviewee=profile.user).count(),
            'is_favourite': is_fav,
        })

    all_skills = list(Skill.objects.values_list('name', flat=True).order_by('name'))
    return Response({
        'results': data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': max((total + per_page - 1) // per_page, 1),
        'skills': all_skills,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_freelancer_detail(request, profile_id):
    try:
        profile = Profile.objects.select_related('user').prefetch_related(
            'skills__skill', 'portfolio_items'
        ).get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Freelancer not found.'}, status=404)

    skills = [fs.skill.name for fs in profile.skills.all()]
    portfolio = [
        {
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'image': request.build_absolute_uri(p.image.url) if p.image else None,
            'video_url': p.video_url,
            'external_link': p.external_link,
        }
        for p in profile.portfolio_items.all()
    ]

    reviews_qs = Review.objects.filter(reviewee=profile.user).select_related('reviewer').order_by('-created_at')[:10]
    reviews = [
        {
            'id': r.id,
            'reviewer': r.reviewer.get_full_name() or r.reviewer.username,
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat(),
        }
        for r in reviews_qs
    ]

    avg = Review.objects.filter(reviewee=profile.user).aggregate(avg=Avg('rating'))['avg']
    is_fav = False
    if request.user.is_authenticated:
        is_fav = Favourite.objects.filter(user=request.user, freelancer=profile).exists()

    return Response({
        'id': profile.id,
        'username': profile.user.username,
        'full_name': profile.full_name or profile.user.get_full_name() or profile.user.username,
        'email': profile.user.email,
        'bio': profile.bio or '',
        'role': profile.role,
        'hourly_rate': float(profile.hourly_rate) if profile.hourly_rate else None,
        'location': profile.location or '',
        'availability': profile.availability,
        'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile.profile_picture else None,
        'github_url': profile.github_url or '',
        'linkedin_url': profile.linkedin_url or '',
        'website_url': profile.website_url or '',
        'skills': skills,
        'portfolio': portfolio,
        'reviews': reviews,
        'avg_rating': round(float(avg), 1) if avg else None,
        'review_count': reviews_qs.count(),
        'is_favourite': is_fav,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_toggle_favourite(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Freelancer not found.'}, status=404)

    fav, created = Favourite.objects.get_or_create(user=request.user, freelancer=profile)
    if not created:
        fav.delete()
        return Response({'is_favourite': False})
    return Response({'is_favourite': True})


# ---------------------------------------------------------------------------
# DASHBOARD
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_dashboard(request):
    user = request.user
    try:
        role = user.profile.role
    except Exception:
        role = 'client'

    if role == 'freelancer':
        bookings = Booking.objects.filter(freelancer=user).select_related(
            'client', 'client__profile'
        ).prefetch_related('invoice').order_by('-created_at')
        total_earnings = Invoice.objects.filter(
            booking__freelancer=user, status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0

        reviews = Review.objects.filter(reviewee=user).select_related('reviewer').order_by('-created_at')[:5]

        try:
            from datetime import date
            from dateutil.relativedelta import relativedelta
            months = []
            for i in range(5, -1, -1):
                d = date.today().replace(day=1) - relativedelta(months=i)
                total = Invoice.objects.filter(
                    booking__freelancer=user,
                    status='paid',
                    issued_at__year=d.year,
                    issued_at__month=d.month,
                ).aggregate(t=Sum('amount'))['t'] or 0
                months.append({'month': d.strftime('%b %Y'), 'earnings': float(total)})
        except Exception:
            months = []

        return Response({
            'role': role,
            'stats': {
                'total_earnings': float(total_earnings),
                'pending_bookings': bookings.filter(status='pending').count(),
                'active_bookings': bookings.filter(status='accepted').count(),
                'total_bookings': bookings.count(),
            },
            'bookings': [booking_to_dict(b) for b in bookings[:20]],
            'reviews': [
                {
                    'id': r.id,
                    'reviewer': r.reviewer.get_full_name() or r.reviewer.username,
                    'rating': r.rating,
                    'comment': r.comment,
                    'created_at': r.created_at.isoformat(),
                }
                for r in reviews
            ],
            'monthly_earnings': months,
        })

    # client dashboard
    bookings = Booking.objects.filter(client=user).select_related(
        'freelancer', 'freelancer__profile'
    ).prefetch_related('invoice').order_by('-created_at')
    total_spent = Invoice.objects.filter(
        booking__client=user, status='paid'
    ).aggregate(total=Sum('amount'))['total'] or 0

    favourites = Favourite.objects.filter(user=user).select_related('freelancer__user')[:5]

    return Response({
        'role': role,
        'stats': {
            'total_spent': float(total_spent),
            'total_bookings': bookings.count(),
            'pending_bookings': bookings.filter(status='pending').count(),
            'active_bookings': bookings.filter(status='accepted').count(),
        },
        'bookings': [booking_to_dict(b) for b in bookings[:20]],
        'favourites': [
            {
                'id': f.freelancer.id,
                'username': f.freelancer.user.username,
                'full_name': f.freelancer.full_name or f.freelancer.user.username,
            }
            for f in favourites
        ],
    })


# ---------------------------------------------------------------------------
# BOOKINGS
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_booking(request, freelancer_id):
    try:
        freelancer_profile = Profile.objects.get(id=freelancer_id)
        freelancer_user = freelancer_profile.user
    except Profile.DoesNotExist:
        return Response({'error': 'Freelancer not found.'}, status=404)

    if request.user == freelancer_user:
        return Response({'error': 'You cannot book yourself.'}, status=400)

    data = request.data
    try:
        booking = Booking.objects.create(
            client=request.user,
            freelancer=freelancer_user,
            start_date=data['start_date'],
            end_date=data['end_date'],
            description=data.get('description', ''),
        )
    except KeyError as e:
        return Response({'error': f'Missing field: {e}'}, status=400)

    Notification.objects.create(
        user=freelancer_user,
        verb=f'New booking request from {request.user.username}',
        notification_type='booking',
    )
    return Response(booking_to_dict(booking), status=201)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_booking_detail(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=404)

    if request.user not in (booking.client, booking.freelancer):
        return Response({'error': 'Not authorised.'}, status=403)

    if request.method == 'GET':
        return Response(booking_to_dict(booking))

    if request.user != booking.client or booking.status != 'pending':
        return Response({'error': 'Cannot edit this booking.'}, status=403)

    data = request.data
    if 'start_date' in data:
        booking.start_date = data['start_date']
    if 'end_date' in data:
        booking.end_date = data['end_date']
    if 'description' in data:
        booking.description = data['description']
    booking.save()
    return Response(booking_to_dict(booking))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_booking_action(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=404)

    action = request.data.get('action', '')
    user = request.user

    if action in ('accept', 'reject') and user != booking.freelancer:
        return Response({'error': 'Only the freelancer can accept/reject.'}, status=403)
    if action == 'complete' and user not in (booking.client, booking.freelancer):
        return Response({'error': 'Not authorised.'}, status=403)

    action_map = {'accept': 'accepted', 'reject': 'rejected', 'complete': 'completed'}
    if action not in action_map:
        return Response({'error': 'Invalid action. Use accept, reject or complete.'}, status=400)

    booking.status = action_map[action]
    booking.save()

    if action == 'complete':
        try:
            rate = float(booking.freelancer.profile.hourly_rate or 0)
        except Exception:
            rate = 0
        delta = max((booking.end_date - booking.start_date).days, 1)
        amount = rate * delta * 8
        Invoice.objects.get_or_create(booking=booking, defaults={'amount': amount})

    notify_user = booking.client if user == booking.freelancer else booking.freelancer
    Notification.objects.create(
        user=notify_user,
        verb=f'Booking #{booking.id} has been {booking.status}',
        notification_type='booking',
    )
    return Response(booking_to_dict(booking))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found.'}, status=404)

    if request.user != booking.client:
        return Response({'error': 'Only the client can cancel.'}, status=403)
    if booking.status not in ('pending', 'accepted'):
        return Response({'error': 'Cannot cancel this booking.'}, status=400)

    booking.status = 'cancelled'
    booking.save()
    Notification.objects.create(
        user=booking.freelancer,
        verb=f'Booking #{booking.id} was cancelled by {request.user.username}',
        notification_type='booking',
    )
    return Response({'message': 'Booking cancelled.'})


# ---------------------------------------------------------------------------
# INVOICES
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_pay_invoice(request, invoice_id):
    try:
        invoice = Invoice.objects.select_related('booking__freelancer').get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found.'}, status=404)

    if request.user != invoice.booking.client:
        return Response({'error': 'Only the client can pay this invoice.'}, status=403)
    if invoice.status == 'paid':
        return Response({'error': 'Already paid.'}, status=400)

    invoice.status = 'paid'
    invoice.save()

    Payment.objects.create(
        invoice=invoice,
        transaction_id=str(uuid.uuid4()),
        amount=invoice.amount,
        payment_method=request.data.get('payment_method', 'credit_card'),
    )
    Notification.objects.create(
        user=invoice.booking.freelancer,
        verb=f'Payment received for Booking #{invoice.booking.id}',
        notification_type='payment',
    )
    return Response({'message': 'Payment successful.', 'invoice_id': invoice.id})


# ---------------------------------------------------------------------------
# MESSAGES
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_inbox(request):
    user = request.user
    contacts = User.objects.filter(
        Q(sent_messages__recipient=user) | Q(received_messages__sender=user)
    ).exclude(id=user.id).distinct()

    threads = []
    for contact in contacts:
        last_msg = Message.objects.filter(
            Q(sender=user, recipient=contact) | Q(sender=contact, recipient=user)
        ).order_by('-created_at').first()

        unread = Message.objects.filter(sender=contact, recipient=user, is_read=False).count()
        threads.append({
            'username': contact.username,
            'full_name': contact.get_full_name() or contact.username,
            'last_message': last_msg.body[:80] if last_msg else '',
            'last_message_at': last_msg.created_at.isoformat() if last_msg else None,
            'unread_count': unread,
        })

    threads.sort(key=lambda t: t['last_message_at'] or '', reverse=True)
    return Response({'threads': threads})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_chat(request, username):
    try:
        other_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

    user = request.user

    if request.method == 'GET':
        messages_qs = Message.objects.filter(
            Q(sender=user, recipient=other_user) | Q(sender=other_user, recipient=user)
        ).order_by('created_at')
        Message.objects.filter(sender=other_user, recipient=user, is_read=False).update(is_read=True)
        return Response({
            'other_user': {
                'username': other_user.username,
                'full_name': other_user.get_full_name() or other_user.username,
            },
            'messages': [message_to_dict(m) for m in messages_qs],
        })

    body = request.data.get('body', '').strip()
    if not body and 'attachment' not in request.FILES:
        return Response({'error': 'Message body or attachment required.'}, status=400)

    msg = Message.objects.create(
        sender=user,
        recipient=other_user,
        body=body,
        attachment=request.FILES.get('attachment'),
    )
    Notification.objects.create(
        user=other_user,
        verb=f'New message from {user.username}',
        notification_type='message',
    )
    return Response(message_to_dict(msg), status=201)


# ---------------------------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_notifications(request):
    notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
    return Response({
        'notifications': [notification_to_dict(n) for n in notifs],
        'unread_count': Notification.objects.filter(user=request.user, is_read=False).count(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read.'})


# ---------------------------------------------------------------------------
# ADMIN
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAdminUser])
def api_admin_stats(request):
    booking_stats = {
        s: Booking.objects.filter(status=s).count()
        for s in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')
    }
    all_users = User.objects.select_related('profile').order_by('-date_joined')[:30]
    recent_bookings = Booking.objects.select_related('client', 'freelancer').order_by('-created_at')[:20]

    return Response({
        'stats': {
            'users': User.objects.count(),
            'freelancers': Profile.objects.filter(role='freelancer').count(),
            'clients': Profile.objects.filter(role='client').count(),
            'bookings': Booking.objects.count(),
            'revenue': float(Invoice.objects.filter(status='paid').aggregate(t=Sum('amount'))['t'] or 0),
        },
        'booking_stats': booking_stats,
        'recent_bookings': [booking_to_dict(b) for b in recent_bookings],
        'users': [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': getattr(getattr(u, 'profile', None), 'role', 'client'),
                'date_joined': u.date_joined.isoformat(),
                'is_active': u.is_active,
                'is_staff': u.is_staff,
            }
            for u in all_users
        ],
    })
