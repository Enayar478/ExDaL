import { NextResponse } from "next/server";

/** Enveloppe de réponse API cohérente pour toute l'application. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(
  error: string,
  status = 400,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error }, { status });
}
