use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("FFmpeg no disponible o falló: {0}")]
    Ffmpeg(String),
    #[error("error de E/S: {0}")]
    Io(#[from] std::io::Error),
    #[error("error de base de datos: {0}")]
    Db(#[from] rusqlite::Error),
    #[error("JSON inválido: {0}")]
    Json(#[from] serde_json::Error),
    #[error("{0}")]
    Other(String),
}

impl Serialize for AppError {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
