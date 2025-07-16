// Cloudflare Workers compatible Express adapter
export default {
  async fetch(request, env) {
    const app = (await import('./index.js')).default;
    const adjustedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    return app(adjustedRequest);
  }
}
