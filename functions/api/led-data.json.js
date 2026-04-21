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
    const body = await request.json();
    
    const stmt = env.mipostoolbox_db.prepare('INSERT INTO led_boards (sku, details_json) VALUES (?, ?) RETURNING id')
        .bind(body.sku, body.details_json);
    
    const result = await stmt.first();
    
    // Log to changelog
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)')
        .bind('CREATE', 'led', result.id, JSON.stringify(body)).run();
        
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestPut(context) {
    const { request, env } = context;
    const body = await request.json();
    
    const oldRow = await env.mipostoolbox_db.prepare('SELECT * FROM led_boards WHERE id = ?').bind(body.id).first();
    
    const stmt = env.mipostoolbox_db.prepare('UPDATE led_boards SET sku = ?, details_json = ? WHERE id = ?')
        .bind(body.sku, body.details_json, body.id);
    
    await stmt.run();
    
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)')
        .bind('UPDATE', 'led', body.id, JSON.stringify(oldRow), JSON.stringify(body)).run();

    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const body = await request.json();
    
    const oldRow = await env.mipostoolbox_db.prepare('SELECT * FROM led_boards WHERE id = ?').bind(body.id).first();
    
    const stmt = env.mipostoolbox_db.prepare('DELETE FROM led_boards WHERE id = ?')
        .bind(body.id);
    
    await stmt.run();
    
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)')
        .bind('DELETE', 'led', body.id, JSON.stringify(oldRow)).run();

    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
