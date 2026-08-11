document.addEventListener('DOMContentLoaded', () => {
    // Add close interaction for Django notification alert messages
    const closeButtons = document.querySelectorAll('.alert-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const alert = e.target.closest('.alert');
            if (alert) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';
                alert.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        });
    });

    // Auto-dismiss alerts after 5 seconds
    setTimeout(() => {
        document.querySelectorAll('.alert').forEach(alert => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            setTimeout(() => alert.remove(), 400);
        });
    }, 5000);

    // Form input label highlight on focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const parent = input.closest('.form-group, .filter-group');
            if (parent) {
                const label = parent.querySelector('label');
                if (label) {
                    label.style.color = 'var(--primary)';
                }
            }
        });
        
        input.addEventListener('blur', () => {
            const parent = input.closest('.form-group, .filter-group');
            if (parent) {
                const label = parent.querySelector('label');
                if (label) {
                    label.style.color = '';
                }
            }
        });
    });

    // Support smooth scrolling for internal anchors (e.g., #reviews-section)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId || targetId.startsWith('overview') || targetId.startsWith('bookings') || targetId.startsWith('invoices') || targetId.startsWith('recent') || targetId.startsWith('general') || targetId.startsWith('professional') || targetId.startsWith('skills') || targetId.startsWith('portfolio')) {
                return; // Let tab handlers manage tab hashes
            }
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
