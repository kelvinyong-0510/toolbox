export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/test-assets-env') {
      return new Response(JSON.stringify({ hasAssets: !!env.ASSETS }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response("Not test", {status: 200});
  }
}
