import type { Article } from "@/lib/articles/types";

/**
 * Article pilier #1 (Pilier A — PME/startups sous Pennylane).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 */
export const connecterPennylaneTableauDeBord: Article = {
  slug: "connecter-pennylane-tableau-de-bord",
  title: "Comment connecter Pennylane à un tableau de bord fiable",
  metaTitle: "Connecter Pennylane à un tableau de bord : le guide",
  metaDescription:
    "Le guide pour connecter Pennylane à un tableau de bord fiable : API, réconciliation, trésorerie, BFR, MRR. Méthode pas à pas et cas concret.",
  excerpt:
    "Pennylane centralise votre comptabilité, pas votre pilotage. Voici ce qu'il faut construire par-dessus — API, réconciliation, entrepôt, visualisation — pour voir sa trésorerie, son BFR et ses métriques clés en un clic.",
  eyebrow: "Pilotage Pennylane",
  segment: "pme",
  publishedAt: "2026-07-13",
  readingMinutes: 10,
  ctaVariant: "qualification",
  blocks: [
    {
      type: "p",
      text: "Pennylane sait tout de vos chiffres. Vos factures, vos écritures, votre trésorerie bancaire, tout y transite. Et pourtant, la plupart des dirigeants continuent d'ouvrir un fichier Excel le lundi matin pour savoir où ils en sont vraiment. Ce n'est pas un défaut de Pennylane — c'est un malentendu sur ce qu'un outil comptable est censé faire.",
    },
    {
      type: "p",
      text: "Pennylane organise la comptabilité. Un tableau de bord organise la décision. Ce sont deux métiers différents, et confondre les deux coûte cher : des décisions prises une semaine trop tard, une trésorerie qui semble tendue alors qu'elle ne l'est pas — ou l'inverse.",
    },
    {
      type: "p",
      text: "Ce guide explique, sans détour technique inutile, comment passer de « j'ai Pennylane » à « je vois mon entreprise en un clic, tous les jours ». Il couvre ce que permet réellement l'API Pennylane, les briques à construire par-dessus, les métriques qui comptent, les pièges les plus fréquents — avec un cas concret et chiffré — et une méthode pas à pas.",
    },

    {
      type: "h2",
      id: "pourquoi-pennylane-seul-ne-suffit-pas",
      text: "Pourquoi Pennylane seul ne suffit pas à piloter",
    },
    {
      type: "p",
      text: "Pennylane fait très bien une chose : tenir une comptabilité à jour, quasi en temps réel, avec une saisie largement automatisée. C'est déjà beaucoup mieux que la plupart des systèmes comptables classiques, mis à jour un mois après la clôture.",
    },
    {
      type: "p",
      text: "Mais une entreprise ne vit pas seulement en écritures comptables. Elle vit en clients qui commandent, en abonnements qui se renouvellent ou qui churnent, en encaissements qui arrivent avec un décalage variable, en fournisseurs qu'il faut payer à temps. Cette réalité opérationnelle est répartie dans plusieurs outils : un CRM ou un outil de facturation, une plateforme de paiement, parfois un tableur qui fait le lien tant bien que mal.",
    },
    {
      type: "p",
      text: "Chaque outil a raison dans son coin. Le CRM sait combien de clients sont actifs. La plateforme de paiement sait ce qui a été réellement encaissé, à la date exacte. Pennylane sait ce qui a été comptabilisé, avec parfois un décalage de quelques jours à quelques semaines selon le rythme de saisie. Aucun des trois, seul, ne répond à la question que se pose un dirigeant un mardi matin : combien j'ai vraiment en trésorerie, et combien j'en aurai dans six semaines ?",
    },
    {
      type: "p",
      text: "Un tableau de bord fiable n'est pas un habillage graphique posé sur Pennylane. C'est un système qui va chercher la donnée à la source dans chaque outil, la met d'accord avec les autres, et la restitue sous une forme qui répond aux questions du métier — pas seulement aux exigences du plan comptable.",
    },

    {
      type: "h2",
      id: "api-pennylane",
      text: "Ce que permet réellement l'API Pennylane",
    },
    {
      type: "p",
      text: "Pennylane expose une API publique documentée, pensée pour les intégrations tierces. Concrètement, elle permet notamment de :",
    },
    {
      type: "list",
      items: [
        "récupérer et créer des factures clients et fournisseurs ;",
        "lister et créer des transactions bancaires et les comptes associés ;",
        "lister ou créer des écritures comptables dans les journaux ;",
        "gérer les fiches clients, fournisseurs et produits ;",
        "importer des justificatifs et les lier à une écriture ;",
        "générer un FEC (fichier des écritures comptables).",
      ],
    },
    {
      type: "p",
      text: "Autrement dit : l'API donne accès à la matière première comptable et bancaire de façon structurée, sans ressaisie manuelle. C'est la brique d'entrée indispensable — mais elle ne fait, à elle seule, ni la réconciliation avec les autres outils, ni le prévisionnel, ni la visualisation. Elle donne la donnée brute ; le travail commence après.",
    },
    {
      type: "p",
      text: "Les capacités décrites ici sont vérifiables dans la [documentation publique de Pennylane](https://help.pennylane.com/fr/articles/18770-utiliser-les-api-publiques-pennylane).",
    },

    {
      type: "h2",
      id: "quatre-briques",
      text: "Les quatre briques d'un tableau de bord fiable",
    },
    {
      type: "p",
      text: "Un tableau de bord qui mérite sa confiance quotidienne repose sur quatre briques, dans cet ordre. Sauter une étape est la cause la plus fréquente d'un dashboard qu'on cesse de regarder au bout de trois semaines.",
    },
    { type: "h3", id: "extraction", text: "1. L'extraction" },
    {
      type: "p",
      text: "Aller chercher la donnée à la source, dans chaque outil : Pennylane via son API, le CRM ou l'outil de facturation, la plateforme de paiement. Chaque extraction est programmée pour tourner seule, sans intervention manuelle — sinon le tableau de bord retombe dans le travers qu'il devait résoudre.",
    },
    { type: "h3", id: "reconciliation", text: "2. La réconciliation" },
    {
      type: "p",
      text: "C'est l'étape la plus négligée, et la plus déterminante. Une facture Pennylane, une ligne CRM et un encaissement qui parlent du même client, à la même période, doivent être rapprochés proprement : doublons, devises, délais de règlement, TVA, avoirs. Sans cette étape, on obtient trois chiffres différents pour une même réalité — et c'est celui-là qui finit affiché en réunion, avec la contestation qui va avec.",
    },
    { type: "h3", id: "entrepot", text: "3. L'entrepôt" },
    {
      type: "p",
      text: "Un référentiel unique, où la donnée réconciliée est stockée sous une forme stable et interrogeable. C'est ce qui fait qu'un tableau de bord reste juste dans le temps, plutôt que de se dérégler à chaque mise à jour d'un des outils sources. C'est aussi la garantie que dans deux ans, en cas de levée ou de cession, l'historique existe déjà, propre, sans reconstitution d'urgence.",
    },
    { type: "h3", id: "visualisation", text: "4. La visualisation" },
    {
      type: "p",
      text: "La partie visible — et la moins importante des quatre, même si c'est celle qu'on montre. Un bon tableau de bord répond à des questions précises du métier (« combien de trésorerie dans six semaines ? », « quel est mon BFR ce mois-ci ? »), pas à l'envie d'afficher des graphiques. La complexité doit rester invisible ; seule la décision doit apparaître claire.",
    },

    {
      type: "h2",
      id: "metriques",
      text: "Les métriques qui comptent vraiment",
    },
    {
      type: "p",
      text: "Toutes les métriques ne se valent pas. Trois reviennent systématiquement pour une PME ou une startup sous Pennylane.",
    },
    {
      type: "h3",
      id: "tresorerie",
      text: "La trésorerie — position et prévisionnel",
    },
    {
      type: "p",
      text: "La position de trésorerie du jour est facile à obtenir : c'est le solde bancaire. Ce qui a de la valeur, c'est le prévisionnel : les encaissements attendus — factures émises, échéances contractuelles, délai de paiement réel observé, pas celui du contrat — moins les décaissements connus : salaires, fournisseurs, échéances fiscales et sociales. C'est ce prévisionnel qui donne le nombre de mois de trésorerie devant soi, la vraie question avant de recruter ou d'investir.",
    },
    {
      type: "h3",
      id: "bfr",
      text: "Le BFR (besoin en fonds de roulement)",
    },
    {
      type: "p",
      text: "Le décalage entre le moment où l'entreprise paie ses charges et le moment où elle encaisse ses ventes. Un BFR qui se dégrade silencieusement — délai client qui s'allonge, stock qui grossit — est souvent le premier signal d'alerte avant une tension de trésorerie visible. Il ne se lit pas dans Pennylane seul : il exige de croiser factures émises, factures réglées et données du CRM.",
    },
    {
      type: "h3",
      id: "mrr-arr",
      text: "MRR et ARR — pour les modèles à revenu récurrent",
    },
    {
      type: "p",
      text: "Si une partie du chiffre d'affaires est un abonnement, le MRR (revenu mensuel récurrent) et l'ARR deviennent la métrique de référence. Le piège classique : confondre le MRR avec le chiffre d'affaires facturé divisé par douze. Le MRR réel exclut les prestations ponctuelles, ajuste au prorata les changements en cours de mois, et retire immédiatement un client qui churne — pas seulement à l'échéance de son contrat. Cette distinction, minime en apparence, change parfois le chiffre de plusieurs points.",
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : ce qu'une réconciliation révèle",
    },
    {
      type: "p",
      text: "Illustration à partir d'une situation type rencontrée, chiffres arrondis pour l'anonymat. Une entreprise de services B2B d'une vingtaine de personnes, avec une partie de son chiffre d'affaires facturée en abonnement mensuel, pilotait sa trésorerie sur un tableur mis à jour chaque lundi à partir du relevé bancaire.",
    },
    {
      type: "p",
      text: "En connectant l'API Pennylane, le CRM et la plateforme d'encaissement dans un entrepôt unique, trois écarts sont apparus dès la première réconciliation :",
    },
    {
      type: "list",
      items: [
        "12 factures échues et jamais relancées, soit environ 38 000 € en attente — invisibles dans le tableur, qui ne suivait que le solde bancaire, pas les créances en cours.",
        "Un délai de paiement client réel de 52 jours, contre 30 prévus au contrat. Une fois intégré au prévisionnel, cet écart a fait passer le runway affiché de 2,3 à 4,1 mois : la trésorerie n'était pas plus tendue que prévu, elle était mal projetée — et l'entreprise avait failli geler un recrutement sur une base erronée.",
        "Un MRR recalculé à 64 500 €, contre 71 000 € estimés jusque-là. L'écart de 9 % venait de deux prestations ponctuelles comptées à tort comme récurrentes, et d'un client parti deux mois plus tôt mais toujours dans le tableur.",
      ],
    },
    {
      type: "stat",
      value: "38 000 €",
      label:
        "de créances échues, invisibles dans le tableur — révélées dès la première réconciliation.",
    },
    {
      type: "p",
      text: "Aucun de ces écarts ne relevait d'une erreur de saisie dans Pennylane. Ils venaient tous du même endroit : l'absence de réconciliation entre les outils. Chacun avait raison dans son coin ; ensemble, ils ne disaient rien de fiable.",
    },

    {
      type: "h2",
      id: "pieges",
      text: "Les pièges les plus fréquents",
    },
    {
      type: "list",
      items: [
        "La donnée éclatée sans référentiel commun : trois outils, trois vérités partielles, personne pour arbitrer.",
        "Le tableau de bord qui casse au premier changement : un fichier construit à la main tient rarement plus de quelques mois.",
        "La confusion entre solde bancaire et trésorerie prévisionnelle : voir de l'argent aujourd'hui ne dit rien de dans six semaines.",
        "Le MRR mal défini : un chiffre flatteur mais faux finit toujours par être découvert — au pire moment, face à un investisseur.",
        "L'absence de mise à jour automatique : un tableau de bord qu'il faut alimenter à la main redevient vite le fichier Excel qu'il devait remplacer.",
      ],
    },

    {
      type: "h2",
      id: "methode",
      text: "La méthode, pas à pas",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Cadrer les questions avant les outils. Quelles décisions ce tableau de bord doit-il permettre de prendre, et à quelle fréquence ? Sans réponse claire, on construit des graphiques, pas un outil de pilotage.",
        "Auditer les sources existantes. Lister où vit chaque donnée aujourd'hui — Pennylane, CRM, paiement, tableur de secours — et repérer les écarts déjà visibles entre elles.",
        "Connecter l'API Pennylane et les autres sources. Mettre en place une extraction automatisée, programmée, qui ne dépend d'aucune saisie manuelle récurrente.",
        "Construire la réconciliation et l'entrepôt. L'étape la plus longue, et celle qui porte toute la fiabilité du reste. À faire une fois, correctement, plutôt que rafistoler en boucle.",
        "Construire les vues utiles. Trésorerie prévisionnelle, BFR, MRR/ARR si pertinent — lisibles en quelques secondes, pas un tableau de cinquante colonnes.",
        "Fiabiliser dans la durée. Les outils changent, l'activité évolue. Un contrôle mensuel, léger mais régulier, évite que le tableau de bord se dérègle silencieusement.",
      ],
    },

    {
      type: "h2",
      id: "ce-que-ca-change",
      text: "Ce que cela change concrètement",
    },
    {
      type: "p",
      text: "Un dirigeant qui voit sa trésorerie prévisionnelle, son BFR et ses métriques clés à jour, chaque jour, sans les reconstruire, ne prend plus les mêmes décisions. Il recrute quand la donnée le permet, pas quand l'inquiétude le pousse. Il relance une créance en retard avant qu'elle ne devienne un problème. Et le jour où un investisseur ou un repreneur demande ses chiffres, ils existent déjà, propres, avec un historique — plutôt que plusieurs semaines de reconstitution dans l'urgence.",
    },
    {
      type: "p",
      text: "C'est exactement ce que couvre **Le Socle · Clarté** : la réconciliation de Pennylane, du CRM et des paiements dans un entrepôt unique, et des tableaux de bord fiables qui tournent seuls — pour ouvrir un écran et voir où l'on en est, chaque jour, pas à la fin du mois.",
    },
    {
      type: "p",
      text: "Si votre situation ressemble à celle décrite plus haut — une donnée qui existe, mais dispersée, et une confiance dans les chiffres déjà érodée une fois de trop — un échange de vingt minutes suffit pour identifier ce qui, chez vous, mérite d'être connecté en priorité.",
    },
  ],
};
