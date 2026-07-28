use crate::error::AppResult;
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Db(pub Mutex<Connection>);

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS projects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    payload    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS assets_cache (
    path       TEXT PRIMARY KEY,
    duration   REAL NOT NULL,
    width      INTEGER NOT NULL,
    height     INTEGER NOT NULL,
    thumbnail  TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
";

/// Ruta del archivo SQLite dentro del directorio de datos del usuario.
pub fn db_path() -> PathBuf {
    let base = std::env::var("XDG_DATA_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            PathBuf::from(std::env::var("HOME").unwrap_or_else(|_| ".".into())).join(".local/share")
        });
    base.join("videoguru-editor")
}

/// Abre (o crea) la base de datos y aplica el esquema.
pub fn init() -> AppResult<Connection> {
    let dir = db_path();
    std::fs::create_dir_all(&dir)?;
    let conn = Connection::open(dir.join("projects.db"))?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    conn.execute_batch(SCHEMA)?;
    Ok(conn)
}
