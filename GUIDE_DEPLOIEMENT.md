# Guide de Déploiement Rapide - Decor Mali

## 🎯 Vue d'ensemble

Ce guide vous permet de déployer votre site Decor Mali sur GitHub et Netlify en moins de 15 minutes.

## ✅ Checklist Avant de Commencer

- [ ] Compte GitHub créé ([S'inscrire](https://github.com/signup))
- [ ] Compte Netlify créé ([S'inscrire](https://app.netlify.com/signup))
- [ ] Git installé sur votre ordinateur ([Télécharger](https://git-scm.com/downloads))
- [ ] Node.js 22+ installé ([Télécharger](https://nodejs.org))

## 📤 Étape 1 : Déployer sur GitHub (5 minutes)

### 1.1 Ouvrir un terminal

- **Windows** : Ouvrez "Git Bash" ou "PowerShell"
- **Mac/Linux** : Ouvrez "Terminal"

### 1.2 Naviguer vers le dossier du projet

```bash
cd chemin/vers/decor-mali-simple
```

### 1.3 Initialiser Git

```bash
git init
git add .
git commit -m "Initial commit - Site Decor Mali"
```

### 1.4 Créer un dépôt sur GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Remplissez :
   - **Repository name** : `decor-mali`
   - **Description** : "Site web Decor Mali avec système de devis"
   - **Visibilité** : Public ou Private (votre choix)
3. **NE COCHEZ PAS** "Initialize this repository with a README"
4. Cliquez sur **"Create repository"**

### 1.5 Lier et pousser le code

GitHub vous affichera des commandes. Copiez et exécutez :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/decor-mali.git
git branch -M main
git push -u origin main
```

**Remplacez `VOTRE_USERNAME`** par votre nom d'utilisateur GitHub.

✅ **Votre code est maintenant sur GitHub !**

## 🌐 Étape 2 : Déployer sur Netlify (5 minutes)

### 2.1 Se connecter à Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Sign up with GitHub"**
3. Autorisez Netlify à accéder à votre compte GitHub

### 2.2 Importer le projet

1. Sur le tableau de bord Netlify, cliquez sur **"Add new site"**
2. Sélectionnez **"Import an existing project"**
3. Choisissez **"Deploy with GitHub"**
4. Si demandé, autorisez Netlify à accéder à vos dépôts
5. Cherchez et sélectionnez **`decor-mali`**

### 2.3 Configuration du build

Netlify détectera automatiquement les paramètres grâce au fichier `netlify.toml`.

Vérifiez que vous voyez :
- **Branch to deploy** : `main`
- **Build command** : `pnpm install && pnpm run build`
- **Publish directory** : `dist/public`

Si ce n'est pas le cas, entrez ces valeurs manuellement.

### 2.4 Déployer

1. Cliquez sur **"Deploy decor-mali"**
2. Attendez 2-3 minutes pendant le build
3. Une fois terminé, vous verrez "Site is live" ✅

### 2.5 Obtenir votre URL

Netlify vous donnera une URL comme : `https://random-name-123456.netlify.app`

**Pour la personnaliser** :
1. Allez dans **"Site settings"**
2. Cliquez sur **"Domain management"**
3. Sous "Site name", cliquez sur **"Options"** → **"Edit site name"**
4. Changez en : `decor-mali` (si disponible)
5. Votre URL sera : `https://decor-mali.netlify.app`

✅ **Votre site est en ligne !**

## 🔄 Mettre à Jour le Site

Pour publier des modifications :

```bash
# 1. Faites vos modifications dans le code

# 2. Committez et poussez
git add .
git commit -m "Description de vos modifications"
git push

# 3. Netlify redéploiera automatiquement (2-3 minutes)
```

## 🎨 Personnalisations Importantes

### Changer les coordonnées

Éditez `client/src/pages/Home.jsx` :

```jsx
// Ligne ~237 : Numéro de téléphone
<span className="font-medium">+223 XX XX XX XX</span>

// Ligne ~244 : Email
<span className="font-medium">contact@decormali.com</span>
```

### Changer les prix

Éditez `client/src/pages/QuotePage.jsx` :

```jsx
// Ligne ~13
const PRICES = {
  salon: {
    mattress: 130000,  // Prix d'un matelas
    corner: 130000,    // Prix d'un coin
    arms: 96000,       // Prix d'une paire de bras
    smallTable: 50000, // Prix petite table
    bigTable: 130000,  // Prix grande table
    delivery: 75000,   // Prix livraison
  },
  carpet: {
    pricePerSqm: 13000, // Prix tapis par m²
    delivery: 75000,
  },
  curtain: {
    dubai: 6000,     // 1ère qualité
    quality2: 4500,  // 2ème qualité
    quality3: 4000,  // 3ème qualité
    delivery: 75000,
  },
};
```

Après modification, suivez les étapes de mise à jour ci-dessus.

## 📧 Activer l'Envoi d'Emails (Optionnel)

Par défaut, le formulaire de devis ne envoie pas d'emails. Pour activer cette fonctionnalité :

### Option 1 : Netlify Forms (Recommandé)

1. Dans `client/src/pages/QuotePage.jsx`, modifiez la fonction `handleSubmitQuote`
2. Utilisez l'API Netlify Forms ([Documentation](https://docs.netlify.com/forms/setup/))

### Option 2 : EmailJS (Gratuit)

1. Créez un compte sur [emailjs.com](https://www.emailjs.com/)
2. Installez le package :
   ```bash
   pnpm add @emailjs/browser
   ```
3. Suivez leur [documentation](https://www.emailjs.com/docs/)

## 🆘 Problèmes Courants

### "Build failed" sur Netlify

**Solution** :
1. Allez dans "Deploys" sur Netlify
2. Cliquez sur le dernier déploiement
3. Consultez les logs pour voir l'erreur
4. Souvent, c'est un problème de version Node.js (vérifiez `netlify.toml`)

### Le site affiche une page blanche

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs
3. Vérifiez que tous les fichiers sont bien dans `dist/public` après le build

### Git demande un mot de passe à chaque push

**Solution** : Configurez SSH ou utilisez un Personal Access Token GitHub
- [Guide SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [Guide Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## 📊 Statistiques du Site (Optionnel)

Pour suivre les visiteurs de votre site :

1. Créez un compte [Google Analytics](https://analytics.google.com)
2. Ajoutez le code de suivi dans `client/index.html`

Ou utilisez l'analytics intégré de Netlify (payant).

## 🔒 Sécurité

Le site est sécurisé par défaut avec :
- HTTPS automatique (fourni par Netlify)
- Headers de sécurité (configurés dans `netlify.toml`)
- Pas de base de données (pas de risque de fuite de données)

## 📱 Tester sur Mobile

Après déploiement, testez votre site sur :
- Votre smartphone
- [BrowserStack](https://www.browserstack.com/responsive) (gratuit pour test)
- L'outil de développement Chrome (F12 → Toggle device toolbar)

## 🎉 Félicitations !

Votre site Decor Mali est maintenant en ligne et accessible à tous !

**URL de votre site** : `https://votre-nom.netlify.app`

Partagez-le sur :
- Facebook
- Instagram
- WhatsApp
- Cartes de visite

## 📚 Ressources Utiles

- [Documentation Netlify](https://docs.netlify.com)
- [Documentation React](https://react.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Communauté GitHub](https://github.community)

## 💡 Prochaines Étapes

Pour améliorer votre site :
- [ ] Ajouter une galerie de photos de vos produits
- [ ] Intégrer WhatsApp Business pour le contact direct
- [ ] Ajouter un système d'envoi d'emails automatique
- [ ] Connecter Google Analytics pour suivre les visiteurs
- [ ] Acheter un nom de domaine personnalisé (ex: `decormali.com`)

---

**Besoin d'aide ?** Consultez le fichier `README.md` pour plus de détails techniques.

**Bon déploiement ! 🚀**

