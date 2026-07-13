import type { Article } from "@/lib/articles/types";

/**
 * Article pilier — grappe C (premium : préparer une levée ou une cession).
 * Copy rédigée par l'agent thot-content, ton de marque ExDaL.
 * Cornerstone de la grappe : renvoie vers ses satellites (liens forward-déclarés,
 * inactifs tant que la cible n'est pas publiée) et vers le Score (/score).
 */
export const preparerChiffresLeveeCession: Article = {
  slug: "preparer-chiffres-levee-cession",
  title: "Préparer les chiffres d'une levée ou d'une cession : le guide complet",
  metaTitle: "Préparer les chiffres d'une levée ou cession : guide",
  metaDescription:
    "Le guide complet pour préparer les chiffres d'une levée ou d'une cession : calendrier, due diligence financière, data room et current trading.",
  excerpt:
    "Une levée ou une cession se joue avant la première réunion : dans la solidité des chiffres qu'on présente. Ce guide couvre le calendrier, ce qu'exige réellement un investisseur ou un acheteur, et les chantiers qui évitent la décote de dernière minute.",
  eyebrow: "Levée & cession",
  segment: "premium",
  publishedAt: "2026-07-21",
  ctaVariant: "score",
  relatedSlugs: [
    "anatomie-due-diligence-financiere",
    "mrr-arr-cohortes-previsionnel",
    "construire-data-room-financiere",
    "current-trading-preparer-cession",
    "connecter-pennylane-tableau-de-bord",
  ],
  blocks: [
    {
      type: "p",
      text: "Un acheteur ou un investisseur ne négocie jamais sur ce que vaut votre entreprise. Il négocie sur ce qu'il peut vérifier. Deux sociétés identiques sur le papier — même chiffre d'affaires, même marge, même marché — peuvent se vendre avec dix ou vingt points d'écart de multiple, uniquement parce que l'une présente des chiffres qui se retracent en trois clics et l'autre non.",
    },
    {
      type: "p",
      text: "Ce guide couvre l'ensemble du sujet : pourquoi la préparation décide du prix, le calendrier réel d'une opération, ce qu'exige concrètement la partie en face, les chantiers à mener et les erreurs qui se paient cash. Chaque section renvoie, quand c'est utile, vers un article qui creuse le point en détail — c'est la page à garder ouverte pendant les prochains mois, pas un article à lire une fois.",
    },

    {
      type: "h2",
      id: "ce-qui-fixe-le-prix",
      text: "Ce qui fixe le prix, avant la négociation",
    },
    {
      type: "p",
      text: "La valorisation d'une entreprise n'est jamais un chiffre unique. C'est un multiple appliqué à une métrique — EBITDA, ARR, MRR annualisé selon les modèles — puis ajusté à la baisse pour chaque incertitude que l'acheteur ne peut pas lever seul. Cet ajustement a un nom dans le métier : la décote de risque perçu. Et elle se construit presque entièrement avant la première réunion.",
    },
    {
      type: "p",
      text: "Un dirigeant qui présente un compte de résultat propre, un prévisionnel dont les hypothèses sont documentées et une data room déjà à moitié remplie change la nature de la conversation. Il ne convainc pas qu'un chiffre est bon — il retire la raison de douter. À l'inverse, chaque zone d'ombre — un chiffre qu'on ne sait pas justifier, une clôture qui prend six semaines, un MRR recalculé différemment selon qui pose la question — donne à l'acheteur un argument de négociation gratuit. Il n'a même pas besoin de mentir sur son intention : le doute suffit à faire baisser une offre.",
    },
    {
      type: "p",
      text: "C'est la raison pour laquelle ce travail ne se fait pas dans les trois semaines qui précèdent le closing. Il se prépare des mois avant, pendant que l'entreprise tourne encore normalement — c'est le seul moment où la préparation ne coûte rien en stress ni en crédibilité.",
    },

    {
      type: "h2",
      id: "calendrier-operation",
      text: "Le calendrier d'une opération",
    },
    {
      type: "p",
      text: "Une levée ou une cession se déroule sur trois temps distincts, et la nature du travail change à chaque phase.",
    },
    {
      type: "h3",
      id: "douze-mois-avant",
      text: "Douze à dix-huit mois avant : construire l'historique",
    },
    {
      type: "p",
      text: "C'est la période où l'on cesse de raisonner « pour soi » et où l'on commence à raisonner « pour un tiers ». Les métriques de valorisation doivent être définies une bonne fois, avec une méthode stable — pas recalculées à chaque demande. C'est le moment de mettre en place le suivi qui permettra, plus tard, de présenter un [prévisionnel qui tient face à un examen ligne par ligne](/articles/mrr-arr-cohortes-previsionnel), avec des cohortes documentées plutôt qu'un tableur optimiste.",
    },
    {
      type: "h3",
      id: "six-mois-avant",
      text: "Six mois avant : structurer la data room",
    },
    {
      type: "p",
      text: "La documentation qu'un acheteur demandera est connue à l'avance — elle ne varie presque pas d'une opération à l'autre. [Construire une data room financière](/articles/construire-data-room-financiere) six mois avant, plutôt que dans l'urgence des deux semaines qui précèdent la signature d'une lettre d'intention, change tout le rapport de force : on répond, on ne rattrape pas.",
    },
    {
      type: "h3",
      id: "pendant-due-diligence",
      text: "Pendant la due diligence : tenir sous pression",
    },
    {
      type: "p",
      text: "Une fois la lettre d'intention signée, les questions arrivent par vagues, souvent avec 48 heures pour répondre. C'est le moment où [ce qu'un acheteur regarde vraiment dans une due diligence financière](/articles/anatomie-due-diligence-financiere) devient concret — et où chaque chiffre qui ne se retrace pas immédiatement ralentit le calendrier, parfois de plusieurs semaines. Un closing qui traîne coûte souvent plus cher qu'une négociation dure.",
    },

    {
      type: "h2",
      id: "ce-qu-exige-un-acheteur",
      text: "Ce qu'un investisseur ou un acheteur exige",
    },
    {
      type: "p",
      text: "Trois attentes reviennent, quelle que soit la taille de l'opération.",
    },
    {
      type: "p",
      text: "**La cohérence dans le temps.** Trois exercices comptables complets, pas un seul. Un investisseur veut voir une trajectoire, pas une photo. Une seule année exceptionnelle — bonne ou mauvaise — sans les deux précédentes pour la contextualiser, déclenche systématiquement plus de questions.",
    },
    {
      type: "p",
      text: "**La traçabilité.** Un chiffre présenté doit pouvoir être retracé jusqu'à sa source — la facture, l'écriture comptable, l'encaissement — en quelques minutes, sans qu'une personne clé doive intervenir pour l'expliquer. Un directeur financier qui répond « je dois vérifier » à une question simple envoie un signal, même quand le chiffre est juste.",
    },
    {
      type: "p",
      text: "**Le current trading.** Les mois qui s'écoulent entre la première conversation et le closing comptent double : c'est la période la plus scrutée, celle où l'acheteur vérifie que la trajectoire promise se confirme en temps réel. [Préparer son current trading pour une cession](/articles/current-trading-preparer-cession) mal anticipé fait resurgir des questions qu'on croyait closes trois mois plus tôt.",
    },

    {
      type: "h2",
      id: "cinq-chantiers",
      text: "Les cinq chantiers de la préparation",
    },
    {
      type: "h3",
      id: "chantier-metriques",
      text: "Les métriques qui définissent le prix",
    },
    {
      type: "p",
      text: "MRR, ARR, cohortes de rétention, marge par segment de clientèle : ce sont ces chiffres, pas le chiffre d'affaires global, qui déterminent le multiple appliqué. Le piège le plus fréquent : un MRR gonflé par des prestations ponctuelles comptées à tort comme récurrentes. Ce détail, insignifiant en apparence, peut représenter dix points de valorisation. Le sujet mérite un traitement à part entière — [construire un MRR, un ARR et des cohortes qui résistent à l'examen](/articles/mrr-arr-cohortes-previsionnel).",
    },
    {
      type: "h3",
      id: "chantier-reconciliation",
      text: "La réconciliation et la traçabilité",
    },
    {
      type: "p",
      text: "Les ventes, la comptabilité et les paiements doivent raconter la même histoire, au même euro près. Cette réconciliation ne se construit pas la veille d'une due diligence : elle se construit en amont, dans le pilotage courant de l'entreprise. C'est tout l'enjeu de [connecter Pennylane à un tableau de bord fiable](/articles/connecter-pennylane-tableau-de-bord) — un chantier qui, mené correctement dix-huit mois avant une opération, transforme la due diligence en formalité plutôt qu'en reconstitution d'urgence.",
    },
    {
      type: "h3",
      id: "chantier-data-room",
      text: "La data room",
    },
    {
      type: "p",
      text: "Un dossier structuré, avec les bons documents au bon endroit, avant qu'on vous les demande. Peu de dirigeants savent qu'une data room mal organisée fait plus de dégâts qu'une data room incomplète : un acheteur qui doit fouiller pour trouver un contrat suppose qu'il en manque d'autres.",
    },
    {
      type: "h3",
      id: "chantier-historique",
      text: "L'historique",
    },
    {
      type: "p",
      text: "Trois exercices minimum, avec les ajustements et retraitements expliqués — pas cachés, expliqués. Un chiffre exceptionnel non commenté inquiète davantage qu'un chiffre médiocre justifié.",
    },
    {
      type: "h3",
      id: "chantier-current-trading",
      text: "Le current trading",
    },
    {
      type: "p",
      text: "Les semaines qui séparent la signature de la lettre d'intention du closing. C'est là que se joue la confiance finale : la trajectoire annoncée trois mois plus tôt se vérifie-t-elle, mois après mois, dans des chiffres qui arrivent à temps ?",
    },

    {
      type: "h2",
      id: "cas-concret",
      text: "Le cas concret : ce que révèle une due diligence",
    },
    {
      type: "p",
      text: "Situation composite, chiffres arrondis pour l'anonymat. Une société de services B2B d'une trentaine de salariés, ARR affiché de 2,34 M€, entrée en négociation exclusive avec un acquéreur industriel après six mois de discussions. Le prix indicatif reposait sur un multiple de 4x l'ARR — soit une valorisation de départ autour de 9,4 M€.",
    },
    {
      type: "p",
      text: "La due diligence a commencé par la reconstitution du MRR mois par mois, exigée par l'acheteur. Deux écarts sont apparus :",
    },
    {
      type: "list",
      items: [
        "Douze contrats de prestation ponctuelle, facturés récurremment par commodité comptable mais sans engagement de renouvellement, comptés à tort dans le MRR récurrent.",
        "Trois clients partis en cours d'année, retirés du CRM mais toujours comptés dans le churn du trimestre précédent — un churn réel de 14 % contre 9 % affiché.",
      ],
    },
    {
      type: "p",
      text: "L'ARR réel, une fois retraité, s'établissait à 2,07 M€ — un écart de 270 000 €, soit 11,5 % du chiffre initial. Appliqué au même multiple, l'écart de valorisation dépassait le million d'euros. Le closing a finalement eu lieu six semaines plus tard que prévu, le temps de reconstruire une trace fiable pour chaque contrat contesté — six semaines pendant lesquelles l'acheteur a repris l'ascendant sur la négociation, obtenant au passage un ajustement du prix à la baisse et une clause d'earn-out supplémentaire.",
    },
    {
      type: "stat",
      value: "1,08 M€",
      label:
        "l'écart de valorisation provoqué par un MRR mal défini, découvert en pleine due diligence.",
    },
    {
      type: "p",
      text: "Rien, dans ce dossier, ne relevait d'une malversation. Juste une définition du MRR jamais formalisée, et un churn suivi de façon irrégulière. Deux réponses auraient suffi, posées un an plus tôt : quelle est notre définition exacte du récurrent, et qui vérifie le churn chaque mois.",
    },

    {
      type: "h2",
      id: "erreurs",
      text: "Les erreurs qui coûtent cher",
    },
    {
      type: "list",
      items: [
        "**Attendre la lettre d'intention pour préparer les chiffres.** À ce stade, il n'y a plus de marge pour corriger une méthode, seulement pour colmater dans l'urgence — et l'urgence se voit.",
        "**Confondre chiffre d'affaires et revenu récurrent.** Une confusion qui gonfle artificiellement le prévisionnel affiché, et se retourne contre le dirigeant dès la première vérification.",
        "**Une data room construite au fil des demandes.** Chaque document envoyé avec deux jours de retard renforce l'impression que rien n'était prêt.",
        "**Un historique sans explication des écarts.** Un exercice atypique non commenté déclenche plus de suspicion qu'un exercice moins bon mais justifié.",
        "**Ignorer le current trading.** Une entreprise qui promet une trajectoire, puis livre des chiffres décevants pendant les mois du closing, voit souvent le prix renégocié à la baisse.",
        "**Découvrir l'écart pendant la due diligence plutôt qu'avant.** C'est la différence entre corriger tranquillement et négocier sous contrainte, l'acheteur en position de force.",
      ],
    },

    {
      type: "h2",
      id: "par-ou-commencer",
      text: "Par où commencer",
    },
    {
      type: "p",
      text: "Rien de ce qui précède ne se règle en une semaine. Mais tout commence par savoir où l'on en est réellement — pas où l'on pense en être. Le Score de Préparation à la Cession mesure en dix questions les quatre dimensions qui font basculer une négociation : les comptes, les métriques, la traçabilité, la data room. Trois minutes, un score sur cent, et les priorités à traiter en premier — avant d'en parler avec qui que ce soit d'autre.",
    },
  ],
};
