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
  { id: 1, name: 'Produit 1', price: 19.99, image: 'product1.jpg' },
  { id: 2, name: 'Produit 2', price: 29.99, image: 'product2.jpg' },
  { id: 3, name: 'Produit 3', price: 39.99, image: 'product3.jpg' }
];

// Routes
app.get('/', (req, res) => {
  res.render('index', { products });
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