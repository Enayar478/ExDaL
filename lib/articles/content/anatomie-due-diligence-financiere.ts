import type { Article } from "@/lib/articles/types";

/**
 * Article satellite, grappe C (premium : préparer une levée ou une cession).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 * Creuse un point du pilier `preparer-chiffres-levee-cession` : ce qu'un
 * acheteur ou investisseur examine réellement pendant la due diligence.
 */
export const anatomieDueDiligenceFinanciere: Article = {
  slug: "anatomie-due-diligence-financiere",
  title:
    "Anatomie d'une due diligence financière : ce qu'un acheteur regarde vraiment",
  metaTitle: "Due diligence financière : ce qu'un acheteur regarde",
  metaDescription:
    "Revenu, churn, marge, trésorerie, engagements hors bilan : ce qu'un acheteur vérifie vraiment en due diligence, et les red flags qui coûtent cher.",
  excerpt:
    "Une due diligence ne cherche pas à confirmer ce que vous annoncez. Elle cherche l'écart entre ce que vous annoncez et ce qui se retrace. Voici les volets qu'un acheteur ou un investisseur passe au crible, dans l'ordre où il les pose, et ce qui fait déraper un closing.",
  eyebrow: "Due diligence",
  segment: "premium",
  publishedAt: "2026-08-04",
  ctaVariant: "score",
  relatedSlugs: [
    "preparer-chiffres-levee-cession",
    "mrr-arr-cohortes-previsionnel",
    "construire-data-room-financiere",
  ],
  blocks: [
    {
      type: "p",
      text: "Une due diligence financière ne part jamais d'une page blanche. L'acheteur ou l'investisseur arrive avec une hypothèse, celle construite pendant les échanges préliminaires et l'offre indicative, et il passe les semaines suivantes à essayer de la casser. Pas par méfiance systématique : par méthode. Un chiffre qui résiste à cet exercice devient un chiffre sur lequel on peut fonder un prix. Un chiffre qui ne résiste pas devient une clause, un earn-out, ou une ligne de négociation.",
    },
    {
      type: "p",
      text: "Ce qui suit décrit l'anatomie réelle de cet exercice : l'ordre dans lequel les questions arrivent, les volets qui concentrent l'essentiel des découvertes, et un cas composite qui montre à quoi ressemble, en euros, un écart découvert trop tard.",
    },

    {
      type: "h2",
      id: "ordre-des-questions",
      text: "L'ordre dans lequel un acheteur pose ses questions",
    },
    {
      type: "p",
      text: "Un investisseur ne commence jamais par les contrats ou par le juridique. Il commence par le revenu, parce que c'est la base sur laquelle repose le multiple, donc le prix. Une fois le revenu vérifié, il descend vers la marge, puis vers la trésorerie, puis vers tout ce qui n'apparaît pas au bilan mais engage l'entreprise pour les années suivantes. Chaque étape conditionne la suivante : un doute sur le revenu jette un doute sur la marge, un doute sur la marge jette un doute sur la trésorerie normative.",
    },
    {
      type: "p",
      text: "C'est cet enchaînement qui explique pourquoi une due diligence qui commence mal se termine rarement bien. Les vingt premiers jours fixent le ton. Un dirigeant qui répond avec des chiffres qui se retracent immédiatement change la nature des questions suivantes, elles deviennent techniques plutôt que suspicieuses.",
    },

    {
      type: "h2",
      id: "volets-examines",
      text: "Les volets qu'un acheteur passe au crible",
    },

    {
      type: "h3",
      id: "qualite-du-revenu",
      text: "La qualité du revenu, avant son montant",
    },
    {
      type: "p",
      text: "La première question n'est jamais « combien ». C'est « quelle part de ce revenu se répétera l'an prochain sans effort commercial supplémentaire ». Un acheteur reconstitue le MRR mois par mois, contrat par contrat, et retire tout ce qui ressemble à du one-shot déguisé en récurrent : une prestation ponctuelle facturée en mensualités par commodité, un pilote gratuit requalifié en abonnement payant sur le papier, un contrat signé fin de trimestre pour gonfler le chiffre du mois. Le sujet mérite un traitement à part entière, [construire un MRR, un ARR et des cohortes qui résistent à l'examen](/articles/mrr-arr-cohortes-previsionnel), tant les définitions approximatives y sont fréquentes et coûteuses.",
    },

    {
      type: "h3",
      id: "churn-retention",
      text: "Le churn et la rétention par cohorte",
    },
    {
      type: "p",
      text: "Un taux de churn global masque presque toujours une réalité plus dure en dessous. L'acheteur segmente par cohorte d'acquisition, par taille de client, parfois par commercial. Un churn de 8 % qui monte à 22 % sur les clients acquis il y a dix-huit mois raconte une histoire différente d'un churn stable à 8 % sur toutes les cohortes, même si le chiffre affiché en haut de page est identique. C'est souvent là que se cache l'écart entre le prévisionnel présenté et la trajectoire réelle.",
    },

    {
      type: "h3",
      id: "marge-par-segment",
      text: "La marge, décomposée par segment",
    },
    {
      type: "p",
      text: "Une marge brute agrégée cache des situations très différentes selon l'offre, le canal d'acquisition ou le type de client. Un acheteur veut savoir si la croissance récente s'est faite sur des segments rentables ou sur des segments qui grossissent le chiffre d'affaires en dégradant la marge. Une entreprise qui a gagné 30 % de clients en un an mais dont la marge unitaire a reculé de six points n'a pas la même valeur qu'une entreprise qui a gagné les mêmes 30 % en maintenant sa marge.",
    },

    {
      type: "h3",
      id: "tresorerie-bfr",
      text: "La trésorerie et le besoin en fonds de roulement",
    },
    {
      type: "p",
      text: "La trésorerie affichée à une date donnée dit peu de choses seule. Ce qui compte, c'est sa dynamique : le BFR se dégrade-t-il avec la croissance, les délais de paiement clients s'allongent-ils, existe-t-il un décalage saisonnier qui rend le solde de fin d'année artificiellement flatteur. Un acheteur reconstruit une trésorerie normative sur douze mois glissants, pas sur le chiffre du jour du rendez-vous.",
    },

    {
      type: "h3",
      id: "engagements-hors-bilan",
      text: "Les engagements hors bilan",
    },
    {
      type: "p",
      text: "C'est le volet le plus souvent sous-estimé par les dirigeants, et l'un des plus scrutés côté acheteur : cautions données, clauses de sortie anticipée dans les baux, garanties accordées à des clients, litiges en cours non provisionnés, dettes sociales ou fiscales latentes. Rien de tout cela n'apparaît nécessairement dans les comptes, mais tout cela engage l'entreprise le lendemain de la signature. Un engagement découvert en due diligence, même mineur en montant, ralentit systématiquement le calendrier le temps de le documenter.",
    },

    {
      type: "h3",
      id: "retraitements",
      text: "Les retraitements de l'EBITDA",
    },
    {
      type: "p",
      text: "Le résultat comptable n'est presque jamais le chiffre sur lequel se négocie un prix. L'acheteur retraite : rémunération du dirigeant ramenée à un niveau de marché, charges exceptionnelles isolées, avantages en nature réintégrés, loyers intragroupe ajustés. Chaque retraitement, s'il n'est pas documenté par le dirigeant en amont, devient une hypothèse que l'acheteur pose lui-même, presque toujours à son avantage.",
    },

    {
      type: "h2",
      id: "red-flags",
      text: "Les red flags qui ralentissent tout",
    },
    {
      type: "list",
      items: [
        "**Une définition du récurrent qui change selon l'interlocuteur.** Le MRR présenté au commercial, au comptable et à l'acheteur ne coïncide pas exactement.",
        "**Un churn qui n'est suivi qu'au trimestre.** Impossible de répondre à la question posée par cohorte mensuelle sans reconstruction manuelle de plusieurs jours.",
        "**Une trésorerie présentée à un seul instant.** Aucune vue sur les douze derniers mois glissants pour juger de sa tendance réelle.",
        "**Un engagement mentionné oralement, jamais par écrit.** Un bail avec clause de sortie coûteuse, une garantie donnée à un client majeur, découverts trop tard.",
        "**Des retraitements non documentés.** Le dirigeant sait qu'un chiffre doit être ajusté, mais ne l'a jamais formalisé par écrit avant la question.",
        "**Un délai de réponse qui s'allonge.** Chaque jour de retard sur une question simple confirme, dans l'esprit de l'acheteur, que rien n'était prêt.",
      ],
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : ce qu'une revue des engagements a mis au jour",
    },
    {
      type: "p",
      text: "Situation composite, chiffres arrondis pour l'anonymat. Un éditeur de logiciel métier, 22 salariés, en levée de série A auprès d'un fonds généraliste, trésorerie affichée de 640 000 € au moment de la term sheet. La revue des engagements hors bilan, menée dans la troisième semaine de due diligence, a fait remonter deux points qui n'apparaissaient nulle part dans les comptes présentés.",
    },
    {
      type: "list",
      items: [
        "Une clause de sortie anticipée sur le bail des bureaux, signée deux ans plus tôt, chiffrant l'indemnité due en cas de départ avant terme à 120 000 €, jamais provisionnée ni mentionnée en réunion.",
        "Un contentieux prud'homal ouvert depuis huit mois avec un ancien salarié, risque estimé par l'avocat à 85 000 €, absent du tableau de bord transmis à l'investisseur.",
      ],
    },
    {
      type: "p",
      text: "Aucun des deux montants n'était dissimulé volontairement : le premier avait été signé par l'ancien dirigeant financier, parti depuis, le second suivi uniquement par l'avocat externe, jamais remonté au reporting. Mais l'effet sur la négociation a été direct. L'investisseur a recalculé la trésorerie nette ajustée du bridge de financement, retirant les deux montants du cash disponible post-closing.",
    },
    {
      type: "stat",
      value: "205 000 €",
      label:
        "l'ajustement de trésorerie nette imposé par des engagements hors bilan jamais documentés.",
    },
    {
      type: "p",
      text: "Le tour de table s'est finalement bouclé, mais avec un escrow de 150 000 € bloqué douze mois et une clause de garantie de passif élargie aux deux points découverts. Deux documents auraient suffi, tenus à jour dans la data room dès le départ : un registre des engagements et litiges, et un tableau de rapprochement entre le reporting financier et le juridique.",
    },

    {
      type: "h2",
      id: "comment-se-preparer",
      text: "Comment s'y préparer avant que la question n'arrive",
    },
    {
      type: "p",
      text: "La bonne réponse à une question de due diligence n'est pas une bonne réponse improvisée, c'est un document qui existait déjà avant que la question soit posée. Cela suppose deux chantiers menés en parallèle, largement en amont : la définition stricte et documentée de chaque métrique, et [une data room financière construite en amont plutôt que dans l'urgence de la lettre d'intention](/articles/construire-data-room-financiere), avec un registre des engagements tenu à jour en continu, pas reconstitué a posteriori.",
    },
    {
      type: "p",
      text: "Ce travail dépasse le cadre d'un seul article. [Le guide complet pour préparer les chiffres d'une levée ou d'une cession](/articles/preparer-chiffres-levee-cession) couvre l'ensemble du calendrier, du premier chantier lancé dix-huit mois avant l'opération jusqu'au current trading qui se joue dans les dernières semaines du closing.",
    },

    {
      type: "p",
      text: "Avant de savoir par quel chantier commencer, encore faut-il savoir lequel des quatre piliers, comptes, métriques, traçabilité, data room, est le plus fragile aujourd'hui. Le Score de Préparation à la Cession répond à cette question en dix questions et trois minutes, avec un score sur cent et l'ordre de priorité à traiter en premier.",
    },
  ],
};
