document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('productForm');
  const cancelBtn = document.getElementById('cancelEdit');

  const toggleStatsBtn = document.getElementById('toggleStatsBtn');
  const statsSection = document.getElementById('statsSection');

  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formSection = document.querySelector('.product-form');

  const toggleListBtn = document.getElementById('toggleListBtn');
  const listSection = document.querySelector('.product-list');

  // Basculer l'affichage des statistiques
  toggleStatsBtn.addEventListener('click', function () {
    const isVisible = !statsSection.classList.contains('hidden');
    if (isVisible) {
      statsSection.classList.add('hidden');
      toggleStatsBtn.textContent = 'Afficher les statistiques';
    } else {
      statsSection.classList.remove('hidden');
      toggleStatsBtn.textContent = 'Masquer les statistiques';
    }
  });

  // Masquer/Afficher le formulaire
  toggleFormBtn.addEventListener('click', function () {
    const isVisible = !formSection.classList.contains('hidden');
    if (isVisible) {
      formSection.classList.add('hidden');
      this.textContent = 'Afficher le formulaire';
    } else {
      formSection.classList.remove('hidden');
      this.textContent = 'Masquer le formulaire';
    }
  });

  // Masquer/Afficher la liste des produits
  toggleListBtn.addEventListener('click', function () {
    const isVisible = !listSection.classList.contains('hidden');
    if (isVisible) {
      listSection.classList.add('hidden');
      this.textContent = 'Afficher la liste des produits';
    } else {
      listSection.classList.remove('hidden');
      this.textContent = 'Masquer la liste des produits';
    }
  });

  // Éditer un produit
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function () {
      const data = this.dataset;
      document.getElementById('productId').value = data.id;
      document.getElementById('productName').value = data.name;
      document.getElementById('productPrice').value = data.price;
      document.getElementById('productCategory').value = data.category;
      document.getElementById('productImage').value = data.image; // Si tu veux garder ce champ pour modification sans upload
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Annuler édition
  cancelBtn.addEventListener('click', function () {
    form.reset();
    document.getElementById('productId').value = '';
  });

  // Soumettre le formulaire
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this); // Récupère tous les champs avec "name"
  
    try {
      const response = await fetch('/admin/save-product', {
        method: 'POST',
        body: formData // FormData inclut maintenant l'image ET les autres champs
      });
  
      if (response.ok) {
        loadProducts(); // Recharger la liste
        form.reset();   // Réinitialiser le formulaire
        document.getElementById('productId').value = ''; // Vider l'id
        alert('Produit sauvegardé avec succès !');
      } else {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
  
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l’enregistrement.');
    }
  });
  
  // Supprimer un produit
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async function () {
      if (!confirm('Confirmer la suppression ?')) return;
      const id = this.dataset.id;

      try {
        const response = await fetch('/admin/delete-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ id })
        });

        if (response.ok) {
          const row = this.closest('tr');
          row.classList.add('fade-out');
          setTimeout(() => row.remove(), 500);
        }

      } catch (e) {
        console.error(e);
        alert('Erreur lors de la suppression.');
      }
    });
  });

  // Charger les produits via AJAX
  async function loadProducts() {
    try {
      const res = await fetch('/admin/products-data');
      const products = await res.json();
      updateTable(products);
    } catch (e) {
      console.error(e);
    }
  }

  function updateTable(products) {
    const tbody = document.querySelector('.product-list tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="/images/${p.image}" alt="${p.name}" class="product-thumb" onerror="this.src='/images/default.jpg'"></td>
        <td>${p.name}</td>
        <td>${Number(p.price).toLocaleString('fr-FR')} GNF</td>
        <td>${p.category}</td>
        <td class="actions">
          <button class="btn-edit" 
                  data-id="${p.id}"
                  data-name="${p.name}"
                  data-price="${p.price}"
                  data-category="${p.category}"
                  data-image="${p.image}">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn-delete" data-id="${p.id}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </td>`;
      tbody.appendChild(tr);
      attachEvents(tr);
    });
  }

  function attachEvents(row) {
    row.querySelector('.btn-edit').addEventListener('click', function () {
      const data = this.dataset;
      document.getElementById('productId').value = data.id;
      document.getElementById('productName').value = data.name;
      document.getElementById('productPrice').value = data.price;
      document.getElementById('productCategory').value = data.category;
      document.getElementById('productImage').value = data.image;
      form.scrollIntoView({ behavior: 'smooth' });
    });

    row.querySelector('.btn-delete').addEventListener('click', async function () {
      if (!confirm('Confirmer la suppression ?')) return;
      const id = this.dataset.id;

      try {
        const response = await fetch('/admin/delete-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ id })
        });

        if (response.ok) {
          const row = this.closest('tr');
          row.classList.add('fade-out');
          setTimeout(() => row.remove(), 500);
        }

      } catch (e) {
        console.error(e);
        alert('Erreur lors de la suppression.');
      }
    });
  }
});