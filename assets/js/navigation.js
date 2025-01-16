const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav ul');
const body = document.body;

function toggleMenu(show) {
    hamburger.classList.toggle('active', show);
    nav.classList.toggle('active', show);
    body.classList.toggle('menu-open', show);
    
    const icon = hamburger.querySelector('i');
    if (show) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

hamburger.addEventListener('click', function() {
    const willShow = !nav.classList.contains('active');
    toggleMenu(willShow);
});

// Close menu when clicking a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        toggleMenu(false);
    });
});

// Close menu when pressing escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
        toggleMenu(false);
    }
}); 