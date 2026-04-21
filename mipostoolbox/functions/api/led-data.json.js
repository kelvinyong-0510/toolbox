export async function onRequest(context) {
    const { env } = context;
    const { results } = await env.mipostoolbox_db.prepare('SELECT * FROM led_boards').all();
    
    const formattedData = results.map(row => {
        return {
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
