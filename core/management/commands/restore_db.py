import os
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Restore the database from a JSON dump or SQLite backup file.'

    def add_arguments(self, parser):
        parser.add_argument(
            'backup_file',
            type=str,
            help='Path to the backup file (.json or .sqlite3)'
        )

    def handle(self, *args, **options):
        file_path = Path(options['backup_file'])
        if not file_path.exists():
            raise CommandError(f"Backup file not found: {file_path}")

        if file_path.suffix == '.sqlite3':
            db_path = Path(settings.DATABASES['default']['NAME'])
            shutil.copy2(file_path, db_path)
            self.stdout.write(self.style.SUCCESS(f"Successfully restored SQLite DB from {file_path}"))
        elif file_path.suffix == '.json':
            call_command('loaddata', str(file_path))
            self.stdout.write(self.style.SUCCESS(f"Successfully restored data from {file_path}"))
        else:
            raise CommandError("Unsupported backup format. Expected .json or .sqlite3 file.")
