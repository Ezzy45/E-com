const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const adminPath = path.join(__dirname, 'admin.txt');

// Utilisateur à ajouter
const newUsername = 'Yougui';
const newPassword = 'Ezzy';

// Hash le mot de passe
bcrypt.hash(newPassword, 10, (err, hash) => {
  if (err) throw err;

  // Format : username:hash
  const newUserLine = `${newUsername}:${hash}\n`;

  // Ajoute au fichier admin.txt
  fs.appendFile(adminPath, newUserLine, 'utf8', (err) => {
    if (err) throw err;
    console.log(`Utilisateur "${newUsername}" ajouté avec succès !`);
  });
});