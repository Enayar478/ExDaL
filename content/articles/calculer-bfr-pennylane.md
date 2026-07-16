---
title: Calculer et piloter son BFR à partir de Pennylane
metaTitle: 'Calculer son BFR à partir de Pennylane : la méthode'
metaDescription: >-
  Le BFR se dégrade souvent en silence. Comment le calculer et le suivre depuis
  Pennylane, le CRM et la facturation, et les leviers pour l'améliorer.
excerpt: >-
  Le BFR grossit sans bruit : un délai client qui glisse de quelques jours, un
  stock qui traîne, une facture jamais relancée. Pennylane seul ne le montre
  pas. Voici comment le calculer, le suivre et agir avant que la trésorerie n'en
  paie le prix.
eyebrow: BFR & trésorerie
segment: pme
publishedAt: '2026-09-22'
ctaVariant: qualification
relatedSlugs:
  - connecter-pennylane-tableau-de-bord
  - suivre-tresorerie-previsionnelle-pennylane
  - reconcilier-pennylane-crm-paiements
---
Le compte de résultat dit que l'entreprise est rentable. La banque, elle, montre un solde qui se resserre mois après mois. Entre les deux, un chiffre que peu de dirigeants suivent avec la même rigueur que leur chiffre d'affaires : le besoin en fonds de roulement.

Le BFR ne se voit pas dans Pennylane. Il se calcule à partir de Pennylane, en croisant les créances clients, les stocks et les dettes fournisseurs, avec ce qu'en disent le CRM et la facturation. Ce guide explique ce qu'est réellement le BFR, pourquoi il se dégrade souvent sans que personne ne le remarque avant qu'il ne soit trop tard, comment le calculer proprement, et quels leviers actionner pour le faire baisser.

## Le BFR, une définition simple mais mal comprise

Le besoin en fonds de roulement mesure l'argent que l'entreprise doit avancer entre le moment où elle engage une dépense et le moment où elle encaisse la vente correspondante. La formule tient en une ligne : créances clients plus stocks, moins dettes fournisseurs.

- Les créances clients : ce qui a été facturé mais pas encore encaissé. Plus le délai de paiement s'allonge, plus cette ligne grossit.
- Les stocks : marchandises, matières premières ou en-cours de production, immobilisés tant qu'ils ne sont pas vendus.
- Les dettes fournisseurs : ce que l'entreprise doit mais n'a pas encore payé. Un délai fournisseur plus long réduit le BFR, à condition de ne pas dégrader la relation.

Un BFR positif est normal dans la plupart des activités : l'entreprise avance de l'argent avant de le récupérer. Le problème n'est pas qu'il existe, c'est qu'il grossisse plus vite que le chiffre d'affaires. Une croissance de 20 % du BFR pour 5 % de croissance du chiffre d'affaires n'est pas un détail comptable, c'est un besoin de financement qui s'installe.

## Pourquoi le BFR se dégrade sans qu'on le voie

Aucune de ces dégradations n'arrive d'un coup. C'est leur lenteur qui les rend dangereuses.

Un client habitué à payer à 30 jours glisse à 38, puis à 45, sans qu'aucune facture ne soit officiellement en retard : chacune finit par être réglée, juste un peu plus tard que la précédente. Un commercial accepte un délai de règlement plus long pour emporter un contrat, sans que la décision remonte jamais dans un tableau de trésorerie. Un stock constitué pour sécuriser une rupture d'approvisionnement reste en rayon trois mois après que le risque a disparu. Chacun de ces gestes se justifie isolément. Ensemble, ils immobilisent du cash que personne n'a décidé d'immobiliser.

Pennylane, seul, ne peut pas alerter sur cette dérive. Il enregistre les factures et les paiements au fil de l'eau, avec une vision comptable, pas un délai moyen recalculé en continu ni une comparaison avec les conditions contractuelles négociées ailleurs, dans le CRM ou le devis signé.

## Calculer son BFR en croisant Pennylane, CRM et facturation

### Ce que donne Pennylane

Pennylane fournit la matière comptable brute : le montant des factures clients émises et non soldées, le montant des factures fournisseurs reçues et non réglées, et, si les stocks y sont suivis, leur valorisation. C'est un point de départ fiable, mais partiel : il dit ce qui a été comptabilisé, pas ce qui a été promis à un client par un commercial, ni ce qu'un CRM sait d'une négociation en cours sur les conditions de paiement.

### Ce qu'il faut ajouter

Le délai de paiement réellement pratiqué, calculé facture par facture, pas celui inscrit dans les conditions générales de vente. Le CRM ou l'outil de facturation donne la date d'émission et, en croisant avec les encaissements réels, le délai effectif. C'est [ce croisement entre Pennylane, le CRM et les paiements](/journal/reconcilier-pennylane-crm-paiements) qui fait la différence entre un BFR théorique, calculé sur des conditions contractuelles, et un BFR réel, celui qui pèse vraiment sur la trésorerie.

### La formule à suivre chaque mois

En jours de chiffre d'affaires, le calcul se lit ainsi : délai moyen de paiement clients, plus délai moyen de rotation des stocks, moins délai moyen de paiement fournisseurs. Le résultat, multiplié par le chiffre d'affaires journalier moyen, donne le montant en euros immobilisé. C'est ce nombre de jours, suivi mois après mois sur une même méthode, qui révèle une dérive bien avant qu'elle ne se traduise en tension bancaire.

## Le cas concret : ce que révèle un calcul mensuel

Situation composite, chiffres arrondis pour l'anonymat. Une société de négoce de matériel professionnel B2B, 14 salariés, chiffre d'affaires annuel de 1 780 000 €, suivait sa trésorerie au solde bancaire, sans jamais avoir formalisé de calcul de BFR. « On sait qu'on avance de l'argent, ce n'est pas un scoop », résumait la dirigeante avant l'exercice.

Le calcul, une fois les trois sources croisées, a donné trois chiffres inattendus :

- Un délai de paiement client réel de 61 jours, contre 45 jours inscrits dans les conditions générales. L'écart venait de sept comptes clients importants, jamais relancés au-delà de l'échéance par habitude commerciale.
- Un stock couvrant 52 jours de vente, alors que l'objectif fixé en interne, jamais mesuré depuis, était de 30 jours. Une partie dormait depuis plus de six mois sur une référence en fin de vie.
- Un délai fournisseurs de 34 jours seulement, alors que la plupart des fournisseurs accordaient contractuellement 45 jours : l'entreprise payait plus vite qu'elle n'y était obligée, sans bénéfice identifié en retour.

En jours, le BFR s'élevait à 79 jours de chiffre d'affaires (61 plus 52, moins 34). Rapporté au chiffre d'affaires journalier moyen, environ 4 877 €, cela représentait près de 385 000 € de trésorerie immobilisée, sans qu'aucune ligne comptable ne le signale isolément.

::stat[immobilisés dans le BFR, l'équivalent de plus de trois mois de charges fixes, révélés par un calcul jamais fait auparavant.]{value="385 000 €"}

Rien ici ne relevait d'une erreur de gestion isolée. Trois habitudes prises séparément, une relance client remise à plus tard, un réassort décidé par précaution, un règlement fournisseur payé par automatisme dès réception, s'étaient additionnées en un besoin de financement que personne n'avait décidé.

## Les leviers pour faire baisser son BFR

### Réduire le délai de paiement client

Le levier le plus direct, et souvent le moins exploité. Relancer systématiquement à J+3 après échéance, pas au bout de trois semaines. Demander un acompte à la commande sur les projets significatifs, 30 % suffisent déjà à changer la donne sur un BFR tendu. Proposer un escompte pour paiement anticipé sur les plus gros comptes plutôt que de subir un allongement silencieux.

### Ajuster les stocks au réel, pas à l'intuition

Un stock de sécurité se justifie tant que le risque qu'il couvre existe. Passé ce délai, il ne sécurise plus rien, il immobilise du cash pour de mauvaises raisons. Revoir les seuils de réassort tous les trimestres, pas une fois par an, et identifier les références qui dorment depuis plus de six mois avant qu'elles ne deviennent une perte à provisionner.

### Négocier les délais fournisseurs, sans les subir

Payer plus vite que nécessaire n'est pas de la prudence, c'est un financement gratuit offert au fournisseur. Vérifier que les délais contractuels sont bien ceux appliqués en pratique, et renégocier quand un fournisseur stratégique peut absorber quelques jours supplémentaires sans tension sur la relation.

## Le lien entre BFR et trésorerie

Un BFR qui grossit de 10 % en six mois, sans qu'on l'ait mesuré, se traduit tôt ou tard par une trésorerie plus tendue que ne le laissait supposer le compte de résultat. C'est souvent la première alerte, bien avant qu'un découvert bancaire ne devienne visible. Suivre le BFR sans le connecter au [prévisionnel de trésorerie](/journal/suivre-tresorerie-previsionnelle-pennylane) revient à mesurer une fièvre sans jamais consulter : le chiffre existe, mais il ne sert à rien tant qu'il n'éclaire pas une décision, recruter, investir, ou au contraire ralentir un mois.

C'est là que la démarche rejoint celle décrite pour [connecter Pennylane à un tableau de bord fiable](/journal/connecter-pennylane-tableau-de-bord) : le BFR n'est pas une métrique isolée à calculer une fois par an pour le bilan, c'est un signal à suivre mensuellement, au même titre que la trésorerie et le chiffre d'affaires, avec la même exigence de fiabilité.

## Ce que cela change concrètement

Un dirigeant qui suit son BFR chaque mois, avec un calcul stable et des sources réconciliées, ne découvre plus une tension de trésorerie une fois qu'elle est là. Il la voit venir, deux ou trois mois à l'avance, avec le temps d'agir : relancer une créance, ajuster un stock, renégocier un délai. Le BFR devient un outil de pilotage, pas une ligne de bilan qu'on regarde une fois par an avec l'expert-comptable.

Si votre BFR n'a jamais été calculé, ou s'il l'a été une fois, il y a un an, pour un dossier bancaire, un échange de vingt minutes suffit pour identifier où se cache, chez vous, l'argent qui dort sans raison.
