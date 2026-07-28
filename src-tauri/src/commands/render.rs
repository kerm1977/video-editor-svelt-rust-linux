use crate::error::{AppError, AppResult};
use crate::ffmpeg;
use serde::Deserialize;
use std::collections::HashMap;
use std::io::Write;

#[derive(Debug, Deserialize)]
struct Meta {
    fps: u32,
}

#[derive(Debug, Deserialize)]
struct Asset {
    id: String,
    path: String,
}

#[derive(Debug, Deserialize)]
struct Clip {
    #[serde(rename = "assetId")]
    asset_id: String,
    kind: String,
    start: f64,
    duration: f64,
    #[serde(rename = "inPoint")]
    in_point: f64,
}

#[derive(Debug, Deserialize)]
struct Track {
    kind: String,
    clips: Vec<Clip>,
}

#[derive(Debug, Deserialize)]
struct Timeline {
    tracks: Vec<Track>,
}

#[derive(Debug, Deserialize)]
struct ProjectFile {
    meta: Meta,
    assets: Vec<Asset>,
    timeline: Timeline,
}

fn video_clips(project: &ProjectFile) -> Vec<&Clip> {
    let mut clips: Vec<&Clip> = project
        .timeline
        .tracks
        .iter()
        .filter(|t| t.kind == "video")
        .flat_map(|t| t.clips.iter())
        .filter(|c| c.kind == "video" || c.kind == "image")
        .collect();
    clips.sort_by(|a, b| a.start.partial_cmp(&b.start).unwrap_or(std::cmp::Ordering::Equal));
    clips
}

/// Renderiza la pista de vídeo principal concatenando los clips recortados.
#[tauri::command]
pub async fn render_timeline(payload: String, output: String) -> AppResult<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let project: ProjectFile = serde_json::from_str(&payload)?;
        let paths: HashMap<&str, &str> = project
            .assets
            .iter()
            .map(|a| (a.id.as_str(), a.path.as_str()))
            .collect();

        let clips = video_clips(&project);
        if clips.is_empty() {
            return Err(AppError::Other("No hay clips de vídeo que renderizar".into()));
        }

        let dir = tempfile::tempdir()?;
        let mut list = std::fs::File::create(dir.path().join("list.txt"))?;

        for (i, clip) in clips.iter().enumerate() {
            let Some(src) = paths.get(clip.asset_id.as_str()) else {
                continue;
            };
            if src.is_empty() {
                continue;
            }
            let part = dir.path().join(format!("part{i}.mp4"));
            ffmpeg::trim_clip(src, clip.in_point, clip.duration, &part)?;
            writeln!(list, "file '{}'", part.to_string_lossy())?;
        }
        list.flush()?;

        ffmpeg::concat_segments(&dir.path().join("list.txt"), &output, project.meta.fps)?;
        Ok(output)
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}
