from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Profile, Booking, Invoice, Review, Portfolio, Skill, FreelancerSkill, Payment
import datetime

class FreelanceHubWorkflowTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create client user
        self.client_user = User.objects.create_user(username='client12', email='client12@example.com', password='pass12345')
        self.client_profile = self.client_user.profile
        self.client_profile.role = 'client'
        self.client_profile.save()

        # Create freelancer user
        self.freelancer_user = User.objects.create_user(username='expert99', email='expert99@example.com', password='pass12345')
        self.freelancer_profile = self.freelancer_user.profile
        self.freelancer_profile.role = 'freelancer'
        self.freelancer_profile.title = 'Principal Django Architect'
        self.freelancer_profile.hourly_rate = 95.00
        self.freelancer_profile.experience_years = 7
        self.freelancer_profile.availability = True
        self.freelancer_profile.save()

        # Create skills
        self.skill_django = Skill.objects.create(name='Django')
        FreelancerSkill.objects.create(profile=self.freelancer_profile, skill=self.skill_django)

    def test_profile_averages_and_count(self):
        """Test profile reviews averages helper metrics"""
        self.assertEqual(self.freelancer_profile.get_reviews_count(), 0)
        self.assertEqual(self.freelancer_profile.get_average_rating(), 0.0)

    def test_booking_and_invoice_workflow(self):
        """Test end to end workflow: Create booking -> Accept -> Generate Invoice -> Pay -> Complete -> Review"""
        # 1. Log in client
        self.client.login(username='client12', password='pass12345')

        # 2. Create booking request
        booking_data = {
            'start_date': (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d'),
            'end_date': (datetime.date.today() + datetime.timedelta(days=7)).strftime('%Y-%m-%d'),
            'description': 'Need help with advanced marketplace features.'
        }
        response = self.client.post(reverse('create_booking', args=[self.freelancer_profile.id]), booking_data)
        self.assertEqual(response.status_code, 302) # Redirect to home/talent detail
        
        booking = Booking.objects.first()
        self.assertIsNotNone(booking)
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.client, self.client_user)
        self.assertEqual(booking.freelancer, self.freelancer_user)

        # 3. Log in freelancer
        self.client.login(username='expert99', password='pass12345')

        # 4. Accept booking (this generates an invoice)
        response = self.client.post(reverse('booking_action', args=[booking.id]), {'action': 'accept'})
        self.assertEqual(response.status_code, 302)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'accepted')

        invoice = Invoice.objects.first()
        self.assertIsNotNone(invoice)
        self.assertEqual(invoice.status, 'due')
        self.assertEqual(invoice.booking, booking)

        # 5. Log in client to pay invoice
        self.client.login(username='client12', password='pass12345')
        pay_response = self.client.post(reverse('pay_invoice', args=[invoice.id]), {'payment_method': 'stripe'})
        self.assertEqual(pay_response.status_code, 302)

        invoice.refresh_from_db()
        self.assertEqual(invoice.status, 'paid')
        self.assertEqual(Payment.objects.count(), 1)

        # 6. Log in freelancer to complete booking
        self.client.login(username='expert99', password='pass12345')
        response = self.client.post(reverse('booking_action', args=[booking.id]), {'action': 'complete'})
        self.assertEqual(response.status_code, 302)

        booking.refresh_from_db()
        self.assertEqual(booking.status, 'completed')

        # 7. Log in client to leave review
        self.client.login(username='client12', password='pass12345')
        review_data = {
            'rating': 5,
            'comment': 'Outstanding Django architecture and delivery speed!'
        }
        response = self.client.post(reverse('talent_detail', args=[self.freelancer_profile.id]), review_data)
        self.assertEqual(response.status_code, 302)

        review = Review.objects.first()
        self.assertIsNotNone(review)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Outstanding Django architecture and delivery speed!')
        self.assertEqual(review.reviewer, self.client_user)

        self.freelancer_profile.refresh_from_db()
        self.assertEqual(self.freelancer_profile.get_reviews_count(), 1)
        self.assertEqual(self.freelancer_profile.get_average_rating(), 5.0)
