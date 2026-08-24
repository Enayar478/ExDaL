/**
 * Séquence A · Pilotage. Cible : PME/startups sous Pennylane, dossier déjà
 * solide (verdict credible/pret du Score) ou stade « pilotage » déclaré au
 * formulaire de qualification.
 *
 * Copy définitive de l'agent thot-content (.claude/plans/copy-nurture-emails-pilotage.md),
 * intégrée telle quelle. Seule correction technique : les CTA de réservation
 * pointent vers cal.com (domaine réel du produit, cf. lib/cal.ts), la copy
 * source mentionnait par erreur « cal.eu ».
 */
import { site } from "@/lib/site";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";

const CAL_BOOKING_URL = "https://cal.com/exdal/echange-20min";

export const PILOTAGE_EMAILS: readonly NurtureEmailDefinition[] = [
  {
    step: 0,
    key: "pilotage-0",
    subject: "Ce que le résultat ne dit pas encore",
    preheader: "Un geste de trente secondes avant de refermer l'onglet.",
    blocks: [
      {
        type: "paragraph",
        text: "Vous avez ce que vous êtes venu chercher. Une chose de plus, tant que c'est encore ouvert sur votre écran.",
      },
      {
        type: "paragraph",
        text: "Comparez le chiffre d'affaires du mois dans Pennylane avec celui de votre CRM ou de votre outil d'encaissement. Un écart de deux à trois pour cent est normal, c'est une question de délai. Au-delà, regardez du côté des avoirs : c'est souvent là que se cache la différence qu'on n'explique jamais vraiment. Notez le montant en euros, pas en pourcentage. C'est ce chiffre-là qu'on vous demandera d'expliquer un jour, pas la moyenne du mois.",
      },
      {
        type: "paragraph",
        text: "Rien d'autre à faire ici. Juste un réflexe qui change ce que vous verrez la prochaine fois que vous ouvrez le tableau.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 1,
    key: "pilotage-1",
    subject: "Un dirigeant m'a montré son Excel hier",
    preheader: "Le fichier tenait avec douze onglets et une prière.",
    blocks: [
      {
        type: "paragraph",
        text: "Il pilote une boîte de douze personnes, service B2B, en croissance depuis deux ans. Chaque lundi, il ouvre un fichier de douze onglets pour savoir où il en est. Il me l'a montré en visio la semaine dernière, l'air un peu gêné, comme si c'était une faute.",
      },
      {
        type: "paragraph",
        text: "Le fichier n'était pas mauvais. Il était juste devenu trop grand pour une seule personne. Trois collaborateurs y touchaient, chacun avec sa propre logique de copier-coller depuis Pennylane. Résultat : trois versions du même chiffre de marge, et personne pour dire laquelle était juste au moment où son associé lui a posé la question en réunion.",
      },
      {
        type: "paragraph",
        text: "On a passé une heure à retracer d'où venait chaque écart. La cause n'était pas la comptabilité, mais l'absence d'un point d'entrée unique : un seul endroit où le chiffre se calcule, une seule fois, avant d'être lu par tout le monde. Il a supprimé neuf onglets sur douze la semaine suivante.",
      },
      {
        type: "paragraph",
        text: "Rien de spectaculaire. Juste un fichier qui, enfin, dit la même chose à tout le monde.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 2,
    key: "pilotage-2",
    subject: "Le piège du reporting que personne ne voit",
    preheader: "Trois chiffres différents, et aucun des trois n'a tort.",
    blocks: [
      {
        type: "paragraph",
        text: "Pennylane dit un chiffre. Le CRM en dit un autre. La plateforme de paiement, un troisième. Le réflexe, c'est de chercher lequel se trompe. Aucun ne se trompe.",
      },
      {
        type: "paragraph",
        text: "Chaque outil compte le chiffre d'affaires à un moment différent du cycle de vente : à la commande, à la facture, à l'encaissement. Le piège du reporting mensuel, ce n'est pas une erreur de saisie, c'est de choisir un chiffre sans savoir à quel moment il a été capturé. On finit par présenter un CA qui ne correspond à aucune réalité comptable précise, juste à celle qu'on avait sous la main ce jour-là.",
      },
      {
        type: "paragraph",
        text: "J'ai détaillé la méthode pour faire dire la même chose à ces trois sources : clés de rapprochement, doublons, délais, avoirs.",
      },
      {
        type: "cta",
        label: "Lire la méthode de réconciliation",
        url: `${site.url}/journal/reconcilier-pennylane-crm-paiements`,
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 3,
    key: "pilotage-3",
    subject: "Comment je construis un tableau de bord qui tient",
    preheader: "Quatre temps, pas un de plus, pas un de moins.",
    blocks: [
      {
        type: "paragraph",
        text: "Un tableau de bord qui tient dans la durée se construit toujours dans le même ordre, peu importe le secteur.",
      },
      {
        type: "paragraph",
        text: "D'abord, une seule source de vérité par métrique : le CA vient de Pennylane, jamais d'un export recopié. Ensuite, un entrepôt qui stocke la donnée brute avant tout calcul, pour qu'on puisse toujours remonter à la source d'un chiffre contesté. Puis les règles de calcul, écrites une fois, appliquées partout de la même façon. Enfin seulement, la visualisation : le tableau que vous regardez le lundi matin n'est que la dernière étape, pas la première.",
      },
      {
        type: "paragraph",
        text: "C'est exactement ce que je construis dans Le Socle : les trois premiers temps posés une bonne fois, pour que le quatrième cesse de vous mentir.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 4,
    key: "pilotage-4",
    subject: "Vingt minutes, sans engagement",
    preheader: "Vous repartez avec une idée claire, qu'on travaille ensemble ou non.",
    blocks: [
      {
        type: "paragraph",
        text: "Depuis quatre emails, vous avez eu de la méthode, un cas réel, un piège à éviter. Pas une seule fois on vous a demandé quoi que ce soit.",
      },
      {
        type: "paragraph",
        text: "Voici la seule chose que je vous propose dans cette série : vingt minutes pour regarder votre situation précise, celle que je ne connais pas encore derrière un email. Vous en ressortez avec un diagnostic net sur ce qui, chez vous, casse le pilotage : la source du chiffre, l'outil manquant, ou simplement le temps qui manque pour le faire soi-même. Qu'on travaille ensemble après, ou pas.",
      },
      { type: "cta", label: "Réserver mes vingt minutes", url: CAL_BOOKING_URL },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 5,
    key: "pilotage-5",
    subject: "Ce que je n'ai pas encore dit",
    preheader: "Un dernier angle, resté de côté jusqu'ici.",
    blocks: [
      {
        type: "paragraph",
        text: "Il y a un angle que je n'ai pas encore abordé dans cette série : le moment où le tableau de bord devient un problème politique, pas technique.",
      },
      {
        type: "paragraph",
        text: "Dans une équipe de plus de cinq personnes, le chiffre affiché devient un enjeu. Le commercial veut voir sa marge, pas la marge nette. Le comptable veut la vision fiscale. Le dirigeant veut la trésorerie à trente jours. Un bon tableau de bord ne choisit pas entre ces regards : il part d'une seule donnée brute et laisse chacun la lire à sa façon, sans jamais recalculer à la main dans un coin.",
      },
      {
        type: "paragraph",
        text: "C'est le sujet le plus difficile à régler seul, et souvent celui qui coûte le plus cher en réunions inutiles. Si un jour il redevient urgent chez vous, vous savez où me trouver.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
];
