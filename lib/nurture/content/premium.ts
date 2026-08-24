/**
 * Séquence C · Premium. Cible : dirigeants en levée ou cession (verdict
 * fondations/en-construction du Score, ou stade « operation » déclaré au
 * formulaire de qualification). Rythme plus resserré : la fenêtre de
 * décision est plus courte que pour un besoin de pilotage récurrent.
 *
 * Copy définitive de l'agent thot-content (.claude/plans/copy-nurture-emails-premium.md),
 * intégrée telle quelle. Seule correction technique : les CTA de réservation
 * pointent vers cal.com (domaine réel du produit, cf. lib/cal.ts), la copy
 * source mentionnait par erreur « cal.eu ».
 */
import { site } from "@/lib/site";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";

const CAL_BOOKING_URL = "https://cal.com/exdal/echange-20min";

export const PREMIUM_EMAILS: readonly NurtureEmailDefinition[] = [
  {
    step: 0,
    key: "premium-0",
    subject: "Ce que le résultat implique vraiment",
    preheader: "Un chiffre a un coût, le jour où un acheteur se présente.",
    blocks: [
      {
        type: "paragraph",
        text: "Vous avez votre résultat. Une chose à ajouter, calmement : ce chiffre a un coût réel le jour où un acheteur ou un investisseur s'assoit en face de vous.",
      },
      {
        type: "paragraph",
        text: "Pas parce qu'il est mauvais. Parce qu'un score bas signale un écart entre ce que vous racontez de votre entreprise et ce qu'un tiers peut vérifier en quelques heures d'audit. Cet écart, un acheteur le traduit en risque, et un risque se traduit toujours en décote ou en clause d'earn out qui vous engage encore deux ans après la signature.",
      },
      {
        type: "paragraph",
        text: "Rien à faire dans l'immédiat. Juste à savoir que le compteur, lui, tourne déjà.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 1,
    key: "premium-1",
    subject: "J'ai préparé ces fichiers, une fois, pour de vrai",
    preheader: "Trois semaines, un acheteur, et un tableau qui ne pardonnait rien.",
    blocks: [
      {
        type: "paragraph",
        text: "Je l'ai fait une fois, pour de vrai : préparer les fichiers financiers d'une cession, pas un exercice théorique, un vrai deal avec un acheteur qui avait mandaté un cabinet d'audit pour éplucher trois ans d'historique.",
      },
      {
        type: "paragraph",
        text: "On avait trois semaines. La comptabilité était propre, tenue par un expert-comptable sérieux, mais elle n'était pas construite pour répondre aux questions d'un acheteur : la marge par ligne de produit n'existait nulle part, le MRR se recalculait à la main chaque mois dans un fichier différent selon qui s'en occupait, et deux contrats majeurs avaient des clauses de sortie que personne n'avait remontées jusqu'au chiffre.",
      },
      {
        type: "paragraph",
        text: "On a reconstruit une data room propre : une source par métrique, une piste d'audit sur chaque chiffre clé, les cohortes de rétention client posées noir sur blanc. L'acheteur a posé les mêmes questions difficiles que d'habitude. Cette fois, chaque réponse tenait en une requête, pas en une nuit de reconstruction sous pression.",
      },
      {
        type: "paragraph",
        text: "Le deal s'est signé au prix annoncé au départ, sans décote de dernière minute. C'est la seule fois où j'ai vu un audit financier se terminer plus vite que prévu.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 2,
    key: "premium-2",
    subject: "Ce qu'un acheteur regarde en premier",
    preheader: "Pas votre pitch. Le premier chiffre qui ne colle pas.",
    blocks: [
      {
        type: "paragraph",
        text: "Un acheteur ne cherche pas à confirmer ce que vous annoncez. Il cherche l'écart entre ce que vous annoncez et ce qui se retrace dans les comptes.",
      },
      {
        type: "paragraph",
        text: "L'ordre dans lequel il regarde n'est presque jamais celui qu'on imagine : avant la croissance, il vérifie la marge réelle et la trésorerie ; avant la trésorerie, les engagements hors bilan que personne ne met en avant. Un seul red flag mal expliqué suffit à faire durer l'audit trois semaines de plus, et chaque semaine de plus est une semaine où l'acheteur peut changer d'avis ou renégocier.",
      },
      {
        type: "paragraph",
        text: "J'ai détaillé les volets qu'il passe au crible, dans l'ordre exact où il les pose.",
      },
      {
        type: "cta",
        label: "Lire l'anatomie d'une due diligence",
        url: `${site.url}/journal/anatomie-due-diligence-financiere`,
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 3,
    key: "premium-3",
    subject: "Le prix d'une due diligence subie",
    preheader: "Trois semaines de retard valent souvent plus cher qu'on ne pense.",
    blocks: [
      {
        type: "paragraph",
        text: "Une due diligence mal préparée ne fait pas échouer un deal d'un coup. Elle l'use, question après question.",
      },
      {
        type: "paragraph",
        text: "Chaque incohérence trouvée déplace la conversation : de la valeur de l'entreprise vers la fiabilité de ses chiffres. À partir de là, l'acheteur ne discute plus le prix qu'il vous propose, il cherche des garanties supplémentaires : earn out plus long, séquestre plus élevé, clause de révision. Un audit qui aurait dû durer trois semaines s'étire à six, et chaque semaine de plus est une semaine où le climat économique, la trésorerie de l'acheteur ou sa patience peuvent changer. J'ai vu des deals se conclure dix à quinze pour cent sous le prix évoqué en lettre d'intention, pour cette seule raison.",
      },
      {
        type: "paragraph",
        text: "Ce n'est jamais la comptabilité qui manque. C'est le temps de la reconstruire sous la pression d'un tiers.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 4,
    key: "premium-4",
    subject: "Vingt minutes, avant que ça ne devienne urgent",
    preheader: "Le temps de préparer une cession se compte en mois, pas en semaines.",
    blocks: [
      {
        type: "paragraph",
        text: "Le point commun de tous les deals que j'ai vus se dégrader : la préparation a commencé au moment où l'acheteur était déjà à table, jamais avant.",
      },
      {
        type: "paragraph",
        text: "Vingt minutes suffisent pour situer où vous en êtes réellement : ce qui tiendrait déjà un audit, ce qui demanderait trois semaines de reconstruction, et ce qui coûterait une vraie décote si un acheteur se présentait dans les prochains mois. Si vous envisagez une levée ou une cession dans l'année qui vient, ce délai compte plus que vous ne le pensez.",
      },
      { type: "cta", label: "Réserver mes vingt minutes", url: CAL_BOOKING_URL },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 5,
    key: "premium-5",
    subject: "Une dernière chose",
    preheader: "Le détail que les acheteurs vérifient toujours, et qu'on oublie toujours.",
    blocks: [
      {
        type: "paragraph",
        text: "Un dernier point, resté de côté jusqu'ici : les engagements hors bilan.",
      },
      {
        type: "paragraph",
        text: "Garanties données à un client, clause de non-concurrence signée avec un ancien associé, dette fournisseur qui ne figure dans aucun tableau habituel : ce sont les trois choses qu'un acheteur découvre le plus souvent trop tard dans le processus, et qui rouvrent une négociation qu'on croyait close. Les lister à l'avance, avec leur montant réel, évite au moins la mauvaise surprise le jour où quelqu'un d'autre les trouve à votre place.",
      },
      {
        type: "paragraph",
        text: "Cette série s'arrête ici. Si une levée ou une cession redevient concrète chez vous, vous savez où me trouver.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
];
