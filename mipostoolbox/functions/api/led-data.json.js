const ADMIN_PIN = "MIPOS888";

function checkAuth(request) {
    const pin = request.headers.get("X-Admin-Pin");
    return pin === ADMIN_PIN;
}

export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.mipostoolbox_db.prepare('SELECT * FROM led_boards ORDER BY id DESC').all();
    
    // We send back both ID and formatted data so Admin UI has ID for edits
    const formattedData = results.map(row => {
        return {
            id: row.id,
            SKU: row.sku,
            Details: JSON.parse(row.details_json)
        };
    });

    return new Response(JSON.stringify(formattedData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: {'Access-Control-Allow-Origin': '*'} });

    const body = await request.json();
    
    const stmt = env.mipostoolbox_db.prepare('INSERT INTO led_boards (sku, details_json) VALUES (?, ?)')
        .bind(body.sku, body.details_json);
    
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestPut(context) {
    const { request, env } = context;
    if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: {'Access-Control-Allow-Origin': '*'} });

    const body = await request.json();
    
    const stmt = env.mipostoolbox_db.prepare('UPDATE led_boards SET sku = ?, details_json = ? WHERE id = ?')
        .bind(body.sku, body.details_json, body.id);
    
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: {'Access-Control-Allow-Origin': '*'} });

    const body = await request.json();
    
    const stmt = env.mipostoolbox_db.prepare('DELETE FROM led_boards WHERE id = ?')
        .bind(body.id);
    
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Pin',
        }
    });
}
