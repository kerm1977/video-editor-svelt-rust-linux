use crate::error::{AppError, AppResult};
use std::path::Path;
use std::process::{Command, Output};

pub const FFMPEG: &str = "ffmpeg";
pub const FFPROBE: &str = "ffprobe";

/// Ejecuta un binario y devuelve su salida estándar, o un error legible.
pub fn run(bin: &str, args: &[String]) -> AppResult<Output> {
    let output = Command::new(bin)
        .args(args)
        .output()
        .map_err(|e| AppError::Ffmpeg(format!("no se pudo ejecutar {bin}: {e}")))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(AppError::Ffmpeg(stderr.lines().last().unwrap_or("").to_string()));
    }
    Ok(output)
}

/// Comprueba que FFmpeg y FFprobe estén instalados en el sistema.
pub fn is_available() -> bool {
    [FFMPEG, FFPROBE].iter().all(|bin| {
        Command::new(bin)
            .arg("-version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    })
}

/// Consulta metadatos en formato JSON mediante ffprobe.
pub fn probe_json(path: &str) -> AppResult<serde_json::Value> {
    if !Path::new(path).exists() {
        return Err(AppError::Other(format!("archivo inexistente: {path}")));
    }
    let args = vec![
        "-v".into(),
        "error".into(),
        "-print_format".into(),
        "json".into(),
        "-show_format".into(),
        "-show_streams".into(),
        path.to_string(),
    ];
    let out = run(FFPROBE, &args)?;
    Ok(serde_json::from_slice(&out.stdout)?)
}

/// Extrae un fotograma a `output` en el instante indicado.
pub fn extract_frame(path: &str, timestamp: f64, output: &Path, width: u32) -> AppResult<()> {
    let args = vec![
        "-y".into(),
        "-ss".into(),
        format!("{timestamp}"),
        "-i".into(),
        path.to_string(),
        "-frames:v".into(),
        "1".into(),
        "-vf".into(),
        format!("scale={width}:-1"),
        output.to_string_lossy().to_string(),
    ];
    run(FFMPEG, &args).map(|_| ())
}

/// Concatena segmentos descritos en un archivo de lista con `-f concat`.
pub fn concat_segments(list_file: &Path, output: &str, fps: u32) -> AppResult<()> {
    let args = vec![
        "-y".into(),
        "-f".into(),
        "concat".into(),
        "-safe".into(),
        "0".into(),
        "-i".into(),
        list_file.to_string_lossy().to_string(),
        "-r".into(),
        fps.to_string(),
        "-c:v".into(),
        "libx264".into(),
        "-preset".into(),
        "medium".into(),
        "-crf".into(),
        "20".into(),
        "-c:a".into(),
        "aac".into(),
        output.to_string(),
    ];
    run(FFMPEG, &args).map(|_| ())
}

/// Recorta un clip de origen a un archivo intermedio.
pub fn trim_clip(input: &str, start: f64, duration: f64, output: &Path) -> AppResult<()> {
    let args = vec![
        "-y".into(),
        "-ss".into(),
        format!("{start}"),
        "-t".into(),
        format!("{duration}"),
        "-i".into(),
        input.to_string(),
        "-c".into(),
        "copy".into(),
        output.to_string_lossy().to_string(),
    ];
    run(FFMPEG, &args).map(|_| ())
}
