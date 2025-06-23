const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();
const app = express();
const multer = require('multer');
const PORT = process.env.PORT || 3000;

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_tres_securise',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration du moteur de vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Chemins des fichiers
const productsPath = path.join(__dirname, 'data', 'products.json');
const adminPath = path.join(__dirname, 'admin.txt');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });
// Fonction pour supprimer un fichier
function deleteFile(filePath) {
  const fullPath = path.join(__dirname, 'public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

// Initialisation des fichiers s'ils n'existent pas
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(productsPath)) {
  fs.writeFileSync(productsPath, JSON.stringify([
    {
      id: 1,
      name: "Smartphone",
      price: 599.99,
      category: "Électronique",
      image: "product1.jpg"
    },
    {
      id: 2,
      name: "Ordinateur portable",
      price: 999.99,
      category: "Électronique",
      image: "product2.jpg"
    },
    {
      id: 3,
      name: "T-shirt",
      price: 29.99,
      category: "Vêtements",
      image: "product3.jpg"
    }
  ], null, 2));
}
if (!fs.existsSync(adminPath)) {
  const defaultPassword = 'admin123';
  bcrypt.hash(defaultPassword, 10, (err, hash) => {
    if (err) throw err;
    fs.writeFileSync(adminPath, `admin:${hash}`);
  });
}

// Fonction pour lire les produits
const getProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Middleware d'authentification
const isAdmin = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/login');
};

// Routes publiques
app.get('/', (req, res) => {
  res.render('index', { products: getProducts() });
});

app.get('/products', (req, res) => {
  const category = req.query.category || 'Tous';
  const searchQuery = req.query.search || '';
  let filteredProducts = getProducts();
  if (category !== 'Tous') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }
  res.render('products', { 
    products: filteredProducts, 
    categories: ['Tous', 'Électronique', 'Vêtements', 'Maison', 'Alimentation'],
    currentCategory: category,
    searchQuery 
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    cities: ['Mamou', 'Conakry'],
    deliveryTime: '24h à 72h',
    satisfaction: '98% de clients satisfaits'
  });
});

app.get('/checkout', (req, res) => {
  const productId = parseInt(req.query.productId);
  const product = getProducts().find(p => p.id === productId);
  if (!product) {
    return res.redirect('/products');
  }
  res.render('checkout', { product });
});

// Routes d'authentification
app.get('/admin/login', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect('/admin');
  }
  res.render('admin-login', { error: req.query.error });
});

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminData = fs.readFileSync(adminPath, 'utf8');
    
    // Lire toutes les lignes (chaque ligne = un utilisateur)
    const users = {};
    adminData.trim().split('\n').forEach(line => {
      const [user, hash] = line.split(':');
      users[user] = hash.trim();
    });

    if (!users[username]) {
      return res.redirect('/admin/login?error=1');
    }

    const match = await bcrypt.compare(password, users[username]);
    if (match) {
      req.session.isAuthenticated = true;
      req.session.username = username; // Optionnel : garder le nom d'utilisateur
      req.session.save(err => {
        if (err) console.error('Session save error:', err);
        return res.redirect('/admin');
      });
      return;
    }

    res.redirect('/admin/login?error=1');

  } catch (err) {
    console.error('Login error:', err);
    res.redirect('/admin/login?error=1');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Route Admin principale
app.get('/admin', isAdmin, (req, res) => {
  try {
    const products = getProducts();
    res.render('admin', { 
      products,
      categories: ['Électronique', 'Vêtements', 'Maison', 'Alimentation']
    });
  } catch (err) {
    console.error('Admin render error:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Nouvelle route unique pour ajouter ou modifier un produit
app.post('/admin/save-product', isAdmin, upload.single('image'), (req, res) => {
  const { id, name, price, category, description} = req.body;
  console.log("Données reçues:", req.body);
console.log("Fichier reçu:", req.file);

  let products = getProducts();
  let imagePath = req.body.image; // Ancienne image par défaut

  // Si une nouvelle image est téléchargée
  if (req.file) {
    // Supprimer l'ancienne image si elle existe et ce n'est pas la même
    if (imagePath && imagePath !== req.file.filename) {
      const oldImagePath = path.join(__dirname, 'public', 'images', imagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    imagePath = req.file.filename; // Utiliser la nouvelle image
  }

  if (id) {
    // Mise à jour
    products = products.map(p => 
      p.id == id ? { ...p, name, price: parseFloat(price), category,description, image: imagePath } : p
    );
  } else {
    // Ajout
    products.push({
      id: Date.now(),
      name,
      price: parseFloat(price),
      category,
      description,
      image: imagePath
    });
  }

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.redirect('/admin');
});

// Suppression
app.post('/admin/delete-product', isAdmin, (req, res) => {
  const { id } = req.body;
  let products = getProducts();
  const productToDelete = products.find(p => p.id == id);

  if (productToDelete && productToDelete.image) {
    const imagePath = `images/${productToDelete.image}`;
    deleteFile(imagePath); // Supprime l'image du serveur
  }

  products = products.filter(p => p.id != id);
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.redirect('/admin');
});

// Nouvelle route pour récupérer les produits en JSON
app.get('/admin/products-data', isAdmin, (req, res) => {
  try {
    const products = getProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement des produits' });
  }
});

// Routes pour les commandes et messages
app.post('/submit-order', (req, res) => {
  const { fullName, email, phone, product, quantity } = req.body;
  /*const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });*/
  // Exemple de configuration plus résiliente
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: 'process.env.EMAIL_PASS'
  },
  connectionTimeout: 10000, // timeout de 10 secondes
  socketTimeout: 10000
});

  const mailOptionsAdmin = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
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

  const mailOptionsClient = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de commande',
    text: `
      Bonjour ${fullName},
      Nous avons bien reçu votre commande et vous remercions pour votre confiance.
      Récapitulatif de votre commande:
      Produit: ${product}
      Quantité: ${quantity}
      Nous vous contacterons bientôt pour finaliser la livraison.
      Cordialement,
      L'équipe de MamYano
    `
  };

  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.log('Erreur envoi admin:', error);
      return res.send('Erreur lors de l\'envoi de la commande.');
    }
    transporter.sendMail(mailOptionsClient, (errorClient, infoClient) => {
      if (errorClient) {
        console.log('Erreur envoi client:', errorClient);
        return res.send(`
          <h2>Merci pour votre commande, ${fullName}!</h2>
          <p>Nous avons bien reçu votre commande mais une erreur est survenue avec l'email de confirmation.</p>
          <a href="/">Retour à l'accueil</a>
        `);
      }
      res.send(`
        <h2>Merci pour votre commande, ${fullName}!</h2>
        <p>Nous avons bien reçu votre commande et vous avons envoyé un email de confirmation.</p>
        <a href="/">Retour à l'accueil</a>
      `);
    });
  });
});

app.post('/send-message', (req, res) => {
  const { name, email, phone, city, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptionsAdmin = {
    from: process.env.EMAIL_USER,
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

  const mailOptionsClient = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation de message',
    text: `
      Bonjour ${name},
      Nous avons bien reçu votre message et vous remercions pour votre confiance.
      Récapitulatif:
      Téléphone: ${phone}
      Ville: ${city}
      Notre équipe vous répondra dans les plus brefs délais.
      Cordialement,
      L'équipe de MamYano
    `
  };

  transporter.sendMail(mailOptionsAdmin, (error, info) => {
    if (error) {
      console.log('Erreur envoi admin:', error);
      return res.send('Erreur lors de l\'envoi du message.');
    }
    transporter.sendMail(mailOptionsClient, (errorClient, infoClient) => {
      if (errorClient) {
        console.log('Erreur envoi client:', errorClient);
        return res.send(`
          <h2>Merci pour votre message, ${name}!</h2>
          <p>Nous avons bien reçu votre message mais une erreur est survenue avec l'email de confirmation.</p>
          <a href="/">Retour à l'accueil</a>
        `);
      }
      res.send(`
        <h2>Merci pour votre message, ${name}!</h2>
        <p>Nous avons bien reçu votre message et vous avons envoyé un email de confirmation.</p>
        <a href="/">Retour à l'accueil</a>
      `);
    });
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
