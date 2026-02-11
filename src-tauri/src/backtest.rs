use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Position {
    Long,
    Short,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OHLCV {
    pub time: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub id: String,
    pub time: i64,
    pub position: Position,
    pub entry_price: f64,
    pub exit_price: f64,
    pub entry_time: i64,
    pub exit_time: i64,
    pub pnl: f64,
    pub pnl_percent: f64,
    pub sl: Option<f64>,
    pub tp: Option<f64>,
    pub status: TradeStatus,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TradeStatus {
    Win,
    Loss,
    BreakEven,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquityPoint {
    pub time: i64,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestStats {
    pub total_trades: u32,
    pub win_rate: f64,
    pub profit_factor: f64,
    pub net_profit: f64,
    pub gross_profit: f64,
    pub gross_loss: f64,
    pub max_drawdown: f64,
    pub max_drawdown_percent: f64,
    pub sharpe_ratio: f64,
    pub expected_payoff: f64,
    pub absolute_drawdown: f64,
    pub relative_drawdown: f64,
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestResult {
    pub trades: Vec<Trade>,
    pub equity_curve: Vec<EquityPoint>,
    pub stats: BacktestStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyCondition {
    pub indicator: String,
    pub operator: String,
    pub value: f64,
    pub period: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyConfig {
    pub name: String,
    pub entry_conditions: Vec<StrategyCondition>,
    pub exit_conditions: Vec<StrategyCondition>,
    pub stop_loss_pips: f64,
    pub take_profit_pips: f64,
    pub lot_size: f64,
    pub risk_percent: f64,
}

impl Default for StrategyConfig {
    fn default() -> Self {
        Self {
            name: "Default Strategy".to_string(),
            entry_conditions: vec![],
            exit_conditions: vec![],
            stop_loss_pips: 50.0,
            take_profit_pips: 100.0,
            lot_size: 0.1,
            risk_percent: 2.0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacktestConfig {
    pub symbol: String,
    pub timeframe: String,
    pub start_date: i64,
    pub end_date: i64,
    pub initial_deposit: f64,
    pub leverage: f64,
    pub modeling_quality: String,
}

impl Default for BacktestConfig {
    fn default() -> Self {
        Self {
            symbol: "EURUSD".to_string(),
            timeframe: "H1".to_string(),
            start_date: 1704067200,
            end_date: 1735689600,
            initial_deposit: 10000.0,
            leverage: 100.0,
            modeling_quality: "Every Tick".to_string(),
        }
    }
}

#[derive(Debug)]
pub struct BacktestEngine {
    pub data_cache: HashMap<String, Vec<OHLCV>>,
}

impl BacktestEngine {
    pub fn new() -> Self {
        Self {
            data_cache: HashMap::new(),
        }
    }

    pub fn add_data(&mut self, symbol: &str, data: Vec<OHLCV>) {
        self.data_cache.insert(symbol.to_string(), data);
    }

    pub fn get_data(&self, symbol: &str) -> Option<&Vec<OHLCV>> {
        self.data_cache.get(symbol)
    }

    pub fn run_backtest(
        &self,
        data: &[OHLCV],
        strategy: &StrategyConfig,
        config: &BacktestConfig,
    ) -> BacktestResult {
        if data.is_empty() {
            return self.empty_result(config.initial_deposit);
        }

        let pips_to_price = 0.0001;
        let mut equity = config.initial_deposit;
        let mut max_equity = config.initial_deposit;
        let mut max_drawdown = 0.0;
        let mut max_drawdown_percent = 0.0;
        let mut trades: Vec<Trade> = vec![];
        let mut equity_curve: Vec<EquityPoint> = vec![];

        let mut position: Option<Position> = None;
        let mut entry_price = 0.0;
        let mut entry_time = 0;
        let mut entry_idx = 0;
        let mut sl_price = 0.0;
        let mut tp_price = 0.0;

        let mut wins = 0;
        let mut losses = 0;
        let mut gross_profit = 0.0;
        let mut gross_loss = 0.0;
        let mut consecutive_wins = 0;
        let mut consecutive_losses = 0;
        let mut max_consecutive_wins = 0;
        let mut max_consecutive_losses = 0;
        let mut short_positions = 0;
        let mut short_won = 0;
        let mut long_positions = 0;
        let mut long_won = 0;

        let mut largest_profit = 0.0;
        let mut largest_loss = 0.0;

        let price_data: Vec<f64> = data.iter().map(|c| c.close).collect();
        let time_data: Vec<i64> = data.iter().map(|c| c.time).collect();

        for (i, candle) in data.iter().enumerate() {
            equity_curve.push(EquityPoint {
                time: candle.time,
                value: equity,
            });

            if equity > max_equity {
                max_equity = equity;
            }

            let drawdown = max_equity - equity;
            let drawdown_percent = if max_equity > 0.0 {
                (drawdown / max_equity) * 100.0
            } else {
                0.0
            };

            if drawdown > max_drawdown {
                max_drawdown = drawdown;
            }
            if drawdown_percent > max_drawdown_percent {
                max_drawdown_percent = drawdown_percent;
            }

            match position {
                Some(pos) => {
                    let current_price = candle.close;
                    let pnl_pips = match pos {
                        Position::Long => (current_price - entry_price) / pips_to_price,
                        Position::Short => (entry_price - current_price) / pips_to_price,
                    };
                    let pnl_value = pnl_pips * config.leverage * strategy.lot_size * 10.0;
                    let pnl_percent = (pnl_value / equity) * 100.0;

                    let mut closed = false;
                    let mut trade_status = TradeStatus::BreakEven;

                    if sl_price > 0.0 {
                        match pos {
                            Position::Long if current_price <= sl_price => {
                                closed = true;
                                trade_status = TradeStatus::Loss;
                            }
                            Position::Short if current_price >= sl_price => {
                                closed = true;
                                trade_status = TradeStatus::Loss;
                            }
                            _ => {}
                        }
                    }

                    if !closed && tp_price > 0.0 {
                        match pos {
                            Position::Long if current_price >= tp_price => {
                                closed = true;
                                trade_status = TradeStatus::Win;
                            }
                            Position::Short if current_price <= tp_price => {
                                closed = true;
                                trade_status = TradeStatus::Win;
                            }
                            _ => {}
                        }
                    }

                    if closed {
                        equity += pnl_value;

                        let trade = Trade {
                            id: format!("trade_{}", trades.len() + 1),
                            time: candle.time,
                            position: pos,
                            entry_price,
                            exit_price: current_price,
                            entry_time,
                            exit_time: candle.time,
                            pnl: pnl_value,
                            pnl_percent,
                            sl: Some(sl_price),
                            tp: Some(tp_price),
                            status: trade_status,
                        };

                        trades.push(trade);

                        match pos {
                            Position::Short => {
                                short_positions += 1;
                                if trade_status == TradeStatus::Win {
                                    short_won += 1;
                                    wins += 1;
                                    gross_profit += pnl_value;
                                    consecutive_wins += 1;
                                    consecutive_losses = 0;
                                } else {
                                    losses += 1;
                                    gross_loss += pnl_value.abs();
                                    consecutive_losses += 1;
                                    consecutive_wins = 0;
                                }
                            }
                            Position::Long => {
                                long_positions += 1;
                                if trade_status == TradeStatus::Win {
                                    long_won += 1;
                                    wins += 1;
                                    gross_profit += pnl_value;
                                    consecutive_wins += 1;
                                    consecutive_losses = 0;
                                } else {
                                    losses += 1;
                                    gross_loss += pnl_value.abs();
                                    consecutive_losses += 1;
                                    consecutive_wins = 0;
                                }
                            }
                        }

                        if pnl_value > largest_profit {
                            largest_profit = pnl_value;
                        }
                        if pnl_value < largest_loss {
                            largest_loss = pnl_value;
                        }

                        if consecutive_wins > max_consecutive_wins {
                            max_consecutive_wins = consecutive_wins;
                        }
                        if consecutive_losses > max_consecutive_losses {
                            max_consecutive_losses = consecutive_losses;
                        }

                        position = None;
                    }
                }
                None => {
                    let should_enter = self.evaluate_entry_conditions(
                        &price_data[..=i],
                        &time_data[..=i],
                        strategy,
                        candle,
                    );

                    if should_enter {
                        position = Some(Position::Long);
                        entry_price = candle.close;
                        entry_time = candle.time;
                        entry_idx = i;

                        sl_price = candle.close - (strategy.stop_loss_pips * pips_to_price);
                        tp_price = candle.close + (strategy.take_profit_pips * pips_to_price);
                    }
                }
            }

            if trades.len() >= 10000 {
                break;
            }
        }

        let total_trades = trades.len() as u32;
        let win_rate = if total_trades > 0 {
            wins as f64 / total_trades as f64
        } else {
            0.0
        };
        let profit_factor = if gross_loss > 0.0 {
            gross_profit / gross_loss
        } else {
            if gross_profit > 0.0 {
                f64::MAX
            } else {
                0.0
            }
        };
        let net_profit = gross_profit - gross_loss;
        let expected_payoff = if total_trades > 0 {
            net_profit / total_trades as f64
        } else {
            0.0
        };
        let absolute_drawdown = config.initial_deposit - max_equity;

        let returns: Vec<f64> = trades
            .iter()
            .map(|t| t.pnl / config.initial_deposit * 100.0)
            .collect();
        let avg_return = if !returns.is_empty() {
            returns.iter().sum::<f64>() / returns.len() as f64
        } else {
            0.0
        };
        let variance = if returns.len() > 1 {
            returns
                .iter()
                .map(|r| (r - avg_return).powi(2))
                .sum::<f64>()
                / returns.len() as f64
        } else {
            0.0
        };
        let std_dev = variance.sqrt();
        let sharpe_ratio = if std_dev > 0.0 {
            (avg_return / std_dev) * (252.0_f64.sqrt())
        } else {
            0.0
        };

        let modeling_quality = match config.modeling_quality.as_str() {
            "Every Tick" => 99.0,
            "OHLC (Fast)" => 90.0,
            "Open Prices Only" => 75.0,
            _ => 90.0,
        };

        let ticks_modelled = data.len() as u64 * 10;

        BacktestResult {
            trades,
            equity_curve,
            stats: BacktestStats {
                total_trades,
                win_rate,
                profit_factor,
                net_profit,
                gross_profit,
                gross_loss,
                max_drawdown,
                max_drawdown_percent,
                sharpe_ratio,
                expected_payoff,
                absolute_drawdown,
                relative_drawdown: max_drawdown_percent,
                short_positions,
                short_won,
                long_positions,
                long_won,
                profit_trades: wins,
                loss_trades: losses,
                largest_profit_trade: largest_profit,
                largest_loss_trade: largest_loss,
                average_profit_trade: if wins > 0 {
                    gross_profit / wins as f64
                } else {
                    0.0
                },
                average_loss_trade: if losses > 0 {
                    gross_loss / losses as f64
                } else {
                    0.0
                },
                max_consecutive_wins,
                max_consecutive_losses,
                modeling_quality,
                ticks_modelled,
            },
        }
    }

    fn evaluate_entry_conditions(
        &self,
        prices: &[f64],
        times: &[i64],
        strategy: &StrategyConfig,
        candle: &OHLCV,
    ) -> bool {
        if strategy.entry_conditions.is_empty() {
            return true;
        }

        for condition in &strategy.entry_conditions {
            let indicator_value = match condition.indicator.as_str() {
                "RSI" => self.calculate_rsi(prices, condition.period.unwrap_or(14)),
                "EMA" => self.calculate_ema(prices, condition.period.unwrap_or(21)),
                "SMA" => self.calculate_sma(prices, condition.period.unwrap_or(20)),
                "Price" => candle.close,
                _ => candle.close,
            };

            let threshold = condition.value;

            match condition.operator.as_str() {
                ">" if indicator_value <= threshold => return false,
                "<" if indicator_value >= threshold => return false,
                "==" if (indicator_value - threshold).abs() > 0.001 => return false,
                _ => {}
            }
        }

        true
    }

    fn calculate_rsi(&self, prices: &[f64], period: u32) -> f64 {
        if prices.len() < period as usize + 1 {
            return 50.0;
        }

        let period = period as usize;
        let mut gains = 0.0;
        let mut losses = 0.0;

        for i in (prices.len() - period)..prices.len() {
            let diff = prices[i] - prices[i - 1];
            if diff > 0.0 {
                gains += diff;
            } else {
                losses += diff.abs();
            }
        }

        let avg_gain = gains / period as f64;
        let avg_loss = losses / period as f64;

        if avg_loss == 0.0 {
            return 100.0;
        }

        let rs = avg_gain / avg_loss;
        100.0 - (100.0 / (1.0 + rs))
    }

    fn calculate_ema(&self, prices: &[f64], period: u32) -> f64 {
        if prices.is_empty() {
            return 0.0;
        }

        let period = period as usize;
        let multiplier = 2.0 / (period as f64 + 1.0);

        if prices.len() < period {
            return prices.iter().sum::<f64>() / prices.len() as f64;
        }

        let mut ema = prices[..period].iter().sum::<f64>() / period as f64;

        for i in period..prices.len() {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        ema
    }

    fn calculate_sma(&self, prices: &[f64], period: u32) -> f64 {
        let period = period as usize;
        if prices.len() < period {
            return prices.iter().sum::<f64>() / prices.len() as f64;
        }

        prices[prices.len() - period..].iter().sum::<f64>() / period as f64
    }

    fn empty_result(&self, initial_deposit: f64) -> BacktestResult {
        BacktestResult {
            trades: vec![],
            equity_curve: vec![EquityPoint {
                time: 0,
                value: initial_deposit,
            }],
            stats: BacktestStats {
                total_trades: 0,
                win_rate: 0.0,
                profit_factor: 0.0,
                net_profit: 0.0,
                gross_profit: 0.0,
                gross_loss: 0.0,
                max_drawdown: 0.0,
                max_drawdown_percent: 0.0,
                sharpe_ratio: 0.0,
                expected_payoff: 0.0,
                absolute_drawdown: 0.0,
                relative_drawdown: 0.0,
                short_positions: 0,
                short_won: 0,
                long_positions: 0,
                long_won: 0,
                profit_trades: 0,
                loss_trades: 0,
                largest_profit_trade: 0.0,
                largest_loss_trade: 0.0,
                average_profit_trade: 0.0,
                average_loss_trade: 0.0,
                max_consecutive_wins: 0,
                max_consecutive_losses: 0,
                modeling_quality: 90.0,
                ticks_modelled: 0,
            },
        }
    }
}
