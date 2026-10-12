import logging
import os
import urllib.request
import urllib.error
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

# Spending / Usage caps config for external APIs (e.g. OpenAI, Stripe, Email services)
MAX_MONTHLY_EXTERNAL_BUDGET_USD = float(os.environ.get('MAX_MONTHLY_EXTERNAL_BUDGET_USD', '100.0'))
MAX_SINGLE_REQUEST_COST_USD = float(os.environ.get('MAX_SINGLE_REQUEST_COST_USD', '1.0'))

# Strict file upload limits (5MB)
MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.svg'}
ALLOWED_DOC_EXTENSIONS = {'.pdf', '.zip', '.txt', '.doc', '.docx'}
ALLOWED_ALL_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOC_EXTENSIONS

def validate_uploaded_file(uploaded_file, allowed_types='all', max_size_bytes=MAX_UPLOAD_SIZE_BYTES):
    """
    Validates uploaded file size and extension to prevent resource exhaustion and malicious uploads.
    """
    if not uploaded_file:
        return

    if uploaded_file.size > max_size_bytes:
        max_mb = max_size_bytes / (1024 * 1024)
        raise ValidationError(f"File size exceeds the maximum allowed limit of {max_mb:.1f}MB.")

    ext = os.path.splitext(uploaded_file.name)[1].lower()
    allowed = ALLOWED_IMAGE_EXTENSIONS if allowed_types == 'image' else ALLOWED_ALL_EXTENSIONS
    if ext not in allowed:
        raise ValidationError(f"File type '{ext}' is not permitted. Allowed: {', '.join(sorted(allowed))}")

def safe_external_request(url, method='GET', timeout=10.0, data=None, headers=None, estimated_cost_usd=0.0):
    """
    Executes an external HTTP request using standard urllib with:
    1. Strict timeout (default: 10s).
    2. Spending/usage guardrails against external API costs.
    3. Safe error logging without leaks.
    """
    if estimated_cost_usd > MAX_SINGLE_REQUEST_COST_USD:
        logger.error(f"External API call blocked: estimated cost ${estimated_cost_usd} exceeds limit ${MAX_SINGLE_REQUEST_COST_USD}")
        raise ValueError("External request rejected: usage/spending cap exceeded.")

    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode('utf-8')
    except urllib.error.URLError as e:
        logger.error(f"External request to {url} failed: {e}")
        raise
