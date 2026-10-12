import uuid
from datetime import date, timedelta
from django.test import TestCase, Client
from django.contrib.auth.models import User
from core.models import Profile, Booking, Invoice, Payment

class HardeningAndSecurityTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.client_user = User.objects.create_user(username='client1', password='Password123!', email='client1@example.com')
        self.freelancer_user = User.objects.create_user(username='artisan1', password='Password123!', email='artisan1@example.com')
        
        self.freelancer_profile = self.freelancer_user.profile
        self.freelancer_profile.role = 'freelancer'
        self.freelancer_profile.hourly_rate = 100.00
        self.freelancer_profile.save()

    def test_health_check_endpoints(self):
        # Test API v1 health
        res = self.client.get('/api/v1/health/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'healthy')
        self.assertEqual(res.json()['database'], 'connected')

        # Test root /health/
        root_res = self.client.get('/health/')
        self.assertEqual(root_res.status_code, 200)
        self.assertEqual(root_res.json()['status'], 'healthy')

    def test_payment_idempotency(self):
        self.client.force_login(self.client_user)
        booking = Booking.objects.create(
            client=self.client_user,
            freelancer=self.freelancer_user,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2),
            status='completed',
        )
        invoice = Invoice.objects.create(booking=booking, amount=200.00, status='unpaid')

        idempotency_key = f"idem-key-{uuid.uuid4()}"

        # 1st payment request
        res1 = self.client.post(
            f'/api/v1/invoices/{invoice.id}/pay/',
            data={'payment_method': 'credit_card'},
            content_type='application/json',
            HTTP_IDEMPOTENCY_KEY=idempotency_key
        )
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()['message'], 'Payment successful.')

        # Verify only 1 payment was created
        self.assertEqual(Payment.objects.filter(invoice=invoice).count(), 1)
        self.assertEqual(invoice.payments.first().idempotency_key, idempotency_key)

        # 2nd identical request with same idempotency key
        res2 = self.client.post(
            f'/api/v1/invoices/{invoice.id}/pay/',
            data={'payment_method': 'credit_card'},
            content_type='application/json',
            HTTP_IDEMPOTENCY_KEY=idempotency_key
        )
        self.assertEqual(res2.status_code, 200)
        self.assertTrue(res2.json().get('idempotent'))
        # Still only 1 payment
        self.assertEqual(Payment.objects.filter(invoice=invoice).count(), 1)

    def test_duplicate_booking_prevention(self):
        self.client.force_login(self.client_user)
        today = date.today()
        # Create first booking
        res1 = self.client.post(
            f'/api/v1/bookings/create/{self.freelancer_profile.id}/',
            data={
                'start_date': today.isoformat(),
                'end_date': (today + timedelta(days=5)).isoformat(),
                'description': 'First project',
            },
            content_type='application/json'
        )
        self.assertEqual(res1.status_code, 201)

        # Attempt to create duplicate overlapping booking
        res2 = self.client.post(
            f'/api/v1/bookings/create/{self.freelancer_profile.id}/',
            data={
                'start_date': (today + timedelta(days=2)).isoformat(),
                'end_date': (today + timedelta(days=7)).isoformat(),
                'description': 'Duplicate overlapping project',
            },
            content_type='application/json'
        )
        self.assertEqual(res2.status_code, 400)
        self.assertIn('already exists', res2.json()['error'])
