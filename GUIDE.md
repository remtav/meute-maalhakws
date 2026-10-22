# Guide — Site de la meute Maalhakws

## Pour les animateurs : publier

1. Aller sur **https://app.pagescms.org** et se connecter avec le courriel invité (un lien de connexion est envoyé par courriel).
2. Choisir le dépôt **meute-maalhakws**.
3. **Publier une nouvelle** : *Nouvelles* → *Ajouter* → remplir Titre, Date, Texte (image optionnelle) → *Enregistrer*.
   La nouvelle est en ligne en ~1 minute, en haut du babillard.
   Cocher *Épingler* pour la garder en tête du babillard (décocher quand elle n'est plus utile).
4. **Modifier le mot de bienvenue ou les infos pratiques** : *Mot de bienvenue* ou *Infos pratiques*.
5. **Changer le lien des photos** : *Réglages* → coller le lien Proton Drive.

## Pour l'administrateur : mise en place (une seule fois)

### 1. Cloudflare Pages (hébergement)
1. Créer un compte gratuit sur https://dash.cloudflare.com.
2. *Workers & Pages* → *Create* → *Pages* → *Connect to Git* → choisir `remtav/meute-maalhakws`.
3. Nom du projet : `maalhakws` (adresse : `maalhakws.pages.dev`).
4. Framework : **Astro**; commande : `npm run build`; dossier : `dist`; branche de production : `main`.
5. *Settings* → *Variables and Secrets* : ajouter `PUBLIC_GA_ID` = identifiant GA4 (`G-…`), puis redéployer.

> ⚠️ Ne communiquer l'adresse à personne avant d'avoir terminé l'étape 2.

### 2. Cloudflare Access (site privé)
1. Projet Pages → *Settings* → *General* → **Enable access policy** (protège les aperçus).
2. *Zero Trust* (choisir le forfait **Free**) → *Access* → *Applications* → ouvrir l'application créée à l'étape précédente.
3. Dans *Public hostname*, retirer le `*` du sous-domaine pour couvrir `maalhakws.pages.dev`, puis enregistrer.
4. Réactiver *Enable access policy* dans Pages pour recréer la protection des aperçus. Il doit y avoir **deux** applications Access (domaine principal + aperçus).
5. *Settings* → *Authentication* : activer **One-time PIN**.
6. *Access* → *Lists* (ou directement dans la politique) : liste **Familles** avec les courriels autorisés.
7. Politique de chaque application : *Allow* → *Include* → *Emails* = liste Familles (+ animateurs). Durée de session : **1 mois**.
8. Tester : courriel autorisé → code reçu; courriel non autorisé → aucun code; navigation privée → page de connexion.

Procédure officielle : https://developers.cloudflare.com/pages/platform/known-issues/ (section Access).

### 3. Pages CMS (publication)
1. Se connecter sur https://app.pagescms.org avec GitHub et installer l'application sur le dépôt.
2. Le fichier `.pages.yml` du dépôt configure déjà les formulaires.
3. *Settings* → *Collaborators* : inviter chaque animateur par courriel (pas de compte GitHub requis).

### 4. Proton Drive (photos)
1. Créer le dossier `Meute Maalhakws – Photos`.
2. *Partager* → *Créer un lien public* → accès **Éditeur**, sans mot de passe; **désactiver** l'option permettant aux éditeurs de repartager.
3. Coller le lien dans Pages CMS → *Réglages*.

### 5. Google Analytics (alertes)
1. Créer une propriété GA4 (flux Web : `https://maalhakws.pages.dev`), copier l'identifiant `G-…` dans `PUBLIC_GA_ID` (étape 1.5).
2. GA4 → *Rapports* → *Insights* → *Créer* :
   - utilisateurs actifs quotidiens **> 40**, notification courriel;
   - anomalie sur les utilisateurs actifs;
   - pays différent du Canada.
3. En cas d'alerte : vérifier *Zero Trust* → *Logs* → *Access* pour voir quels courriels se sont connectés.

## Gestion courante
- **Ajouter/retirer une famille** : Zero Trust → *Access* → *Lists* → *Familles*.
- **Le lien Proton a fuité** : dans Proton Drive, supprimer le lien et en créer un nouveau; le coller dans *Réglages*.
- **Fin d'année** : vider la liste des familles sortantes; régénérer le lien Proton.
