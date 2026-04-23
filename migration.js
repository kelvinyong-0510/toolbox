const fs = require('fs');

const ledData = JSON.parse(fs.readFileSync('mipostoolbox/api/led-data.json', 'utf8'));
const tutorialData = JSON.parse(fs.readFileSync('mipostoolbox/api/tutorial-data.json', 'utf8'));

let sql = `
DROP TABLE IF EXISTS led_boards;
CREATE TABLE led_boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT,
    details_json TEXT NOT NULL
);

DROP TABLE IF EXISTS tutorials;
CREATE TABLE tutorials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT,
    playlist_name TEXT,
    playlist_link TEXT,
    video_links_json TEXT,
    file_links_json TEXT
);

`;

for (const item of ledData) {
    const sku = item.SKU.replace(/'/g, "''");
    const details = JSON.stringify(item.Details || []).replace(/'/g, "''");
    sql += `INSERT INTO led_boards (sku, details_json) VALUES ('${sku}', '${details}');\n`;
}

for (const item of tutorialData) {
    const sku = item.SKU.replace(/'/g, "''");
    const pName = (item.PlaylistName || '').replace(/'/g, "''");
    const pLink = (item.PlaylistLink || '').replace(/'/g, "''");
    const vLinks = JSON.stringify(item.VideoLinks || []).replace(/'/g, "''");
    const fLinks = JSON.stringify(item.FileLinks || []).replace(/'/g, "''");
    sql += `INSERT INTO tutorials (sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES ('${sku}', '${pName}', '${pLink}', '${vLinks}', '${fLinks}');\n`;
}

fs.writeFileSync('schema.sql', sql);
console.log('schema.sql generated successfully.');
