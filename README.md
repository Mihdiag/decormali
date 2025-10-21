# Decor Mali - Site Web Simplifié

Site web vitrine pour Decor Mali avec système de devis en ligne pour salons, tapis et rideaux.

## 🚀 Technologies Utilisées

- **React 19** - Framework JavaScript
- **Vite** - Build tool rapide
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **Wouter** - Routeur léger

## 📋 Fonctionnalités

- ✅ Page d'accueil avec présentation des services
- ✅ Système de devis en ligne pour :
  - Salons marocains et mauritaniens
  - Tapis et moquettes
  - Rideaux (3 qualités)
- ✅ Calcul automatique des prix
- ✅ Formulaire de contact
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Interface en français

## 🛠️ Installation Locale

### Prérequis

- Node.js version 22+ ([Télécharger](https://nodejs.org))
- pnpm ([Installer](https://pnpm.io/installation))

### Étapes

1. **Cloner ou extraire le projet**

```bash
cd decor-mali-simple
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Lancer en mode développement**

```bash
pnpm run dev
```

Le site sera accessible sur `http://localhost:3000`

4. **Builder pour la production**

```bash
pnpm run build
```

Les fichiers de production seront dans le dossier `dist/public`

## 🌐 Déploiement sur GitHub et Netlify

### Étape 1 : Déployer sur GitHub

1. **Initialiser Git**

```bash
git init
git add .
git commit -m "Initial commit - Decor Mali"
```

2. **Créer un dépôt sur GitHub**

- Allez sur [github.com](https://github.com)
- Cliquez sur "New repository"
- Nommez-le `decor-mali`
- Ne cochez pas "Initialize with README"
- Cliquez sur "Create repository"

3. **Pousser le code**

```bash
git remote add origin https://github.com/VOTRE_USERNAME/decor-mali.git
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer sur Netlify

#### Option A : Via l'interface Netlify (Recommandé)

1. **Créer un compte Netlify**
   - Allez sur [netlify.com](https://www.netlify.com)
   - Inscrivez-vous avec votre compte GitHub

2. **Importer le projet**
   - Cliquez sur "Add new site" → "Import an existing project"
   - Sélectionnez "Deploy with GitHub"
   - Choisissez votre dépôt `decor-mali`

3. **Configuration automatique**
   - Netlify détectera automatiquement les paramètres grâce au fichier `netlify.toml`
   - Vérifiez :
     - Build command: `pnpm install && pnpm run build`
     - Publish directory: `dist/public`

4. **Déployer**
   - Cliquez sur "Deploy site"
   - Attendez 2-3 minutes
   - Votre site sera en ligne !

5. **Personnaliser l'URL**
   - Dans "Site settings" → "Domain management"
   - Changez le nom du site (ex: `decor-mali.netlify.app`)

#### Option B : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

## 📝 Personnalisation

### Modifier les coordonnées

Éditez le fichier `client/src/pages/Home.jsx` :

```jsx
// Ligne ~237
<Phone className="h-5 w-5 text-orange-600" />
<span className="font-medium">+223 XX XX XX XX</span>

// Ligne ~244
<Mail className="h-5 w-5 text-orange-600" />
<span className="font-medium">contact@decormali.com</span>
```

### Modifier les prix

Éditez le fichier `client/src/pages/QuotePage.jsx` :

```jsx
// Ligne ~13
const PRICES = {
  salon: {
    mattress: 130000,
    corner: 130000,
    arms: 96000,
    // ...
  },
  // ...
};
```

### Modifier le nom du site

Éditez le fichier `shared/const.ts` :

```typescript
export const APP_TITLE = "Decor Mali";
export const APP_LOGO = "https://votre-logo.com/logo.png";
```

## 📱 Fonctionnement du Système de Devis

Le système de devis fonctionne entièrement côté client (dans le navigateur) :

1. L'utilisateur sélectionne un type de produit (Salon, Tapis, Rideaux)
2. Il configure les dimensions et options
3. Le prix est calculé instantanément en JavaScript
4. Il remplit ses coordonnées
5. Une notification confirme l'envoi de la demande

**Note** : Actuellement, les demandes de devis ne sont pas envoyées par email. Pour activer cette fonctionnalité, vous pouvez :

- Utiliser [EmailJS](https://www.emailjs.com/) (gratuit)
- Utiliser [Netlify Forms](https://www.netlify.com/products/forms/)
- Intégrer un service d'emailing

## 🎨 Personnalisation des Couleurs

Les couleurs principales sont définies dans `client/src/index.css` :

```css
:root {
  --primary: orange-600;
  --accent: amber-600;
}
```

Pour changer le thème, modifiez les classes Tailwind dans les fichiers JSX.

## 📦 Structure du Projet

```
decor-mali-simple/
├── client/
│   ├── public/          # Assets statiques
│   └── src/
│       ├── components/  # Composants UI réutilisables
│       ├── pages/       # Pages du site
│       │   ├── Home.jsx        # Page d'accueil
│       │   ├── QuotePage.jsx   # Page de devis
│       │   └── NotFound.tsx    # Page 404
│       ├── App.tsx      # Configuration des routes
│       └── main.tsx     # Point d'entrée
├── netlify.toml         # Configuration Netlify
├── package.json         # Dépendances
└── README.md           # Ce fichier
```

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm run dev

# Build de production
pnpm run build

# Prévisualiser le build
pnpm run preview

# Vérifier les types TypeScript
pnpm run check

# Formater le code
pnpm run format
```

## 🆘 Dépannage

### Le site ne se build pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
pnpm install
pnpm run build
```

### Erreur de version Node.js

Assurez-vous d'utiliser Node.js 22+:

```bash
node --version
```

### Le site ne s'affiche pas après déploiement

1. Vérifiez les logs de build dans Netlify
2. Assurez-vous que `dist/public` contient bien les fichiers
3. Vérifiez que le fichier `netlify.toml` est présent

## 📄 Licence

MIT - Vous êtes libre d'utiliser ce code pour votre projet.

## 📞 Support

Pour toute question sur le déploiement :
- Documentation Netlify : https://docs.netlify.com
- Documentation Vite : https://vitejs.dev

---

**Bon déploiement ! 🚀**

