document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', function() {
        this.classList.toggle('active');
        const answer = this.nextElementSibling;
        answer.classList.toggle('show');
      });
    });
    
    // Animation des cartes d'information
    const infoCards = document.querySelectorAll('.info-card');
    
    infoCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
      });
    });
    
    // Validation du formulaire
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        const phoneInput = this.querySelector('input[type="tel"]');
        const phoneValue = phoneInput.value.trim();
        
        if (!/^\+?224\d{8,9}$/.test(phoneValue)) {
          e.preventDefault();
          alert('Veuillez entrer un numéro de téléphone guinéen valide (ex: +22412345678 ou 624123456)');
          phoneInput.focus();
        }
      });
    }
  });