use crate::db::Db;
use crate::error::{AppError, AppResult};
use rusqlite::{params, OptionalExtension};
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct ProjectSummary {
    pub id: i64,
    pub name: String,
    pub updated_at: String,
}

fn lock<'a>(db: &'a State<Db>) -> AppResult<std::sync::MutexGuard<'a, rusqlite::Connection>> {
    db.0.lock().map_err(|e| AppError::Other(e.to_string()))
}

/// Inserta o actualiza el proyecto y devuelve su id.
#[tauri::command]
pub fn save_project(
    db: State<Db>,
    id: Option<i64>,
    name: String,
    payload: String,
) -> AppResult<i64> {
    let conn = lock(&db)?;
    match id {
        Some(existing) => {
            conn.execute(
                "UPDATE projects SET name = ?1, payload = ?2, updated_at = datetime('now') WHERE id = ?3",
                params![name, payload, existing],
            )?;
            Ok(existing)
        }
        None => {
            conn.execute(
                "INSERT INTO projects (name, payload) VALUES (?1, ?2)",
                params![name, payload],
            )?;
            Ok(conn.last_insert_rowid())
        }
    }
}

/// Devuelve el JSON serializado del proyecto solicitado.
#[tauri::command]
pub fn load_project(db: State<Db>, id: i64) -> AppResult<Option<String>> {
    let conn = lock(&db)?;
    let payload = conn
        .query_row("SELECT payload FROM projects WHERE id = ?1", params![id], |r| {
            r.get::<_, String>(0)
        })
        .optional()?;
    Ok(payload)
}

/// Lista los proyectos guardados, más recientes primero.
#[tauri::command]
pub fn list_projects(db: State<Db>) -> AppResult<Vec<ProjectSummary>> {
    let conn = lock(&db)?;
    let mut stmt =
        conn.prepare("SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC LIMIT 50")?;
    let rows = stmt.query_map([], |row| {
        Ok(ProjectSummary {
            id: row.get(0)?,
            name: row.get(1)?,
            updated_at: row.get(2)?,
        })
    })?;
    Ok(rows.collect::<Result<Vec<_>, _>>()?)
}

#[tauri::command]
pub fn delete_project(db: State<Db>, id: i64) -> AppResult<()> {
    let conn = lock(&db)?;
    conn.execute("DELETE FROM projects WHERE id = ?1", params![id])?;
    Ok(())
}

#[tauri::command]
pub fn set_setting(db: State<Db>, key: String, value: String) -> AppResult<()> {
    let conn = lock(&db)?;
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

#[tauri::command]
pub fn get_setting(db: State<Db>, key: String) -> AppResult<Option<String>> {
    let conn = lock(&db)?;
    let value = conn
        .query_row("SELECT value FROM settings WHERE key = ?1", params![key], |r| {
            r.get::<_, String>(0)
        })
        .optional()?;
    Ok(value)
}
