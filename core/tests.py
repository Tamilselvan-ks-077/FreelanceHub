from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from decimal import Decimal
import datetime

from .models import (
    Profile, Booking, Invoice, Review, Portfolio, Skill, FreelancerSkill, Payment,
    Message, normalize_skill_name
)

class FreelanceHubWorkflowTests(TestCase):
    def setUp(self):
        self.client = Client()
        # Create client user
        self.client_user = User.objects.create_user(username='client12', email='client12@example.com', password='pass12345')
        self.client_profile = self.client_user.profile
        self.client_profile.role = 'client'
        self.client_profile.save()

        # Create freelancer user
        self.freelancer_user = User.objects.create_user(
            username='expert99', 
            first_name='Alan',
            last_name='Turing',
            email='expert99@example.com', 
            password='pass12345'
        )
        self.freelancer_profile = self.freelancer_user.profile
        self.freelancer_profile.role = 'freelancer'
        self.freelancer_profile.title = 'Principal Django Architect'
        self.freelancer_profile.bio = 'Expert Python & Django systems architect with 7 years experience.'
        self.freelancer_profile.location = 'London, UK'
        self.freelancer_profile.hourly_rate = Decimal('95.00')
        self.freelancer_profile.experience_years = 7
        self.freelancer_profile.availability = True
        self.freelancer_profile.save()

        # Create skills
        self.skill_django = Skill.objects.create(name='Django')
        FreelancerSkill.objects.create(profile=self.freelancer_profile, skill=self.skill_django)

    def test_profile_averages_and_zero_reviews(self):
        """Priority 4: Test that 0 reviews returns None and count 0 (not 0.0)"""
        self.assertEqual(self.freelancer_profile.get_reviews_count(), 0)
        self.assertIsNone(self.freelancer_profile.get_average_rating())

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
        self.assertEqual(response.status_code, 302)
        
        booking = Booking.objects.first()
        self.assertIsNotNone(booking)
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.client, self.client_user)
        self.assertEqual(booking.freelancer, self.freelancer_user)

        # 3. Log in freelancer
        self.client.login(username='expert99', password='pass12345')

        # 4. Accept booking (generates invoice)
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


class Priority1ProfileCompletenessTests(TestCase):
    """PRIORITY 1: Freelancers must NOT appear publicly unless profile has all required fields."""

    def setUp(self):
        self.client = Client()
        self.fl_user = User.objects.create_user(
            username='incomplete_fl',
            first_name='Incomplete',
            last_name='User',
            email='inc@test.com',
            password='Password123!'
        )
        self.profile = self.fl_user.profile
        self.profile.role = 'freelancer'
        self.profile.save()

    def test_incomplete_profile_excluded_from_explore(self):
        """Incomplete profiles must not appear in the Explore directory."""
        self.assertFalse(self.profile.is_complete())
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'incomplete_fl')
        self.assertEqual(len(response.context['freelancers']), 0)

    def test_incomplete_profile_blocks_public_direct_view(self):
        """Unauthenticated or other public users cannot view an incomplete profile."""
        response = self.client.get(reverse('talent_detail', args=[self.profile.id]))
        self.assertEqual(response.status_code, 404)

    def test_incomplete_profile_accessible_by_owner(self):
        """Owner can view their own incomplete profile with status alert."""
        self.client.login(username='incomplete_fl', password='Password123!')
        response = self.client.get(reverse('talent_detail', args=[self.profile.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Profile Incomplete')

    def test_completed_profile_becomes_public(self):
        """When all required fields are provided, profile becomes complete and publicly visible."""
        self.profile.title = 'Full-Stack Developer'
        self.profile.bio = 'Experienced full stack engineer.'
        self.profile.location = 'Austin, TX'
        self.profile.hourly_rate = Decimal('70.00')
        self.profile.experience_years = 4
        self.profile.availability = True
        self.profile.save()
        
        skill = Skill.objects.create(name='Python')
        FreelancerSkill.objects.create(profile=self.profile, skill=skill)
        
        self.assertTrue(self.profile.is_complete())
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Incomplete User')
        self.assertEqual(len(response.context['freelancers']), 1)


class Priority2HourlyRateValidationTests(TestCase):
    """PRIORITY 2: Reject $0, negative, NaN, non-numeric rates with HTTP 400 on backend."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='rate_tester', email='rt@test.com', password='Password123!')
        self.user.profile.role = 'freelancer'
        self.user.profile.save()
        self.client.login(username='rate_tester', password='Password123!')

    def _post_profile_rate(self, rate_val):
        return self.client.post(reverse('profile_edit'), {
            'action': 'update_profile',
            'title': 'Senior Engineer',
            'bio': 'Valid bio description here.',
            'location': 'New York, US',
            'hourly_rate': rate_val,
            'experience_years': 5,
            'availability': 'true'
        })

    def test_reject_zero_hourly_rate(self):
        response = self._post_profile_rate('0')
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'Hourly rate must be greater than $0.', status_code=400)

    def test_reject_zero_float_hourly_rate(self):
        response = self._post_profile_rate('0.00')
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'Hourly rate must be greater than $0.', status_code=400)

    def test_reject_negative_hourly_rate(self):
        response = self._post_profile_rate('-10')
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'Hourly rate must be greater than $0.', status_code=400)

    def test_reject_non_numeric_string_hourly_rate(self):
        response = self._post_profile_rate('abc')
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'Hourly rate must be greater than $0.', status_code=400)

    def test_reject_empty_hourly_rate(self):
        response = self._post_profile_rate('')
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, 'Hourly rate must be greater than $0.', status_code=400)

    def test_accept_valid_positive_hourly_rate(self):
        response = self._post_profile_rate('50.00')
        self.assertEqual(response.status_code, 302)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.hourly_rate, Decimal('50.00'))

    def test_accept_one_dollar_hourly_rate(self):
        response = self._post_profile_rate('1.00')
        self.assertEqual(response.status_code, 302)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.hourly_rate, Decimal('1.00'))


class Priority4ReviewDisplayAndCalculationTests(TestCase):
    """PRIORITY 4: Zero reviews display 'No reviews yet', ratings calculated correctly without division-by-zero."""

    def setUp(self):
        self.client = Client()
        self.fl_user = User.objects.create_user(username='rev_fl', email='rev@test.com', password='Password123!')
        p = self.fl_user.profile
        p.role = 'freelancer'
        p.title = 'Tech Lead'
        p.bio = 'Great bio.'
        p.location = 'Seattle, WA'
        p.hourly_rate = Decimal('100.00')
        p.experience_years = 5
        p.save()
        s = Skill.objects.create(name='Python')
        FreelancerSkill.objects.create(profile=p, skill=s)

        self.c1 = User.objects.create_user(username='c1', password='Password123!')
        self.c2 = User.objects.create_user(username='c2', password='Password123!')

    def test_zero_review_html_display(self):
        response = self.client.get(reverse('home'))
        self.assertContains(response, 'No reviews yet')
        self.assertNotContains(response, '0.0 (0 reviews)')
        self.assertNotContains(response, '0.0 (0 review')

    def test_multiple_reviews_calculation(self):
        p = self.fl_user.profile
        # Add 2 reviews: 5 and 4 -> average 4.5
        Review.objects.create(reviewer=self.c1, reviewee=self.fl_user, rating=5, comment='Superb')
        Review.objects.create(reviewer=self.c2, reviewee=self.fl_user, rating=4, comment='Good')
        
        self.assertEqual(p.get_reviews_count(), 2)
        self.assertEqual(p.get_average_rating(), 4.5)

        response = self.client.get(reverse('home'))
        self.assertContains(response, '4.5')
        self.assertContains(response, '(2 reviews)')


class Priority5SkillNormalizationTests(TestCase):
    """PRIORITY 5: Canonical skill normalization (case-insensitive storage/search, clean display)."""

    def test_skill_name_canonicalization(self):
        self.assertEqual(normalize_skill_name('react'), 'React')
        self.assertEqual(normalize_skill_name('REACT'), 'React')
        self.assertEqual(normalize_skill_name('python'), 'Python')
        self.assertEqual(normalize_skill_name('PYTHON'), 'Python')
        self.assertEqual(normalize_skill_name('full stack'), 'Full Stack')
        self.assertEqual(normalize_skill_name('ui/ux'), 'UI/UX')
        self.assertEqual(normalize_skill_name('devops'), 'DevOps')

    def test_skill_save_auto_normalizes(self):
        s1 = Skill.objects.create(name='react')
        self.assertEqual(s1.name, 'React')

    def test_case_insensitive_skill_search(self):
        client = Client()
        fl_user = User.objects.create_user(username='react_dev', email='rd@test.com', password='Password123!')
        p = fl_user.profile
        p.role = 'freelancer'
        p.title = 'React Engineer'
        p.bio = 'I build React apps.'
        p.location = 'Remote'
        p.hourly_rate = Decimal('80.00')
        p.experience_years = 4
        p.save()
        s = Skill.objects.create(name='React')
        FreelancerSkill.objects.create(profile=p, skill=s)

        for query_val in ['react', 'React', 'REACT']:
            response = client.get(reverse('home') + f'?skill={query_val}')
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, 'react_dev')


class Priority6And7FilterValidationAndEmptyStateTests(TestCase):
    """PRIORITIES 6 & 7: Explore filter validation and empty state."""

    def setUp(self):
        self.client = Client()
        fl_user = User.objects.create_user(username='filter_dev', email='fd@test.com', password='Password123!')
        p = fl_user.profile
        p.role = 'freelancer'
        p.title = 'Senior Developer'
        p.bio = 'Bio description here.'
        p.location = 'Boston, MA'
        p.hourly_rate = Decimal('90.00')
        p.experience_years = 5
        p.save()
        s = Skill.objects.create(name='Django')
        FreelancerSkill.objects.create(profile=p, skill=s)

    def test_min_rate_greater_than_max_rate_warning(self):
        """When min_rate > max_rate, system handles it safely with warning."""
        response = self.client.get(reverse('home') + '?min_rate=100&max_rate=50')
        self.assertEqual(response.status_code, 200)
        messages_list = list(response.context['messages'])
        self.assertTrue(any('Minimum rate cannot exceed maximum rate.' in str(m) for m in messages_list))

    def test_empty_state_when_zero_results(self):
        """When no freelancers match filters, display empty state and clear button."""
        response = self.client.get(reverse('home') + '?q=NonExistentDeveloperXYZ123')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'No freelancers found')
        self.assertContains(response, 'Try changing your search or filters.')
        self.assertContains(response, 'Clear Filters')
        self.assertContains(response, '0 Freelancers Available')


class SecurityAndAuthorizationTests(TestCase):
    """SECURITY: Authorization and preventing data manipulation across profiles."""

    def setUp(self):
        self.client = Client()
        self.u1 = User.objects.create_user(username='user_one', email='u1@test.com', password='Password123!')
        self.u2 = User.objects.create_user(username='user_two', email='u2@test.com', password='Password123!')
        self.u1.profile.role = 'freelancer'
        self.u1.profile.hourly_rate = Decimal('50.00')
        self.u1.profile.save()

        self.u2.profile.role = 'freelancer'
        self.u2.profile.hourly_rate = Decimal('80.00')
        self.u2.profile.save()

    def test_user_can_only_modify_own_profile(self):
        """User one logged in cannot modify User two profile."""
        self.client.login(username='user_one', password='Password123!')
        self.client.post(reverse('profile_edit'), {
            'action': 'update_profile',
            'title': 'Hacked Title',
            'bio': 'Hacked Bio',
            'hourly_rate': '150.00',
            'location': 'Hacked Location',
            'experience_years': 10,
        })
        self.u2.profile.refresh_from_db()
        self.u1.profile.refresh_from_db()
        # User two remains unmodified
        self.assertNotEqual(self.u2.profile.title, 'Hacked Title')
        self.assertEqual(self.u2.profile.hourly_rate, Decimal('80.00'))
        # User one is updated
        self.assertEqual(self.u1.profile.title, 'Hacked Title')
        self.assertEqual(self.u1.profile.hourly_rate, Decimal('150.00'))


class AuditAndFixesTests(TestCase):
    """TESTS: Verifying fixes for open redirect, role validation, file extensions, and booking dates."""

    def setUp(self):
        self.client = Client()
        self.u1 = User.objects.create_user(username='u1', email='u1@test.com', password='Password123!')
        self.u1.profile.role = 'client'
        self.u1.profile.save()

        self.u2 = User.objects.create_user(username='u2', email='u2@test.com', password='Password123!')
        self.u2.profile.role = 'freelancer'
        self.u2.profile.title = 'Specialist'
        self.u2.profile.bio = 'Bio description'
        self.u2.profile.location = 'London'
        self.u2.profile.hourly_rate = Decimal('50.00')
        self.u2.profile.experience_years = 3
        self.u2.profile.save()
        
        self.skill = Skill.objects.create(name='Django')
        FreelancerSkill.objects.create(profile=self.u2.profile, skill=self.skill)

    def test_signup_role_validation(self):
        """Signup must reject roles other than client/freelancer."""
        response = self.client.post(reverse('signup'), {
            'username': 'attacker',
            'email': 'attacker@test.com',
            'role': 'admin',
            'password': 'Password123!',
            'password_confirm': 'Password123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertFalse(User.objects.filter(username='attacker').exists())

    def test_open_redirect_protection(self):
        """Login redirect is sanitized using url_has_allowed_host_and_scheme."""
        response = self.client.post(reverse('login') + '?next=//evil.com', {
            'username': 'u1',
            'password': 'Password123!',
        })
        self.assertEqual(response.status_code, 302)
        # Should redirect to home, NOT evil.com
        self.assertRedirects(response, reverse('home'))

    def test_chat_file_extension_whitelist(self):
        """Chat attachments only allow safe extensions."""
        self.client.login(username='u1', password='Password123!')
        
        # Test disallowed extension
        from django.core.files.uploadedfile import SimpleUploadedFile
        bad_file = SimpleUploadedFile("malicious.py", b"print('hack')")
        response = self.client.post(reverse('chat', args=['u2']), {
            'body': 'Check this file out',
            'attachment': bad_file
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Message.objects.filter(attachment__contains='malicious.py').count(), 0)

        # Test allowed extension
        good_file = SimpleUploadedFile("resume.pdf", b"pdf content")
        response = self.client.post(reverse('chat', args=['u2']), {
            'body': 'Here is my resume',
            'attachment': good_file
        })
        self.assertEqual(response.status_code, 302)
        # Check if saved attachment exists and has correct extension
        msg = Message.objects.filter(body='Here is my resume').first()
        self.assertIsNotNone(msg)
        self.assertTrue(msg.attachment.name.startswith('attachments/resume'))
        self.assertTrue(msg.attachment.name.endswith('.pdf'))

    def test_booking_past_start_date_rejected(self):
        """Start date in the past should be rejected in booking request."""
        self.client.login(username='u1', password='Password123!')
        
        past_date = (datetime.date.today() - datetime.timedelta(days=2)).strftime('%Y-%m-%d')
        future_date = (datetime.date.today() + datetime.timedelta(days=5)).strftime('%Y-%m-%d')
        
        response = self.client.post(reverse('create_booking', args=[self.u2.profile.id]), {
            'start_date': past_date,
            'end_date': future_date,
            'description': 'Help in the past'
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Booking.objects.count(), 0)

