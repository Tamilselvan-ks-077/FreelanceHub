from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg

# Kept for backward compatibility
class Student(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    email = models.EmailField()

    def __str__(self):
        return self.name

# Role choices for users
ROLE_CHOICES = (
    ('client', 'Client'),
    ('freelancer', 'Freelancer'),
)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    bio = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    age = models.IntegerField(default=18)
    contact_email = models.EmailField(blank=True, null=True)
    
    # Premium features
    cover_banner = models.ImageField(upload_to='banners/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    location = models.CharField(max_length=100, blank=True, null=True)
    experience_years = models.IntegerField(default=0)
    availability = models.BooleanField(default=True)
    response_rate = models.IntegerField(default=100)
    response_time = models.CharField(max_length=50, default='1 hour')
    views_count = models.IntegerField(default=0)
    
    education = models.TextField(blank=True, null=True)
    experience_detail = models.TextField(blank=True, null=True)
    certificates = models.TextField(blank=True, null=True)
    languages = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    def get_average_rating(self):
        avg = Review.objects.filter(reviewee=self.user).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def get_completed_projects_count(self):
        return Booking.objects.filter(freelancer=self.user, status='completed').count()

    def get_reviews_count(self):
        return Review.objects.filter(reviewee=self.user).count()

class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Freelancer skill relations
class FreelancerSkill(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('profile', 'skill')

    def __str__(self):
        return f"{self.profile.user.username} - {self.skill.name}"

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_made')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings_received')
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.id}: {self.client.username} -> {self.freelancer.username} ({self.status})"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('due', 'Payment Due'),
    )
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='invoice')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice #{self.id} for Booking #{self.booking.id} ({self.status})"

class Review(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.reviewer.username} -> {self.reviewee.username} ({self.rating}★)"

class Portfolio(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='portfolio_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='portfolio/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    external_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Portfolio: {self.title} for {self.profile.user.username}"

class Notification(models.Model):
    TYPE_CHOICES = (
        ('booking', 'Booking Request'),
        ('payment', 'Payment'),
        ('message', 'Message'),
        ('profile', 'Profile Action'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    verb = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='booking')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.verb}"

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    body = models.TextField()
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message: {self.sender.username} -> {self.recipient.username}"

class Favourite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourites')
    freelancer = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'freelancer')

    def __str__(self):
        return f"{self.user.username} liked {self.freelancer.user.username}"

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='credit_card')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.transaction_id} - ${self.amount}"

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} @ {self.timestamp}"

# Signal receivers to automatically create/save Profile when User is saved
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)