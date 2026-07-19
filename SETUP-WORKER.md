# Résidence Seven — déploiement (version Workers, 2026)

Cloudflare a changé son interface : la création de "Pages" classique a été fusionnée
dans "Workers". Ce dossier est adapté à la nouvelle interface.

## Contenu du dossier

- `public/index.html` — le site public
- `public/admin.html` — l'interface d'administration
- `worker.js` — gère l'API `/api/content` ET sert les fichiers du dossier `public/`
- `wrangler.jsonc` — fichier de configuration que Cloudflare lit pour savoir comment déployer

## Étape 1 — Remplacer les fichiers sur GitHub

Sur votre dépôt `residence-seven` (github.com) :
1. Supprimez l'ancien contenu (les fichiers `index.html`, `admin.html`, `content.default.json`,
   `SETUP.md` et le dossier `functions` à la racine) — ou uploadez simplement les nouveaux
   fichiers par-dessus si GitHub vous le permet
2. Ajoutez ces nouveaux fichiers/dossiers **à la racine du dépôt** :
   - `worker.js`
   - `wrangler.jsonc`
   - le dossier `public/` (avec `index.html` et `admin.html` dedans)
3. **Commit changes**

## Étape 2 — Créer le Worker sur Cloudflare

1. dash.cloudflare.com → **Workers & Pages** → **Create application**
2. **Import a repository** / **Sélectionner un référentiel**
3. Choisissez `residence-seven`
4. Sur l'écran de configuration :
   - **Nom du projet** : `residence-seven`
   - **Déployer la commande** : laissez `npx wrangler deploy` (par défaut)
   - **Chemin d'accès** : `/`
5. Cliquez sur **Déployer**

Cloudflare va lire `wrangler.jsonc`, comprendre qu'il faut servir `public/` comme site
et exécuter `worker.js` pour l'API. Vous obtiendrez une adresse `residence-seven.workers.dev`
(ou similaire).

## Étape 3 — Reconnecter le KV et le mot de passe

Comme avant, mais cette fois dans les réglages du **Worker** (pas Pages) :
1. Ouvrez le Worker `residence-seven` créé → **Settings** → **Bindings** (ou **Variables et secrets**)
2. **Add** → **KV namespace**
   - Variable name : `CONTENT_KV`
   - Sélectionnez `RESIDENCE_SEVEN_CONTENT` (déjà créé précédemment)
3. **Add** → **Variable d'environnement / Secret**
   - Nom : `ADMIN_PASSWORD`
   - Valeur : votre mot de passe
4. **Enregistrer**, puis redéployez si demandé (menu Déploiements → relancer le dernier déploiement)

## Étape 4 — Tester

Allez sur `https://[votre-worker].workers.dev/admin.html`, entrez le mot de passe, modifiez
et enregistrez. Le site public (`/`) doit refléter les changements immédiatement.

## Notes

- Si Cloudflare vous laisse choisir un sous-domaine personnalisé plus tard (nom de domaine),
  le fonctionnement reste identique.
- Le formulaire de réservation du site redirige vers `https://reservation-seven.pages.dev`
  avec les dates/suite/email en paramètres d'URL — inchangé.
