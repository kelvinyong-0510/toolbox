export async function onRequestGet(context) {
    const { env } = context;
    const { results } = await env.mipostoolbox_db.prepare('SELECT * FROM changelog ORDER BY id DESC LIMIT 100').all();
    
    return new Response(JSON.stringify(results, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
