# Plan de développement — Site de la meute Maalhakws

> « La meute Maalhakws est une fabuleuse meute extérieure pour vos jeunes pleins
> d'énergie et d'enthousiasme. Nous sommes très heureux que vous soyez des nôtres
> cette année ! »

## 1. Objectifs

| Besoin | Réponse retenue |
|---|---|
| Site **privé**, ~30 membres (familles) | Contrôle d'accès par courriel (liste blanche), sans mot de passe à gérer |
| **Babillard** de nouvelles, du plus récent au plus ancien | Nouvelles en fichiers Markdown, triées par date à la compilation |
| Mécanisme **simple** pour publier | Interface d'édition web (formulaire : titre, date, texte, image) — aucun code |
| **Photos** des événements via Proton Drive | Lien de partage Proton Drive (l'intégration en `iframe` est impossible, voir §4) |
| Coût | 0 $ (hors nom de domaine optionnel, ~15 $/an) |

## 2. Architecture recommandée

```
Parents (navigateur)
   │  courriel → code à usage unique
   ▼
Cloudflare Access  ── liste blanche des ~30 courriels (gratuit jusqu'à 50 utilisateurs)
   ▼
Cloudflare Pages   ── site statique (Astro) recompilé à chaque publication
   ▲
GitHub (ce dépôt)  ── nouvelles = fichiers src/content/nouvelles/*.md
   ▲
Pages CMS          ── formulaire web pour les animateurs qui publient
```

**Pourquoi ce choix**
- **Statique** : rien à maintenir côté serveur, pas de base de données, pas de faille d'application à corriger.
- **Cloudflare Access** : vraie protection (le contenu n'est jamais servi sans authentification), connexion par code envoyé par courriel — idéal pour des parents non techniques. Ajouter/retirer une famille = modifier une liste.
- **Pages CMS** (pagescms.org, gratuit, open source) : les responsables publient via un formulaire; chaque publication crée un commit et déclenche un redéploiement (~1 min). Historique et retour arrière gratuits grâce à Git.

**Alternatives écartées**
- *Mot de passe partagé unique* (ex. Cloudflare Pages + en-tête Basic Auth) : plus simple mais fuit facilement, impossible de révoquer une seule famille. Acceptable en plan B.
- *WordPress / Wix privé* : hébergement payant ou maintenance (mises à jour, extensions).
- *Google Sites* : gratuit et privé, mais exige un compte Google pour chaque famille.

## 3. Structure du site

```
/                 Accueil : mot de bienvenue + 3 dernières nouvelles + bouton « Photos »
/nouvelles        Babillard complet, du plus récent au plus ancien (pagination à 10)
/nouvelles/[slug] Nouvelle individuelle
/photos           Liste des albums d'événements (liens Proton Drive)
/infos            Calendrier, coordonnées des animateurs, matériel à apporter (optionnel)
```

Format d'une nouvelle (`src/content/nouvelles/2026-10-21-sortie-automne.md`) :

```markdown
---
titre: Sortie d'automne au parc
date: 2026-10-21
epingle: false        # optionnel : garder en haut du babillard
image: /uploads/automne.jpg   # optionnel
---
Rendez-vous samedi 9 h au chalet. Apportez bottes et collation !
```

Tri : `getCollection('nouvelles')` puis tri décroissant sur `date` (les nouvelles épinglées d'abord).

Albums photos (`src/content/albums.json`, aussi éditable dans Pages CMS) :

```json
[{ "titre": "Camp d'automne 2026", "date": "2026-10-18", "lien": "https://drive.proton.me/urls/XXXX#YYYY" }]
```

## 4. Proton Drive — faisabilité

**Intégration directe (iframe) : ❌ impossible.**
Vérifié le 2026-10-21 sur `https://drive.proton.me/urls/...` : la réponse contient
`Content-Security-Policy: frame-ancestors https://mail.proton.me https://calendar.proton.me https://drive.proton.me`.
Le navigateur refusera d'afficher un lien de partage Proton Drive dans une page d'un autre domaine.

**Affichage des photos dans notre page via API : ❌ non réaliste.**
Proton Drive est chiffré de bout en bout; la clé de déchiffrement est dans le fragment `#...` du lien et les fichiers ne sont déchiffrés que dans l'application Proton. Il n'existe pas d'URL d'image directe exploitable par une balise `<img>`, et utiliser le SDK pour déchiffrer dans notre site serait complexe et fragile.

**Solution retenue : ✅ lien de partage par événement.**
1. Dans Proton Drive, créer un dossier par événement (ex. `Meute/2026-10 Camp automne`).
2. *Partager → Créer un lien public*; activer un **mot de passe** sur le lien et, si souhaité, une **date d'expiration**.
3. Coller le lien dans la page `/photos` (via Pages CMS). Une carte avec titre, date et une photo de couverture (hébergée dans le dépôt) ouvre l'album dans un nouvel onglet.
4. Le mot de passe de l'album est indiqué uniquement sur le site (déjà protégé par Cloudflare Access) → double protection.

**À vérifier avec ton compte** : si tu veux que les parents *déposent* aussi leurs photos, tester l'option de lien avec permission d'édition (« peut modifier ») offerte selon ton forfait Proton. Sinon, un formulaire de dépôt séparé pourra être envisagé plus tard.

## 5. Étapes de réalisation

| # | Étape | Livrable | Effort |
|---|---|---|---|
| 1 | Initialiser Astro + thème simple (couleurs de la meute, logo, responsive mobile) | Squelette déployable | 0,5 j |
| 2 | Collection `nouvelles` + pages Accueil / Babillard / Nouvelle, tri décroissant, épinglage, pagination | Babillard fonctionnel | 0,5 j |
| 3 | Page `/photos` alimentée par `albums.json` | Cartes d'albums | 0,25 j |
| 4 | Configurer Pages CMS (`.pages.yml`) : formulaires « Nouvelle » et « Album », téléversement d'images | Publication sans code | 0,25 j |
| 5 | Déploiement Cloudflare Pages (branche `main`) + domaine (optionnel) | Site en ligne | 0,25 j |
| 6 | Cloudflare Zero Trust → Access : application sur le domaine, politique « Emails » avec la liste des familles, méthode « One-time PIN »; durée de session 1 mois | Site privé | 0,25 j |
| 7 | Tests : connexion d'un parent test, publication d'une nouvelle, ouverture d'un album, mobile | Validation | 0,25 j |
| 8 | Guide d'une page pour les animateurs (publier une nouvelle, ajouter un album, ajouter une famille) | `GUIDE.md` | 0,25 j |

**Total estimé : ~2,5 jours.**

## 6. Exploitation courante

- **Publier une nouvelle** : pagescms.org → « Nouvelles » → *Ajouter* → *Enregistrer*. En ligne en ~1 minute.
- **Ajouter un album** : créer le lien Proton Drive → Pages CMS → « Albums » → coller le lien.
- **Ajouter/retirer une famille** : Cloudflare Zero Trust → Access → Politique → liste des courriels.
- **Fin d'année** : retirer les courriels des familles sortantes; faire expirer les anciens liens d'albums.

## 7. Confidentialité (photos d'enfants)

- Aucun nom de famille d'enfant dans les nouvelles; prénoms seulement si nécessaire.
- `robots.txt` + `noindex` (en plus d'Access) pour éviter tout référencement.
- Obtenir le consentement photo des parents en début d'année; ne pas mettre d'albums sur le site pour les jeunes sans consentement.
- Liens Proton Drive : mot de passe + expiration (ex. fin de l'année scoute).

## 8. Décisions à confirmer

1. Nom de domaine dédié (ex. `maalhakws.ca`) ou sous-domaine gratuit `*.pages.dev`?
2. Qui publie? (Les personnes qui publient ont besoin d'un compte GitHub gratuit, ajouté comme collaborateur du dépôt.)
3. Les parents doivent-ils pouvoir téverser des photos, ou seulement les consulter?
4. Logo / couleurs de la meute disponibles?
