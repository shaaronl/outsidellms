import { demoRepository } from "@/lib/repositories/demo-repository";
// Server-only JamBase integration boundary. Do not call a secret-authenticated API from the browser.
export async function listEvents(query?: string) { return demoRepository.list({ query }); }
