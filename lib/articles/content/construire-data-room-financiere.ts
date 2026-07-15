import type { Article } from "@/lib/articles/types";

/**
 * Article satellite, grappe C (premium : préparer une levée ou une cession).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 * Renvoie vers le pilier de la grappe et vers deux satellites voisins
 * (due diligence, current trading), CTA de fin vers le Score.
 */
export const construireDataRoomFinanciere: Article = {
  slug: "construire-data-room-financiere",
  title: "Construire sa data room financière avant une levée ou une cession",
  metaTitle: "Construire sa data room financière : le guide",
  metaDescription:
    "Ce qu'un acheteur attend dans une data room financière : les pièces à réunir, l'organisation qui inspire confiance, et le bon moment pour la préparer.",
  excerpt:
    "Une data room dit quelque chose avant le premier chiffre lu : soit vous maîtrisez votre dossier, soit vous le découvrez avec l'acheteur. Ce guide détaille les pièces attendues, l'organisation qui inspire confiance, et pourquoi elle se prépare avant la lettre d'intention, jamais après.",
  eyebrow: "Data room financière",
  segment: "premium",
  publishedAt: "2026-09-08",
  ctaVariant: "score",
  relatedSlugs: [
    "preparer-chiffres-levee-cession",
    "anatomie-due-diligence-financiere",
    "current-trading-preparer-cession",
  ],
  blocks: [
    {
      type: "p",
      text: "Personne, dans une opération de levée ou de cession, ne commence par lire vos comptes. On commence par ouvrir votre data room. En trente secondes, avant le premier chiffre, elle a déjà dit quelque chose : soit vous maîtrisez votre dossier, soit vous le découvrez en même temps que l'acheteur.",
    },
    {
      type: "p",
      text: "Ce n'est pas une exagération de banquier d'affaires. Un dossier bien rangé raccourcit une due diligence de plusieurs semaines. Un dossier improvisé ouvre une question que personne ne pose à voix haute, mais que tout le monde se pose : si les documents sont dans cet état, que dit-on des chiffres qu'on n'a pas encore vus ?",
    },

    {
      type: "h2",
      id: "ce-qu-une-data-room-revele",
      text: "Ce qu'une data room révèle avant le premier chiffre lu",
    },
    {
      type: "p",
      text: "Un acheteur expérimenté lit une data room comme un radiologue lit une image : pas document par document, mais par la texture d'ensemble. Des dossiers nommés au hasard, trois versions du même contrat sans savoir laquelle fait foi, un état du capital vieux de dix-huit mois. Rien de tout cela ne prouve une fraude. Mais tout cela nourrit un doute, et le doute se négocie.",
    },
    {
      type: "p",
      text: "[Ce qu'un acheteur regarde vraiment dans une due diligence financière](/articles/anatomie-due-diligence-financiere) commence, en réalité, avant l'ouverture du premier fichier Excel : dans la façon dont le dossier a été construit. Une data room propre ne rassure pas que sur la forme. Elle raccourcit le calendrier, parce que chaque question trouve sa réponse dans un document déjà présent, sans aller-retour par email ni relance du dirigeant en pleine négociation.",
    },

    {
      type: "h2",
      id: "pieces-attendues",
      text: "Les pièces qu'un acheteur attend",
    },
    {
      type: "p",
      text: "La liste ne varie presque pas d'une opération à l'autre, ce qui devrait, en théorie, la rendre facile à anticiper. Sept familles de documents reviennent systématiquement.",
    },
    {
      type: "h3",
      id: "etats-financiers",
      text: "Les états financiers, trois exercices",
    },
    {
      type: "p",
      text: "Liasses fiscales, grand livre, balance générale, sur trois exercices complets, pas la dernière année isolée. Un exercice atypique, bon ou mauvais, sans comparaison pour le situer, déclenche plus de questions qu'il n'en résout.",
    },
    {
      type: "h3",
      id: "detail-ca-mrr",
      text: "Le détail du chiffre d'affaires et du MRR",
    },
    {
      type: "p",
      text: "Le CA global ne suffit à personne. Un acheteur veut la ventilation par client, par produit, par mois, et pour les modèles à revenu récurrent, un MRR défini une bonne fois, avec la méthode explicitée : ce qui compte comme récurrent, ce qui n'en fait pas partie, comment le churn est traité. Un tableau sans méthode documentée à côté vaut moins qu'un tableau plus modeste, mais expliqué.",
    },
    {
      type: "h3",
      id: "contrats",
      text: "Les contrats clients et fournisseurs",
    },
    {
      type: "p",
      text: "Contrats clients significatifs, conditions générales, contrats fournisseurs engageants, baux, contrats de travail des postes clés. Un acheteur cherche la dépendance cachée : un seul client à 40 % du chiffre d'affaires, un fournisseur sans écrit depuis six ans, un bail qui expire dans huit mois. Ce sont ces détails, pas le montant du CA, qui font parfois basculer une négociation.",
    },
    {
      type: "h3",
      id: "dette-engagements",
      text: "La dette et les engagements financiers",
    },
    {
      type: "p",
      text: "Emprunts bancaires, comptes courants d'associés, garanties données, crédit-bail, PGE encore en remboursement. Tout engagement qui pèsera sur l'acquéreur après le closing doit apparaître, avec le tableau d'amortissement, pas seulement le solde restant dû.",
    },
    {
      type: "h3",
      id: "cap-table",
      text: "La cap table et la gouvernance",
    },
    {
      type: "p",
      text: "Répartition du capital, pactes d'actionnaires, BSPCE ou stock-options en circulation, clauses de sortie. Une cap table qui se découvre au fil de la due diligence, avec un actionnaire minoritaire oublié ou une clause de préemption non anticipée, peut suspendre une opération à quelques semaines du closing.",
    },
    {
      type: "h3",
      id: "fiscal-social",
      text: "Le fiscal et le social",
    },
    {
      type: "p",
      text: "Liasses fiscales, attestations de régularité URSSAF, contrôles fiscaux passés et leurs suites, contrats de travail, registre du personnel. Un contrôle fiscal non mentionné, découvert par l'acheteur plutôt que révélé par le dirigeant, change immédiatement la nature de la relation de confiance.",
    },
    {
      type: "h3",
      id: "retraitements",
      text: "Les retraitements, documentés",
    },
    {
      type: "p",
      text: "Chaque charge exceptionnelle, chaque rémunération au-dessus du marché versée au dirigeant, chaque produit non récurrent doit être identifié et expliqué, pas retiré silencieusement du calcul de l'EBITDA retraité. [Préparer les chiffres d'une levée ou d'une cession](/articles/preparer-chiffres-levee-cession) implique de documenter ces retraitements des mois avant l'opération, au moment où ils sont encore faciles à justifier avec des pièces, pas reconstruits de mémoire sous pression.",
    },

    {
      type: "h2",
      id: "organisation-qui-inspire-confiance",
      text: "L'organisation qui inspire confiance",
    },
    {
      type: "p",
      text: "La liste des pièces compte moins que ce qu'on en fait. Une data room qui inspire confiance obéit à quelques règles simples, presque toutes ignorées par défaut.",
    },
    {
      type: "p",
      text: "Une arborescence pensée pour l'acheteur, pas pour le dirigeant : les catégories usuelles, juridique, financier, commercial, social, fiscal, plutôt qu'un classement improvisé au fil des ajouts. Un index qui liste chaque document, sa date, sa version : sans lui, personne ne sait jamais s'il regarde la dernière version d'un contrat ou une version périmée depuis un an. Des droits d'accès gradués, ouverts par phases, les documents généraux dès le teaser, les pièces sensibles (contrats nominatifs, salaires) seulement après la lettre d'intention signée, jamais avant.",
    },
    {
      type: "p",
      text: "Un détail que peu de dirigeants anticipent : la data room reste consultée après le closing, pour les garanties de passif. Un dossier qui disparaît une fois la signature obtenue est, lui aussi, un signal, et rarement un bon.",
    },

    {
      type: "h2",
      id: "avant-la-lettre-d-intention",
      text: "Le bon moment : avant la lettre d'intention",
    },
    {
      type: "p",
      text: "La tentation est de construire la data room une fois la lettre d'intention signée, quand l'acheteur commence à poser ses premières questions précises. C'est l'erreur la plus fréquente, et la plus coûteuse. À ce stade, il n'y a plus de temps pour rassembler proprement, seulement pour rattraper dans l'urgence, document par document, pendant que le calendrier tourne.",
    },
    {
      type: "p",
      text: "La data room se construit six mois avant, pendant que rien ne presse encore. C'est le moment où l'on peut retrouver un contrat égaré auprès d'un fournisseur, recalculer un MRR avec méthode plutôt qu'en urgence, faire signer un pacte d'actionnaires à jour. Une fois la lettre d'intention signée, la due diligence arrive par vagues de questions, souvent avec 48 heures pour répondre. Puis vient la période la plus scrutée de toutes, celle du [current trading](/articles/current-trading-preparer-cession) : les mois qui séparent la signature du closing, où chaque document encore manquant retarde la clôture d'autant.",
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : une data room qui rallonge le closing",
    },
    {
      type: "p",
      text: "Situation composite, chiffres arrondis pour l'anonymat. Une société d'édition logicielle B2B, 22 salariés, ARR affiché de 1,86 M€, entre en négociation exclusive avec un fonds après quatre mois d'échanges préliminaires. La data room est ouverte le jour de la signature de la lettre d'intention, pas avant.",
    },
    {
      type: "p",
      text: "Premier obstacle : les contrats clients sont dispersés entre trois dossiers partagés, gérés par deux personnes différentes, sans index commun. L'équipe met neuf jours à réunir les douze contrats représentant 70 % de l'ARR, le temps de retrouver les versions réellement signées.",
    },
    {
      type: "p",
      text: "Deuxième obstacle : le MRR présenté au teaser incluait des développements spécifiques facturés ponctuellement, jamais isolés du revenu récurrent. Le retraitement, demandé par l'acheteur, prend onze jours supplémentaires et fait apparaître un MRR réel inférieur de 6 % au chiffre initialement communiqué.",
    },
    {
      type: "p",
      text: "Troisième obstacle : la cap table transmise omettait un pacte d'actionnaires signé deux ans plus tôt, avec une clause de sortie conjointe. Sa découverte, en pleine due diligence, suspend les échanges le temps de faire valider la clause par l'ensemble des associés.",
    },
    {
      type: "stat",
      value: "7 semaines",
      label:
        "le retard de closing accumulé par une data room construite après la lettre d'intention, plutôt qu'avant.",
    },
    {
      type: "p",
      text: "Aucun de ces trois obstacles ne remettait en cause la valeur de l'entreprise. Chacun aurait pu être réglé en une journée, six mois plus tôt, sans pression et sans témoin. Reconstitués sous le regard de l'acheteur, ils sont devenus des motifs de méfiance, et un argument de négociation sur le prix final.",
    },

    {
      type: "h2",
      id: "erreurs",
      text: "Les erreurs qui coûtent cher",
    },
    {
      type: "list",
      items: [
        "**Ouvrir la data room à la lettre d'intention.** À ce stade, il n'y a plus de marge pour bien ranger, seulement pour rattraper dans l'urgence, document par document.",
        "**Classer par date d'ajout plutôt que par nature.** Pratique pour qui range, illisible pour qui découvre le dossier en une heure.",
        "**Donner un accès mal calibré.** Tout ouvrir dès le teaser expose des données sensibles sans contrepartie ; tout verrouiller trop longtemps ralentit la confiance.",
        "**Laisser plusieurs versions d'un même contrat sans index.** L'acheteur ne sait jamais laquelle fait foi, et le suppose souvent à tort.",
        "**Oublier un engagement signé il y a longtemps.** Un pacte d'actionnaires, une garantie, un contentieux clos mais non mentionné ressurgit toujours au pire moment.",
      ],
    },

    {
      type: "h2",
      id: "par-ou-commencer",
      text: "Par où commencer",
    },
    {
      type: "p",
      text: "Une data room ne se construit pas en une semaine, mais elle commence par un inventaire honnête : quels documents existent déjà, lesquels sont introuvables, lesquels n'ont jamais été formalisés. Le Score de Préparation à la Cession évalue en dix questions où se situe votre dossier aujourd'hui, comptes, métriques, traçabilité, data room, et donne les priorités à traiter avant d'ouvrir la moindre conversation avec un acheteur.",
    },
  ],
};
