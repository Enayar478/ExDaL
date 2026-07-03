# ExDaL — Plan stratégique de la machine à leads

> Document de référence. Synthèse de 5 audits (design, contenu/SEO, technique, QA,
> sécurité) + frameworks growth full-funnel et psychology-ux, appliqués au tunnel.
> Objectif : faire d'exdal.fr une machine à rendez-vous qualifiés — précise,
> mesurable, conforme. On n'invente pas la roue : biais et systèmes connus, appliqués
> à bon escient, dans le respect strict de la DA austère.

---

## 0. Le cap

**North Star :** nombre de clients récurrents actifs.
La landing sert un seul but : convertir un visiteur qualifié en **call de 20 min**.
Tout le reste (SEO, newsletter, ads) alimente ce point de bascule.

### KPIs du tunnel (cibles de départ — hypothèses à valider par la donnée)

| Étape | Métrique | Cible initiale |
| ----- | -------- | -------------- |
| Visiteur → clic CTA | `cta_clicked / page_view` | > 3 % |
| Modale → lead soumis | `lead_submitted / modal_opened` | > 40 % |
| Lead → booking confirmé | `booking_confirmed / lead_submitted` | > 50 % |
| Booking → call honoré | présence au RDV | > 80 % |
| Call → mission | conversion commerciale | 25–35 % |
| Mission → récurrent | passage en maintenance | à mesurer (North Star) |

> Règle : aucune optimisation à l'aveugle. On instrumente (P1) **avant** d'acheter du
> trafic (P3). « Forger dans l'obscurité, c'est non. »

---

## 1. Le tunnel comme machine à leads — biais cognitifs par section

Chaque section applique déjà un levier (repris du brief). L'audit psychology-ux
confirme les acquis et identifie les biais **sous-exploités à activer sobrement**.

| Section | Levier présent (✓) | À activer (sobrement) |
| ------- | ------------------ | --------------------- |
| **1 Hero** | Anchoring + Curiosity Gap | Garder le CTA **above the fold** sur mobile (Fitts). Un seul point d'or. |
| **2 Preuve** | Authority Bias | **Social proof chiffrée** : réserver l'emplacement, activer au 1er chiffre réel (valeur de transaction, volume). Détailler « ARR, MRR, current trading » (authority + SEO). |
| **3 Problème** | Loss Aversion | Déjà fort. Ne pas surcharger. |
| **4 Sélecteur** | Self-referential encoding | **État sélectionné persistant** = Commitment & Consistency (le micro-oui reste visible). |
| **5 Offres** | Centre-Stage + Hick | Différencier l'offre centrale **sur mobile** + label « Recommandé » (Von Restorff). **Anchoring prix** : l'ancre 44 000 € sur l'Opération. |
| **6 Méthode** | Labor Illusion + Goal Gradient | Étape 04 « La lumière » = **seul point d'or** de la liste (Goal Gradient visuel). |
| **7 Pourquoi** | Peak-End Rule | Plus de respiration (padding supérieur) — signal que ce bloc pèse. |
| **8 Closing** | Réciprocité | **Dupliquer la réassurance** sous le CTA. Réciprocité amont via lead magnet. |
| **Modale** | Default Bias (stade pré-rempli ✓) | **Goal Gradient « étape 1/3 »** (Zeigarnik) + **Spark Effect** (réduire la friction mobile). |

---

## 2. Growth full-funnel

### 2.1 Priorisation des canaux (budget de lancement ~0)

1. **Réseau chaud cabinets — LinkedIn organique + DM.** ROI immédiat, coût nul. Canal
   de conversion le plus rapide. *Démarrer tout de suite.*
2. **SEO longue traîne Pennylane — blog en 3 piliers.** Compounding, coût = temps.
   Le volume brut est bas mais **ultra-qualifié** — c'est une force.
3. **Malt — profil spécialisé Pennylane.** Capture de l'intent existant.
4. **Newsletter « Lumen » — nurture.** Capitalise le trafic, réchauffe avant l'appel.
5. **GBP / GEO + AEO — crédibilité et citations IA.** Quick win « expert data Pennylane ».
6. **LinkedIn Ads — petit budget test.** *Seulement en P3*, une fois des pages qui
   convertissent (sinon on paie pour un tunnel non optimisé).

### 2.2 SEO — architecture de contenu

Le site est une one-page ; la croissance SEO exige un **blog en silos** (piliers + clusters).

- **Pilier 1 — Reporting & tableaux de bord Pennylane.** Article pilier « Ce que le
  tableau de bord natif Pennylane ne fait pas ». Clusters : réconciliation
  Pennylane/CRM/paiements, intégration API reporting, automatisation mensuelle,
  pilotage PME.
- **Pilier 2 — Data financière pour levée & cession.** Pilier « Préparer sa due
  diligence data : ne pas subir l'investisseur ». Clusters : ARR/MRR investor-ready,
  data room cession PME, current trading, cohortes SaaS, métriques série A.
- **Pilier 3 — ExDaL pour cabinets.** Landing dédiée `/cabinets` (offre marque blanche,
  hypothèse à tester) + cluster « pourquoi les cabinets délèguent leur analytics ».

**Top mots-clés** (intention commerciale, difficulté faible, ultra-qualifiés) :
`analytics engineer Pennylane` · `expert data Pennylane` · `data financière cession
entreprise` · `tableau de bord Pennylane` · `réconciliation Pennylane CRM paiements` ·
`due diligence data financière` · `ARR MRR reporting investor-ready` ·
`cabinet comptable Pennylane sous-traitance data`. (Cartographie complète : 22 termes,
voir backlog Contenu §5.5.)

### 2.3 GEO / AEO — être cité par les IA

Enjeu : apparaître quand un dirigeant demande à ChatGPT/Perplexity/Claude « qui peut
m'aider avec ma data Pennylane avant une levée ? ».
- **Page `/a-propos`** avec le fondateur **nommé** (les IA citent des personnes) : double
  compétence data + finance, cession réelle vécue.
- **JSON-LD** `Person` + `Service` + `FAQPage` (blocs FAQ 10-15 questions par pilier).
- **Cohérence des profils tiers** (Malt, LinkedIn) + contributions à valeur dans
  l'écosystème Pennylane (forum, groupes) → co-citations « ExDaL + Pennylane + analytics ».

### 2.4 Lead magnets (réciprocité amont)

1. **Checklist due diligence data** — « Les 23 fichiers/indicateurs qu'un investisseur
   réclame ». Haut de funnel, segment levée/cession. Gated sur pilier 2.
2. **Autodiagnostic « L'état de vos données Pennylane »** — 10 questions → score →
   oriente vers Socle/Pilotage/Opération. Qualification silencieuse.
3. **Template ARR/MRR investor-ready** — Google Sheet documenté. Le plus premium :
   démontre la compétence, crée la dette de réciprocité.
4. **Insight « La question qu'un investisseur pose en premier »** — non gated, article +
   email standalone. Génère partages LinkedIn + trafic.

### 2.5 Newsletter « Lumen »

- **Angle :** « Ce que vos chiffres vous disent — si vous savez les lire. » Clarté
  décisionnelle, pas tech. Ton marque (calme, précis, une idée par numéro).
- **Cadence :** bimensuelle (la rareté est une valeur de marque).
- **Séquence de bienvenue (J0/J3/J7/J14) :** livraison+promesse → preuve sans vendre →
  problème nommé+chiffré → carte du pilotage long terme + présentation sobre des 3 offres.
- **Réservoir :** 12 numéros déjà cadrés (voir backlog Contenu §5.5).
- **Rôle :** accumulation de confiance → le prospect arrive à l'appel en ayant déjà
  accepté que son problème est réel. Le script d'appel ne part plus de zéro.
- **Tech :** Resend Audiences + **double opt-in RGPD obligatoire** (voir §4).

### 2.6 Calendrier éditorial 90 jours

Mois 1 **Fondations** (poser l'expertise) → Mois 2 **Autorité** (niches cession/levée)
→ Mois 3 **Conversion** (landing `/cabinets`, social proof, bilan). Chaque article = 3
posts LinkedIn + 1 numéro Lumen. Détail semaine par semaine : backlog Contenu §5.5.

---

## 3. Roadmap d'exécution — priorisée en phases

Priorité = fonction de : bloque le lancement ? impacte un lead ? effort ?
Source entre parenthèses : (S)écurité, (T)ech, (Q)A, (D)esign, (C)ontenu.

### P0 — Durcissement pré-live *(avant les vrais tokens / tout trafic)*

Bloquants sécurité, fiabilité, conformité et accessibilité. La plupart sont **code-only**
(exécutables sans comptes tiers).

| # | Item | Sévérité | Effort | Source |
| - | ---- | -------- | ------ | ------ |
| 1 | **Échapper le HTML** des champs externes dans les emails (`escapeHtml`) — XSS | CRITICAL | S | S (C-1) |
| 2 | **`CAL_WEBHOOK_SECRET` obligatoire** + vérif inconditionnelle du webhook | HIGH | XS | S/T/Q (H-1) |
| 3 | **`clientIp` anti-spoof** : `x-real-ip` d'abord (XFF falsifiable) | HIGH | XS | S (H-4) |
| 4 | **Rate-limit distribué (Upstash Redis)** — le `Map` mémoire ne limite rien | HIGH | S | S/T/Q (H-2) *(compte Upstash)* |
| 5 | **Rate-limit sur `/api/cal-webhook`** | HIGH | XS | S (H-5) |
| 6 | **Content-Security-Policy** dans `next.config.ts` | HIGH | M | S/T (H-3) |
| 7 | **RGPD** : page `/mentions-legales` + mention de consentement sous le CTA + rétention leads + DPA sous-traitants | MEDIUM | M | S (M-5) |
| 8 | **`REVOKE ALL`** sur `leads`/`path_signals` pour `anon`/`authenticated` (défense en profondeur RLS) | MEDIUM | XS | S (M-3) |
| 9 | **Masquer l'email (PII)** dans les logs | MEDIUM | XS | S (M-4) |
| 10 | **Contrastes WCAG AA** : `gris`/`or-dim` sous 4.5:1 → relever | Impact 5 | XS | D/Q |
| 11 | **Focus restauré** après fermeture de la modale (WCAG 2.4.3) | Major | S | Q/D |
| 12 | **`prefers-reduced-motion`** sur le scroll du sélecteur | Minor | XS | Q |
| 13 | **A11y modale** : `aria-label` fermeture, `aria-required`/`aria-invalid` | Impact 3 | XS | D/Q |
| 14 | **`@vitest/coverage-v8`** manquant (gate de couverture inactif) | Major | XS | Q |
| 15 | **Filet anti-perte de lead** : si Supabase échoue, fallback (email de secours au fondateur avec le lead) au lieu de perdre | Tier 1 | S | Q/T |
| 16 | `CAL_LINK` (retirer `NEXT_PUBLIC_`) — validé dans `env.ts` | MEDIUM | XS | S (M-1) |
| 17 | Honeypot `display:none` + `postcss` override ≥ 8.5.10 + limite taille body | LOW | XS | S (L-1/2/3) |

### P1 — Conversion & mesure *(la machine à leads)*

| # | Item | Impact | Effort | Source |
| - | ---- | ------ | ------ | ------ |
| 18 | **PostHog** : install + événements du tunnel (voir §3.bis) + funnels | Mesure | M | T/Q *(compte PostHog EU)* |
| 19 | **Corrélation lead↔booking par `lead_id`** (metadata Cal), pas par email | Mesure | M | T (H-2) |
| 20 | **Idempotence webhook** via `cal_booking_uid unique` (éviter doubles emails) | Fiabilité | M | T (H-1) |
| 21 | **`sendEmail` timeout 8s** + emails critiques une fois idempotence en place | Résilience | S | T (H-4) |
| 22 | **Centre-Stage sur mobile** + label « Recommandé » (Von Restorff) | Impact 4 | S | D |
| 23 | **État sélectionné persistant** du sélecteur (Commitment) | Impact 5 | S | D |
| 24 | **Emplacement social proof** structuré dans Proof (activer au 1er chiffre) | Impact 4 | S | D/C |
| 25 | **Friction modale mobile** : espacements, Goal Gradient « étape 1/3 » | Impact 4 | S | D |
| 26 | **Affinages copy SEO** : `<title>`, meta (keyword en tête), eyebrow « au centre »→« continu », réassurance dupliquée au closing | Impact 3 | XS | C |
| 27 | **Persister le `FormState`** (fermeture accidentelle ne perd pas la saisie) | Impact 3 | M | D/Q |
| 28 | **A/B testing** via feature flags PostHog (H1, CTA, offre centrale) | Croissance | M | T |
| 29 | **Tests e2e Playwright** (parcours lead + sélecteur, 14 cas) + tests d'intégration des routes API | Fiabilité | M | Q/T |
| 30 | **Perf** : lazy-load de la modale (INP), poids emblème < 50 KB WebP, budget perf | Perf | S | T |
| 31 | Micro-interactions clair-obscur (tensions, hover portes, étape 04 or) — `prefers-reduced-motion` respecté | Délice | S | D |

### P2 — Acquisition / inbound *(remplir le haut du tunnel)*

| # | Item | Source |
| - | ---- | ------ |
| 32 | Blog structuré (piliers + clusters) — commencer par pilier 1 puis 2 | C |
| 33 | Landing `/cabinets` (formulaire dédié, distinct PME) | C/D |
| 34 | Page `/a-propos` nommée + JSON-LD `Person`/`Service`/`FAQPage` (GEO/AEO) | C/T |
| 35 | Lead magnets #1→#4 (checklist, autodiagnostic, template, insight) | C/T |
| 36 | Newsletter « Lumen » : endpoint double opt-in + séquence de bienvenue | T/C |
| 37 | GBP « expert data Pennylane » + cohérence Malt/LinkedIn | C |
| 38 | Exécution du calendrier éditorial 90 jours (LinkedIn + blog + Lumen) | C |

### P3 — Scale & observabilité *(amplifier ce qui convertit)*

| # | Item | Source |
| - | ---- | ------ |
| 39 | LinkedIn Ads (petit budget test) sur les pages qui convertissent + retargeting | C/T |
| 40 | **Sentry** (alerting 5xx sur `/api/lead` et `/api/cal-webhook`) + alerte nouveau lead (Supabase webhook → Slack/Discord) | T/Q |
| 41 | **CI GitHub Actions** (lint + test + build + e2e + coverage gate 80 % `lib/`) | Q |
| 42 | **Smoke tests post-déploiement** (curl `/api/lead`, `/api/segment`, `/api/cal-webhook`, temps de chargement) | Q |
| 43 | Logger JSON structuré (trace id) + SEA sur pages gagnantes | T/C |

### Les 3 verrous absolus avant tout trafic payant
**#4 (rate-limit réel) · #2 (webhook sécurisé) · #18 (PostHog).** Sans eux : abus
possible, faux bookings possibles, et optimisation à l'aveugle.

---

## 3.bis Instrumentation PostHog — événements du tunnel

Client : `posthog-js` (mode `persistence: memory` au lancement = exempté bandeau CNIL).
Serveur : `posthog-node` dans les routes API. Capture UTM sur `page_view`.

**Client :** `page_view` (url, referrer, utm_*) · `section_viewed` (IntersectionObserver
50 %) · `path_door_clicked` (segment) · `qualification_modal_opened` (trigger_location) ·
`qualification_step_completed` (step) · `qualification_modal_closed` (step_reached) ·
`lead_submitted` (segment, stage, pennylane — **jamais** name/email) · `cal_redirect`.
**Serveur :** `lead_created` (lead_id, segment…) · `booking_confirmed` (lead_id,
email_hash SHA-256) · `segment_signal_recorded`.

**Funnels :** page_view → modal_opened → lead_submitted → booking_confirmed ;
path_door_clicked → lead_submitted (quelle porte convertit) ; le tout ventilé par UTM.
**Événement à ne jamais rater : `lead_submitted`** (seule conversion mesurable avant Cal).

---

## 4. Conformité RGPD & sécurité (durcissement)

ExDaL collecte des données personnelles (nom, email, rôle, entreprise). Obligations :
- **Mentions légales / politique de confidentialité** : responsable de traitement, base
  légale (intérêt légitime B2B), finalité, destinataires (Supabase, Resend, Cal.com,
  Vercel), durée de conservation, droits (accès/rectification/suppression via
  contact@exdal.fr), transferts hors UE (clauses types).
- **Consentement** sous le CTA : « En soumettant, vous acceptez le traitement de vos
  informations par ExDaL conformément à notre politique de confidentialité. »
- **Rétention** : purge `new` > 12 mois, `booked` > 3 ans (trigger/CRON Supabase).
- **Double opt-in newsletter** (obligatoire CNIL) + preuve de consentement (hash IP).
- **DPA** signés : Supabase, Resend, Cal.com, Vercel.
- **Durcissement technique** : détails et remédiations dans le backlog Sécurité §5.4.

**Acquis confirmés (à préserver) :** `server-only` sur tous les modules sensibles ·
`env.ts` fail-fast Zod · `service_role` non exposée · RLS activée · `timingSafeEqual`
sur le HMAC · URL Cal.com encodée via `URLSearchParams` · JSON-LD statique · headers de
base + `poweredByHeader: false`.

---

## 5. Backlogs détaillés par domaine (annexes)

> Les rapports complets des 5 agents sont la source ; résumé des items non déjà listés.

### 5.1 Design (Apollon)
Contrastes WCAG (gris `#6F6858`→`#8A8674`, or-dim + poids 500) · Centre-Stage mobile +
« Recommandé » · état sélectionné du sélecteur · emplacement social proof · friction
modale mobile (`gap`, `px`) · a11y fermeture/`aria-required` · fix eyebrow « Section · »
· CTA above-the-fold 375px · idées sobres : micro-animation tensions, lumière latérale
hover portes, étape 04 en or, respiration section Pourquoi, apparition douce de la modale.

### 5.2 Technique (Héphaïstos)
Rate-limit Upstash · secret webhook obligatoire · corrélation `lead_id` · idempotence
`cal_booking_uid` · `sendEmail` timeout · PostHog events · feature flags A/B · perf
(lazy modale, image, budgets) · newsletter Resend Audiences double opt-in · Sentry ·
logs JSON · index `status` · schema Zod sur `responses` Cal · singleton Supabase à documenter.

### 5.3 QA (Argos)
Parcours par coût de défaillance (Tier 1 : lead perdu si Supabase down) · tests
unitaires manquants (rate-limit, templates email, cal-webhook, cal) · **tests
d'intégration des routes API** · e2e Playwright (14 cas : happy path, validations,
réseau, 500, 429, double soumission, honeypot, fermeture, sélecteur, a11y) · QA du
tracking (DebugView, interception e2e) · a11y (focus trap, ChoiceGroup clavier, alerts)
· responsive (clavier virtuel, dvh, smooth scroll iOS) · `@vitest/coverage-v8` · CI ·
smoke tests · sessions d'exploratory testing.

### 5.4 Sécurité (security-reviewer)
CRITICAL C-1 (XSS emails). HIGH : H-1 secret webhook, H-2 rate-limit, H-3 CSP, H-4 IP
spoof, H-5 rate-limit webhook. MEDIUM : M-1 `CAL_LINK`, M-2 escape prospect, M-3 REVOKE,
M-4 PII log, M-5 RGPD. LOW : L-1 honeypot, L-2 postcss, L-3 body size, L-4 logs.

### 5.5 Contenu (Thot)
22 mots-clés priorisés · 3 piliers + clusters · 4 lead magnets · newsletter Lumen
(angle, cadence, séquence 4 emails, 12 sujets) · calendrier 90 jours semaine par semaine
· affinages copy (title/meta, « au centre »→« continu », réassurance closing, détail
ARR/MRR/current trading dans Proof). **Intouchables :** le H1 et la signature du Pourquoi
(pic émotionnel — Peak-End).

---

## 6. Prochaine action recommandée

Démarrer **P0 (durcissement code-only)** immédiatement, en PR séparées, pendant que les
comptes tiers et le `.env` se mettent en place :
XSS emails → webhook obligatoire → `clientIp` → CSP → contrastes WCAG → focus/reduced-motion
→ `@vitest/coverage-v8` → REVOKE migration → PII log → mentions légales.
Les items nécessitant un compte (Upstash, PostHog, Sentry, Resend Audiences) sont
exécutés dès que les accès arrivent.
