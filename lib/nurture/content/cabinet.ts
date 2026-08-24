/**
 * Séquence B · Cabinet. Cible : cabinets comptables sous Pennylane qui
 * servent leurs propres clients (hypothèse marque blanche à tester).
 *
 * Copy définitive de l'agent thot-content (.claude/plans/copy-nurture-emails-cabinet.md),
 * intégrée telle quelle. Seule correction technique : les CTA de réservation
 * pointent vers cal.eu : le compte Cal du studio vit sur l instance EU
 * (cal.com/exdal renvoie 404, vérifié). Ne pas "corriger" vers cal.com.
 */
import { site } from "@/lib/site";
import type { NurtureEmailDefinition } from "@/lib/nurture/content/types";

const CAL_BOOKING_URL = "https://cal.eu/exdal/echange-20min";

export const CABINET_EMAILS: readonly NurtureEmailDefinition[] = [
  {
    step: 0,
    key: "cabinet-0",
    subject: "Un constat, en plus de ce que vous avez demandé",
    preheader: "La saisie recule. Ce qui la remplace ne s'improvise pas.",
    blocks: [
      {
        type: "paragraph",
        text: "Vous avez ce que vous êtes venu chercher. Un constat, en plus, qui vaut pour la plupart des cabinets sous Pennylane aujourd'hui.",
      },
      {
        type: "paragraph",
        text: "L'automatisation ne va pas s'arrêter de grignoter la saisie et le lettrage. Ce n'est pas une menace nouvelle, c'est déjà largement fait chez les cabinets qui ont basculé tôt. La vraie question n'est plus de savoir si ce temps va se libérer, mais ce que vous en faites : des tâches annexes qui remplissent le vide, ou une offre de conseil que vos clients paient volontiers, parce que personne d'autre ne la leur propose avec la même finesse.",
      },
      {
        type: "paragraph",
        text: "Rien à faire de plus ici, juste une idée à laisser tourner.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 1,
    key: "cabinet-1",
    subject: "Ce cabinet a arrêté de vendre du temps",
    preheader: "Même effectif. Un tiers du chiffre en plus, ailleurs.",
    blocks: [
      {
        type: "paragraph",
        text: "Un cabinet de sept collaborateurs, que je ne nommerai pas, facturait ses missions Pennylane comme toutes les autres : au temps passé sur la saisie et les clôtures.",
      },
      {
        type: "paragraph",
        text: "Le problème, c'est que Pennylane a fait baisser ce temps d'environ 30% chez leurs clients en deux ans. Moins de temps facturable, sur un forfait qui n'avait pas bougé. La rentabilité de ces dossiers s'est mise à fondre sans qu'ils y touchent.",
      },
      {
        type: "paragraph",
        text: "Ce qui a changé la donne : ils ont arrêté de vendre des heures de saisie et se sont mis à vendre un point mensuel sur les chiffres, un vrai rendez-vous où ils commentent la marge, la trésorerie, les écarts avec le prévisionnel. Même dossier, même Pennylane, mais un forfait qui a presque doublé sur les clients qui l'ont pris, parce que ce qu'ils achètent maintenant, ce n'est plus du temps, c'est une lecture.",
      },
      {
        type: "paragraph",
        text: "Ça n'a rien demandé de plus que ce qu'ils savaient déjà faire. Juste le vendre autrement.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 2,
    key: "cabinet-2",
    subject: "Ce que vos clients vous demanderont bientôt",
    preheader: "L'API Pennylane fait plus que vous ne pensez, et moins aussi.",
    blocks: [
      {
        type: "paragraph",
        text: "Vos clients ne vous demanderont plus si vous pouvez leur envoyer le bilan à temps. Ils vous demanderont pourquoi ils n'ont pas déjà accès à leurs chiffres du mois en cours.",
      },
      {
        type: "paragraph",
        text: "L'API Pennylane rend ça possible : factures, écritures, transactions bancaires, FEC, dossier par dossier, sans ressaisie. Mais elle ne fait ni la réconciliation entre plusieurs outils, ni le pilotage lisible que le client attend au final. C'est l'écart entre ce que l'API permet et ce qu'un cabinet en construit qui fait toute la différence, et c'est cet écart que j'ai détaillé dans l'article ci-dessous.",
      },
      {
        type: "cta",
        label: "Voir ce que permet l'API Pennylane",
        url: `${site.url}/journal/api-pennylane-cabinet-comptable`,
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 3,
    key: "cabinet-3",
    subject: "Vous n'avez pas besoin d'embaucher pour ça",
    preheader: "Monter en gamme ne veut pas dire recruter un data analyst.",
    blocks: [
      {
        type: "paragraph",
        text: "Le frein qu'on m'oppose le plus souvent, ce n'est pas l'envie de proposer du pilotage à ses clients. C'est le temps et la compétence pour le construire dossier après dossier.",
      },
      {
        type: "paragraph",
        text: "Recruter un profil data dans un cabinet de dix à trente personnes ne se justifie presque jamais : le volume ne suit pas, et le profil coûte cher à former sur vos process internes. Il existe une autre voie, celle d'un partenaire externe qui construit les tableaux de bord derrière votre marque, pendant que vous gardez la relation client et la valeur ajoutée du conseil.",
      },
      {
        type: "paragraph",
        text: "C'est une question qui mérite plus qu'un email. Je la garde pour la prochaine.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 4,
    key: "cabinet-4",
    subject: "Parlons de vos clients, pas juste de Pennylane",
    preheader: "Vingt minutes entre professionnels. Aucun pitch au programme.",
    blocks: [
      {
        type: "paragraph",
        text: "Je ne vous propose pas un rendez-vous commercial. Je n'ai rien à vous vendre en vingt minutes, et ce n'est pas l'idée.",
      },
      {
        type: "paragraph",
        text: "L'idée, c'est de regarder ensemble deux ou trois dossiers de votre portefeuille, ceux où vos clients réclament déjà plus qu'un bilan annuel, et de voir ce qui pourrait s'y construire concrètement. Vous repartez avec des pistes utilisables même si on n'entame jamais rien ensemble après.",
      },
      { type: "cta", label: "Réserver l'échange", url: CAL_BOOKING_URL },
      { type: "signature", text: "Rayane" },
    ],
  },
  {
    step: 5,
    key: "cabinet-5",
    subject: "À votre rythme",
    preheader: "Un dernier repère, sans relance derrière.",
    blocks: [
      {
        type: "paragraph",
        text: "Un cabinet qui bascule vers le conseil ne le fait jamais d'un coup. Ça se fait dossier par dossier, en commençant par les clients qui posent déjà les bonnes questions.",
      },
      {
        type: "paragraph",
        text: "Le repère le plus fiable pour choisir par où commencer : le client qui vous appelle en dehors des périodes de clôture pour parler chiffres. Celui-là est prêt avant même de le savoir. Les autres suivront, ou pas, et ce n'est pas grave non plus.",
      },
      {
        type: "paragraph",
        text: "Cette série s'arrête là. Si le sujet revient sur la table chez vous, vous savez où me trouver.",
      },
      { type: "signature", text: "Rayane" },
    ],
  },
];
