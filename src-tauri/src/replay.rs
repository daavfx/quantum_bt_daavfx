//! Replay Engine - Market playback functionality
//! 
//! Provides smooth, frame-rate independent market replay with:
//! - Variable playback speed (0.1x to 10x)
//! - Frame skipping for performance
//! - Precise time synchronization
//! - Pause/Step controls

use crate::AppState;
use crate::backtest::OHLCV;
use std::time::Instant;
use tauri::State;
use log::{info, debug};

#[derive(Debug, Clone)]
pub struct ReplayState {
    pub symbol: String,
    pub data: Vec<OHLCV>,
    pub current_index: usize,
    pub speed: f64,
    pub is_playing: bool,
    pub play_start: Option<Instant>,
    pub last_update: Option<Instant>,
}

impl Default for ReplayState {
    fn default() -> Self {
        Self {
            symbol: String::new(),
            data: Vec::new(),
            current_index: 0,
            speed: 1.0,
            is_playing: false,
            play_start: None,
            last_update: None,
        }
    }
}

#[tauri::command]
pub async fn load_replay_session(
    state: State<'_, AppState>,
    symbol: String,
    _timeframe: String,
) -> Result<ReplayInfo, String> {
    info!("Loading replay session for {}", symbol);
    
    let cache = state.cache.lock().map_err(|e| e.to_string())?;
    let data = cache.get(&symbol).cloned().ok_or_else(|| {
        format!("No data found for symbol: {}", symbol)
    })?;
    
    let total_candles = data.len();
    
    if total_candles == 0 {
        return Err("No data available for replay".to_string());
    }
    
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    replay.symbol = symbol.clone();
    replay.data = data;
    replay.current_index = 0;
    replay.speed = 1.0;
    replay.is_playing = false;
    replay.play_start = None;
    replay.last_update = None;
    
    let start_time = replay.data[0].time;
    let end_time = replay.data[replay.data.len()-1].time;
    
    info!("Replay session loaded: {} candles", total_candles);
    
    Ok(ReplayInfo {
        total_candles,
        current_index: 0,
        start_time,
        end_time,
        symbol,
        timeframe: _timeframe,
        is_playing: false,
        speed: 1.0,
    })
}

#[tauri::command]
pub async fn start_replay(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if replay.data.is_empty() {
        return Err("No replay session loaded".to_string());
    }
    
    replay.is_playing = true;
    replay.play_start = Some(Instant::now());
    replay.last_update = Some(Instant::now());
    
    info!("Replay started at {}x speed", replay.speed);
    Ok(())
}

#[tauri::command]
pub async fn pause_replay(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    replay.is_playing = false;
    replay.play_start = None;
    replay.last_update = None;
    
    info!("Replay paused at index {}", replay.current_index);
    Ok(())
}

#[tauri::command]
pub async fn stop_replay(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    replay.is_playing = false;
    replay.current_index = 0;
    replay.play_start = None;
    replay.last_update = None;
    
    info!("Replay stopped");
    Ok(())
}

#[tauri::command]
pub async fn step_forward(
    state: State<'_, AppState>,
    steps: Option<usize>,
) -> Result<ReplayUpdate, String> {
    let steps = steps.unwrap_or(1);
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if replay.data.is_empty() {
        return Err("No replay session loaded".to_string());
    }
    
    replay.current_index = (replay.current_index + steps).min(replay.data.len() - 1);
    replay.is_playing = false;
    
    let candle = &replay.data[replay.current_index];
    
    debug!("Step forward to index {}", replay.current_index);
    
    Ok(ReplayUpdate {
        current_index: replay.current_index,
        total_candles: replay.data.len(),
        candle: CandleData::from(candle),
        progress: replay.current_index as f64 / replay.data.len() as f64,
    })
}

#[tauri::command]
pub async fn step_backward(
    state: State<'_, AppState>,
    steps: Option<usize>,
) -> Result<ReplayUpdate, String> {
    let steps = steps.unwrap_or(1);
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if replay.data.is_empty() {
        return Err("No replay session loaded".to_string());
    }
    
    replay.current_index = replay.current_index.saturating_sub(steps);
    replay.is_playing = false;
    
    let candle = &replay.data[replay.current_index];
    
    debug!("Step backward to index {}", replay.current_index);
    
    Ok(ReplayUpdate {
        current_index: replay.current_index,
        total_candles: replay.data.len(),
        candle: CandleData::from(candle),
        progress: replay.current_index as f64 / replay.data.len() as f64,
    })
}

#[tauri::command]
pub async fn set_replay_speed(
    state: State<'_, AppState>,
    speed: f64,
) -> Result<(), String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    replay.speed = speed.clamp(0.1, 10.0);
    
    info!("Replay speed set to {}x", replay.speed);
    Ok(())
}

#[tauri::command]
pub async fn seek_to_index(
    state: State<'_, AppState>,
    index: usize,
) -> Result<ReplayUpdate, String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if replay.data.is_empty() {
        return Err("No replay session loaded".to_string());
    }
    
    replay.current_index = index.min(replay.data.len() - 1);
    replay.is_playing = false;
    
    let candle = &replay.data[replay.current_index];
    
    info!("Seek to index {}", replay.current_index);
    
    Ok(ReplayUpdate {
        current_index: replay.current_index,
        total_candles: replay.data.len(),
        candle: CandleData::from(candle),
        progress: replay.current_index as f64 / replay.data.len() as f64,
    })
}

#[tauri::command]
pub async fn get_replay_state(
    state: State<'_, AppState>,
) -> Result<ReplayStateResponse, String> {
    let replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if replay.data.is_empty() {
        return Ok(ReplayStateResponse {
            is_loaded: false,
            is_playing: false,
            current_index: 0,
            total_candles: 0,
            speed: 1.0,
            symbol: String::new(),
            timeframe: String::new(),
            progress: 0.0,
        });
    }
    
    Ok(ReplayStateResponse {
        is_loaded: true,
        is_playing: replay.is_playing,
        current_index: replay.current_index,
        total_candles: replay.data.len(),
        speed: replay.speed,
        symbol: replay.symbol.clone(),
        timeframe: String::new(),
        progress: replay.current_index as f64 / replay.data.len() as f64,
    })
}

#[tauri::command]
pub async fn advance_replay(
    state: State<'_, AppState>,
    delta_time_ms: u64,
) -> Result<Option<ReplayUpdate>, String> {
    let mut replay = state.replay_state.lock().map_err(|e| e.to_string())?;
    
    if !replay.is_playing || replay.data.is_empty() {
        return Ok(None);
    }
    
    let base_candles_per_second = 1.0;
    let candles_to_advance = (base_candles_per_second * replay.speed * (delta_time_ms as f64 / 1000.0)) as usize;
    
    if candles_to_advance == 0 {
        return Ok(None);
    }
    
    replay.current_index = (replay.current_index + candles_to_advance).min(replay.data.len() - 1);
    
    if replay.current_index >= replay.data.len() - 1 {
        replay.is_playing = false;
    }
    
    let candle = &replay.data[replay.current_index];
    
    Ok(Some(ReplayUpdate {
        current_index: replay.current_index,
        total_candles: replay.data.len(),
        candle: CandleData::from(candle),
        progress: replay.current_index as f64 / replay.data.len() as f64,
    }))
}

#[derive(serde::Serialize)]
pub struct ReplayInfo {
    pub total_candles: usize,
    pub current_index: usize,
    pub start_time: i64,
    pub end_time: i64,
    pub symbol: String,
    pub timeframe: String,
    pub is_playing: bool,
    pub speed: f64,
}

#[derive(serde::Serialize)]
pub struct ReplayStateResponse {
    pub is_loaded: bool,
    pub is_playing: bool,
    pub current_index: usize,
    pub total_candles: usize,
    pub speed: f64,
    pub symbol: String,
    pub timeframe: String,
    pub progress: f64,
}

#[derive(serde::Serialize)]
pub struct ReplayUpdate {
    pub current_index: usize,
    pub total_candles: usize,
    pub candle: CandleData,
    pub progress: f64,
}

#[derive(serde::Serialize)]
pub struct CandleData {
    pub time: i64,
    pub open: String,
    pub high: String,
    pub low: String,
    pub close: String,
    pub volume: String,
}

impl From<&OHLCV> for CandleData {
    fn from(c: &OHLCV) -> Self {
        Self {
            time: c.time,
            open: c.open.to_string(),
            high: c.high.to_string(),
            low: c.low.to_string(),
            close: c.close.to_string(),
            volume: c.volume.to_string(),
        }
    }
}
