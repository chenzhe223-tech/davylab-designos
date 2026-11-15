// Explicit browser-origin policy. Authorization is still enforced by the gateway.
export function withCors(handler, allowedOrigins) {
  const allowed = new Set(allowedOrigins);
  return async request => {
    const origin = request.headers.get('origin');
    const isAllowed = !!origin && allowed.has(origin);
    const path = new URL(request.url).pathname;
    if (request.method === 'OPTIONS' && path === '/v1/chat') {
      if (!isAllowed) return new Response(null, {status:403});
      const method = request.headers.get('access-control-request-method');
      const requestedHeaders = (request.headers.get('access-control-request-headers') || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
      if (method !== 'POST' || requestedHeaders.some(h => !['authorization','content-type'].includes(h))) return new Response(null, {status:403});
      return new Response(null, {status:204, headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'authorization, content-type','access-control-max-age':'600','vary':'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'}});
    }
    const response = await handler(request);
    if (!isAllowed || path !== '/v1/chat') return response;
    const headers = new Headers(response.headers);
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  };
}
