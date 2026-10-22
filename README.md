# Meute Maalhakws

Site privé de la meute Maalhakws : babillard de nouvelles, infos pratiques et accès aux photos (Proton Drive).

- Plan et décisions : [`PLAN.md`](PLAN.md)
- Publication et mise en place : [`GUIDE.md`](GUIDE.md)

## Développement

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # site statique dans dist/
npm run check    # vérification des types
```

Variable optionnelle : `PUBLIC_GA_ID` (identifiant Google Analytics 4, chargé après consentement).

## Contenu

| Contenu | Fichier | Édition |
|---|---|---|
| Nouvelles | `src/content/nouvelles/*.md` | Pages CMS → Nouvelles |
| Mot de bienvenue | `src/content/pages/accueil.md` | Pages CMS → Mot de bienvenue |
| Infos pratiques | `src/content/pages/infos.md` | Pages CMS → Infos pratiques |
| Lien des photos | `src/data/reglages.json` | Pages CMS → Réglages |
| Images | `public/uploads/` | Téléversement dans Pages CMS |
