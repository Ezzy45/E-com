document.addEventListener('DOMContentLoaded', function() {
  // Gestion de la recherche en temps réel (optionnel)
  const searchInput = document.querySelector('.search-bar input');
  const searchForm = document.querySelector('.search-bar form');
  
  if (searchInput && searchForm) {
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        searchForm.submit();
      }
    });
    
    // Vous pourriez aussi implémenter une recherche AJAX ici
    // pour des résultats en temps réel sans rechargement de page
  }
  
  // Animation des cartes produits
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
  });
});