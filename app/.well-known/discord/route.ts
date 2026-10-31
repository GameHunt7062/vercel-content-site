// app/.well-known/discord/route.ts
export function GET() {
  return new Response('dh=86329100338a01929bcbddeefa50dd0d7cfbdd95', {
    headers: { 'Content-Type': 'text/plain' },
  });
}
