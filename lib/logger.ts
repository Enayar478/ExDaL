import "server-only";

/**
 * Logger serveur structuré (finding L-4/M-6).
 *
 * Chaque entrée de log est un objet JSON sur une seule ligne :
 *   { level, msg, ts, ...context }
 *
 * Avantages : ingestion directe par Datadog/Axiom/Sentry, grep-able en prod,
 * et aucun détail sensible n'est exposé côté client (module server-only).
 *
 * L'API publique (logger.error / logger.warn) est inchangée pour ne rien
 * casser dans le reste de la codebase.
 */

type LogLevel = "error" | "warn";

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  [key: string]: unknown;
}

function buildEntry(
  level: LogLevel,
  msg: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    msg,
    ts: new Date().toISOString(),
    ...context,
  };
}

export const logger = {
  error(message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = buildEntry("error", message, context);
    console.error(JSON.stringify(entry));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = buildEntry("warn", message, context);
    console.warn(JSON.stringify(entry));
  },
};
