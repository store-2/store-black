// developer.js
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.glow-on-hover');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('active');
            setTimeout(() => {
                button.classList.remove('active');
            }, 300);
        });
    });
});

// Additional functionality can be added here as needed.