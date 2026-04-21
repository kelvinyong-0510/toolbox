export async function onRequestPost(context) {
    const { request, env } = context;
    const { logId } = await request.json();
    
    // Fetch log entry
    const logResult = await env.mipostoolbox_db.prepare('SELECT * FROM changelog WHERE id = ?').bind(logId).first();
    if (!logResult) return new Response("Log not found", { status: 404, headers: {'Access-Control-Allow-Origin': '*'} });
    
    const { action, target_table, target_id, old_data } = logResult;
    
    // Reverse CREATE -> DELETE
    if (action === 'CREATE') {
        if (target_table === 'led') await env.mipostoolbox_db.prepare('DELETE FROM led_boards WHERE id = ?').bind(target_id).run();
        if (target_table === 'tutorial') await env.mipostoolbox_db.prepare('DELETE FROM tutorials WHERE id = ?').bind(target_id).run();
        
        await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id) VALUES (?, ?, ?)')
            .bind('REVERT_CREATE', target_table, target_id).run();
    }
    
    // Reverse DELETE or UPDATE -> Restore old_data
    if ((action === 'DELETE' || action === 'UPDATE') && old_data) {
        const oldRow = JSON.parse(old_data);
        
        if (target_table === 'led') {
            await env.mipostoolbox_db.prepare('INSERT OR REPLACE INTO led_boards (id, sku, details_json) VALUES (?, ?, ?)')
                .bind(oldRow.id, oldRow.sku, oldRow.details_json).run();
        }
        
        if (target_table === 'tutorial') {
            await env.mipostoolbox_db.prepare('INSERT OR REPLACE INTO tutorials (id, sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(oldRow.id, oldRow.sku, oldRow.playlist_name || '', oldRow.playlist_link || '', oldRow.video_links_json || '[]', oldRow.file_links_json || '[]').run();
        }
        
        await env.mipostoolbox_db.prepare('INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)')
            .bind('REVERT', target_table, target_id, old_data).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: {'Access-Control-Allow-Origin': '*'} });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
