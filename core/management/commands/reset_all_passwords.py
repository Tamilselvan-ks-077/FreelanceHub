from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction

class Command(BaseCommand):
    help = 'Sets a single common password for all users in the database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            type=str,
            default='Tamil@123',
            help='The password to set for all users'
        )

    def handle(self, *args, **options):
        password = options['password']
        if not password:
            self.stderr.write(self.style.ERROR("Password cannot be empty."))
            return

        users = list(User.objects.all())
        count = len(users)

        if count == 0:
            self.stdout.write(self.style.WARNING("No users found in database."))
            return

        with transaction.atomic():
            for user in users:
                user.set_password(password)
                user.save(update_fields=['password'])

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully updated password to '{password}' for all {count} users."
            )
        )
