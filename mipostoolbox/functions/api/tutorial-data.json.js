export async function onRequest(context) {
    const { env } = context;
    const { results } = await env.mipostoolbox_db.prepare('SELECT * FROM tutorials').all();
    
    const formattedData = results.map(row => {
        const item = { SKU: row.sku };
        if (row.playlist_name) item.PlaylistName = row.playlist_name;
        if (row.playlist_link) item.PlaylistLink = row.playlist_link;
        
        const videoLinks = JSON.parse(row.video_links_json);
        if (videoLinks && videoLinks.length > 0) item.VideoLinks = videoLinks;
        
        const fileLinks = JSON.parse(row.file_links_json);
        if (fileLinks && fileLinks.length > 0) item.FileLinks = fileLinks;
        
        return item;
    });

    return new Response(JSON.stringify(formattedData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
