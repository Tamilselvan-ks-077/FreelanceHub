document.addEventListener('DOMContentLoaded', () => {
    // Add close interaction for Django notification alert messages
    const closeButtons = document.querySelectorAll('.alert-close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const alert = e.target.closest('.alert');
            if (alert) {
                // Fade out animation
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-10px)';
                alert.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        });
    });

    // Subtly animate talent cards on hover focus using JavaScript checks if needed
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.color = 'var(--primary)';
                label.style.transition = 'color 0.2s ease';
            }
        });
        
        input.addEventListener('blur', () => {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.color = 'var(--text-muted)';
            }
        });
    });
});
