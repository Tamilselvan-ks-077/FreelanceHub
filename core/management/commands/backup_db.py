import os
import shutil
import time
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Create a secure timestamped JSON/SQLite backup of the database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default=str(settings.BASE_DIR / 'backups'),
            help='Directory to store the backup files'
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['json', 'sqlite'],
            default='json',
            help='Backup format: json dumpdata or sqlite file copy'
        )

    def handle(self, *args, **options):
        output_dir = Path(options['output_dir'])
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = time.strftime('%Y%m%d_%H%M%S')

        if options['format'] == 'sqlite' and settings.DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':
            db_path = Path(settings.DATABASES['default']['NAME'])
            if not db_path.exists():
                self.stderr.write(self.style.ERROR(f"SQLite database file not found at {db_path}"))
                return
            backup_file = output_dir / f"db_backup_{timestamp}.sqlite3"
            shutil.copy2(db_path, backup_file)
            self.stdout.write(self.style.SUCCESS(f"Successfully backed up SQLite DB to {backup_file}"))
        else:
            backup_file = output_dir / f"backup_{timestamp}.json"
            with open(backup_file, 'w', encoding='utf-8') as f:
                call_command(
                    'dumpdata',
                    'core',
                    'auth.user',
                    natural_foreign=True,
                    natural_primary=True,
                    indent=2,
                    stdout=f
                )
            self.stdout.write(self.style.SUCCESS(f"Successfully created JSON data backup at {backup_file}"))
