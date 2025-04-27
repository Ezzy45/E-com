const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

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
const categories = ['Tous', 'Électronique', 'Vêtements', 'Maison', 'Alimentation'];

const products = [
  { id: 1, name: 'Smartphone', price: 900000, image: 'productE1.png', category: 'Électronique' },
  { id: 2, name: 'Ordinateur portable', price: 3000000, image: 'productE2.png', category: 'Électronique' },
  { id: 3, name: 'Arduino Mega', price: 250000, image: 'productE3.png', category: 'Électronique' },
  { id: 4, name: 'Arduino Uno', price: 150000, image: 'productE4.png', category: 'Électronique' },
  { id: 5, name: 'Disque SSD', price: 250000, image: 'productE5.png', category: 'Électronique' },
  { id: 6, name: 'T-shirt', price: 70000, image: 'productV1.png', category: 'Vêtements' },
  { id: 7, name: 'Jean', price: 80000, image: 'productV2.png', category: 'Vêtements' },
  { id: 8, name: 'Lunnette', price: 150000, image: 'productV3.png', category: 'Vêtements' },
  { id: 9, name: 'Lampe', price: 50000, image: 'productM1.png', category: 'Maison' },
  { id: 10, name: 'Coussin', price: 70000, image: 'productM2.png', category: 'Maison' },
  { id: 11, name: 'Fruits', price: 10000, image: 'productA1.png', category: 'Alimentation' },
  { id: 12, name: 'Légumes', price: 5000, image: 'productA2.png', category: 'Alimentation' }
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

// Ajoutez cette route avant app.listen()
app.get('/contact', (req, res) => {
  res.render('contact', {
    cities: ['Mamou', 'Conakry'],
    deliveryTime: '24h à 72h',
    satisfaction: '98% de clients satisfaits'
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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
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

  // Email de confirmation pour le client
  const mailOptionsClient = {
    from: 'mamyyano@gmail.com',
    to: email,
    subject: 'Merci pour votre message',
    text: `
      Bonjour ${fullName},
      
      Nous avons bien reçu votre commande et vous remercions pour votre confiance.
      
      Voici un récapitulatif de votre demande:
      Téléphone: ${phone}
      
      Notre équipe vous répondra dans les plus brefs délais.
      
      Cordialement,
      L'équipe de MamYano
    `
  };

  // Envoi de l'email à l'administrateur
  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.log('Erreur envoi admin:', error);
      return res.send('Erreur lors de l\'envoi du message.');
    }
    
    // Si l'email à l'admin est bien envoyé, on envoie la confirmation au client
    transporter.sendMail(mailOptionsClient, (errorClient, infoClient) => {
      if (errorClient) {
        console.log('Erreur envoi client:', errorClient);
        // On affiche quand même le succès car le message est reçu par l'admin
        return res.send(`
          <h2>Merci pour votre message, ${fullName}!</h2>
          <p>Nous avons bien reçu votre demande mais une erreur est survenue avec l'email de confirmation.</p>
          <p>Notre équipe vous contactera bientôt.</p>
          <a href="/">Retour à l'accueil</a>
        `);
      }
      
      // Tout s'est bien passé
      res.send(`
        <h2>Merci pour votre commande, ${fullName}!</h2>
        <p>Nous avons bien reçu votre commande et vous avons envoyé un email de confirmation.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <a href="/">Retour à l'accueil</a>
      `);
    });
  });
});

// Ajoutez cette route avant app.listen()
app.post('/send-message', (req, res) => {
  const { name, email, phone, city, message } = req.body;
  
  // Configuration du transporteur email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email pour l'administrateur
  const mailOptionsAdmin = {
    from: 'mamyyano@gmail.com',
    to: 'beavoguimamadiesaie@gmail.com',
    subject: 'Nouveau message de contact',
    text: `
      Nouveau message reçu:
      Nom complet: ${name}
      Email: ${email}
      Téléphone: ${phone}
      Ville: ${city}
      Message: ${message}
    `
  };

  // Email de confirmation pour le client
  const mailOptionsClient = {
    from: 'mamyyano@gmail.com',
    to: email,
    subject: 'Merci pour votre message',
    text: `
      Bonjour ${name},
      
      Nous avons bien reçu votre message et vous remercions pour votre confiance.
      
      Voici un récapitulatif de votre demande:
      Téléphone: ${phone}
      Ville: ${city}
      
      Notre équipe vous répondra dans les plus brefs délais.
      
      Cordialement,
      L'équipe de MamYano
    `
  };

  // Envoi de l'email à l'administrateur
  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.log('Erreur envoi admin:', error);
      return res.send('Erreur lors de l\'envoi du message.');
    }
    
    // Si l'email à l'admin est bien envoyé, on envoie la confirmation au client
    transporter.sendMail(mailOptionsClient, (errorClient, infoClient) => {
      if (errorClient) {
        console.log('Erreur envoi client:', errorClient);
        // On affiche quand même le succès car le message est reçu par l'admin
        return res.send(`
          <h2>Merci pour votre message, ${name}!</h2>
          <p>Nous avons bien reçu votre demande mais une erreur est survenue avec l'email de confirmation.</p>
          <p>Notre équipe vous contactera bientôt.</p>
          <a href="/">Retour à l'accueil</a>
        `);
      }
      
      // Tout s'est bien passé
      res.send(`
        <h2>Merci pour votre message, ${name}!</h2>
        <p>Nous avons bien reçu votre demande et vous avons envoyé un email de confirmation.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <a href="/">Retour à l'accueil</a>
      `);
    });
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
