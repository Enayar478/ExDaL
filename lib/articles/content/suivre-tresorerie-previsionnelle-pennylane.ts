import type { Article } from "@/lib/articles/types";

/**
 * Article satellite, grappe A (Pilotage, PME/startups sous Pennylane).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 * Renvoie vers le pilier de la grappe et vers deux autres satellites (BFR,
 * réconciliation CRM/paiements) pour tisser le maillage sémantique.
 */
export const suivreTresoreriePrevisionnellePennylane: Article = {
  slug: "suivre-tresorerie-previsionnelle-pennylane",
  title: "Suivre sa trésorerie prévisionnelle sous Pennylane",
  metaTitle: "Trésorerie prévisionnelle sous Pennylane : guide",
  metaDescription:
    "Solde bancaire ou trésorerie prévisionnelle : la différence qui évite les erreurs de recrutement. Méthode, runway et automatisation sous Pennylane.",
  excerpt:
    "Un solde bancaire confortable ne dit rien de ce qui arrive dans six semaines. Voici comment construire, sous Pennylane, un prévisionnel d'encaissements et de décaissements qui tient compte du délai de paiement réel, des échéances récurrentes et de la saisonnalité, et calculer un runway sur lequel on peut s'appuyer.",
  eyebrow: "Pilotage Pennylane",
  segment: "pme",
  publishedAt: "2026-09-01",
  ctaVariant: "qualification",
  relatedSlugs: [
    "connecter-pennylane-tableau-de-bord",
    "calculer-bfr-pennylane",
    "reconcilier-pennylane-crm-paiements",
  ],
  blocks: [
    {
      type: "p",
      text: "Un dirigeant qui ouvre son compte bancaire un mardi matin et voit 140 000 € se sent rassuré. Il a raison de l'être, à l'instant T. Ce chiffre ne dit rien de ce qui se passera dans six semaines : une échéance URSSAF, un client qui paie avec deux mois de retard au lieu d'un, un mois d'août où les encaissements ralentissent alors que les salaires, eux, tombent toujours le 28.",
    },
    {
      type: "p",
      text: "Pennylane enregistre les mouvements bancaires en quasi temps réel, c'est déjà un progrès net par rapport à une comptabilité tenue à un mois d'écart. Mais un solde de compte, aussi frais soit-il, reste une photo. La trésorerie prévisionnelle est un film : elle projette ce qui va rentrer et ce qui va sortir, avec des dates, pas seulement un chiffre figé au jour J.",
    },
    {
      type: "p",
      text: "Ce sujet s'inscrit dans une question plus large, celle de [construire un tableau de bord fiable par-dessus Pennylane](/articles/connecter-pennylane-tableau-de-bord) : la trésorerie prévisionnelle en est la brique la plus urgente, celle qui évite de recruter sur une base fausse ou de geler un investissement qui aurait pu attendre.",
    },

    {
      type: "h2",
      id: "solde-vs-tresorerie",
      text: "Le solde bancaire n'est pas la trésorerie",
    },
    {
      type: "p",
      text: "Le solde bancaire répond à une question : combien j'ai aujourd'hui. La trésorerie prévisionnelle répond à une autre : combien j'aurai dans quatre, six, douze semaines. Ce sont deux questions différentes, et confondre les réponses coûte cher dans les deux sens.",
    },
    {
      type: "p",
      text: "Un solde confortable aujourd'hui peut cacher un mur trois semaines plus tard : une échéance de TVA, deux salaires, un remboursement d'emprunt, tombant tous la même semaine pendant que les encaissements clients traînent. À l'inverse, un solde tendu peut annoncer un mois plus respirable, si une grosse facture déjà émise doit être réglée sous dix jours. Sans prévisionnel, le dirigeant navigue à l'instinct, et l'instinct se trompe à peu près une fois sur deux.",
    },
    {
      type: "p",
      text: "Prenons un exemple simple. Le compte affiche 90 000 € un lundi. Cette même semaine, deux salaires et une échéance URSSAF représentent 54 000 €, et le seul encaissement attendu, un client historiquement irrégulier, ne tombera peut-être pas avant le début du mois suivant. Le solde ne change pas d'un centime tant que rien n'est débité. La trésorerie prévisionnelle, elle, aurait sonné l'alerte une semaine plus tôt.",
    },

    {
      type: "h2",
      id: "construire-previsionnel",
      text: "Construire un prévisionnel d'encaissements et de décaissements",
    },
    {
      type: "p",
      text: "Un prévisionnel de trésorerie utile tient sur une seule feuille : une colonne de dates, une ligne par flux attendu, entrant ou sortant, un solde qui se recalcule automatiquement semaine après semaine. La difficulté n'est pas dans la structure. Elle est dans la justesse des hypothèses qu'on y met, et c'est là que la plupart des tableurs maison échouent silencieusement.",
    },

    {
      type: "h3",
      id: "delai-paiement-reel",
      text: "Le délai de paiement réel, pas celui du contrat",
    },
    {
      type: "p",
      text: "La plupart des prévisionnels amateurs utilisent le délai contractuel : facture à 30 jours, encaissement supposé au jour 30. Dans les faits, ce délai est presque toujours optimiste. Pennylane permet de calculer le délai réel observé, la date d'émission de chaque facture comparée à sa date de règlement effectif, sur les douze derniers mois. C'est ce chiffre-là qu'il faut injecter dans le prévisionnel, pas celui du contrat. Un client qui paie en moyenne à 52 jours au lieu de 30 ne va pas changer de comportement parce qu'on l'espère. Cet écart, ignoré, est aussi ce qui gonfle silencieusement le [besoin en fonds de roulement](/articles/calculer-bfr-pennylane) : un délai client qui s'allonge et un délai fournisseur qui reste fixe, c'est la définition même d'une tension de trésorerie qui se prépare sans bruit.",
    },

    {
      type: "h3",
      id: "echeances-recurrentes",
      text: "Les échéances récurrentes, encaissées et décaissées",
    },
    {
      type: "p",
      text: "Une fois les encaissements clients estimés avec leur vrai délai, il reste à placer les décaissements récurrents à leurs dates réelles, pas approximatives :",
    },
    {
      type: "list",
      items: [
        "les salaires et charges sociales, à date fixe chaque mois ;",
        "la TVA, généralement due le mois suivant, à positionner sur le mois où elle tombe réellement, pas sur celui de l'activité ;",
        "l'impôt sur les sociétés, par acomptes, sur son propre calendrier ;",
        "les loyers, abonnements et charges fixes, faciles à lister une fois et à reconduire ;",
        "les échéances de remboursement d'emprunt, capital et intérêts, à leur date contractuelle exacte.",
      ],
    },
    {
      type: "p",
      text: "Ce sont des flux connus à l'avance, sans incertitude. Les lister une fois, avec leurs dates exactes, retire déjà la moitié du travail d'un bon prévisionnel.",
    },

    {
      type: "h3",
      id: "saisonnalite",
      text: "La saisonnalité, invisible sur un seul mois",
    },
    {
      type: "p",
      text: "Un prévisionnel qui prolonge simplement le mois dernier se trompe dès que l'activité n'est pas parfaitement linéaire, ce qui est le cas de la plupart des entreprises. Une agence facture peu en août, une entreprise qui vend à des collectivités encaisse par vagues liées aux exercices budgétaires, un e-commerce vit une pointe en novembre et décembre. Douze à vingt-quatre mois d'historique Pennylane suffisent pour repérer ces cycles et les appliquer au prévisionnel, plutôt que de découvrir la baisse d'août le 15 août.",
    },

    {
      type: "h2",
      id: "runway",
      text: "Le runway : combien de mois devant soi",
    },
    {
      type: "p",
      text: "Le runway est le nombre de mois de trésorerie devant soi au rythme de consommation actuel : trésorerie disponible divisée par le burn mensuel net, c'est-à-dire les décaissements moins les encaissements récurrents du mois. C'est la question qui précède toute décision structurante : recruter, signer un bail plus grand, investir dans un outil, lever des fonds.",
    },
    {
      type: "p",
      text: "Un runway calculé sur le solde bancaire seul se trompe presque toujours, dans un sens ou dans l'autre. Un runway calculé sur le prévisionnel, avec le délai de paiement réel et la saisonnalité intégrés, donne un chiffre défendable devant un associé, un investisseur, ou soi-même un dimanche soir, avant de signer une offre d'embauche.",
    },
    {
      type: "p",
      text: "Le runway se lit aussi en burn brut et burn net. Le burn brut correspond aux seules dépenses ; le burn net retire les encaissements récurrents avant de mesurer la consommation. Une entreprise qui facture beaucoup en début de mois et paie ses charges en fin de mois voit son runway respirer différemment selon la méthode retenue, un détail qui change la lecture d'un comité de direction.",
    },

    {
      type: "h2",
      id: "automatiser",
      text: "Automatiser le suivi plutôt que le reconstruire chaque lundi",
    },
    {
      type: "p",
      text: "Un prévisionnel construit une fois, à la main, dans un tableur, tient rarement plus de deux ou trois mois. Les dates changent, un client paie plus tôt que prévu, un autre prend du retard, une nouvelle charge récurrente apparaît, et le fichier n'est plus tenu à jour au moment précis où il faudrait le consulter.",
    },
    {
      type: "p",
      text: "Automatiser le suivi suppose que les encaissements constatés en banque, les factures émises dans Pennylane et les données du CRM racontent la même histoire, sans écart ni doublon. C'est exactement le sujet de la [réconciliation entre Pennylane, le CRM et les paiements](/articles/reconcilier-pennylane-crm-paiements) : sans cette étape, le prévisionnel se construit sur une base déjà bancale, aussi soignée soit la formule de calcul du runway posée par-dessus.",
    },
    {
      type: "p",
      text: "Le rythme de mise à jour compte aussi. Un prévisionnel actualisé chaque vendredi arrive toujours après les décisions qu'il aurait dû éclairer. Une mise à jour quotidienne, ou au minimum hebdomadaire automatisée, change la nature de l'outil : il cesse d'être un rapport pour devenir un instrument consulté avant de décider, pas après.",
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : ce qu'un prévisionnel correctement construit révèle",
    },
    {
      type: "p",
      text: "Situation composite, chiffres arrondis pour l'anonymat. Une agence de communication de 14 personnes, facturation mensuelle et quelques missions au forfait, suivait sa trésorerie sur un tableur mis à jour le vendredi à partir du solde affiché sur son appli banque.",
    },
    {
      type: "p",
      text: "Le solde au 3 juin affichait 168 400 €, un chiffre jugé confortable en interne, suffisant pour envisager un recrutement à la rentrée. En reconstruisant le prévisionnel à partir des factures Pennylane et de l'historique réel des encaissements, trois éléments ont changé la lecture :",
    },
    {
      type: "list",
      items: [
        "Un délai de paiement client réel de 58 jours, contre 30 jours prévus au contrat pour les trois principaux comptes, un écart qui décale de près d'un mois chaque grosse rentrée d'argent attendue.",
        "Deux factures de 27 000 € et 31 000 € émises fin mai, comptées comme encaissées en juin dans le tableur alors que leur historique de règlement les situait plutôt fin juillet.",
        "Une baisse saisonnière d'août, visible sur les trois exercices précédents à environ 40 % d'encaissements en moins par rapport à la moyenne mensuelle, jamais intégrée au calcul.",
      ],
    },
    {
      type: "stat",
      value: "3,1 mois",
      label:
        "de runway réel une fois le délai de paiement observé et la baisse d'août intégrés, contre 5,4 mois affichés sur la base du solde bancaire seul.",
    },
    {
      type: "p",
      text: "Le recrutement prévu à la rentrée n'a pas été annulé, il a été décalé de six semaines, le temps qu'une facture en retard rentre effectivement. Une décision prise trois mois plus tôt sur la seule base du solde bancaire aurait probablement conduit à une tension de trésorerie réelle en septembre, au pire moment pour la corriger.",
    },

    {
      type: "h2",
      id: "pieges",
      text: "Les pièges les plus fréquents",
    },
    {
      type: "list",
      items: [
        "Confondre solde bancaire et trésorerie prévisionnelle : le premier est une photo, la seconde un film.",
        "Utiliser le délai de paiement contractuel plutôt que le délai réel observé, presque toujours plus long.",
        "Oublier une échéance récurrente ponctuelle, TVA, acompte d'IS, remboursement d'emprunt, parce qu'elle ne tombe pas tous les mois.",
        "Ignorer la saisonnalité et prolonger linéairement le mois dernier.",
        "Reconstruire le prévisionnel à la main chaque semaine, jusqu'à ce qu'un mois plus chargé, personne ne le fasse plus.",
      ],
    },

    {
      type: "h2",
      id: "methode",
      text: "Par où commencer",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Calculer le délai de paiement réel de vos dix principaux clients sur les douze derniers mois, à partir des factures Pennylane, pas du contrat.",
        "Lister les échéances récurrentes connues, salaires, charges sociales, TVA, IS, loyers, emprunts, avec leurs dates exactes.",
        "Repérer la saisonnalité sur au moins douze mois d'historique, et l'appliquer au lieu d'une projection linéaire.",
        "Construire le prévisionnel semaine par semaine sur douze à seize semaines glissantes, pas mois par mois sur un horizon flou.",
        "Automatiser la mise à jour en connectant Pennylane, la banque et le CRM, pour que le prévisionnel se rafraîchisse seul.",
      ],
    },

    {
      type: "p",
      text: "C'est exactement ce que couvre **Le Socle · Clarté** : la trésorerie prévisionnelle construite une fois, proprement, à partir du délai de paiement réel et non du contrat, et mise à jour seule au fil des semaines.",
    },
    {
      type: "p",
      text: "Si votre solde bancaire vous semble suffisant mais que vous n'avez pas vérifié depuis quand, un échange de vingt minutes suffit pour situer où se trouve, chez vous, l'écart entre ce que la banque affiche et ce que la trésorerie annonce vraiment.",
    },
  ],
};
