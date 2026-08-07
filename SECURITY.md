# Politique de sécurité

La sécurité d'ExDaL (landing exdal.fr) est une priorité. Merci de contribuer à la garder solide.

## Signaler une vulnérabilité

- **Contact :** contact@exdal.fr (objet commençant par « Sécurité »).
- **N'ouvrez pas** d'issue publique pour une faille non corrigée.
- Merci d'inclure : description, étapes de reproduction, impact potentiel, et si possible une suggestion de correctif.

Nous accusons réception sous 72 heures et vous tenons informé jusqu'à la correction.

## Divulgation coordonnée

Laissez-nous un délai raisonnable pour corriger avant toute divulgation publique. Aucune poursuite ne sera engagée contre une recherche de bonne foi respectant cette politique.

## Périmètre

Ce dépôt héberge la landing exdal.fr (Next.js). Surfaces principales : routes API (`app/api/*`), validation des entrées, authentification du panneau `/admin`, en-têtes de sécurité, webhooks.

## Mesures en place

- En-têtes de sécurité stricts : CSP, HSTS, X-Frame-Options, etc.
- RLS Supabase, accès `service_role` côté serveur uniquement.
- Validation Zod à toutes les frontières, rate-limiting durable, honeypots.
- Vérification HMAC des webhooks, comparaisons à temps constant.
- Analyse continue : CodeQL (SAST), audit des dépendances en CI, Dependabot.
