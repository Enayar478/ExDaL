import "server-only";

/**
 * Logger serveur minimal. On journalise le contexte d'erreur côté serveur
 * sans jamais exposer de détail sensible au client.
 */
export const logger = {
  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[exdal] ${message}`, context ?? "");
  },
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[exdal] ${message}`, context ?? "");
  },
};
