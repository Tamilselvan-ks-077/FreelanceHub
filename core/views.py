from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Avg, Count, Sum
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import json
import uuid

from .models import (
    Student, Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment, ActivityLog
)
from .serializers import StudentSerializer

# --- Helper Functions ---
def create_notification(user, verb, description=None, notification_type='booking'):
    Notification.objects.create(
        user=user,
        verb=verb,
        description=description,
        notification_type=notification_type
    )

def log_activity(user, action):
    ActivityLog.objects.create(user=user, action=action)

# --- General Views ---
def home(request):
    """
    SaaS Home landing and advanced search directory.
    """
    freelancers = Profile.objects.filter(role='freelancer').select_related('user').prefetch_related('skills__skill')
    
    # Advanced Filters
    query = request.GET.get('q', '').strip()
    if query:
        freelancers = freelancers.filter(
            Q(user__username__icontains=query) |
            Q(title__icontains=query) |
            Q(bio__icontains=query)
        )
        
    skill_query = request.GET.get('skill', '').strip()
    if skill_query:
        freelancers = freelancers.filter(skills__skill__name__icontains=skill_query)
        
    min_rate = request.GET.get('min_rate')
    if min_rate:
        freelancers = freelancers.filter(hourly_rate__gte=min_rate)
        
    max_rate = request.GET.get('max_rate')
    if max_rate:
        freelancers = freelancers.filter(hourly_rate__lte=max_rate)
        
    location = request.GET.get('location', '').strip()
    if location:
        freelancers = freelancers.filter(location__icontains=location)
        
    experience = request.GET.get('experience')
    if experience:
        freelancers = freelancers.filter(experience_years__gte=experience)
        
    availability = request.GET.get('availability')
    if availability == 'true':
        freelancers = freelancers.filter(availability=True)
    elif availability == 'false':
        freelancers = freelancers.filter(availability=False)
        
    verified = request.GET.get('verified')
    if verified == 'true':
        freelancers = freelancers.filter(is_verified=True)
        
    # Annotate fields for sorting and filtering
    freelancers = freelancers.annotate(
        avg_rating=Avg('user__reviews_received__rating'),
        completed_count=Count('user__bookings_received', filter=Q(user__bookings_received__status='completed')),
        reviews_count=Count('user__reviews_received')
    )
    
    min_rating = request.GET.get('rating')
    if min_rating:
        freelancers = freelancers.filter(avg_rating__gte=min_rating)
        
    # Sorting
    sort_by = request.GET.get('sort_by', 'newest')
    if sort_by == 'newest':
        freelancers = freelancers.order_by('-id')
    elif sort_by == 'highest_rated':
        freelancers = freelancers.order_by('-avg_rating')
    elif sort_by == 'lowest_price':
        freelancers = freelancers.order_by('hourly_rate')
    elif sort_by == 'highest_price':
        freelancers = freelancers.order_by('-hourly_rate')
    elif sort_by == 'most_completed':
        freelancers = freelancers.order_by('-completed_count')

    # Recently Viewed (Session-based)
    recently_viewed_ids = request.session.get('recently_viewed', [])
    recently_viewed = []
    if recently_viewed_ids:
        recently_viewed = Profile.objects.filter(id__in=recently_viewed_ids, role='freelancer').select_related('user')

    return render(request, "core/home.html", {
        "freelancers": freelancers,
        "query": query,
        "skill_query": skill_query,
        "min_rate": min_rate,
        "max_rate": max_rate,
        "location": location,
        "experience": experience,
        "availability": availability,
        "verified": verified,
        "min_rating": min_rating,
        "sort_by": sort_by,
        "recently_viewed": recently_viewed,
    })

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        role = request.POST.get("role")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")

        if password != password_confirm:
            messages.error(request, "Passwords do not match.")
            return redirect('signup')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username is already taken.")
            return redirect('signup')

        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            profile = user.profile
            profile.role = role
            profile.contact_email = email
            profile.save()

            log_activity(user, "Registered and created profile.")
            messages.success(request, f"Welcome to FreelanceHub, {username}!")
            auth_login(request, user)
            return redirect('home')
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return redirect('signup')

    return render(request, "core/signup.html")

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            log_activity(user, "Logged in.")
            messages.success(request, f"Welcome back, {username}!")
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password.")
            return redirect('login')

    return render(request, "core/login.html")

def logout_view(request):
    if request.user.is_authenticated:
        log_activity(request.user, "Logged out.")
    auth_logout(request)
    messages.success(request, "You have been logged out.")
    return redirect('login')

# --- Profile & Portfolio CRUD ---
@login_required
def profile_edit_view(request):
    profile = request.user.profile

    if request.method == "POST":
        action = request.POST.get("action")
        
        if action == "update_profile":
            profile.bio = request.POST.get("bio")
            profile.age = request.POST.get("age", 18)
            profile.contact_email = request.POST.get("contact_email")
            profile.location = request.POST.get("location")
            
            if profile.role == 'freelancer':
                profile.title = request.POST.get("title")
                profile.hourly_rate = request.POST.get("hourly_rate", 0.00)
                profile.experience_years = request.POST.get("experience_years", 0)
                profile.availability = request.POST.get("availability") == "true"
                profile.education = request.POST.get("education")
                profile.experience_detail = request.POST.get("experience_detail")
                profile.certificates = request.POST.get("certificates")
                profile.languages = request.POST.get("languages")
                
                # Check for upload files
                if request.FILES.get("cover_banner"):
                    profile.cover_banner = request.FILES.get("cover_banner")
                    
            profile.save()
            log_activity(request.user, "Updated profile fields.")
            messages.success(request, "Profile updated successfully!")
            
        elif action == "add_skill" and profile.role == 'freelancer':
            skill_name = request.POST.get("skill_name", "").strip()
            if skill_name:
                skill, created = Skill.objects.get_or_create(name=skill_name)
                FreelancerSkill.objects.get_or_create(profile=profile, skill=skill)
                messages.success(request, f"Added skill: {skill_name}")
                
        elif action == "remove_skill" and profile.role == 'freelancer':
            skill_id = request.POST.get("skill_id")
            if skill_id:
                FreelancerSkill.objects.filter(profile=profile, skill_id=skill_id).delete()
                messages.success(request, "Skill removed.")

        elif action == "add_portfolio" and profile.role == 'freelancer':
            title = request.POST.get("portfolio_title")
            desc = request.POST.get("portfolio_desc")
            img = request.FILES.get("portfolio_image")
            vid = request.POST.get("portfolio_video")
            link = request.POST.get("portfolio_link")
            
            Portfolio.objects.create(
                profile=profile,
                title=title,
                description=desc,
                image=img,
                video_url=vid,
                external_link=link
            )
            messages.success(request, "Portfolio item added!")
            
        elif action == "delete_portfolio" and profile.role == 'freelancer':
            item_id = request.POST.get("item_id")
            Portfolio.objects.filter(profile=profile, id=item_id).delete()
            messages.success(request, "Portfolio item deleted.")
                
        return redirect('profile_edit')

    current_skills = FreelancerSkill.objects.filter(profile=profile).select_related('skill') if profile.role == 'freelancer' else []
    portfolio_items = Portfolio.objects.filter(profile=profile) if profile.role == 'freelancer' else []
    return render(request, "core/profile_edit.html", {
        "profile": profile,
        "current_skills": current_skills,
        "portfolio_items": portfolio_items
    })

def talent_detail_view(request, profile_id):
    freelancer = get_object_or_404(Profile, id=profile_id, role='freelancer')
    
    # Increment views count
    if request.user.is_authenticated and freelancer.user != request.user:
        freelancer.views_count += 1
        freelancer.save()

    # Session storage for recently viewed
    recently_viewed = request.session.get('recently_viewed', [])
    if freelancer.id not in recently_viewed:
        recently_viewed.insert(0, freelancer.id)
        # Keep only last 5
        request.session['recently_viewed'] = recently_viewed[:5]

    skills = FreelancerSkill.objects.filter(profile=freelancer).select_related('skill')
    portfolio_items = Portfolio.objects.filter(profile=freelancer)
    reviews = Review.objects.filter(reviewee=freelancer.user).select_related('reviewer__profile').order_by('-created_at')
    
    is_favourited = False
    if request.user.is_authenticated:
        is_favourited = Favourite.objects.filter(user=request.user, freelancer=freelancer).exists()

    # Can review? Checks if client has completed booking with this freelancer
    can_review = False
    if request.user.is_authenticated:
        can_review = Booking.objects.filter(
            client=request.user, 
            freelancer=freelancer.user, 
            status='completed'
        ).exists() and not Review.objects.filter(reviewer=request.user, reviewee=freelancer.user).exists()

    if request.method == "POST" and request.user.is_authenticated:
        # Submit review
        rating = request.POST.get("rating", 5)
        comment = request.POST.get("comment", "")
        
        Review.objects.create(
            reviewer=request.user,
            reviewee=freelancer.user,
            rating=rating,
            comment=comment
        )
        messages.success(request, "Review submitted successfully!")
        return redirect('talent_detail', profile_id=profile_id)

    return render(request, "core/talent_detail.html", {
        "freelancer": freelancer,
        "skills": skills,
        "portfolio_items": portfolio_items,
        "reviews": reviews,
        "is_favourited": is_favourited,
        "can_review": can_review,
    })

# --- Favourites wishlist ---
@login_required
def toggle_favourite_view(request, profile_id):
    freelancer = get_object_or_404(Profile, id=profile_id, role='freelancer')
    fav, created = Favourite.objects.get_or_create(user=request.user, freelancer=freelancer)
    if not created:
        fav.delete()
        messages.success(request, f"Removed {freelancer.user.username} from wishlist.")
    else:
        messages.success(request, f"Bookmarked {freelancer.user.username}.")
    return redirect('talent_detail', profile_id=profile_id)

# --- Booking and Invoice flow ---
@login_required
def create_booking_view(request, freelancer_id):
    if request.method == "POST":
        freelancer_profile = get_object_or_404(Profile, id=freelancer_id, role='freelancer')
        
        if freelancer_profile.user == request.user:
            messages.error(request, "You cannot book yourself.")
            return redirect('talent_detail', profile_id=freelancer_id)
            
        start_date_str = request.POST.get("start_date")
        end_date_str = request.POST.get("end_date")
        description = request.POST.get("description")

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            if start_date > end_date:
                messages.error(request, "Start date cannot be after end date.")
                return redirect('talent_detail', profile_id=freelancer_id)

            booking = Booking.objects.create(
                client=request.user,
                freelancer=freelancer_profile.user,
                start_date=start_date,
                end_date=end_date,
                description=description,
                status='pending'
            )
            
            create_notification(
                user=freelancer_profile.user,
                verb="Received booking request",
                description=f"{request.user.username} requested a booking from {start_date_str} to {end_date_str}.",
                notification_type='booking'
            )
            log_activity(request.user, f"Requested Booking #{booking.id} with {freelancer_profile.user.username}.")
            
            messages.success(request, f"Booking request sent to {freelancer_profile.user.username}!")
            return redirect('dashboard')
        except ValueError:
            messages.error(request, "Invalid dates provided.")
            return redirect('talent_detail', profile_id=freelancer_id)
        except Exception as e:
            messages.error(request, f"Error booking freelancer: {str(e)}")
            return redirect('talent_detail', profile_id=freelancer_id)

    return redirect('home')

@login_required
def booking_action_view(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    if request.method == "POST":
        action = request.POST.get("action")

        # Freelancer accepts, rejects or marks completed
        if booking.freelancer == request.user:
            if action == "accept" and booking.status == "pending":
                booking.status = "accepted"
                booking.save()
                
                # Generate invoice
                delta = booking.end_date - booking.start_date
                days = max(delta.days + 1, 1)
                hours_per_day = 8
                rate = booking.freelancer.profile.hourly_rate
                amount = days * hours_per_day * rate
                
                Invoice.objects.get_or_create(booking=booking, defaults={'amount': amount, 'status': 'due'})
                
                create_notification(
                    user=booking.client,
                    verb="Booking request accepted",
                    description=f"{request.user.username} accepted your booking request. Invoice generated.",
                    notification_type='booking'
                )
                log_activity(request.user, f"Accepted Booking #{booking.id}.")
                messages.success(request, "Booking accepted and invoice issued.")
                
            elif action == "reject" and booking.status == "pending":
                booking.status = "rejected"
                booking.save()
                
                create_notification(
                    user=booking.client,
                    verb="Booking request rejected",
                    description=f"{request.user.username} declined your booking request.",
                    notification_type='booking'
                )
                log_activity(request.user, f"Rejected Booking #{booking.id}.")
                messages.success(request, "Booking request declined.")
                
            elif action == "complete" and booking.status == "accepted":
                # Ensure paid before complete (Optionally enforced or completed anyway)
                booking.status = "completed"
                booking.save()
                
                create_notification(
                    user=booking.client,
                    verb="Booking marked completed",
                    description=f"{request.user.username} marked the project as completed.",
                    notification_type='booking'
                )
                log_activity(request.user, f"Marked Booking #{booking.id} completed.")
                messages.success(request, "Booking marked as completed.")
                
        # Client cancels
        elif booking.client == request.user:
            if action == "cancel" and booking.status == "pending":
                booking.status = "cancelled"
                booking.save()
                
                create_notification(
                    user=booking.freelancer,
                    verb="Booking request cancelled",
                    description=f"Client {request.user.username} cancelled their booking request.",
                    notification_type='booking'
                )
                log_activity(request.user, f"Cancelled Booking #{booking.id}.")
                messages.success(request, "Booking request cancelled.")

        return redirect('dashboard')

    return redirect('dashboard')

@login_required
def booking_edit_view(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.client != request.user or booking.status != 'pending':
        messages.error(request, "You cannot edit this booking.")
        return redirect('dashboard')

    if request.method == "POST":
        start_date_str = request.POST.get("start_date")
        end_date_str = request.POST.get("end_date")
        description = request.POST.get("description")

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            if start_date > end_date:
                messages.error(request, "Start date cannot be after end date.")
                return render(request, "core/booking_edit.html", {"booking": booking})

            booking.start_date = start_date
            booking.end_date = end_date
            booking.description = description
            booking.save()
            
            create_notification(
                user=booking.freelancer,
                verb="Booking request updated",
                description=f"Client {request.user.username} updated the dates for Booking #{booking.id}.",
                notification_type='booking'
            )
            log_activity(request.user, f"Updated Booking #{booking.id}.")
            messages.success(request, "Booking request updated!")
            return redirect('dashboard')
        except ValueError:
            messages.error(request, "Invalid dates.")
        except Exception as e:
            messages.error(request, str(e))

    return render(request, "core/booking_edit.html", {"booking": booking})

@login_required
def booking_cancel_view(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    if booking.client != request.user or booking.status != 'pending':
        messages.error(request, "You cannot cancel this booking request.")
        return redirect('dashboard')

    if request.method == "POST":
        booking.delete()
        log_activity(request.user, f"Deleted booking request #{booking_id}.")
        messages.success(request, "Booking request cancelled and removed.")
        
    return redirect('dashboard')

# --- Checkout / Payment Simulation ---
@login_required
def pay_invoice_view(request, invoice_id):
    invoice = get_object_or_404(Invoice, id=invoice_id)
    if invoice.booking.client != request.user:
        messages.error(request, "You do not have access to pay this invoice.")
        return redirect('dashboard')
    
    if invoice.status == 'paid':
        messages.info(request, "This invoice is already paid.")
        return redirect('dashboard')

    if request.method == "POST":
        # Simulate payment processing
        payment_method = request.POST.get("payment_method", "credit_card")
        tx_id = f"TX-{uuid.uuid4().hex[:12].upper()}"
        
        # Create payment record
        Payment.objects.create(
            invoice=invoice,
            transaction_id=tx_id,
            amount=invoice.amount,
            payment_method=payment_method
        )
        
        # Update invoice
        invoice.status = 'paid'
        invoice.save()
        
        create_notification(
            user=invoice.booking.freelancer,
            verb="Payment received",
            description=f"{request.user.username} paid invoice #{invoice.id} (${invoice.amount}).",
            notification_type='payment'
        )
        log_activity(request.user, f"Paid Invoice #{invoice.id} with method {payment_method}.")
        messages.success(request, "Payment successful! Invoice marked as Paid.")
        return redirect('dashboard')

    return render(request, "core/checkout.html", {"invoice": invoice})

@login_required
def invoice_print_view(request, invoice_id):
    invoice = get_object_or_404(Invoice, id=invoice_id)
    # Ensure user is part of booking
    if invoice.booking.client != request.user and invoice.booking.freelancer != request.user:
        messages.error(request, "Access denied.")
        return redirect('dashboard')
    return render(request, "core/printable_invoice.html", {"invoice": invoice})

# --- Inbox and Messaging ---
@login_required
def messages_list_view(request):
    # Get distinct users this user has chatted with
    user = request.user
    sent = Message.objects.filter(sender=user).values_list('recipient_id', flat=True)
    received = Message.objects.filter(recipient=user).values_list('sender_id', flat=True)
    chat_partner_ids = set(list(sent) + list(received))
    
    partners = Profile.objects.filter(user_id__in=chat_partner_ids).select_related('user')
    return render(request, "core/inbox.html", {"partners": partners})

@login_required
def chat_view(request, username):
    partner = get_object_or_404(User, username=username)
    user = request.user
    
    if request.method == "POST":
        body = request.POST.get("body", "").strip()
        attachment = request.FILES.get("attachment")
        
        if body or attachment:
            msg = Message.objects.create(
                sender=user,
                recipient=partner,
                body=body,
                attachment=attachment
            )
            create_notification(
                user=partner,
                verb="New chat message",
                description=f"Received a new message from {user.username}.",
                notification_type='message'
            )
            log_activity(user, f"Sent chat message to {username}.")
            
            # If HTMX request, render only single message chunk
            if request.headers.get("HX-Request"):
                return render(request, "core/partials/single_message.html", {"message": msg})
                
        return redirect('chat', username=username)

    # Fetch messages between user and partner
    chat_messages = Message.objects.filter(
        (Q(sender=user) & Q(recipient=partner)) |
        (Q(sender=partner) & Q(recipient=user))
    ).order_by('created_at')
    
    # Mark incoming messages as read
    Message.objects.filter(sender=partner, recipient=user, is_read=False).update(is_read=True)
    
    # Conversation list on side
    sent = Message.objects.filter(sender=user).values_list('recipient_id', flat=True)
    received = Message.objects.filter(recipient=user).values_list('sender_id', flat=True)
    chat_partner_ids = set(list(sent) + list(received))
    partners = Profile.objects.filter(user_id__in=chat_partner_ids).select_related('user')

    return render(request, "core/chat.html", {
        "partner": partner,
        "chat_messages": chat_messages,
        "partners": partners
    })

# --- Notification Views ---
@login_required
def notifications_list_view(request):
    notifs = Notification.objects.filter(user=request.user).order_by('-created_at')
    return render(request, "core/notifications.html", {"notifs": notifs})

@login_required
def mark_notifications_read_view(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    messages.success(request, "All notifications marked as read.")
    return redirect('notifications')

# --- Dashboard Separation ---
@login_required
def dashboard_view(request):
    profile = request.user.profile
    today = timezone.now().date()
    six_months_ago = today - timedelta(days=180)
    
    # Base dashboard logs
    activities = ActivityLog.objects.filter(user=request.user).order_by('-timestamp')[:8]

    if profile.role == 'freelancer':
        bookings = Booking.objects.filter(freelancer=request.user).select_related('client__profile').order_by('-created_at')
        invoices = Invoice.objects.filter(booking__freelancer=request.user).select_related('booking__client').order_by('-issued_at')
        
        # Stats Aggregates
        total_bookings = bookings.count()
        pending = bookings.filter(status='pending').count()
        accepted = bookings.filter(status='accepted').count()
        completed = bookings.filter(status='completed').count()
        cancelled = bookings.filter(status='cancelled').count()
        
        # Financial Aggregates
        paid_invoices = invoices.filter(status='paid')
        total_earnings = paid_invoices.aggregate(Sum('amount'))['amount__sum'] or 0.00
        unpaid_amount = invoices.filter(status__in=['unpaid', 'due']).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        # Active Clients count
        active_clients = bookings.filter(status='accepted').values('client').distinct().count()
        
        # Monthly Chart data (past 6 months)
        earnings_by_month = {}
        for i in range(6):
            m_date = today - timedelta(days=i*30)
            m_key = m_date.strftime("%b %Y")
            earnings_by_month[m_key] = 0.00

        for inv in paid_invoices.filter(issued_at__date__gte=six_months_ago):
            m_key = inv.issued_at.strftime("%b %Y")
            if m_key in earnings_by_month:
                earnings_by_month[m_key] += float(inv.amount)
        
        # Format chart data
        chart_labels = list(reversed(list(earnings_by_month.keys())))
        chart_values = [earnings_by_month[label] for label in chart_labels]

        # Success rate completed / (completed + cancelled)
        total_finished = completed + cancelled
        success_rate = round((completed / total_finished) * 100, 1) if total_finished > 0 else 100.0

        return render(request, "core/dashboard.html", {
            "role": "freelancer",
            "bookings": bookings,
            "invoices": invoices,
            "activities": activities,
            "total_bookings": total_bookings,
            "pending": pending,
            "accepted": accepted,
            "completed": completed,
            "cancelled": cancelled,
            "total_earnings": total_earnings,
            "unpaid_amount": unpaid_amount,
            "active_clients": active_clients,
            "success_rate": success_rate,
            "chart_labels": json.dumps(chart_labels),
            "chart_values": json.dumps(chart_values),
        })
        
    else: # Client Role
        bookings = Booking.objects.filter(client=request.user).select_related('freelancer__profile').order_by('-created_at')
        invoices = Invoice.objects.filter(booking__client=request.user).select_related('booking__freelancer').order_by('-issued_at')
        
        # Stats
        total_projects = bookings.count()
        completed = bookings.filter(status='completed').count()
        active = bookings.filter(status='accepted').count()
        pending = bookings.filter(status='pending').count()
        rejected = bookings.filter(status='rejected').count()
        
        # Finance
        total_paid = invoices.filter(status='paid').aggregate(Sum('amount'))['amount__sum'] or 0.00
        outstanding = invoices.filter(status__in=['unpaid', 'due']).aggregate(Sum('amount'))['amount__sum'] or 0.00
        
        # Favourite freelancers count
        favourites_count = Favourite.objects.filter(user=request.user).count()

        return render(request, "core/dashboard.html", {
            "role": "client",
            "bookings": bookings,
            "invoices": invoices,
            "activities": activities,
            "total_projects": total_projects,
            "completed": completed,
            "active": active,
            "pending": pending,
            "rejected": rejected,
            "total_paid": total_paid,
            "outstanding": outstanding,
            "favourites_count": favourites_count,
        })

# --- Custom Admin Dashboard ---
@login_required
def admin_dashboard_view(request):
    if not request.user.is_staff:
        messages.error(request, "Staff clearance required.")
        return redirect('home')

    today = timezone.now().date()
    six_months_ago = today - timedelta(days=180)

    # General Stats
    total_users = User.objects.count()
    clients = Profile.objects.filter(role='client').count()
    freelancers = Profile.objects.filter(role='freelancer').count()
    total_bookings = Booking.objects.count()
    total_invoices = Invoice.objects.count()
    
    # Financial aggregate
    revenue = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0.00

    recent_users = User.objects.select_related('profile').order_by('-date_joined')[:5]
    recent_bookings = Booking.objects.select_related('client', 'freelancer').order_by('-created_at')[:5]
    recent_payments = Payment.objects.select_related('invoice__booking__client').order_by('-created_at')[:5]

    # Revenue Chart Data (past 6 months)
    revenue_by_month = {}
    for i in range(6):
        m_date = today - timedelta(days=i*30)
        m_key = m_date.strftime("%b %Y")
        revenue_by_month[m_key] = 0.00

    payments = Payment.objects.filter(created_at__date__gte=six_months_ago)
    for pay in payments:
        m_key = pay.created_at.strftime("%b %Y")
        if m_key in revenue_by_month:
            revenue_by_month[m_key] += float(pay.amount)
            
    chart_labels = list(reversed(list(revenue_by_month.keys())))
    chart_values = [revenue_by_month[label] for label in chart_labels]

    return render(request, "core/admin_dashboard.html", {
        "total_users": total_users,
        "clients": clients,
        "freelancers": freelancers,
        "total_bookings": total_bookings,
        "total_invoices": total_invoices,
        "revenue": revenue,
        "recent_users": recent_users,
        "recent_bookings": recent_bookings,
        "recent_payments": recent_payments,
        "chart_labels": json.dumps(chart_labels),
        "chart_values": json.dumps(chart_values),
    })

# --- Backward Compatible API View ---
@api_view(["GET"])
def student_list(request):
    students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)