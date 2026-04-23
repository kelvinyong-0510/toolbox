CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id INTEGER,
    old_data TEXT,
    new_data TEXT,
    timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
);
