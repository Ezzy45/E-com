const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du moteur de vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Données des produits
const products = [
  { id: 1, name: 'Smartphone', price: 599.99, image: 'product1.jpg', category: 'Électronique' },
  { id: 2, name: 'Ordinateur portable', price: 999.99, image: 'product2.jpg', category: 'Électronique' },
  { id: 3, name: 'T-shirt', price: 29.99, image: 'product3.jpg', category: 'Vêtements' },
  { id: 4, name: 'Jean', price: 59.99, image: 'product4.jpg', category: 'Vêtements' },
  { id: 5, name: 'Lampe', price: 39.99, image: 'product5.jpg', category: 'Maison' },
  { id: 6, name: 'Coussin', price: 19.99, image: 'product6.jpg', category: 'Maison' },
  { id: 7, name: 'Fruits', price: 9.99, image: 'product7.jpg', category: 'Alimentation' },
  { id: 8, name: 'Légumes', price: 7.99, image: 'product8.jpg', category: 'Alimentation' }
];

// Routes
app.get('/', (req, res) => {
  res.render('index', { products });
});

// Nouvelle route pour la page produits
app.get('/products', (req, res) => {
  const category = req.query.category || 'Tous';
  const searchQuery = req.query.search || '';
  
  let filteredProducts = products;
  
  // Filtrage par catégorie
  if (category !== 'Tous') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Filtrage par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }
  
  res.render('products', { 
    products: filteredProducts, 
    categories, 
    currentCategory: category,
    searchQuery 
  });
});

app.get('/checkout', (req, res) => {
  const productId = parseInt(req.query.productId);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.redirect('/');
  }
  
  res.render('checkout', { product });
});

app.post('/submit-order', (req, res) => {
  const { fullName, email, phone, product, quantity } = req.body;

  // Configuration du transporteur email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mamyyano@gmail.com', // Remplacez par votre email
      pass: 'eotiuhjaqolfwmfb'      // Remplacez par votre mot de passe
    }
  });

  const mailOptions = {
    from: 'mamyyano@gmail.com',
    to: 'beavoguimamadiesaie@gmail.com', // Email de l'administrateur
    subject: 'Nouvelle commande reçue',
    text: `
      Nouvelle commande:
      Nom complet: ${fullName}
      Email: ${email}
      Téléphone: ${phone}
      Produit: ${product}
      Quantité: ${quantity}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.send('Erreur lors de l\'envoi de la commande.');
    }
    res.send(`
      <h2>Merci pour votre commande!</h2>
      <p>Nous avons reçu votre demande et vous contacterons bientôt.</p>
      <a href="/">Retour à l'accueil</a>
    `);
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});