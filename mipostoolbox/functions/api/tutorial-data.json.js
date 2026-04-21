export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.mipostoolbox_db.prepare('SELECT * FROM tutorials ORDER BY id DESC').all();
    
    const formattedData = results.map(row => {
        const item = { id: row.id, SKU: row.sku };
        if (row.playlist_name) item.PlaylistName = row.playlist_name;
        if (row.playlist_link) item.PlaylistLink = row.playlist_link;
        
        try {
            const videoLinks = JSON.parse(row.video_links_json);
            if (videoLinks && videoLinks.length > 0) item.VideoLinks = videoLinks;
        } catch(e){}
        
        try{
            const fileLinks = JSON.parse(row.file_links_json);
            if (fileLinks && fileLinks.length > 0) item.FileLinks = fileLinks;
        } catch(e){}
        
        return item;
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
    
    const stmt = env.mipostoolbox_db.prepare('INSERT INTO tutorials (sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?) RETURNING id')
        .bind(body.sku, body.playlist_name || '', body.playlist_link || '', body.video_links_json || '[]', body.file_links_json || '[]');
    
    const result = await stmt.first();
    
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)')
        .bind('CREATE', 'tutorial', result.id, JSON.stringify(body)).run();
        
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestPut(context) {
    const { request, env } = context;
    const body = await request.json();
    
    const oldRow = await env.mipostoolbox_db.prepare('SELECT * FROM tutorials WHERE id = ?').bind(body.id).first();
    
    const stmt = env.mipostoolbox_db.prepare('UPDATE tutorials SET sku = ?, playlist_name = ?, playlist_link = ?, video_links_json = ?, file_links_json = ? WHERE id = ?')
        .bind(body.sku, body.playlist_name || '', body.playlist_link || '', body.video_links_json || '[]', body.file_links_json || '[]', body.id);
    
    await stmt.run();
    
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)')
        .bind('UPDATE', 'tutorial', body.id, JSON.stringify(oldRow), JSON.stringify(body)).run();
        
    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const body = await request.json();
    
    const oldRow = await env.mipostoolbox_db.prepare('SELECT * FROM tutorials WHERE id = ?').bind(body.id).first();
    
    const stmt = env.mipostoolbox_db.prepare('DELETE FROM tutorials WHERE id = ?')
        .bind(body.id);
    
    await stmt.run();
    
    await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)')
        .bind('DELETE', 'tutorial', body.id, JSON.stringify(oldRow)).run();
        
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
