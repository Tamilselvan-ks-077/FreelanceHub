"""
=============================================================================
FreelanceHub — Database Mutation Test Suite
=============================================================================
Tests that values can be CREATED, READ, UPDATED, and DELETED across every
major model, both at the ORM level and through the Django view layer.

Run with:
    python manage.py test core.test_db_mutations -v2
=============================================================================
"""

from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import (
    Student, Profile, Skill, FreelancerSkill, Booking, Invoice,
    Review, Portfolio, Notification, Message, Favourite, Payment,
    ActivityLog, ChatRoom, ChatMessage,
)
import datetime


# ───────────────────────────────────────────────────────────────────────────
# 1. DIRECT ORM — Model-level CRUD
# ───────────────────────────────────────────────────────────────────────────

class StudentModelCRUDTest(TestCase):
    """Test CREATE / UPDATE / DELETE on the legacy Student model."""

    def test_create_student(self):
        s = Student.objects.create(name="Alice", age=22, email="alice@test.com")
        self.assertEqual(Student.objects.count(), 1)
        self.assertEqual(s.name, "Alice")

    def test_update_student(self):
        s = Student.objects.create(name="Bob", age=20, email="bob@test.com")
        s.name = "Bob Updated"
        s.age = 21
        s.save()
        s.refresh_from_db()
        self.assertEqual(s.name, "Bob Updated")
        self.assertEqual(s.age, 21)

    def test_delete_student(self):
        s = Student.objects.create(name="Charlie", age=19, email="charlie@test.com")
        pk = s.pk
        s.delete()
        self.assertFalse(Student.objects.filter(pk=pk).exists())


class ProfileModelCRUDTest(TestCase):
    """Test that Profile auto-creates on User creation and can be mutated."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="t@t.com", password="secret123"
        )

    def test_profile_auto_created(self):
        self.assertTrue(Profile.objects.filter(user=self.user).exists())

    def test_update_profile_fields(self):
        p = self.user.profile
        p.role = "freelancer"
        p.title = "React Dev"
        p.hourly_rate = 75.50
        p.bio = "I build UIs"
        p.location = "Chennai"
        p.experience_years = 4
        p.availability = False
        p.is_verified = True
        p.save()
        p.refresh_from_db()

        self.assertEqual(p.role, "freelancer")
        self.assertEqual(p.title, "React Dev")
        self.assertEqual(float(p.hourly_rate), 75.50)
        self.assertEqual(p.bio, "I build UIs")
        self.assertEqual(p.location, "Chennai")
        self.assertEqual(p.experience_years, 4)
        self.assertFalse(p.availability)
        self.assertTrue(p.is_verified)

    def test_delete_user_cascades_profile(self):
        uid = self.user.pk
        self.user.delete()
        self.assertFalse(Profile.objects.filter(user_id=uid).exists())


class SkillModelCRUDTest(TestCase):
    """Test Skill and FreelancerSkill CRUD."""

    def setUp(self):
        self.user = User.objects.create_user("dev", "d@d.com", "pass1234")
        self.user.profile.role = "freelancer"
        self.user.profile.save()

    def test_create_skill(self):
        s = Skill.objects.create(name="GraphQL")
        self.assertEqual(s.name, "GraphQL")

    def test_update_skill(self):
        s = Skill.objects.create(name="Rct")
        s.name = "React"
        s.save()
        s.refresh_from_db()
        self.assertEqual(s.name, "React")

    def test_delete_skill(self):
        s = Skill.objects.create(name="Temp")
        s.delete()
        self.assertFalse(Skill.objects.filter(name="Temp").exists())

    def test_link_skill_to_freelancer(self):
        s = Skill.objects.create(name="Rust")
        fs = FreelancerSkill.objects.create(profile=self.user.profile, skill=s)
        self.assertEqual(FreelancerSkill.objects.count(), 1)
        fs.delete()
        self.assertEqual(FreelancerSkill.objects.count(), 0)


class BookingModelCRUDTest(TestCase):
    """Test Booking lifecycle at ORM level."""

    def setUp(self):
        self.client_user = User.objects.create_user("cl", "cl@t.com", "pass1234")
        self.client_user.profile.role = "client"
        self.client_user.profile.save()

        self.freelancer_user = User.objects.create_user("fl", "fl@t.com", "pass1234")
        self.freelancer_user.profile.role = "freelancer"
        self.freelancer_user.profile.save()

    def test_create_booking(self):
        b = Booking.objects.create(
            client=self.client_user,
            freelancer=self.freelancer_user,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=7),
            description="Build an API",
            status="pending",
        )
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(b.status, "pending")

    def test_update_booking_status(self):
        b = Booking.objects.create(
            client=self.client_user,
            freelancer=self.freelancer_user,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=3),
            status="pending",
        )
        for new_status in ("accepted", "completed"):
            b.status = new_status
            b.save()
            b.refresh_from_db()
            self.assertEqual(b.status, new_status)

    def test_delete_booking(self):
        b = Booking.objects.create(
            client=self.client_user,
            freelancer=self.freelancer_user,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=1),
        )
        pk = b.pk
        b.delete()
        self.assertFalse(Booking.objects.filter(pk=pk).exists())

    def test_chatroom_auto_created_on_booking(self):
        """Signal should auto-create a ChatRoom when a Booking is created."""
        b = Booking.objects.create(
            client=self.client_user,
            freelancer=self.freelancer_user,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=1),
        )
        self.assertTrue(ChatRoom.objects.filter(booking=b).exists())


class InvoiceAndPaymentCRUDTest(TestCase):
    """Test Invoice + Payment creation and updates."""

    def setUp(self):
        self.cl = User.objects.create_user("c", "c@c.com", "pass1234")
        self.fl = User.objects.create_user("f", "f@f.com", "pass1234")
        self.booking = Booking.objects.create(
            client=self.cl, freelancer=self.fl,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=5),
            status="accepted",
        )

    def test_create_invoice(self):
        inv = Invoice.objects.create(booking=self.booking, amount=500.00, status="due")
        self.assertEqual(inv.status, "due")
        self.assertEqual(float(inv.amount), 500.00)

    def test_update_invoice_to_paid(self):
        inv = Invoice.objects.create(booking=self.booking, amount=500.00, status="due")
        inv.status = "paid"
        inv.save()
        inv.refresh_from_db()
        self.assertEqual(inv.status, "paid")

    def test_create_payment(self):
        inv = Invoice.objects.create(booking=self.booking, amount=300.00, status="due")
        pay = Payment.objects.create(
            invoice=inv, transaction_id="TX-TESTID001", amount=300.00, payment_method="stripe"
        )
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(pay.transaction_id, "TX-TESTID001")

    def test_delete_invoice_cascades_payment(self):
        inv = Invoice.objects.create(booking=self.booking, amount=100.00, status="due")
        Payment.objects.create(invoice=inv, transaction_id="TX-DEL01", amount=100.00)
        inv.delete()
        self.assertEqual(Payment.objects.count(), 0)


class ReviewCRUDTest(TestCase):
    """Test Review creation and update."""

    def setUp(self):
        self.reviewer = User.objects.create_user("rev", "r@r.com", "pass1234")
        self.reviewee = User.objects.create_user("target", "t@r.com", "pass1234")

    def test_create_review(self):
        r = Review.objects.create(
            reviewer=self.reviewer, reviewee=self.reviewee,
            rating=4, comment="Great work!"
        )
        self.assertEqual(r.rating, 4)

    def test_update_review_rating(self):
        r = Review.objects.create(
            reviewer=self.reviewer, reviewee=self.reviewee,
            rating=3, comment="OK"
        )
        r.rating = 5
        r.comment = "Actually amazing!"
        r.save()
        r.refresh_from_db()
        self.assertEqual(r.rating, 5)
        self.assertEqual(r.comment, "Actually amazing!")


class MessageCRUDTest(TestCase):
    """Test Message model CRUD."""

    def setUp(self):
        self.u1 = User.objects.create_user("sender", "s@s.com", "pass1234")
        self.u2 = User.objects.create_user("receiver", "r@r.com", "pass1234")

    def test_create_message(self):
        m = Message.objects.create(sender=self.u1, recipient=self.u2, body="Hello!")
        self.assertEqual(Message.objects.count(), 1)
        self.assertFalse(m.is_read)

    def test_mark_message_read(self):
        m = Message.objects.create(sender=self.u1, recipient=self.u2, body="Hi")
        m.is_read = True
        m.save()
        m.refresh_from_db()
        self.assertTrue(m.is_read)

    def test_delete_message(self):
        m = Message.objects.create(sender=self.u1, recipient=self.u2, body="Bye")
        m.delete()
        self.assertEqual(Message.objects.count(), 0)


class NotificationCRUDTest(TestCase):
    """Test Notification create / mark-read / delete."""

    def setUp(self):
        self.user = User.objects.create_user("notifuser", "n@n.com", "pass1234")

    def test_create_notification(self):
        n = Notification.objects.create(user=self.user, verb="Test event")
        self.assertFalse(n.is_read)

    def test_mark_read(self):
        n = Notification.objects.create(user=self.user, verb="Event")
        n.is_read = True
        n.save()
        n.refresh_from_db()
        self.assertTrue(n.is_read)

    def test_bulk_mark_read(self):
        for i in range(5):
            Notification.objects.create(user=self.user, verb=f"Event {i}")
        Notification.objects.filter(user=self.user, is_read=False).update(is_read=True)
        self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)


class FavouriteCRUDTest(TestCase):
    """Test toggling favourites."""

    def setUp(self):
        self.user = User.objects.create_user("fav_user", "f@f.com", "pass1234")
        self.fl = User.objects.create_user("fav_fl", "fl@f.com", "pass1234")
        self.fl.profile.role = "freelancer"
        self.fl.profile.save()

    def test_add_favourite(self):
        Favourite.objects.create(user=self.user, freelancer=self.fl.profile)
        self.assertEqual(Favourite.objects.count(), 1)

    def test_remove_favourite(self):
        f = Favourite.objects.create(user=self.user, freelancer=self.fl.profile)
        f.delete()
        self.assertEqual(Favourite.objects.count(), 0)


class ActivityLogCRUDTest(TestCase):
    """Test activity log creation."""

    def test_create_log(self):
        u = User.objects.create_user("loguser", "l@l.com", "pass1234")
        a = ActivityLog.objects.create(user=u, action="Logged in")
        self.assertEqual(ActivityLog.objects.count(), 1)
        self.assertIn("Logged in", str(a))


# ───────────────────────────────────────────────────────────────────────────
# 2. VIEW LAYER — Test DB changes through HTTP endpoints
# ───────────────────────────────────────────────────────────────────────────

class SignupCreatesUserAndProfileTest(TestCase):
    """POST /signup/ should create a User + Profile in the DB."""

    def test_signup_creates_records(self):
        c = Client()
        resp = c.post(reverse("signup"), {
            "username": "newguy",
            "email": "new@guy.com",
            "role": "freelancer",
            "password": "StrongP@ss1",
            "password_confirm": "StrongP@ss1",
        })
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(User.objects.filter(username="newguy").exists())
        p = User.objects.get(username="newguy").profile
        self.assertEqual(p.role, "freelancer")


class ProfileEditUpdatesDBTest(TestCase):
    """POST /profile/edit/ should persist changes in core_profile."""

    def setUp(self):
        self.user = User.objects.create_user("editor", "e@e.com", "pass1234")
        self.user.profile.role = "freelancer"
        self.user.profile.save()

    def test_update_profile_via_view(self):
        c = Client()
        c.login(username="editor", password="pass1234")
        resp = c.post(reverse("profile_edit"), {
            "action": "update_profile",
            "bio": "New bio from test",
            "age": 30,
            "contact_email": "editor@new.com",
            "location": "Bengaluru",
            "title": "Senior Dev",
            "hourly_rate": "120.00",
            "experience_years": 6,
            "availability": "true",
            "education": "B.Tech CS",
            "experience_detail": "6 years of full-stack",
            "certificates": "AWS Certified",
            "languages": "English, Tamil",
        })
        self.assertEqual(resp.status_code, 302)

        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.bio, "New bio from test")
        self.assertEqual(self.user.profile.title, "Senior Dev")
        self.assertEqual(float(self.user.profile.hourly_rate), 120.00)
        self.assertEqual(self.user.profile.location, "Bengaluru")

    def test_add_skill_via_view(self):
        c = Client()
        c.login(username="editor", password="pass1234")
        c.post(reverse("profile_edit"), {
            "action": "add_skill",
            "skill_name": "Kubernetes",
        })
        self.assertTrue(Skill.objects.filter(name="Kubernetes").exists())
        self.assertTrue(
            FreelancerSkill.objects.filter(
                profile=self.user.profile, skill__name="Kubernetes"
            ).exists()
        )

    def test_remove_skill_via_view(self):
        c = Client()
        c.login(username="editor", password="pass1234")
        skill = Skill.objects.create(name="ToRemove")
        FreelancerSkill.objects.create(profile=self.user.profile, skill=skill)

        c.post(reverse("profile_edit"), {
            "action": "remove_skill",
            "skill_id": skill.id,
        })
        self.assertFalse(
            FreelancerSkill.objects.filter(
                profile=self.user.profile, skill=skill
            ).exists()
        )


class BookingFlowViaViewsTest(TestCase):
    """Full booking lifecycle tested through Django views."""

    def setUp(self):
        self.c = Client()
        self.client_user = User.objects.create_user("viewclient", "vc@t.com", "pass1234")
        self.client_user.profile.role = "client"
        self.client_user.profile.save()

        self.fl_user = User.objects.create_user("viewfl", "vf@t.com", "pass1234")
        self.fl_user.profile.role = "freelancer"
        self.fl_user.profile.hourly_rate = 100
        self.fl_user.profile.save()

    def test_create_booking_via_view(self):
        self.c.login(username="viewclient", password="pass1234")
        resp = self.c.post(reverse("create_booking", args=[self.fl_user.profile.id]), {
            "start_date": "2026-09-01",
            "end_date": "2026-09-10",
            "description": "Test project via view",
        })
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(Booking.objects.count(), 1)
        b = Booking.objects.first()
        self.assertEqual(b.status, "pending")
        self.assertEqual(b.description, "Test project via view")

    def test_accept_booking_changes_status(self):
        self.c.login(username="viewclient", password="pass1234")
        self.c.post(reverse("create_booking", args=[self.fl_user.profile.id]), {
            "start_date": "2026-09-01",
            "end_date": "2026-09-10",
            "description": "Accept test",
        })
        booking = Booking.objects.first()

        # Freelancer accepts
        self.c.login(username="viewfl", password="pass1234")
        self.c.post(reverse("booking_action", args=[booking.id]), {"action": "accept"})
        booking.refresh_from_db()
        self.assertEqual(booking.status, "accepted")
        # Invoice should have been auto-generated
        self.assertTrue(Invoice.objects.filter(booking=booking).exists())

    def test_reject_booking_changes_status(self):
        self.c.login(username="viewclient", password="pass1234")
        self.c.post(reverse("create_booking", args=[self.fl_user.profile.id]), {
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "description": "Reject test",
        })
        booking = Booking.objects.first()

        self.c.login(username="viewfl", password="pass1234")
        self.c.post(reverse("booking_action", args=[booking.id]), {"action": "reject"})
        booking.refresh_from_db()
        self.assertEqual(booking.status, "rejected")

    def test_cancel_booking_deletes_record(self):
        self.c.login(username="viewclient", password="pass1234")
        self.c.post(reverse("create_booking", args=[self.fl_user.profile.id]), {
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "description": "Cancel test",
        })
        booking = Booking.objects.first()

        self.c.post(reverse("booking_cancel", args=[booking.id]))
        self.assertEqual(Booking.objects.count(), 0)

    def test_edit_booking_updates_db(self):
        self.c.login(username="viewclient", password="pass1234")
        self.c.post(reverse("create_booking", args=[self.fl_user.profile.id]), {
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "description": "Original desc",
        })
        booking = Booking.objects.first()

        self.c.post(reverse("booking_edit", args=[booking.id]), {
            "start_date": "2026-10-01",
            "end_date": "2026-10-15",
            "description": "Updated description",
        })
        booking.refresh_from_db()
        self.assertEqual(str(booking.start_date), "2026-10-01")
        self.assertEqual(booking.description, "Updated description")


class PaymentViaViewTest(TestCase):
    """Test that paying an invoice changes invoice.status to 'paid' and creates a Payment."""

    def setUp(self):
        self.cl = User.objects.create_user("paycl", "pc@t.com", "pass1234")
        self.cl.profile.role = "client"
        self.cl.profile.save()

        self.fl = User.objects.create_user("payfl", "pf@t.com", "pass1234")
        self.fl.profile.role = "freelancer"
        self.fl.profile.hourly_rate = 50
        self.fl.profile.save()

        self.booking = Booking.objects.create(
            client=self.cl, freelancer=self.fl,
            start_date=datetime.date.today(),
            end_date=datetime.date.today() + datetime.timedelta(days=5),
            status="accepted",
        )
        self.invoice = Invoice.objects.create(
            booking=self.booking, amount=2000.00, status="due"
        )

    def test_pay_invoice_via_view(self):
        c = Client()
        c.login(username="paycl", password="pass1234")
        resp = c.post(reverse("pay_invoice", args=[self.invoice.id]), {
            "payment_method": "credit_card"
        })
        self.assertEqual(resp.status_code, 302)

        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, "paid")
        self.assertEqual(Payment.objects.count(), 1)
        pay = Payment.objects.first()
        self.assertTrue(pay.transaction_id.startswith("TX-"))
        self.assertEqual(float(pay.amount), 2000.00)


class ChatViaViewTest(TestCase):
    """Test sending a chat message persists in DB."""

    def setUp(self):
        self.u1 = User.objects.create_user("chatter1", "c1@t.com", "pass1234")
        self.u2 = User.objects.create_user("chatter2", "c2@t.com", "pass1234")

    def test_send_message_via_view(self):
        c = Client()
        c.login(username="chatter1", password="pass1234")
        resp = c.post(reverse("chat", args=["chatter2"]), {"body": "Hey there!"})
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(Message.objects.count(), 1)
        msg = Message.objects.first()
        self.assertEqual(msg.body, "Hey there!")
        self.assertEqual(msg.sender, self.u1)
        self.assertEqual(msg.recipient, self.u2)


class NotificationMarkReadViaViewTest(TestCase):
    """Test marking notifications as read via the view."""

    def setUp(self):
        self.user = User.objects.create_user("notif_u", "nu@t.com", "pass1234")
        for i in range(3):
            Notification.objects.create(user=self.user, verb=f"Event {i}")

    def test_mark_all_read(self):
        c = Client()
        c.login(username="notif_u", password="pass1234")
        resp = c.get(reverse("mark_notifications_read"))  # This is a GET-based view
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(
            Notification.objects.filter(user=self.user, is_read=False).count(), 0
        )


class FavouriteToggleViaViewTest(TestCase):
    """Test toggling favourite via the view."""

    def setUp(self):
        self.user = User.objects.create_user("favvu", "fv@t.com", "pass1234")
        self.fl = User.objects.create_user("favfl", "ff@t.com", "pass1234")
        self.fl.profile.role = "freelancer"
        self.fl.profile.save()

    def test_toggle_favourite_add_and_remove(self):
        c = Client()
        c.login(username="favvu", password="pass1234")

        # Add
        c.get(reverse("toggle_favourite", args=[self.fl.profile.id]))
        self.assertEqual(Favourite.objects.count(), 1)

        # Remove (toggle again)
        c.get(reverse("toggle_favourite", args=[self.fl.profile.id]))
        self.assertEqual(Favourite.objects.count(), 0)
