from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Avg, Count, Sum
from django.conf import settings
from django.utils.http import url_has_allowed_host_and_scheme
from django.http import Http404
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from decimal import Decimal
import json
import uuid

from .models import (
    Student, Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment, ActivityLog,
    normalize_skill_name
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
    Only complete, published freelancer profiles are listed publicly.
    """
    freelancers = Profile.objects.public_freelancers().select_related('user').prefetch_related('skills__skill')
    
    # Advanced Filters
    query = request.GET.get('q', '').strip()
    if query:
        safe_query = query[:100]
        freelancers = freelancers.filter(
            Q(user__username__icontains=safe_query) |
            Q(user__first_name__icontains=safe_query) |
            Q(user__last_name__icontains=safe_query) |
            Q(title__icontains=safe_query) |
            Q(bio__icontains=safe_query)
        )
        
    skill_query = request.GET.get('skill', '').strip()
    if skill_query:
        safe_skill = skill_query[:100]
        freelancers = freelancers.filter(skills__skill__name__icontains=safe_skill)
        
    min_rate_raw = request.GET.get('min_rate', '').strip()
    max_rate_raw = request.GET.get('max_rate', '').strip()
    
    min_rate = None
    max_rate = None
    
    if min_rate_raw:
        try:
            val = Decimal(min_rate_raw)
            if val > 0:
                min_rate = val
        except (ValueError, ArithmeticError):
            pass
            
    if max_rate_raw:
        try:
            val = Decimal(max_rate_raw)
            if val > 0:
                max_rate = val
        except (ValueError, ArithmeticError):
            pass
            
    if min_rate is not None and max_rate is not None and min_rate > max_rate:
        messages.warning(request, "Minimum rate cannot exceed maximum rate.")
    else:
        if min_rate is not None:
            freelancers = freelancers.filter(hourly_rate__gte=min_rate)
        if max_rate is not None:
            freelancers = freelancers.filter(hourly_rate__lte=max_rate)
        
    location = request.GET.get('location', '').strip()
    if location:
        freelancers = freelancers.filter(location__icontains=location[:100])
        
    experience_raw = request.GET.get('experience', '').strip()
    experience = None
    if experience_raw:
        try:
            exp_val = int(experience_raw)
            if exp_val >= 0:
                experience = exp_val
                freelancers = freelancers.filter(experience_years__gte=experience)
        except (ValueError, TypeError):
            pass
        
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
    
    min_rating_raw = request.GET.get('rating', '').strip()
    min_rating = None
    if min_rating_raw:
        try:
            rating_val = float(min_rating_raw)
            if 0 <= rating_val <= 5:
                min_rating = min_rating_raw
                freelancers = freelancers.filter(avg_rating__gte=rating_val)
        except (ValueError, TypeError):
            pass
        
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

    # Recently Viewed (Session-based) - only complete profiles
    recently_viewed_ids = request.session.get('recently_viewed', [])
    recently_viewed = []
    if recently_viewed_ids:
        recently_viewed = Profile.objects.public_freelancers().filter(id__in=recently_viewed_ids).select_related('user')

    return render(request, "core/home.html", {
        "freelancers": freelancers,
        "query": query,
        "skill_query": skill_query,
        "min_rate": min_rate_raw,
        "max_rate": max_rate_raw,
        "location": location,
        "experience": experience_raw,
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

        if role not in ('client', 'freelancer'):
            messages.error(request, "Invalid account role selected.")
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
    next_url = request.POST.get("next") or request.GET.get("next")

    if request.user.is_authenticated:
        if next_url:
            is_safe = url_has_allowed_host_and_scheme(
                url=next_url,
                allowed_hosts={request.get_host()},
                require_https=request.is_secure()
            )
            if is_safe:
                return redirect(next_url)
        return redirect('home')

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            log_activity(user, "Logged in.")
            messages.success(request, f"Welcome back, {username}!")
            if next_url:
                is_safe = url_has_allowed_host_and_scheme(
                    url=next_url,
                    allowed_hosts={request.get_host()},
                    require_https=request.is_secure()
                )
                if is_safe:
                    return redirect(next_url)
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password.")
            return render(request, "core/login.html", {"next": next_url})

    return render(request, "core/login.html", {"next": next_url})

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
            bio = request.POST.get("bio", "").strip()
            age_raw = request.POST.get("age", 18)
            contact_email = request.POST.get("contact_email", "").strip()
            location = request.POST.get("location", "").strip()
            
            try:
                profile.age = int(age_raw)
            except (ValueError, TypeError):
                profile.age = 18
                
            profile.bio = bio
            profile.contact_email = contact_email
            profile.location = location
            
            first_name = request.POST.get("first_name", "").strip()
            last_name = request.POST.get("last_name", "").strip()
            if first_name or last_name:
                request.user.first_name = first_name
                request.user.last_name = last_name
                request.user.save()
            
            if request.FILES.get("avatar"):
                profile.avatar = request.FILES.get("avatar")
            
            if profile.role == 'freelancer':
                title = request.POST.get("title", "").strip()
                hourly_rate_raw = request.POST.get("hourly_rate")
                experience_raw = request.POST.get("experience_years", 0)
                
                # Priority 2: Strict backend validation for hourly rate > 0
                if hourly_rate_raw is None or str(hourly_rate_raw).strip() == "":
                    messages.error(request, "Hourly rate must be greater than $0.")
                    return render(request, "core/profile_edit.html", {
                        "profile": profile,
                        "current_skills": FreelancerSkill.objects.filter(profile=profile).select_related('skill'),
                        "portfolio_items": Portfolio.objects.filter(profile=profile)
                    }, status=400)
                
                try:
                    hourly_rate_val = Decimal(str(hourly_rate_raw).strip())
                    if hourly_rate_val <= Decimal('0'):
                        messages.error(request, "Hourly rate must be greater than $0.")
                        return render(request, "core/profile_edit.html", {
                            "profile": profile,
                            "current_skills": FreelancerSkill.objects.filter(profile=profile).select_related('skill'),
                            "portfolio_items": Portfolio.objects.filter(profile=profile)
                        }, status=400)
                    profile.hourly_rate = hourly_rate_val
                except (ValueError, ArithmeticError, TypeError):
                    messages.error(request, "Hourly rate must be greater than $0.")
                    return render(request, "core/profile_edit.html", {
                        "profile": profile,
                        "current_skills": FreelancerSkill.objects.filter(profile=profile).select_related('skill'),
                        "portfolio_items": Portfolio.objects.filter(profile=profile)
                    }, status=400)
                
                # Experience validation >= 0
                try:
                    exp_val = int(experience_raw)
                    if exp_val < 0:
                        messages.error(request, "Experience cannot be negative.")
                        return render(request, "core/profile_edit.html", {
                            "profile": profile,
                            "current_skills": FreelancerSkill.objects.filter(profile=profile).select_related('skill'),
                            "portfolio_items": Portfolio.objects.filter(profile=profile)
                        }, status=400)
                    profile.experience_years = exp_val
                except (ValueError, TypeError):
                    messages.error(request, "Invalid experience value.")
                    return render(request, "core/profile_edit.html", {
                        "profile": profile,
                        "current_skills": FreelancerSkill.objects.filter(profile=profile).select_related('skill'),
                        "portfolio_items": Portfolio.objects.filter(profile=profile)
                    }, status=400)

                profile.title = title
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
            raw_skill_name = request.POST.get("skill_name", "").strip()
            if raw_skill_name:
                canonical_name = normalize_skill_name(raw_skill_name)
                skill = Skill.objects.filter(name__iexact=canonical_name).first()
                if not skill:
                    skill = Skill.objects.create(name=canonical_name)
                FreelancerSkill.objects.get_or_create(profile=profile, skill=skill)
                messages.success(request, f"Added skill: {skill.name}")
                
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
    
    # Priority 1: Prevent public access to incomplete profiles
    is_owner = request.user.is_authenticated and freelancer.user == request.user
    is_staff = request.user.is_authenticated and request.user.is_staff
    
    if not freelancer.is_complete() and not is_owner and not is_staff:
        raise Http404("Freelancer profile is unpublished or incomplete.")
    
    # Increment views count
    if request.user.is_authenticated and freelancer.user != request.user:
        freelancer.views_count += 1
        freelancer.save()

    # Session storage for recently viewed (only if complete)
    if freelancer.is_complete():
        recently_viewed = request.session.get('recently_viewed', [])
        if freelancer.id not in recently_viewed:
            recently_viewed.insert(0, freelancer.id)
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
        if not can_review:
            messages.error(request, "You cannot review this freelancer.")
            return redirect('talent_detail', profile_id=profile_id)
            
        try:
            rating_val = int(request.POST.get("rating", 5))
            if rating_val < 1 or rating_val > 5:
                rating_val = 5
        except (ValueError, TypeError):
            rating_val = 5
            
        comment = request.POST.get("comment", "").strip()
        
        Review.objects.create(
            reviewer=request.user,
            reviewee=freelancer.user,
            rating=rating_val,
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
        "is_owner": is_owner,
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

            today = timezone.now().date()
            if start_date < today:
                messages.error(request, "Start date cannot be in the past.")
                return redirect('talent_detail', profile_id=freelancer_id)

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

            today = timezone.now().date()
            if start_date < today:
                messages.error(request, "Start date cannot be in the past.")
                return render(request, "core/booking_edit.html", {"booking": booking})

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
        
        if attachment:
            import os
            ext = os.path.splitext(attachment.name)[1].lower()
            allowed_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.docx', '.doc', '.xls', '.xlsx', '.txt', '.zip', '.rar', '.tar.gz', '.csv']
            if ext not in allowed_extensions:
                messages.error(request, "Unsupported file attachment. Only PDF, DOCX, ZIP, TXT, CSV, and images are allowed.")
                return redirect('chat', username=username)
        
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