const images = [
    'images/hero-bg.png',
    'images/Intellitech (1).png',
    'images/Intellitech (2).png',
    'images/Intellitech (3).png',
    'images/Intellitech (4).png',
    'images/Intellitech (5).png'
];

let currentIndex = 0;

function changeBackgroundImage() {
    const hero = document.querySelector('.hero');
    hero.style.backgroundImage = `url('${images[currentIndex]}')`;
    
    currentIndex = (currentIndex + 1) % images.length;
    
    setTimeout(changeBackgroundImage, 30000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Animation for form inputs
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    changeBackgroundImage();
});
