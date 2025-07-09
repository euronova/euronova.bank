# Instructions de déploiement manuel sur Vercel

Ce document contient les étapes nécessaires pour déployer manuellement le projet `euronova.bank` sur Vercel.

## 1. Fichiers à déployer

Le processus de build a généré les fichiers nécessaires au déploiement dans le répertoire `dist/`.

Vous devrez uploader le contenu de ce répertoire sur Vercel.

## 2. Configuration des variables d'environnement sur Vercel

Les variables d'environnement suivantes doivent être configurées dans les paramètres de votre projet Vercel (dans la section "Environment Variables") :

- `DATABASE_URL`: `postgresql://postgres:zMRlHTqxB10grEyX@db.pheefsnpybwtafhrysaa.supabase.co:5432/postgres`
- `BREVO_API_KEY`: `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`
- `APP_URL`: `http://localhost:5000` (ou l'URL de votre application déployée sur Vercel)
- `NODE_ENV`: `production`

Assurez-vous que ces variables sont définies pour l'environnement de production.

## 3. Configuration du projet Vercel

Votre projet Vercel devrait être configuré comme suit :

- **Framework Preset**: `Other` (si Vercel ne détecte pas automatiquement le bon)
- **Build Command**: `npm run build` (ceci est déjà fait localement, mais Vercel peut le refaire si vous uploade le code source)
- **Output Directory**: `dist`
- **Root Directory**: Laissez vide si votre projet est à la racine, sinon spécifiez le sous-répertoire contenant `package.json`.

## 4. Déploiement

Une fois les fichiers uploadés et les variables d'environnement configurées, Vercel devrait automatiquement lancer le déploiement. Si ce n'est pas le cas, vous pouvez déclencher un nouveau déploiement depuis votre tableau de bord Vercel.

Si vous rencontrez toujours des problèmes, veuillez vérifier les logs de build et de runtime sur Vercel pour des messages d'erreur spécifiques.

