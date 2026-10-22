# Plan de développement — Site de la meute Maalhakws

> « La meute Maalhakws est une fabuleuse meute extérieure pour vos jeunes pleins
> d'énergie et d'enthousiasme. Nous sommes très heureux que vous soyez des nôtres
> cette année ! »

## 1. Objectifs

| Besoin | Réponse retenue |
|---|---|
| Site **privé** : consultation réservée aux ~30 courriels autorisés d'avance | Cloudflare Access, liste blanche de courriels, connexion par code à usage unique (§3) |
| **Babillard** de nouvelles, du plus récent au plus ancien | Nouvelles en fichiers Markdown, triées par date à la compilation |
| Mécanisme **simple** pour publier | Pages CMS : formulaire web, animateurs invités par courriel, **sans compte GitHub** |
| **Photos** des événements via Proton Drive | Un bouton qui ouvre le dossier Proton Drive partagé avec permission de modifier (consultation + dépôt) |
| **Protection antirobot** | Défense en couches (§5) |
| Coût | 0 $ (adresse gratuite `*.pages.dev`) |

## 2. Architecture

```
Visiteur (navigateur)
   │  courriel → code à usage unique (envoyé seulement si le courriel est autorisé)
   ▼
Cloudflare Access  ── liste blanche des courriels (gratuit jusqu'à 50 utilisateurs)
   ▼
Cloudflare Pages   ── site statique (Astro) sur maalhakws.pages.dev
   ▲                  recompilé à chaque publication (~1 min)
GitHub (ce dépôt)  ── nouvelles = fichiers src/content/nouvelles/*.md
   ▲
Pages CMS          ── formulaire web des animateurs (collaborateurs invités par courriel)
```

**Pourquoi ce choix**
- **Statique** : rien à maintenir côté serveur, pas de base de données, pas de faille d'application à corriger.
- **Cloudflare Access** : le contenu n'est jamais servi sans authentification; ajouter ou retirer une famille = modifier une liste.
- **Pages CMS** (pagescms.org, gratuit, open source) : chaque publication crée un commit (historique et retour arrière gratuits). Les animateurs sont invités comme *collaborateurs par courriel* ([doc](https://pagescms.org/docs/configuration/collaborators/)) : ils reçoivent un lien de connexion par courriel et peuvent modifier les nouvelles et les images. Seul l'administrateur a besoin d'un compte GitHub (pour configurer et inviter).
- **Plan B** si Pages CMS ne convient pas : page `/admin` maison (Cloudflare Pages Functions) protégée par une règle Access réservée aux animateurs. Les nouvelles restent des fichiers Markdown dans le dépôt, donc rien n'est perdu.

## 3. Accès réservé aux courriels autorisés d'avance

**Mécanisme : Cloudflare Access (Zero Trust, forfait gratuit ≤ 50 utilisateurs) + méthode « One-time PIN ».**

1. Le visiteur arrive sur le site → Cloudflare affiche une page de connexion **avant** de servir quoi que ce soit.
2. Il saisit son courriel. **Le code n'est envoyé que si le courriel figure dans la politique d'accès** ; sinon rien n'est envoyé, mais la page affiche le même message, ce qui empêche de deviner quels courriels sont inscrits ([doc Cloudflare](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)).
3. Avec le code reçu, il obtient une session (durée proposée : 1 mois).

**Configuration**
- Politique *Allow* → *Include* → *Emails* : liste des courriels des familles et des animateurs (2 parents par famille possibles : ~30 familles × 1–2 courriels; rester sous **50 utilisateurs**, sinon 7 $/utilisateur/mois).
- Option pratique : une *Access List* (liste réutilisable) « Familles 2026-2027 », plus simple à mettre à jour.
- Protéger **à la fois** `maalhakws.pages.dev` **et** les aperçus de déploiement (`*.maalhakws.pages.dev`) : Cloudflare Pages → *Settings* → *Enable access policy*, puis modifier l'application Access créée pour couvrir aussi le domaine principal (procédure décrite dans les [problèmes connus de Pages](https://developers.cloudflare.com/pages/platform/known-issues/)).
- Si un domaine personnalisé est ajouté plus tard : l'ajouter à Pages **avant** de lui appliquer la politique Access (limitation documentée).

**Vérifications prévues** : courriel autorisé → code reçu et accès; courriel non autorisé → aucun code; URL d'aperçu non protégée → refusée; fichiers directs (`/photos`, images, `robots.txt`) → tous derrière Access.

## 4. Structure du site

```
/                 Accueil : mot de bienvenue + 3 dernières nouvelles + bouton « Photos »
/nouvelles        Babillard complet, du plus récent au plus ancien (pagination à 10)
/nouvelles/[slug] Nouvelle individuelle
/photos           Bouton « Voir et déposer les photos » + consignes
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

Réglages du site (`src/content/reglages.json`, éditable dans Pages CMS) :

```json
{ "lienPhotos": "https://drive.proton.me/urls/XXXX#YYYY", "motDePassePhotos": "…" }
```

## 5. Protection antirobot

| Couche | Effet | Coût |
|---|---|---|
| **Cloudflare Access** (§3) | Aucun robot ne voit le contenu, le lien Proton ni les adresses courriel : seule la page de connexion est publique | Inclus |
| **Code envoyé seulement aux courriels autorisés** | Un robot ne peut pas utiliser le formulaire pour faire envoyer des courriels à des inconnus ni deviner les inscrits | Inclus |
| **Non-indexation** : `robots.txt` (`Disallow: /`), balise `<meta name="robots" content="noindex, nofollow, noarchive">`, en-tête `X-Robots-Tag` via le fichier `_headers` | Les moteurs de recherche et robots d'IA respectueux n'indexent rien, même en cas d'erreur de configuration | Inclus |
| **Lien Proton protégé par mot de passe** + repartage désactivé | Si le lien fuit, il reste inutilisable sans le mot de passe | Inclus |
| **Aucun formulaire public** sur le site | Rien à polluer par des robots (pas de contact, pas d'inscription en ligne) | — |
| *Si un formulaire public est ajouté un jour* (ex. demande d'accès) : **Cloudflare Turnstile** | CAPTCHA invisible, gratuit | Gratuit |
| *Si un domaine personnalisé est ajouté* : **Bot Fight Mode**, blocage des robots d'IA, règle de limitation de débit | Filtrage des robots au niveau de Cloudflare (ces réglages s'appliquent à un domaine à soi, pas à `*.pages.dev`) | Gratuit |

## 6. Proton Drive

**Intégration (« embed ») dans une page du site (`iframe`) : ❌ impossible.**
- En-tête renvoyé par `https://drive.proton.me/urls/...` (vérifié le 2026-10-21) :
  `Content-Security-Policy: frame-ancestors https://mail.proton.me https://calendar.proton.me https://drive.proton.me`.
- Test réel dans Chromium (2026-10-22) : `Refused to frame 'https://drive.proton.me/' because an ancestor violates the following Content Security Policy directive …`.
- L'affichage des photos dans nos pages via API est aussi irréaliste (fichiers chiffrés de bout en bout, déchiffrés seulement dans l'application Proton).

**Solution retenue : ✅ un bouton vers le dossier partagé avec permission de modifier** ([doc Proton](https://proton.me/support/drive-shareable-link)).
1. Dans Proton Drive, créer un dossier `Meute Maalhakws – Photos` (sous-dossiers par événement au besoin).
2. *Partager → Créer un lien public → accès* **Éditeur**; activer un **mot de passe**; **désactiver le repartage** par les éditeurs; date d'expiration à la fin de l'année scoute.
3. Coller le lien et le mot de passe dans les réglages (Pages CMS). La page `/photos` affiche un gros bouton « Voir et déposer les photos » (nouvel onglet) et le mot de passe, visibles seulement par les personnes connectées.

**À savoir**
- Les parents consultent et déposent **sans compte Proton**; chacun ne peut supprimer ou renommer **que ses propres fichiers**.
- Les dépôts comptent dans l'espace de stockage du propriétaire du compte : surveiller le quota (photo de téléphone ≈ 3–5 Mo).
- Forfait Drive gratuit : 3 liens Éditeur maximum — un seul est nécessaire ici.
- Les visiteurs du lien voient l'identité (compte Proton) de la personne qui partage.

## 7. Étapes de réalisation

| # | Étape | Livrable | Effort |
|---|---|---|---|
| 1 | Initialiser Astro + thème (couleurs, logotype, police Nunito, mobile d'abord) | Squelette déployable | 0,5 j |
| 2 | Collection `nouvelles` + pages Accueil / Babillard / Nouvelle, tri décroissant, épinglage, pagination | Babillard fonctionnel | 0,5 j |
| 3 | Page `/photos` (bouton Proton + mot de passe) alimentée par `reglages.json` | Accès photos | 0,1 j |
| 4 | Non-indexation : `robots.txt`, balise meta, `_headers` (`X-Robots-Tag`, en-têtes de sécurité) | Couche antirobot | 0,1 j |
| 5 | Pages CMS (`.pages.yml`) : formulaires « Nouvelle » et « Réglages », téléversement d'images; inviter les animateurs par courriel | Publication sans code | 0,25 j |
| 6 | Déploiement Cloudflare Pages (branche `main`) sur `maalhakws.pages.dev` (ou nom disponible) | Site en ligne | 0,25 j |
| 7 | Cloudflare Access : application sur le domaine principal + aperçus, politique « Emails » (liste blanche), One-time PIN, session 1 mois | Site privé | 0,25 j |
| 8 | Tests (voir §3 *Vérifications*), publication d'une nouvelle, dépôt d'une photo, mobile | Validation | 0,25 j |
| 9 | Guide d'une page pour les animateurs (publier, changer le lien photos, ajouter/retirer une famille) | `GUIDE.md` | 0,25 j |

**Total estimé : ~2,5 jours.**

> Important : ne pas communiquer l'adresse du site avant la fin de l'étape 7. Entre les étapes 6 et 7, le site est public.

## 8. Exploitation courante

- **Publier une nouvelle** : app.pagescms.org → « Nouvelles » → *Ajouter* → *Enregistrer*. En ligne en ~1 minute.
- **Changer le lien ou le mot de passe des photos** : Pages CMS → « Réglages ».
- **Ajouter/retirer une famille** : Cloudflare Zero Trust → Access → liste « Familles » → ajouter/supprimer le courriel.
- **Fin d'année** : vider la liste des familles sortantes; régénérer le lien Proton et son mot de passe.

## 9. Confidentialité (photos d'enfants)

- Aucun nom de famille d'enfant dans les nouvelles; prénoms seulement si nécessaire.
- Obtenir le consentement photo des parents en début d'année.
- Rappeler sur la page `/photos` de ne pas repartager le lien ni les photos hors de la meute.

## 10. Identité visuelle

Logotype provisoire, lettrage seulement : [`assets/logo.svg`](assets/logo.svg) — « MEUTE » en petites capitales espacées (orange) au-dessus de « Maalhakws » (bleu nuit, Nunito Black), souligné vert forêt. Les lettres sont converties en tracés : rendu identique partout, sans dépendre des polices installées. Un vrai logo sera produit par le groupe et pourra le remplacer sans autre changement.

| Rôle | Couleur | Code |
|---|---|---|
| Principale (titres, en-tête) | Bleu nuit | `#1F3047` |
| Accent (boutons, liens) | Orange feu de camp | `#E8772E` |
| Nature (bandeaux, soulignés) | Vert forêt | `#2F5D3A` |
| Mise en valeur (dates, épinglé) | Jaune soleil | `#F2B53A` |
| Fond de page | Crème | `#FFF7E8` |

Police : *Nunito* (licence SIL OFL, libre d'utilisation).

## 11. Décisions

| # | Question | Décision |
|---|---|---|
| 1 | Adresse | Adresse gratuite `*.pages.dev` pour commencer |
| 2 | Publication | Pages CMS, animateurs invités par courriel (sans compte GitHub) |
| 3 | Photos | Un bouton vers le dossier Proton Drive partagé avec permission de modifier |
| 4 | Logo | Logotype provisoire en lettrage seulement; logo final fourni par le groupe |
| 5 | Accès | Liste blanche de courriels Cloudflare Access (code à usage unique) |
| 6 | Robots | Défense en couches (§5) |
