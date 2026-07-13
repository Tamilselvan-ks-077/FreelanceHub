from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from .models import Student, Profile, Skill, FreelancerSkill, Booking, Invoice
from .serializers import StudentSerializer

def home(request):
    """
    Renders the FreelanceHub home page showing registered members.
    Supports GET filtering/searching by title, name, bio, and skill.
    """
    freelancers = Profile.objects.filter(role='freelancer').select_related('user').prefetch_related('skills__skill').order_by('-id')
    
    # Text search
    query = request.GET.get('q')
    if query:
        freelancers = freelancers.filter(
            Q(user__username__icontains=query) |
            Q(title__icontains=query) |
            Q(bio__icontains=query)
        )
        
    # Skill filter
    skill_query = request.GET.get('skill')
    if skill_query:
        freelancers = freelancers.filter(skills__skill__name__icontains=skill_query.strip())
        
    return render(request, "core/home.html", {
        "freelancers": freelancers,
        "query": query,
        "skill_query": skill_query
    })

def signup_view(request):
    """
    Registers a new user with a specific role ('client' or 'freelancer').
    """
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
            # Create user
            user = User.objects.create_user(username=username, email=email, password=password)
            # Update user role on profile (profile is auto-created by signals)
            profile = user.profile
            profile.role = role
            profile.contact_email = email
            profile.save()

            messages.success(request, f"Account created successfully for {username}!")
            auth_login(request, user)
            return redirect('home')
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return redirect('signup')

    return render(request, "core/signup.html")

def login_view(request):
    """
    Logs in an existing user.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            messages.success(request, f"Welcome back, {username}!")
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password.")
            return redirect('login')

    return render(request, "core/login.html")

def logout_view(request):
    """
    Logs out the user.
    """
    auth_logout(request)
    messages.success(request, "You have been logged out.")
    return redirect('login')

@login_required
def profile_edit_view(request):
    """
    Allows a user (Freelancer or Client) to update their profile information.
    Freelancers can additionally manage their skills.
    """
    profile = request.user.profile

    if request.method == "POST":
        action = request.POST.get("action")
        
        if action == "update_profile":
            if profile.role == 'freelancer':
                profile.title = request.POST.get("title")
                profile.hourly_rate = request.POST.get("hourly_rate", 0.00)
            
            profile.bio = request.POST.get("bio")
            profile.age = request.POST.get("age", 18)
            profile.contact_email = request.POST.get("contact_email")
            profile.save()
            messages.success(request, "Profile updated successfully!")
            
        elif action == "add_skill" and profile.role == 'freelancer':
            skill_name = request.POST.get("skill_name", "").strip()
            if skill_name:
                skill, created = Skill.objects.get_or_create(name=skill_name)
                # Avoid duplicate skill tags
                FreelancerSkill.objects.get_or_create(profile=profile, skill=skill)
                messages.success(request, f"Added skill: {skill_name}")
                
        elif action == "remove_skill" and profile.role == 'freelancer':
            skill_id = request.POST.get("skill_id")
            if skill_id:
                FreelancerSkill.objects.filter(profile=profile, skill_id=skill_id).delete()
                messages.success(request, "Skill removed.")
                
        return redirect('profile_edit')

    current_skills = FreelancerSkill.objects.filter(profile=profile).select_related('skill') if profile.role == 'freelancer' else []
    return render(request, "core/profile_edit.html", {
        "profile": profile,
        "current_skills": current_skills
    })

def talent_detail_view(request, profile_id):
    """
    Displays detail info for a freelancer profile.
    """
    freelancer = get_object_or_404(Profile, id=profile_id, role='freelancer')
    return render(request, "core/talent_detail.html", {"freelancer": freelancer})

@login_required
def create_booking_view(request, freelancer_id):
    """
    Handles booking requests made by a client to a freelancer.
    """
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

            Booking.objects.create(
                client=request.user,
                freelancer=freelancer_profile.user,
                start_date=start_date,
                end_date=end_date,
                description=description,
                status='pending'
            )
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
    """
    Allows freelancers to accept, reject or complete a booking request.
    If accepted, automatically creates an invoice.
    """
    booking = get_object_or_404(Booking, id=booking_id)

    # Security check: only the freelancer can modify the booking
    if booking.freelancer != request.user:
        messages.error(request, "You do not have permission to modify this booking.")
        return redirect('dashboard')

    if request.method == "POST":
        action = request.POST.get("action")

        if action == "accept" and booking.status == "pending":
            booking.status = "accepted"
            booking.save()
            
            # Generate invoice based on date duration
            delta = booking.end_date - booking.start_date
            days = max(delta.days + 1, 1)
            hours_per_day = 8
            rate = booking.freelancer.profile.hourly_rate
            amount = days * hours_per_day * rate
            
            Invoice.objects.get_or_create(booking=booking, defaults={'amount': amount})
            messages.success(request, "Booking accepted and invoice generated.")
            
        elif action == "reject" and booking.status == "pending":
            booking.status = "rejected"
            booking.save()
            messages.success(request, "Booking request declined.")
            
        elif action == "complete" and booking.status == "accepted":
            booking.status = "completed"
            booking.save()
            messages.success(request, "Booking marked as completed.")
            
        return redirect('dashboard')

    return redirect('dashboard')

@login_required
def pay_invoice_view(request, invoice_id):
    """
    Allows clients to pay an invoice.
    """
    invoice = get_object_or_404(Invoice, id=invoice_id)

    # Security check: only the client who booked can pay the invoice
    if invoice.booking.client != request.user:
        messages.error(request, "You do not have permission to pay this invoice.")
        return redirect('dashboard')

    if request.method == "POST":
        invoice.status = 'paid'
        invoice.save()
        messages.success(request, "Invoice paid successfully!")
        return redirect('dashboard')

    return redirect('dashboard')

@login_required
def dashboard_view(request):
    """
    Displays the user's booking requests and invoices depending on their role.
    """
    profile = request.user.profile
    
    if profile.role == 'client':
        bookings = Booking.objects.filter(client=request.user).select_related('freelancer__profile').order_by('-created_at')
        invoices = Invoice.objects.filter(booking__client=request.user).select_related('booking__freelancer').order_by('-issued_at')
    else:
        bookings = Booking.objects.filter(freelancer=request.user).select_related('client__profile').order_by('-created_at')
        invoices = Invoice.objects.filter(booking__freelancer=request.user).select_related('booking__client').order_by('-issued_at')

    return render(request, "core/dashboard.html", {
        "bookings": bookings,
        "invoices": invoices
    })

@login_required
def booking_edit_view(request, booking_id):
    """
    Allows a client to edit a pending booking request.
    """
    booking = get_object_or_404(Booking, id=booking_id)

    # Security check: only the client who created the booking can edit it
    if booking.client != request.user:
        messages.error(request, "You do not have permission to edit this booking request.")
        return redirect('dashboard')

    # Security check: booking must still be pending
    if booking.status != 'pending':
        messages.error(request, "You can only edit pending booking requests.")
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
            
            messages.success(request, "Booking request updated successfully!")
            return redirect('dashboard')
        except ValueError:
            messages.error(request, "Invalid dates provided.")
        except Exception as e:
            messages.error(request, f"Error updating booking: {str(e)}")

    return render(request, "core/booking_edit.html", {"booking": booking})

@login_required
def booking_cancel_view(request, booking_id):
    """
    Allows a client to cancel (delete) a pending booking request.
    """
    booking = get_object_or_404(Booking, id=booking_id)

    # Security check: only the client who created the booking can cancel it
    if booking.client != request.user:
        messages.error(request, "You do not have permission to cancel this booking request.")
        return redirect('dashboard')

    # Security check: booking must still be pending
    if booking.status != 'pending':
        messages.error(request, "You can only cancel pending booking requests.")
        return redirect('dashboard')

    if request.method == "POST":
        booking.delete()
        messages.success(request, "Booking request cancelled and removed successfully.")
        
    return redirect('dashboard')

@api_view(["GET"])
def student_list(request):
    """
    API endpoint that returns a JSON list of all registered students.
    """
    students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)    