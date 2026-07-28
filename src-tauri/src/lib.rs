pub mod commands;
pub mod db;
pub mod error;
pub mod ffmpeg;

use std::sync::Mutex;

/// Punto de entrada compartido por el binario de escritorio.
pub fn run() {
    let conn = db::init().expect("no se pudo inicializar SQLite");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(db::Db(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            commands::media::probe_media,
            commands::media::extract_thumbnail,
            commands::media::extract_filmstrip,
            commands::media::ffmpeg_available,
            commands::media::read_media_file,
            commands::project::save_project,
            commands::project::load_project,
            commands::project::list_projects,
            commands::project::delete_project,
            commands::project::set_setting,
            commands::project::get_setting,
            commands::project::save_project_file,
            commands::project::load_project_file,
            commands::render::render_timeline,
        ])
        .run(tauri::generate_context!())
        .expect("error al arrancar la aplicación Tauri");
}
