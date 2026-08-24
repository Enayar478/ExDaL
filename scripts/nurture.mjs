#!/usr/bin/env node
// Outil de pilotage manuel du nurturing, à l'usage du CEO sur sa machine.
//
// Usage :
//   node scripts/nurture.mjs list [--full]   Parcours vivants (pending+active)
//   node scripts/nurture.mjs stop <email>    Sortie humaine : "quelqu'un répond"
//   node scripts/nurture.mjs stats           Indicateurs du tunnel nurturing
//
// Charge SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY depuis .env.local (racine
// du repo). Aucune dépendance ajoutée pour ça : parsing minimal du fichier,
// le client Supabase est déjà une dépendance du projet.
//
// Ce script NE réutilise PAS lib/nurture/repository.ts : ce module importe
// "server-only", un garde qui lève une exception hors du contexte bundler
// Next.js (webpack/turbopack). Les requêtes Supabase nécessaires sont donc
// réimplémentées ici, minimales et dédiées à cet usage CLI.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = join(ROOT, ".env.local");
const LIVE_STATUSES = ["pending", "active"];
const STATS_ROW_LIMIT = 10_000; // Volume attendu faible (cf. CLAUDE.md, métriques du tunnel).

// ── Environnement ────────────────────────────────────────────────────────

/**
 * Parse un fichier .env minimal : une entrée KEY=VALUE par ligne, guillemets
 * simples/doubles optionnels autour de la valeur, lignes vides et
 * commentaires (#) ignorés. Fonction pure, testée isolément.
 */
export function parseEnvFile(content) {
  const result = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted && value.length >= 2) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

function loadEnvFromDisk() {
  if (!existsSync(ENV_FILE)) return;
  const parsed = parseEnvFile(readFileSync(ENV_FILE, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    // Une variable déjà présente dans l'environnement réel (CI, shell) prime
    // sur .env.local : jamais d'écrasement silencieux d'une config explicite.
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function actionableError(message) {
  process.stderr.write(`Erreur : ${message}\n`);
  process.exitCode = 1;
}

function readSupabaseCredentials() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    actionableError(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.\n" +
        `  Vérifiez ${ENV_FILE} ou exécutez : vercel env pull .env.local`,
    );
    return null;
  }
  return { url, key };
}

function getClient() {
  const credentials = readSupabaseCredentials();
  if (!credentials) return null;
  return createClient(credentials.url, credentials.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Formatage (fonctions pures, testées isolément) ──────────────────────

/** Masque une adresse email : `camille@exemple.fr` → `ca***@exemple.fr`. */
export function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

/** Aligne des colonnes en tableau texte simple (aucune dépendance CLI). */
export function renderTable(headers, rows) {
  const widths = headers.map((header, index) =>
    Math.max(
      header.length,
      ...rows.map((row) => String(row[index] ?? "").length),
      0,
    ),
  );
  const renderLine = (cells) =>
    cells
      .map((cell, index) => String(cell ?? "").padEnd(widths[index]))
      .join("  ")
      .trimEnd();

  const lines = [
    renderLine(headers),
    widths.map((width) => "-".repeat(width)).join("  "),
    ...rows.map(renderLine),
  ];
  return lines.join("\n");
}

function countBy(rows, keyFn) {
  const result = {};
  for (const row of rows) {
    const key = keyFn(row) ?? "inconnu";
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

/**
 * Calcule les indicateurs du tunnel nurturing à partir d'un jeu
 * d'enrollments bruts (sequence, source, status, stop_reason). Fonction
 * pure : les requêtes réseau vivent dans `cmdStats`, ce qui la rend testable
 * sans Supabase.
 */
export function computeStats(rows) {
  const bySequence = countBy(rows, (row) => row.sequence);
  const bySource = countBy(rows, (row) => row.source);
  const byStatus = countBy(rows, (row) => row.status);
  const byStopReason = countBy(
    rows.filter((row) => row.stop_reason),
    (row) => row.stop_reason,
  );

  const conversionBySequence = {};
  for (const sequence of Object.keys(bySequence)) {
    const total = bySequence[sequence];
    const booked = rows.filter(
      (row) => row.sequence === sequence && row.stop_reason === "booked",
    ).length;
    conversionBySequence[sequence] = {
      total,
      booked,
      rate: total > 0 ? booked / total : 0,
    };
  }

  return {
    total: rows.length,
    bySequence,
    bySource,
    byStatus,
    byStopReason,
    conversionBySequence,
    unsubscribed: byStopReason.unsubscribed ?? 0,
  };
}

function formatPercent(rate) {
  return `${(rate * 100).toFixed(1)} %`;
}

function printCountSection(title, counts) {
  console.log(`\n${title} :`);
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    console.log("  (aucune donnée)");
    return;
  }
  for (const [key, count] of entries) {
    console.log(`  ${key.padEnd(16)} ${count}`);
  }
}

function printStats(stats) {
  console.log(`Total enrollments (tous statuts confondus) : ${stats.total}`);

  printCountSection("Par séquence", stats.bySequence);
  printCountSection("Par source", stats.bySource);
  printCountSection("Par statut", stats.byStatus);

  console.log("\nTaux séquence → booked (stop_reason=booked) :");
  const conversions = Object.entries(stats.conversionBySequence);
  if (conversions.length === 0) {
    console.log("  (aucune donnée)");
  }
  for (const [sequence, { total, booked, rate }] of conversions) {
    console.log(
      `  ${sequence.padEnd(16)} ${booked}/${total} (${formatPercent(rate)})`,
    );
  }

  console.log(`\nDésinscriptions (stop_reason=unsubscribed) : ${stats.unsubscribed}`);
}

// ── Commandes ────────────────────────────────────────────────────────────

async function cmdList(showFull) {
  const client = getClient();
  if (!client) return;

  const { data, error } = await client
    .from("nurture_enrollments")
    .select("email, sequence, source, status, next_step, next_send_at, created_at")
    .in("status", LIVE_STATUSES)
    .order("next_send_at", { ascending: true, nullsFirst: false });

  if (error) {
    actionableError(`lecture des parcours vivants : ${error.message}`);
    return;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    console.log("Aucun parcours vivant.");
    return;
  }

  const headers = [
    "email",
    "sequence",
    "source",
    "statut",
    "etape",
    "prochain_envoi",
    "cree_le",
  ];
  const tableRows = rows.map((row) => [
    showFull ? row.email : maskEmail(row.email),
    row.sequence,
    row.source,
    row.status,
    row.next_step,
    row.next_send_at ?? "-",
    row.created_at,
  ]);

  console.log(renderTable(headers, tableRows));
  console.log(`\n${rows.length} parcours vivant(s).`);
  if (!showFull) {
    console.log("(email masqué par défaut, option --full pour l'adresse complète)");
  }
}

async function cmdStop(emailArg) {
  if (!emailArg) {
    actionableError("usage : node scripts/nurture.mjs stop <email>");
    return;
  }

  const client = getClient();
  if (!client) return;

  const email = emailArg.trim().toLowerCase();

  const { data, error } = await client
    .from("nurture_enrollments")
    .update({
      status: "stopped",
      stopped_at: new Date().toISOString(),
      stop_reason: "replied",
      next_send_at: null,
    })
    .eq("email", email)
    .in("status", LIVE_STATUSES)
    .select("id");

  if (error) {
    actionableError(`arrêt des parcours : ${error.message}`);
    return;
  }

  const count = Array.isArray(data) ? data.length : 0;
  console.log(
    `${count} parcours arrêté(s) pour ${maskEmail(email)} (stop_reason=replied).`,
  );
}

async function cmdStats() {
  const client = getClient();
  if (!client) return;

  const { data, error } = await client
    .from("nurture_enrollments")
    .select("sequence, source, status, stop_reason")
    .limit(STATS_ROW_LIMIT);

  if (error) {
    actionableError(`lecture des indicateurs : ${error.message}`);
    return;
  }

  printStats(computeStats(data ?? []));
}

function printUsage() {
  console.log(
    [
      "Usage :",
      "  node scripts/nurture.mjs list [--full]   Parcours vivants (pending+active)",
      "  node scripts/nurture.mjs stop <email>    Sortie humaine (stop_reason=replied)",
      "  node scripts/nurture.mjs stats           Indicateurs du tunnel nurturing",
    ].join("\n"),
  );
}

async function main() {
  loadEnvFromDisk();
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "list":
      await cmdList(args.includes("--full"));
      break;
    case "stop":
      await cmdStop(args[0]);
      break;
    case "stats":
      await cmdStats();
      break;
    default:
      printUsage();
      if (command) process.exitCode = 1;
  }
}

// Exécute la CLI uniquement quand le fichier est lancé directement (jamais
// à l'import depuis les tests, qui n'exercent que les fonctions pures ci-dessus).
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  main().catch((error) => {
    actionableError(error instanceof Error ? error.message : String(error));
  });
}
