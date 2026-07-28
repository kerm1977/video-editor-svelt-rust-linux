use crate::error::{AppError, AppResult};
use crate::ffmpeg;
use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProbeResult {
    pub duration: f64,
    pub width: u32,
    pub height: u32,
    pub has_audio: bool,
    pub has_video: bool,
}

fn parse_probe(json: &serde_json::Value) -> ProbeResult {
    let streams = json["streams"].as_array().cloned().unwrap_or_default();
    let video = streams.iter().find(|s| s["codec_type"] == "video");
    let has_audio = streams.iter().any(|s| s["codec_type"] == "audio");
    let duration = json["format"]["duration"]
        .as_str()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);
    ProbeResult {
        duration,
        width: video.and_then(|v| v["width"].as_u64()).unwrap_or(0) as u32,
        height: video.and_then(|v| v["height"].as_u64()).unwrap_or(0) as u32,
        has_audio,
        has_video: video.is_some(),
    }
}

/// Devuelve duración y resolución del archivo usando ffprobe.
#[tauri::command]
pub async fn probe_media(path: String) -> AppResult<ProbeResult> {
    tauri::async_runtime::spawn_blocking(move || {
        let json = ffmpeg::probe_json(&path)?;
        Ok(parse_probe(&json))
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}

/// Extrae un fotograma y lo devuelve como data URL PNG en base64.
#[tauri::command]
pub async fn extract_thumbnail(path: String, timestamp: f64) -> AppResult<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let dir = tempfile::tempdir()?;
        let out = dir.path().join("thumb.jpg");
        ffmpeg::extract_frame(&path, timestamp, &out, 320)?;
        let bytes = std::fs::read(&out)?;
        Ok(format!("data:image/jpeg;base64,{}", STANDARD.encode(bytes)))
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}

/// Genera una tira de miniaturas para dibujar un clip en la línea de tiempo.
#[tauri::command]
pub async fn extract_filmstrip(path: String, count: u32, duration: f64) -> AppResult<Vec<String>> {
    tauri::async_runtime::spawn_blocking(move || {
        let dir = tempfile::tempdir()?;
        let mut frames = Vec::new();
        let step = if count > 0 { duration / count as f64 } else { duration };
        for i in 0..count {
            let out = dir.path().join(format!("f{i}.jpg"));
            if ffmpeg::extract_frame(&path, i as f64 * step, &out, 160).is_err() {
                continue;
            }
            let bytes = std::fs::read(&out)?;
            frames.push(format!("data:image/jpeg;base64,{}", STANDARD.encode(bytes)));
        }
        Ok(frames)
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}

/// Indica si FFmpeg/FFprobe están instalados.
#[tauri::command]
pub fn ffmpeg_available() -> bool {
    ffmpeg::is_available()
}

/// Lee un archivo multimedia y lo devuelve como base64 para crear un blob en el frontend.
#[tauri::command]
pub async fn read_media_file(path: String) -> AppResult<String> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = std::fs::read(&path)?;
        Ok(STANDARD.encode(bytes))
    })
    .await
    .map_err(|e| AppError::Other(e.to_string()))?
}
