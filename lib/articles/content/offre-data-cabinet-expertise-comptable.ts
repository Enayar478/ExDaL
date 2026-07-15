import type { Article } from "@/lib/articles/types";

/**
 * Article satellite, grappe B (cabinets comptables sous Pennylane).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 * Satellite du pilier `pennylane-cabinets-automatiser-sans-perdre-controle` :
 * détaille la construction et la vente d'une offre de pilotage récurrente.
 */
export const offreDataCabinetExpertiseComptable: Article = {
  slug: "offre-data-cabinet-expertise-comptable",
  title: "Proposer une offre de pilotage data à ses clients : le guide cabinet",
  metaTitle: "Offre de pilotage data : le guide pour un cabinet",
  metaDescription:
    "Comment un cabinet comptable package et vend une offre de pilotage récurrente : socle technique, rythme de restitution, pricing, clients pilotes.",
  excerpt:
    "Automatiser la production libère du temps. Ce temps ne devient un revenu que si le cabinet sait exactement ce qu'il vend : quel socle technique, quel rythme de restitution, à quel prix. Ce guide détaille comment construire une offre de pilotage vendable, dès le premier client pilote.",
  eyebrow: "Offre de pilotage",
  segment: "cabinet",
  publishedAt: "2026-09-15",
  ctaVariant: "qualification",
  relatedSlugs: [
    "pennylane-cabinets-automatiser-sans-perdre-controle",
    "expert-comptable-augmente",
    "api-pennylane-cabinet-comptable",
  ],
  blocks: [
    {
      type: "p",
      text: "Un client vous appelle un jeudi et demande : « Vous pourriez me faire un point chaque mois sur ma trésorerie, comme pour le bilan intermédiaire ? » La question paraît anodine. Elle ne l'est pas : elle vous demande de transformer une compétence déjà exercée ponctuellement en engagement récurrent. Et la plupart des cabinets, à cet instant précis, n'ont ni prix, ni format, ni réponse prête.",
    },
    {
      type: "p",
      text: "Ce n'est pas un problème de compétence. C'est un problème de packaging. [Automatiser sans perdre le contrôle](/articles/pennylane-cabinets-automatiser-sans-perdre-controle) libère du temps côté production ; ce temps ne devient un revenu que si le cabinet sait exactement ce qu'il vend, à qui, et pour combien. Sans cadre posé à l'avance, chaque demande de suivi se négocie au cas par cas, gratuitement la plupart du temps, parce que dire non à un bon client coûte plus cher que de céder.",
    },
    {
      type: "p",
      text: "Ce guide couvre comment packager une offre de pilotage qui se vend, ce que le cabinet garde en propre et ce qu'il peut déléguer, comment fixer un prix qui tient dans le temps, et comment démarrer sur un ou deux clients avant d'étendre à tout le portefeuille.",
    },

    {
      type: "h2",
      id: "trois-briques",
      text: "Trois briques, pas davantage",
    },
    {
      type: "p",
      text: "Une offre de pilotage qui se vend repose sur trois éléments, ni plus ni moins. Ajouter une quatrième brique dès le départ, support illimité, reporting sur mesure pour chaque client, dilue l'offre avant même qu'elle existe. Les cabinets qui réussissent à la vendre résistent à la tentation de tout personnaliser dès le premier client.",
    },
    {
      type: "h3",
      id: "socle-technique",
      text: "Le socle technique",
    },
    {
      type: "p",
      text: "La matière première : une réconciliation fiable entre Pennylane, le CRM et les paiements, un entrepôt de données qui ne casse pas à chaque mise à jour, un tableau de bord qui tourne seul. [Ce que permet l'API Pennylane côté cabinet](/articles/api-pennylane-cabinet-comptable) rend ce socle possible sans ressaisie, mais le construire proprement demande une compétence d'ingénierie que peu de cabinets ont en interne, et que peu ont intérêt à recruter pour cinq ou dix clients pilotés.",
    },
    {
      type: "h3",
      id: "rythme-restitution",
      text: "Le rythme de restitution",
    },
    {
      type: "p",
      text: "C'est la partie visible pour le client, celle qu'il achète en réalité. Un point mensuel de trente à quarante-cinq minutes, structuré autour de trois ou quatre indicateurs stables (trésorerie, marge, créances, un indicateur métier propre au client) vaut davantage qu'un tableau de bord en libre accès que personne ne consulte. Le rythme, pas l'outil, crée la valeur perçue. Certains cabinets testent un format bimensuel pour les dossiers les plus tendus en trésorerie ; d'autres se limitent à un envoi mensuel commenté par écrit, sans rendez-vous, pour les clients moins demandeurs. Les deux fonctionnent, à condition d'être annoncés clairement dès la vente.",
    },
    {
      type: "h3",
      id: "grille-tarifaire",
      text: "La grille tarifaire récurrente",
    },
    {
      type: "p",
      text: "Le point sur lequel la plupart des cabinets hésitent, parfois au point de renoncer. Une mission de pilotage ne se facture pas comme une mission de production : le prix suit la valeur perçue par le dirigeant, une trésorerie fiable, moins de mauvaises surprises, pas le temps passé à la produire. C'est aussi la brique la plus simple à ajuster une fois testée sur un ou deux clients, ce qui en fait, paradoxalement, celle qu'il faut fixer en dernier.",
    },

    {
      type: "h2",
      id: "garder-deleguer",
      text: "Ce que le cabinet garde, ce qu'il délègue",
    },
    {
      type: "p",
      text: "La règle qui tranche presque tous les cas : tout ce qui touche à la mécanique de la donnée se délègue, tout ce qui touche à la relation et au jugement reste au cabinet.",
    },
    {
      type: "list",
      items: [
        "Se délègue : l'extraction et la réconciliation Pennylane, CRM et banque, la maintenance de l'entrepôt, la construction du tableau de bord, les ajustements techniques quand un client change d'outil.",
        "Reste au cabinet : la restitution en direct, l'interprétation d'un chiffre dans le contexte du client, la décision de ce qui mérite d'être remonté ou tu, la facturation, la relation.",
      ],
    },
    {
      type: "p",
      text: "Cette séparation n'affaiblit pas l'expertise du cabinet, elle la protège. [L'expert-comptable augmenté](/articles/expert-comptable-augmente) ne passe pas moins de temps avec ses clients sous prétexte qu'une partie de la mécanique tourne ailleurs ; il en passe davantage, parce que le temps auparavant perdu en réconciliation manuelle se retrouve en face du client, là où il se facture.",
    },
    {
      type: "p",
      text: "Un point mérite d'être posé sans détour, la question revient à chaque échange sur ce sujet : livrer cette offre en marque blanche, sous le seul nom du cabinet, est une piste que certains cabinets explorent, pas une garantie. Cela dépend du prestataire technique choisi, du niveau d'intégration recherché et, souvent, de contraintes contractuelles propres à chaque cabinet. À traiter comme une hypothèse à valider dossier par dossier, pas comme un acquis.",
    },

    {
      type: "h2",
      id: "fixer-le-prix",
      text: "Fixer le prix : ancrer sur la valeur, pas sur le temps",
    },
    {
      type: "p",
      text: "Trois repères, à ajuster selon la taille du client, pas selon le temps que le cabinet imagine y consacrer.",
    },
    {
      type: "list",
      items: [
        "Client de 5 à 15 salariés, sans direction financière : 250 à 400 € par mois, un point mensuel de trente minutes.",
        "Client de 15 à 40 salariés, avec un enjeu de trésorerie réel : 400 à 700 € par mois, restitution mensuelle plus approfondie, alertes entre deux points.",
        "Client au-delà, ou en préparation d'une opération : tarification à part, hors grille standard, qui rejoint davantage une mission ponctuelle de préparation qu'un abonnement de pilotage.",
      ],
    },
    {
      type: "p",
      text: "Ces montants s'ajoutent aux honoraires de production existants, ils ne les remplacent pas. À clarifier dès la première conversation avec le client : le pilotage est une prestation nouvelle, pas une amélioration gratuite de l'existant.",
    },

    {
      type: "h2",
      id: "demarrer-pilotes",
      text: "Démarrer sur un ou deux clients pilotes",
    },
    {
      type: "p",
      text: "Choisir les bons clients pilotes compte davantage que peaufiner l'offre avant de la proposer. Trois critères reviennent chez les cabinets qui ont transformé l'essai : un client déjà demandeur de suivi rapproché, souvent celui qui appelle entre deux clôtures pour poser une question de trésorerie, une taille suffisante pour que le prix ait un sens pour lui, et une relation déjà installée, parce que le premier pilote se vend sur la confiance, pas sur une démonstration technique.",
    },
    {
      type: "p",
      text: "Une période d'essai de deux à trois mois, sans engagement de durée, désamorce l'essentiel des réticences côté client. Elle donne aussi au cabinet le temps de calibrer le rythme réel de restitution avant de le proposer à un cinquième, un dixième client.",
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : d'une mission ponctuelle à l'abonnement",
    },
    {
      type: "p",
      text: "Situation composite, chiffres arrondis pour l'anonymat. Un cabinet de neuf collaborateurs, quarante-cinq dossiers PME sous Pennylane, a choisi deux clients pour une intervention ponctuelle de diagnostic, réconciliation Pennylane, CRM et banque, plus un premier tableau de bord de trésorerie, facturée en mission forfaitaire à 3 800 € et 4 400 € selon la taille du dossier.",
    },
    {
      type: "p",
      text: "Trois mois après la livraison, le cabinet a proposé aux deux clients de transformer le suivi en abonnement mensuel à 420 € et à 490 €, incluant une mise à jour hebdomadaire des indicateurs et une restitution de quarante-cinq minutes. Les deux ont signé sans discuter le prix, seulement la fréquence : l'un a demandé un point bimensuel plutôt que mensuel, l'autre a gardé le format standard.",
    },
    {
      type: "p",
      text: "Quatorze mois plus tard, l'offre couvre six clients, un revenu récurrent additionnel voisin de 2 340 € par mois, pour un temps collaborateur mobilisé d'environ une heure quarante par client et par mois, le socle technique portant le reste. Le cabinet a aussi constaté qu'aucun des six clients pilotés n'a remis en cause ses honoraires de production comptable lors du dernier renouvellement annuel, contrairement à quatre dossiers sur le reste du portefeuille.",
    },
    {
      type: "stat",
      value: "100 %",
      label:
        "des deux clients pilotes ont transformé leur mission ponctuelle en abonnement de pilotage dans les 90 jours suivant la livraison.",
    },
    {
      type: "p",
      text: "Rien, dans ce parcours, n'a exigé de compétence nouvelle côté cabinet. Le socle technique a changé de main ; la vente, elle, s'est jouée sur un rythme annoncé clairement et un prix fixé avant la première réunion, pas négocié après coup.",
    },

    {
      type: "h2",
      id: "transformer-recurrent",
      text: "Transformer une mission ponctuelle en revenu récurrent",
    },
    {
      type: "p",
      text: "La bascule ne se produit presque jamais d'elle-même. Elle se propose, à un moment précis : juste après la livraison d'une première mission, diagnostic, réconciliation initiale, tableau de bord, quand le client vient de voir la valeur du travail et n'a pas encore eu le temps de l'oublier. Attendre le renouvellement annuel pour évoquer un abonnement de pilotage revient à recommencer la démonstration depuis zéro.",
    },
    {
      type: "p",
      text: "Le langage compte aussi. Présenter l'abonnement comme la suite logique d'un travail déjà livré, « maintenant que la trésorerie est fiabilisée, on la maintient ensemble », convertit mieux qu'une proposition présentée comme une option annexe. Le client achète la continuité d'un résultat, pas un nouveau produit.",
    },

    {
      type: "h2",
      id: "erreurs",
      text: "Les erreurs qui empêchent l'offre de décoller",
    },
    {
      type: "list",
      items: [
        "Vouloir tout personnaliser dès le premier client, ce qui empêche toute réplication ensuite.",
        "Fixer le prix sur le temps passé plutôt que sur la valeur perçue, ce qui plafonne la marge dès le départ.",
        "Proposer l'abonnement des mois après la mission initiale, une fois que le client a oublié pourquoi il en aurait besoin.",
        "Confondre tableau de bord et restitution : un outil sans rendez-vous régulier ne se facture pas au même prix.",
      ],
    },

    {
      type: "p",
      text: "Rien de ce qui précède n'exige de recruter, ni de repenser l'organisation du cabinet. Cela exige un socle technique fiable, un rythme tenable, et un prix fixé avant la première proposition commerciale plutôt qu'après. Si votre cabinet a déjà un ou deux clients qui posent ce genre de question, un échange de vingt minutes suffit pour cadrer l'offre à tester en premier.",
    },
  ],
};
