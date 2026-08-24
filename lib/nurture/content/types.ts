/**
 * Contrat de contenu d'un email de nurturing. PAS de HTML brut ici : le corps
 * est un tableau déclaratif de blocs, rendu par lib/nurture/render.ts selon
 * la DA email existante (lib/email/layout.ts). Ça isole la copy (modifiable
 * par un non-développeur, ex. agent thot-content) du rendu.
 */

export interface ParagraphBlock {
  readonly type: "paragraph";
  readonly text: string;
}

export interface CtaBlock {
  readonly type: "cta";
  readonly label: string;
  readonly url: string;
}

export interface SignatureBlock {
  readonly type: "signature";
  readonly text: string;
}

export type EmailBlock = ParagraphBlock | CtaBlock | SignatureBlock;

/** Définition complète d'un email d'une séquence (une étape = un fichier de contenu). */
export interface NurtureEmailDefinition {
  /** Position dans la séquence, 0 à 5. */
  readonly step: number;
  /** Identifiant stable, ex. "pilotage-0". Sert de email_key en base (nurture_sends). */
  readonly key: string;
  readonly subject: string;
  /** Texte de préview affiché par les clients mail avant l'ouverture. */
  readonly preheader?: string;
  readonly blocks: readonly EmailBlock[];
}
