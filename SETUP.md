# Résidence Seven — mise en ligne avec interface admin

Ce dossier contient :
- `index.html` — le site public (charge son contenu depuis l'API)
- `admin.html` — l'interface d'administration, protégée par mot de passe
- `functions/api/content.js` — l'API qui stocke et renvoie le contenu (fonction Cloudflare Pages)
- `content.default.json` — le contenu de départ (référence, pas utilisé directement en ligne)

## Étape 1 — Créer un espace de stockage (KV)

1. Dans le tableau de bord Cloudflare : **Workers & Pages** → onglet **KV** → **Créer un espace de noms**
2. Nommez-le par exemple `RESIDENCE_SEVEN_CONTENT`
3. Validez (pas besoin d'y ajouter de valeur, l'admin le remplira automatiquement)

## Étape 2 — Déployer le site

1. **Workers & Pages** → **Créer une application** → **Pages** → **Télécharger des ressources** (upload direct)
2. Glissez tout le **dossier** `site` (contenant `index.html`, `admin.html` et le sous-dossier `functions`)
3. Donnez un nom au projet (ex. `residence-seven`) → Déployer
4. Votre site est en ligne sur `residence-seven.pages.dev`

## Étape 3 — Connecter le KV et le mot de passe

Dans le projet Cloudflare Pages qui vient d'être créé :

1. **Settings** → **Functions** → **KV namespace bindings** → **Add binding**
   - Variable name : `CONTENT_KV`
   - KV namespace : `RESIDENCE_SEVEN_CONTENT` (celui créé à l'étape 1)
2. **Settings** → **Environment variables** → **Add variable**
   - Nom : `ADMIN_PASSWORD`
   - Valeur : choisissez un mot de passe solide (ex. `Seven-Admin-2026!`)
   - Cochez "Encrypt" si l'option est proposée
3. Cliquez sur **Redéployer** (ou **Retry deployment**) pour que les nouvelles variables soient prises en compte — les bindings ne s'appliquent qu'après un nouveau déploiement.

## Étape 4 — Utiliser l'admin

1. Allez sur `https://votre-site.pages.dev/admin.html`
2. Entrez le mot de passe défini à l'étape 3
3. Modifiez les textes, prix, services, photos (URL d'image) etc.
4. Cliquez sur **Enregistrer** — le site public est mis à jour immédiatement, sans nouveau déploiement

## Notes importantes

- **Sécurité** : cette protection par mot de passe est simple et suffisante pour un usage courant, mais ce n'est pas un système de comptes multi-utilisateurs. Ne partagez le mot de passe qu'avec les personnes de confiance qui gèrent le site.
- **Photos** : le champ "URL de l'image" dans la galerie doit être un lien direct vers une image déjà hébergée en ligne (par exemple une photo uploadée sur un service comme Cloudflare Images, Imgur, ou votre propre hébergement). Laissé vide, une image de démonstration s'affiche à la place.
- **Si l'admin affiche un message d'erreur au chargement** ("Aucun contenu trouvé…") : c'est normal la toute première fois, tant que le KV n'a jamais été écrit. Modifiez ce que vous voulez et cliquez sur Enregistrer — cela créera le contenu.
- **Changer le mot de passe** : modifiez simplement la variable `ADMIN_PASSWORD` dans Settings → Environment variables, puis redéployez.
