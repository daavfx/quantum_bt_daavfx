use crate::backtest::{BacktestEngine, OHLCV, Trade, Position, BacktestResult, StrategyConfig, BacktestConfig, BacktestStats};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use log::{info, warn};

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub fn get_available_symbols() -> Vec<String> {
    vec![
        "EURUSD".to_string(),
        "GBPUSD".to_string(),
        "USDJPY".to_string(),
        "AUDUSD".to_string(),
        "USDCAD".to_string(),
        "EURJPY".to_string(),
        "GBPJPY".to_string(),
        "EURGBP".to_string(),
        "XAUUSD".to_string(),
        "BTCUSD".to_string(),
    ]
}

#[tauri::command]
pub fn get_available_timeframes() -> Vec<String> {
    vec![
        "M1".to_string(),
        "M5".to_string(),
        "M15".to_string(),
        "M30".to_string(),
        "H1".to_string(),
        "H4".to_string(),
        "D1".to_string(),
        "W1".to_string(),
        "MN1".to_string(),
    ]
}

#[tauri::command]
pub fn get_date_ranges() -> Vec<HashMap<String, String>> {
    vec![
        {
            let mut m = HashMap::new();
            m.insert("label".to_string(), "Last Month".to_string());
            m.insert("start".to_string(), "2025-01-10".to_string());
            m.insert("end".to_string(), "2025-02-10".to_string());
            m
        },
        {
            let mut m = HashMap::new();
            m.insert("label".to_string(), "Last 3 Months".to_string());
            m.insert("start".to_string(), "2024-11-10".to_string());
            m.insert("end".to_string(), "2025-02-10".to_string());
            m
        },
        {
            let mut m = HashMap::new();
            m.insert("label".to_string(), "Last Year".to_string());
            m.insert("start".to_string(), "2024-02-10".to_string());
            m.insert("end".to_string(), "2025-02-10".to_string());
            m
        },
        {
            let mut m = HashMap::new();
            m.insert("label".to_string(), "Last 2 Years".to_string());
            m.insert("start".to_string(), "2023-02-10".to_string());
            m.insert("end".to_string(), "2025-02-10".to_string());
            m
        },
    ]
}

#[derive(Serialize, Deserialize)]
pub struct BacktestResultResponse {
    pub success: bool,
    pub message: String,
    pub trades: Vec<TradeResponse>,
    pub equity_curve: Vec<EquityPointResponse>,
    pub stats: BacktestStatsResponse,
}

#[derive(Serialize, Deserialize)]
pub struct TradeResponse {
    pub id: String,
    pub time: i64,
    pub position: String,
    pub entry_price: f64,
    pub exit_price: f64,
    pub pnl: f64,
    pub pnl_percent: f64,
    pub status: String,
    pub color: String,
}

#[derive(Serialize, Deserialize)]
pub struct EquityPointResponse {
    pub time: i64,
    pub value: f64,
}

#[derive(Serialize, Deserialize)]
pub struct BacktestStatsResponse {
    pub total_trades: u32,
    pub net_profit: f64,
    pub profit_factor: f64,
    pub win_rate: f64,
    pub max_drawdown: f64,
    pub max_drawdown_percent: f64,
    pub sharpe_ratio: f64,
    pub gross_profit: f64,
    pub gross_loss: f64,
    pub expected_payoff: f64,
    pub absolute_drawdown: f64,
    pub short_positions: u32,
    pub short_won: u32,
    pub long_positions: u32,
    pub long_won: u32,
    pub profit_trades: u32,
    pub loss_trades: u32,
    pub largest_profit_trade: f64,
    pub largest_loss_trade: f64,
    pub average_profit_trade: f64,
    pub average_loss_trade: f64,
    pub max_consecutive_wins: u32,
    pub max_consecutive_losses: u32,
    pub modeling_quality: f64,
    pub ticks_modelled: u64,
}

#[derive(Serialize, Deserialize)]
pub struct OptimizationResultResponse {
    pub pass: u32,
    pub params: String,
    pub profit: f64,
    pub drawdown: f64,
    pub win_rate: f64,
    pub score: f64,
}

#[derive(Serialize, Deserialize)]
pub struct MonteCarloResultResponse {
    pub run: u32,
    pub final_equity: f64,
    pub max_drawdown: f64,
    pub profit: f64,
    pub trade_count: u32,
}

#[derive(Deserialize)]
pub struct BacktestRequest {
    pub strategy: StrategyConfigRequest,
    pub config: BacktestConfigRequest,
}

#[derive(Deserialize)]
pub struct StrategyConfigRequest {
    pub name: String,
    pub entry_conditions: Vec<ConditionRequest>,
    pub exit_conditions: Vec<ConditionRequest>,
    pub stop_loss_pips: f64,
    pub take_profit_pips: f64,
    pub lot_size: f64,
    pub risk_percent: f64,
}

#[derive(Deserialize)]
pub struct ConditionRequest {
    pub indicator: String,
    pub operator: String,
    pub value: f64,
    pub period: Option<u32>,
}

#[derive(Deserialize)]
pub struct BacktestConfigRequest {
    pub symbol: String,
    pub timeframe: String,
    pub start_date: i64,
    pub end_date: i64,
    pub initial_deposit: f64,
    pub leverage: f64,
    pub modeling: String,
}

#[tauri::command]
pub async fn run_backtest(
    request: BacktestRequest,
) -> Result<BacktestResultResponse, String> {
    info!("🚀 Starting backtest: {} on {}", request.strategy.name, request.config.symbol);

    let strategy = StrategyConfig {
        name: request.strategy.name,
        entry_conditions: request.strategy.entry_conditions.iter().map(|c| {
            crate::backtest::StrategyCondition {
                indicator: c.indicator.clone(),
                operator: c.operator.clone(),
                value: c.value,
                period: c.period,
            }
        }).collect(),
        exit_conditions: request.strategy.exit_conditions.iter().map(|c| {
            crate::backtest::StrategyCondition {
                indicator: c.indicator.clone(),
                operator: c.operator.clone(),
                value: c.value,
                period: c.period,
            }
        }).collect(),
        stop_loss_pips: request.strategy.stop_loss_pips,
        take_profit_pips: request.strategy.take_profit_pips,
        lot_size: request.strategy.lot_size,
        risk_percent: request.strategy.risk_percent,
    };

    let config = BacktestConfig {
        symbol: request.config.symbol,
        timeframe: request.config.timeframe,
        start_date: request.config.start_date,
        end_date: request.config.end_date,
        initial_deposit: request.config.initial_deposit,
        leverage: request.config.leverage,
        modeling_quality: request.config.modeling,
    };

    let data = generate_sample_data(&config.symbol, config.start_date, config.end_date);

    let engine = BacktestEngine::new();
    let result = engine.run_backtest(&data, &strategy, &config);

    info!("✅ Backtest complete: {} trades, {:.2}% win rate, ${:.2} net profit",
          result.stats.total_trades,
          result.stats.win_rate * 100.0,
          result.stats.net_profit);

    Ok(BacktestResultResponse {
        success: true,
        message: "Backtest completed successfully".to_string(),
        trades: result.trades.iter().map(|t| TradeResponse {
            id: t.id.clone(),
            time: t.time,
            position: match t.position {
                Position::Long => "LONG".to_string(),
                Position::Short => "SHORT".to_string(),
            },
            entry_price: t.entry_price,
            exit_price: t.exit_price,
            pnl: t.pnl,
            pnl_percent: t.pnl_percent,
            status: match t.status {
                crate::backtest::TradeStatus::Win => "WIN".to_string(),
                crate::backtest::TradeStatus::Loss => "LOSS".to_string(),
                crate::backtest::TradeStatus::BreakEven => "BE".to_string(),
            },
            color: if t.pnl >= 0.0 { "#22c55e".to_string() } else { "#ef4444".to_string() },
        }).collect(),
        equity_curve: result.equity_curve.iter().map(|e| EquityPointResponse {
            time: e.time,
            value: e.value,
        }).collect(),
        stats: BacktestStatsResponse {
            total_trades: result.stats.total_trades,
            net_profit: result.stats.net_profit,
            profit_factor: result.stats.profit_factor,
            win_rate: result.stats.win_rate,
            max_drawdown: result.stats.max_drawdown,
            max_drawdown_percent: result.stats.max_drawdown_percent,
            sharpe_ratio: result.stats.sharpe_ratio,
            gross_profit: result.stats.gross_profit,
            gross_loss: result.stats.gross_loss,
            expected_payoff: result.stats.expected_payoff,
            absolute_drawdown: result.stats.absolute_drawdown,
            short_positions: result.stats.short_positions,
            short_won: result.stats.short_won,
            long_positions: result.stats.long_positions,
            long_won: result.stats.long_won,
            profit_trades: result.stats.profit_trades,
            loss_trades: result.stats.loss_trades,
            largest_profit_trade: result.stats.largest_profit_trade,
            largest_loss_trade: result.stats.largest_loss_trade,
            average_profit_trade: result.stats.average_profit_trade,
            average_loss_trade: result.stats.average_loss_trade,
            max_consecutive_wins: result.stats.max_consecutive_wins,
            max_consecutive_losses: result.stats.max_consecutive_losses,
            modeling_quality: result.stats.modeling_quality,
            ticks_modelled: result.stats.ticks_modelled,
        },
    })
}

#[tauri::command]
pub async fn run_optimization(
    symbol: String,
    timeframe: String,
    param_name: String,
    param_min: f64,
    param_max: f64,
    param_step: f64,
) -> Result<Vec<OptimizationResultResponse>, String> {
    info!("⚡ Running optimization: {} {} {} {} {} {}",
          symbol, timeframe, param_name, param_min, param_max, param_step);

    let mut results = Vec::new();
    let mut current_value = param_min;

    while current_value <= param_max {
        let engine = BacktestEngine::new();
        let data = generate_sample_data(&symbol, 1704067200, 1735689600);

        let strategy = StrategyConfig {
            name: format!("Optimization {}", current_value),
            entry_conditions: vec![
                crate::backtest::StrategyCondition {
                    indicator: "RSI".to_string(),
                    operator: "<".to_string(),
                    value: current_value,
                    period: Some(14),
                }
            ],
            exit_conditions: vec![],
            stop_loss_pips: 50.0,
            take_profit_pips: 100.0,
            lot_size: 0.1,
            risk_percent: 2.0,
        };

        let config = BacktestConfig {
            symbol: symbol.clone(),
            timeframe: timeframe.clone(),
            start_date: 1704067200,
            end_date: 1735689600,
            initial_deposit: 10000.0,
            leverage: 100.0,
            modeling_quality: "Every Tick".to_string(),
        };

        let result = engine.run_backtest(&data, &strategy, &config);

        results.push(OptimizationResultResponse {
            pass: results.len() as u32 + 1,
            params: format!("{}: {:.1}", param_name, current_value),
            profit: result.stats.net_profit,
            drawdown: result.stats.max_drawdown_percent,
            win_rate: result.stats.win_rate,
            score: result.stats.net_profit - (result.stats.max_drawdown_percent * 100.0),
        });

        current_value += param_step;
    }

    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

    info!("✅ Optimization complete: {} passes tested", results.len());

    Ok(results
        .into_iter()
        .enumerate()
        .map(|(i, r)| OptimizationResultResponse {
            pass: (i + 1) as u32,
            params: r.params,
            profit: r.profit,
            drawdown: r.drawdown,
            win_rate: r.win_rate,
            score: r.score,
        })
        .collect())
}

#[tauri::command]
pub async fn run_equity_monte_carlo(
    trades: Vec<TradeResponse>,
    initial_deposit: f64,
    runs: u32,
) -> Result<Vec<MonteCarloResultResponse>, String> {
    info!("🎲 Running Monte Carlo simulation with {} trades, {} runs", trades.len(), runs);

    let mut results = Vec::new();

    for run in 1..=runs {
        let mut equity = initial_deposit;
        let mut max_equity = initial_deposit;
        let mut max_drawdown = 0.0;

        for trade in &trades {
            equity += trade.pnl;
            if equity > max_equity {
                max_equity = equity;
            }
            let dd = (max_equity - equity) / max_equity * 100.0;
            if dd > max_drawdown {
                max_drawdown = dd;
            }
        }

        results.push(MonteCarloResultResponse {
            run,
            final_equity: equity,
            max_drawdown,
            profit: equity - initial_deposit,
            trade_count: trades.len() as u32,
        });
    }

    info!("✅ Monte Carlo complete: {} simulations", results.len());

    Ok(results)
}

#[tauri::command]
pub async fn load_sample_data(
    symbol: String,
    start_date: i64,
    end_date: i64,
) -> Result<Vec<OHLCV>, String> {
    info!("📊 Loading sample data for {} from {} to {}", symbol, start_date, end_date);
    Ok(generate_sample_data(&symbol, start_date, end_date))
}

#[tauri::command]
pub async fn import_csv_data(file_path: String) -> Result<Vec<OHLCV>, String> {
    info!("📥 Importing CSV data from: {}", file_path);

    let mut data = Vec::new();
    let mut reader: Option<csv::Reader<std::fs::File>> = None;

    if let Ok(file) = std::fs::File::open(&file_path) {
        reader = Some(csv::Reader::from_reader(file));
    } else if let Ok(json_content) = std::fs::read_to_string(&file_path) {
        if let Ok(json_data) = serde_json::from_str::<Vec<serde_json::Value>>(&json_content) {
            for item in json_data {
                if let (Some(time), Some(open), Some(high), Some(low), Some(close)) = (
                    item.get("time").and_then(|v| v.as_i64()),
                    item.get("open").and_then(|v| v.as_f64()),
                    item.get("high").and_then(|v| v.as_f64()),
                    item.get("low").and_then(|v| v.as_f64()),
                    item.get("close").and_then(|v| v.as_f64()),
                ) {
                    data.push(OHLCV {
                        time,
                        open,
                        high,
                        low,
                        close,
                        volume: item.get("volume").and_then(|v| v.as_f64()).unwrap_or(0.0),
                    });
                }
            }
            info!("✅ Imported {} candles from JSON", data.len());
            return Ok(data);
        }
        return Err("Failed to parse JSON file".to_string());
    } else {
        return Err("Failed to open file".to_string());
    }

    if let Some(rdr) = reader {
        for result in rdr.into_records() {
            match result {
                Ok(record) => {
                    if let (Some(Ok(time)), Some(Ok(open)), Some(Ok(high)), Some(Ok(low)), Some(Ok(close))) = (
                        Some(record[0].parse::<i64>()),
                        Some(record[1].parse::<f64>()),
                        Some(record[2].parse::<f64>()),
                        Some(record[3].parse::<f64>()),
                        Some(record[4].parse::<f64>()),
                    ) {
                        data.push(OHLCV {
                            time,
                            open,
                            high,
                            low,
                            close,
                            volume: record.get(5).and_then(|v| v.parse::<f64>().ok()).unwrap_or(0.0),
                        });
                    }
                }
                Err(e) => warn!("Skipping row: {}", e),
            }
        }
    }

    info!("✅ Imported {} candles from CSV", data.len());
    Ok(data)
}

#[tauri::command]
pub async fn export_results(
    result: BacktestResultResponse,
    file_path: String,
) -> Result<(), String> {
    info!("💾 Exporting results to: {}", file_path);

    let json = serde_json::to_string_pretty(&result)
        .map_err(|e| format!("Failed to serialize results: {}", e))?;

    std::fs::write(&file_path, json)
        .map_err(|e| format!("Failed to write file: {}", e))?;

    info!("✅ Results exported successfully");
    Ok(())
}

fn generate_sample_data(symbol: &str, start_date: i64, end_date: i64) -> Vec<OHLCV> {
    let mut data = Vec::new();

    let base_price = match symbol {
        "EURUSD" => 1.0850,
        "GBPUSD" => 1.2650,
        "USDJPY" => 149.50,
        "AUDUSD" => 0.6520,
        "USDCAD" => 1.3580,
        "EURJPY" => 162.10,
        "GBPJPY" => 188.90,
        "EURGBP" => 0.8570,
        "XAUUSD" => 2030.00,
        "BTCUSD" => 43500.00,
        _ => 1.0000,
    };

    let volatility = match symbol {
        "XAUUSD" => 15.0,
        "BTCUSD" => 500.0,
        "USDJPY" => 1.5,
        "EURJPY" => 2.0,
        _ => 0.0020,
    };

    let mut current_price = base_price;
    let mut current_date = start_date;

    let timeframes_seconds: HashMap<&str, i64> = HashMap::from([
        ("M1", 60),
        ("M5", 300),
        ("M15", 900),
        ("M30", 1800),
        ("H1", 3600),
        ("H4", 14400),
        ("D1", 86400),
        ("W1", 604800),
        ("MN1", 2592000),
    ]);

    let tf_key = "H1";
    let step = timeframes_seconds.get(tf_key).copied().unwrap_or(3600);

    while current_date < end_date {
        let trend_factor = (current_date as f64 / 86400.0).sin() * volatility * 0.5;
        let noise = (rand::random::<f64>() - 0.5) * volatility;

        let open = current_price;
        let change = trend_factor + noise;
        let close = open + change;

        let high = open.max(close) + rand::random::<f64>() * volatility * 0.5;
        let low = open.min(close) - rand::random::<f64>() * volatility * 0.5;

        let volume = 1000.0 + rand::random::<f64>() * 5000.0;

        data.push(OHLCV {
            time: current_date,
            open,
            high,
            low,
            close,
            volume,
        });

        current_price = close;
        current_date += step;
    }

    info!("✅ Generated {} candles for {}", data.len(), symbol);

    data
}
