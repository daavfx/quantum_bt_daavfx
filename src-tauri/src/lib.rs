#![cfg_attr(mobile, tauri::mobile_entry_point)]

use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use log::{info, warn, error};

pub mod backtest;
pub mod indicators;
pub mod commands;
pub mod replay;

pub use backtest::{BacktestEngine, OHLCV, Trade, Position, BacktestResult, EquityPoint};
pub use indicators::{Indicator, IndicatorType, calculate_indicator};
pub use replay::ReplayState;

#[derive(Debug, Clone)]
pub struct AppState {
    pub engine: Arc<Mutex<BacktestEngine>>,
    pub cache: Arc<Mutex<HashMap<String, Vec<OHLCV>>>>,
    pub replay_state: Arc<Mutex<replay::ReplayState>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            engine: Arc::new(Mutex::new(BacktestEngine::new())),
            cache: Arc::new(Mutex::new(HashMap::new())),
            replay_state: Arc::new(Mutex::new(replay::ReplayState::default())),
        }
    }
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_version,
            commands::get_available_symbols,
            commands::get_available_timeframes,
            commands::get_date_ranges,
            commands::run_backtest,
            commands::run_optimization,
            commands::run_equity_monte_carlo,
            commands::load_sample_data,
            commands::import_csv_data,
            commands::export_results,
            replay::load_replay_session,
            replay::start_replay,
            replay::pause_replay,
            replay::stop_replay,
            replay::step_forward,
            replay::step_backward,
            replay::set_replay_speed,
            replay::seek_to_index,
            replay::get_replay_state,
            replay::advance_replay,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
