# CLAUDE.md · ExDaL (Ex Datis Lumen)

Contexte projet pour toute session Claude Code sur ce dépôt. À lire avant d'agir.

---

## 1. Ce qu'est ExDaL

**Ex Datis Lumen**, « De la donnée, la lumière ». Studio d'expertise en **data
financière**, spécialiste **Pennylane**. Un analytics engineer indépendant qui a la
**double compétence rare data + finance** : construit le pipeline ET comprend un
compte de résultat, une due diligence, les métriques qu'exige un investisseur.

Ce dépôt = **la landing exdal.fr**. Ce n'est pas un site vitrine : c'est **la machine
à leads / machine à cash** du studio. Chaque décision (design, copy, technique) se
juge à l'aune de la conversion en rendez-vous qualifiés.

**UVP :** « Vos chiffres savent déjà tout. ExDaL leur donne la parole. »
De la donnée Pennylane brute jusqu'au dossier qui vaut des millions le jour de la vente.

## 2. Objectifs business (source : lean canvas)

- **North Star :** nombre de clients récurrents actifs.
- **Métriques du tunnel :** calls de qualification bookés/semaine · taux call→mission ·
  taux mission→récurrent.
- **Revenus :** Socle TJM 550 à 600 € (missions courtes → **maintenance mensuelle
  récurrente**) ; Opération = forfait par levée/cession (ancre de valeur : 44 000 €
  déjà facturés par un cabinet pour un livrable équivalent).
- **Objectif court terme :** ~2 300 € net/mois (matelas de départ). **Long terme :**
  revenu récurrent portable.

### Segments (3 portes du sélecteur)
1. **PME / startups** sous Pennylane → veulent piloter clair (Le Socle).
2. **Cabinets comptables** sous Pennylane → servent leurs clients (Le Pilotage / marque blanche, hypothèse à tester).
3. **Dirigeants en levée / cession** → premium (L'Opération).

### Offres (jamais plus de 3 ; celle du milieu au centre)
- **Le Socle · Clarté** : réconciliation Pennylane + CRM + paiements, dashboards fiables.
- **Le Pilotage · au centre** : Socle + suivi mensuel récurrent. *Le choix évident.*
- **L'Opération · Maîtrise** : fichiers d'une levée/cession (ARR, MRR, current trading, cohortes).

## 3. Direction artistique (STRICTE, ne pas réinterpréter)

Clair-obscur, luxe austère, beaucoup d'espace négatif. Le calme et la maîtrise,
jamais l'agressivité commerciale.

| Token | Hex | Usage |
| ----- | --- | ----- |
| noir / noir-2 / noir-3 | `#090A0C` / `#0E1013` / `#14171B` | fonds |
| **or** | `#D9B26A` | **points de lumière RARES uniquement** |
| or-dim | `#A8894F` | eyebrows, accents secondaires |
| blanc | `#E8E9E6` | texte principal |
| brume | `#A9B0B6` | texte secondaire |
| gris | `#6F6858` | mentions discrètes |
| line | `#22262B` | filets, bordures |

- **L'or est rare.** Réservé : accents de titres clés, bouton d'action principal,
  métrique/offre mise en avant, point de lumière de l'emblème. Ne jamais le répandre.
- **Typo :** Newsreader (serif, titres) · IBM Plex Mono (chiffres, libellés, mentions).
  Self-hostées via `next/font`.
- **Emblème** (matière sombre → point d'or) : hero (masqué mobile, réduit tablette),
  favicon, image OG. Jamais en petit dans l'en-tête (bord carré visible).

## 4. Ton de voix

Calme et sûr (un expert qui n'a rien à prouver) · précis, jamais jargonneux · sobre
(jamais « révolutionnaire / innovant / leader ») · **on en dit moins pour signifier
plus**. Le luxe austère jusque dans les mots.

- **INTERDIT ABSOLU : le tiret cadratin (—) et le demi-cadratin (–).** Jamais, nulle
  part : ni dans la copy visible, ni dans les titres, ni dans les commentaires de code.
  À la place : virgule, deux-points, parenthèses ou point. Le point médian « · » reste
  autorisé pour les listes inline (eyebrows, mentions). Cette règle est non négociable.

## 5. Copy · source de vérité

Le copywriting définitif vit dans `/brief` (checkout principal, non commité) :
`exdal-marque.html` (plateforme de marque), `exdal-lean-canvas.html`,
`exdal-tunnel.html` (8 sections + principe psychologique de chaque bloc),
`exdal-script-appel.html` (script d'appel + formulaire de qualification).

**Reprendre le copy mot pour mot.** Ne pas réécrire sans raison. Toute nouvelle copy
doit passer par l'agent `thot-content` et respecter le ton ci-dessus.

## 6. Stack & architecture

Next.js 16 (App Router, page **statique**) · TypeScript · Tailwind v4 (tokens `@theme`
dans `app/globals.css`) · Supabase (leads) · Cal.com (RDV 20 min) · Resend (emails) ·
Vercel · domaine exdal.fr chez Hostinger.

```
app/            layout (SEO/fonts) · page (8 sections) · journal/ (cocon) · admin/ (panneau interne) · api/{lead,segment,cal-webhook,newsletter,score}
components/      sections/ · booking/ · ui/ · articles/ (rendu markdown, cartes, maillage)
content/        articles/*.md : source unique du contenu (frontmatter + Markdown)
lib/            validation(Zod) · env · supabase · leads(repository) · cal · email · rate-limit · articles/ (registry fs, schema, markdown, scheduler)
supabase/       migrations/0001_init.sql (RLS verrouillée, accès service_role serveur)
scripts/logo.mjs  génère emblème/favicon/OG depuis brand/logo-exdal-source.png
middleware.ts   Basic Auth du panneau /admin (fail-closed, ADMIN_PASSWORD)
```

**Contenu (le cocon Journal).** Chaque article = un fichier `content/articles/<slug>.md`
(frontmatter YAML validé Zod au build, fail-fast). Le registre scanne le dossier via
`fs` ; ajouter un article = déposer un `.md`. Rendu par react-markdown (aucun HTML brut,
aucun JS exécuté), avec la directive `::stat[label]{value="…"}` (l'unique point d'or par
article) et des ancres de titre automatiques. Les liens internes sont **auto-cicatrisants** :
un lien vers un article non encore publié retombe en texte, puis s'active seul via ISR le
jour de sa sortie (`publishedAt`). Les URLs publiques vivent sous `/journal/<slug>`
(anciennes `/articles/*` redirigées 308). Le panneau `/admin` (Basic Auth, `noindex`,
hors scheduler) liste et prévisualise les articles programmés/brouillons.

Le parcours : CTA « Échanger sur votre situation » → formulaire de qualification
3 questions → `/api/lead` (Supabase) → redirection Cal.com préremplie → webhook →
emails Resend (confirmation prospect + notif interne). Le sélecteur de parcours
enregistre un signal de segmentation et pré-remplit le stade.

## 7. Conventions de code (voir aussi ~/.claude/rules)

- **Immuabilité** : jamais de mutation, toujours de nouveaux objets (spread).
- **Petits fichiers** cohérents (200 à 400 lignes typiques, 800 max).
- **Validation Zod** à toute frontière (entrée API, webhook, env).
- **Aucun secret en dur** : tout en variables d'environnement (`lib/env.ts`, fail-fast).
- **Gestion d'erreurs** explicite ; messages user-friendly côté UI, log détaillé serveur
  (`lib/logger.ts`). Pas de `console.log` en prod.
- **Enveloppe API** cohérente `{ success, data?, error? }` (`lib/api.ts`).
- Sécurité : RLS Supabase, signature HMAC du webhook, honeypot + rate-limit, headers
  de sécurité (`next.config.ts`).

## 8. Workflow (imposé par le CEO)

**Une branche + une PR par fix/feature.** Jamais de commit direct sur `master`.

1. `git checkout -b <type>/<slug>` depuis `master` à jour.
2. Coder → **vérifier le rendu via le preview** (mcp Claude_Preview) aux breakpoints
   mobile/tablette/desktop avant de valider un changement visuel.
3. `pnpm lint` + `pnpm test` + `pnpm build` verts.
4. Commit **conventionnel en français** (`feat:`, `fix:`, `chore:`, `docs:`…),
   attribution désactivée (pas de co-author).
5. `git push -u origin <branche>` → `gh pr create --base master`.
6. La revue se fait en direct avec le CEO (screenshots) → `gh pr merge --squash`.

Commandes : `pnpm dev` · `pnpm build` · `pnpm test` · `pnpm lint`.

## 9. Garde-fous (important)

- **Rester dans le périmètre demandé.** Ne pas explorer Drive/Notion/sources externes
  sans consigne explicite. (Le CEO y tient, cf. mémoire `scope-discipline`.)
- **Ne pas inventer la roue** : les systèmes de conversion, biais cognitifs et leviers
  marketing sont connus et documentés : les appliquer à bon escient, pas les réinventer.
- **Chirurgical** : précis, rigoureux, créatif dans le cadre de la DA. Chaque ajout se
  justifie par un gain de lead/clarté, sinon on ne l'ajoute pas (espace négatif = valeur).

## 10. Équipe d'agents (à orchestrer selon le besoin)

`apollon-designer` (UI/UX, DA) · `thot-content` (copy/SEO/newsletter) ·
`hephaistos-dev` (archi/perf/sécu code) · `argos-qa` (tests, tracking) ·
`security-reviewer` (avant mise en prod). Skills clés : `/growth` (full-funnel),
`/psychology-ux` (biais cognitifs), `/vercel`, `/hosting`, `/gemini-media`.
