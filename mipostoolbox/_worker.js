/**
 * MIPOS ToolBox — _worker.js
 * Handles API routes for D1 database, falls through to static assets.
 */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function err(msg, status = 400) {
  return new Response(msg, { status });
}

// ── LED DATA ──────────────────────────────────────────────
async function handleLed(request, env) {
  const db = env.mipostoolbox_db;
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' } });

  if (method === 'GET') {
    const rows = await db.prepare('SELECT id, sku, details_json FROM led_boards ORDER BY id ASC').all();
    const data = rows.results.map(r => ({ id: r.id, SKU: r.sku, Details: JSON.parse(r.details_json || '[]') }));
    return json(data);
  }

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  if (method === 'POST') {
    const { sku, details_json } = body;
    if (!sku) return err('Missing sku');
    const result = await db.prepare('INSERT INTO led_boards (sku, details_json) VALUES (?, ?)').bind(sku, details_json || '[]').run();
    const newId = result.meta?.last_row_id;
    await db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('CREATE', 'led_boards', newId, JSON.stringify({ sku, details_json })).run();
    return json({ success: true, id: newId });
  }

  if (method === 'PUT') {
    const { id, sku, details_json } = body;
    if (!id) return err('Missing id');
    const old = await db.prepare('SELECT * FROM led_boards WHERE id = ?').bind(id).first();
    await db.prepare('UPDATE led_boards SET sku = ?, details_json = ? WHERE id = ?').bind(sku, details_json, id).run();
    await db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('UPDATE', 'led_boards', id, JSON.stringify(old)).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    const ids = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
    if (!ids.length) return err('Missing ids');

    const stmts = [];
    for (const uid of ids) {
      const old = await db.prepare('SELECT * FROM led_boards WHERE id = ?').bind(uid).first();
      if (old) {
        stmts.push(db.prepare('DELETE FROM led_boards WHERE id = ?').bind(uid));
        stmts.push(db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('DELETE', 'led_boards', uid, JSON.stringify(old)));
      }
    }
    if (stmts.length > 0) await db.batch(stmts);
    return json({ success: true });
  }

  return err('Method not allowed', 405);
}

// ── TUTORIAL DATA ─────────────────────────────────────────
async function handleTutorial(request, env) {
  const db = env.mipostoolbox_db;
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' } });

  if (method === 'GET') {
    const rows = await db.prepare('SELECT id, sku, playlist_name, playlist_link, video_links_json, file_links_json FROM tutorials ORDER BY id ASC').all();
    const data = rows.results.map(r => ({
      id: r.id, SKU: r.sku,
      PlaylistName: r.playlist_name, PlaylistLink: r.playlist_link,
      VideoLinks: JSON.parse(r.video_links_json || '[]'),
      FileLinks: JSON.parse(r.file_links_json || '[]'),
    }));
    return json(data);
  }

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  if (method === 'POST') {
    const { sku, playlist_name, playlist_link, video_links_json, file_links_json } = body;
    if (!sku) return err('Missing sku');
    const result = await db.prepare('INSERT INTO tutorials (sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?)').bind(sku, playlist_name || '', playlist_link || '', video_links_json || '[]', file_links_json || '[]').run();
    const newId = result.meta?.last_row_id;
    await db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('CREATE', 'tutorials', newId, JSON.stringify(body)).run();
    return json({ success: true, id: newId });
  }

  if (method === 'PUT') {
    const { id, sku, playlist_name, playlist_link, video_links_json, file_links_json } = body;
    if (!id) return err('Missing id');
    const old = await db.prepare('SELECT * FROM tutorials WHERE id = ?').bind(id).first();
    await db.prepare('UPDATE tutorials SET sku = ?, playlist_name = ?, playlist_link = ?, video_links_json = ?, file_links_json = ? WHERE id = ?').bind(sku, playlist_name || '', playlist_link || '', video_links_json, file_links_json, id).run();
    await db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('UPDATE', 'tutorials', id, JSON.stringify(old)).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    const ids = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
    if (!ids.length) return err('Missing ids');

    const stmts = [];
    for (const uid of ids) {
      const old = await db.prepare('SELECT * FROM tutorials WHERE id = ?').bind(uid).first();
      if (old) {
        stmts.push(db.prepare('DELETE FROM tutorials WHERE id = ?').bind(uid));
        stmts.push(db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('DELETE', 'tutorials', uid, JSON.stringify(old)));
      }
    }
    if (stmts.length > 0) await db.batch(stmts);
    return json({ success: true });
  }

  return err('Method not allowed', 405);
}

// ── CHANGELOG ─────────────────────────────────────────────
async function handleChangelog(request, env) {
  if (request.method === 'GET') {
    const rows = await env.mipostoolbox_db.prepare('SELECT id, action, target_table, target_id, timestamp FROM changelog ORDER BY id DESC LIMIT 5').all();
    return json(rows.results);
  }
  return err('Method not allowed', 405);
}

// ── CHANGELOG REVERT ──────────────────────────────────────
async function handleChangelogRevert(request, env) {
  if (request.method !== 'POST') return err('Method not allowed', 405);
  const db = env.mipostoolbox_db;
  const { logId } = await request.json().catch(() => ({}));
  if (!logId) return err('Missing logId');

  const log = await db.prepare('SELECT * FROM changelog WHERE id = ?').bind(logId).first();
  if (!log) return err('Log entry not found', 404);

  const snap = JSON.parse(log.old_data || '{}');
  const table = log.target_table;
  const id = log.target_id;

  if (log.action === 'DELETE') {
    // Re-insert the deleted row
    if (table === 'led_boards') {
      await db.prepare('INSERT INTO led_boards (id, sku, details_json) VALUES (?, ?, ?)').bind(id, snap.sku, snap.details_json).run();
    } else if (table === 'tutorials') {
      await db.prepare('INSERT INTO tutorials (id, sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?, ?)').bind(id, snap.sku, snap.playlist_name, snap.playlist_link, snap.video_links_json, snap.file_links_json).run();
    }
  } else if (log.action === 'UPDATE') {
    if (table === 'led_boards') {
      await db.prepare('UPDATE led_boards SET sku = ?, details_json = ? WHERE id = ?').bind(snap.sku, snap.details_json, id).run();
    } else if (table === 'tutorials') {
      await db.prepare('UPDATE tutorials SET sku = ?, playlist_name = ?, playlist_link = ?, video_links_json = ?, file_links_json = ? WHERE id = ?').bind(snap.sku, snap.playlist_name, snap.playlist_link, snap.video_links_json, snap.file_links_json, id).run();
    }
  } else if (log.action === 'CREATE') {
    // Undo a CREATE = delete the row
    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  }

  await db.prepare('INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)').bind('REVERT', table, id, JSON.stringify({ reverted_log_id: logId })).run();
  return json({ success: true });
}

// ── TOOLS REGISTRY ───────────────────────────────────────
async function handleTools(request, env) {
  const db = env.mipostoolbox_db;
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' } });

  if (method === 'GET') {
    const rows = await db.prepare('SELECT * FROM tools ORDER BY sort_order ASC, id ASC').all();
    const data = rows.results.map(r => ({
      id: r.id,
      name: r.name,
      version: r.version,
      icon_emoji: r.icon_emoji,
      icon_bg: r.icon_bg,
      category: r.category,
      category_label: r.category_label,
      is_new: r.is_new === 1,
      description: r.description,
      features: JSON.parse(r.features_json || '[]'),
      download_label: r.download_label,
      download_url: r.download_url,
      versions: JSON.parse(r.versions_json || '[]'),
      docs_url: r.docs_url,
      docs_label: r.docs_label,
      sort_order: r.sort_order,
    }));
    return json(data);
  }

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  if (method === 'POST') {
    const { name, version, icon_emoji, icon_bg, category, category_label, is_new, description, features_json, download_label, download_url, versions_json, docs_url, docs_label, sort_order } = body;
    if (!name) return err('Missing name');
    const result = await db.prepare(
      'INSERT INTO tools (name,version,icon_emoji,icon_bg,category,category_label,is_new,description,features_json,download_label,download_url,versions_json,docs_url,docs_label,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(name, version||'', icon_emoji||'🔧', icon_bg||'linear-gradient(135deg,#1B2A4A,#2a3f6e)', category||'utilities', category_label||'', is_new?1:0, description||'', features_json||'[]', download_label||'⬇ Download', download_url||'', versions_json||'[]', docs_url||'#', docs_label||'Docs', sort_order||0).run();
    return json({ success: true, id: result.meta?.last_row_id });
  }

  if (method === 'PUT') {
    const { id, name, version, icon_emoji, icon_bg, category, category_label, is_new, description, features_json, download_label, download_url, versions_json, docs_url, docs_label, sort_order } = body;
    if (!id) return err('Missing id');
    await db.prepare(
      'UPDATE tools SET name=?,version=?,icon_emoji=?,icon_bg=?,category=?,category_label=?,is_new=?,description=?,features_json=?,download_label=?,download_url=?,versions_json=?,docs_url=?,docs_label=?,sort_order=? WHERE id=?'
    ).bind(name, version||'', icon_emoji||'🔧', icon_bg||'linear-gradient(135deg,#1B2A4A,#2a3f6e)', category||'utilities', category_label||'', is_new?1:0, description||'', features_json||'[]', download_label||'⬇ Download', download_url||'', versions_json||'[]', docs_url||'#', docs_label||'Docs', sort_order||0, id).run();
    return json({ success: true });
  }

  if (method === 'DELETE') {
    const ids = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);
    if (!ids.length) return err('Missing ids');
    const stmts = ids.map(uid => db.prepare('DELETE FROM tools WHERE id = ?').bind(uid));
    if (stmts.length > 0) await db.batch(stmts);
    return json({ success: true });
  }

  return err('Method not allowed', 405);
}

// ── MAIN ROUTER ───────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // API routes
    if (path === '/api/tools.json')               return handleTools(request, env);
    if (path === '/api/led-data.json')             return handleLed(request, env);
    if (path === '/api/tutorial-data.json')         return handleTutorial(request, env);
    if (path === '/api/changelog.json')             return handleChangelog(request, env);
    if (path === '/api/changelog-revert.json')      return handleChangelogRevert(request, env);

    // Static assets fallthrough
    return env.ASSETS.fetch(request);
  },
};
