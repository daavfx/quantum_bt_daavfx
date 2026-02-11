use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IndicatorType {
    RSI,
    EMA,
    SMA,
    MACD,
    BollingerBands,
    ATR,
    VWAP,
    Stochastic,
    WilliamsR,
    CCI,
    ROC,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Indicator {
    pub name: String,
    pub indicator_type: IndicatorType,
    pub values: Vec<f64>,
    pub timestamps: Vec<i64>,
    pub parameters: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BollingerBands {
    pub upper: Vec<f64>,
    pub middle: Vec<f64>,
    pub lower: Vec<f64>,
    pub timestamps: Vec<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MACD {
    pub macd_line: Vec<f64>,
    pub signal_line: Vec<f64>,
    pub histogram: Vec<f64>,
    pub timestamps: Vec<i64>,
}

pub fn calculate_indicator(
    indicator_type: &str,
    data: &[f64],
    timestamps: &[i64],
    params: HashMap<String, f64>,
) -> Option<Indicator> {
    let ind_type = match indicator_type {
        "RSI" => IndicatorType::RSI,
        "EMA" => IndicatorType::EMA,
        "SMA" => IndicatorType::SMA,
        "MACD" => IndicatorType::MACD,
        "Bollinger" => IndicatorType::BollingerBands,
        "ATR" => IndicatorType::ATR,
        "VWAP" => IndicatorType::VWAP,
        "Stochastic" => IndicatorType::Stochastic,
        "Williams" => IndicatorType::WilliamsR,
        "CCI" => IndicatorType::CCI,
        "ROC" => IndicatorType::ROC,
        _ => return None,
    };

    let values = match ind_type {
        IndicatorType::RSI => {
            calculate_rsi_series(data, params.get("period").copied().unwrap_or(14.0) as u32)
        }
        IndicatorType::EMA => {
            calculate_ema_series(data, params.get("period").copied().unwrap_or(21.0) as u32)
        }
        IndicatorType::SMA => {
            calculate_sma_series(data, params.get("period").copied().unwrap_or(20.0) as u32)
        }
        IndicatorType::MACD => {
            let fast = params.get("fast").copied().unwrap_or(12.0) as u32;
            let slow = params.get("slow").copied().unwrap_or(26.0) as u32;
            let signal = params.get("signal").copied().unwrap_or(9.0) as u32;
            return calculate_macd(data, timestamps, fast, slow, signal);
        }
        IndicatorType::BollingerBands => {
            let period = params.get("period").copied().unwrap_or(20.0) as u32;
            let std_dev = params.get("std_dev").copied().unwrap_or(2.0);
            return calculate_bollinger_bands(data, timestamps, period, std_dev);
        }
        IndicatorType::ATR => {
            let period = params.get("period").copied().unwrap_or(14.0) as u32;
            return calculate_atr(data, timestamps, period);
        }
        _ => data.to_vec(),
    };

    Some(Indicator {
        name: indicator_type.to_string(),
        indicator_type: ind_type,
        values,
        timestamps: timestamps.to_vec(),
        parameters: params,
    })
}

pub fn calculate_rsi_series(prices: &[f64], period: u32) -> Vec<f64> {
    let period = period as usize;
    if prices.len() < period + 1 {
        return vec![50.0; prices.len()];
    }

    let mut rsi_values = vec![50.0; period];

    let mut gains = vec![0.0; prices.len()];
    let mut losses = vec![0.0; prices.len()];

    for i in 1..prices.len() {
        let diff = prices[i] - prices[i - 1];
        if diff > 0.0 {
            gains[i] = diff;
        } else {
            losses[i] = diff.abs();
        }
    }

    let mut avg_gain = gains[1..=period].iter().sum::<f64>() / period as f64;
    let mut avg_loss = losses[1..=period].iter().sum::<f64>() / period as f64;

    for i in (period + 1)..prices.len() {
        avg_gain = (avg_gain * (period - 1) as f64 + gains[i]) / period as f64;
        avg_loss = (avg_loss * (period - 1) as f64 + losses[i]) / period as f64;

        let rs = if avg_loss > 0.0 {
            avg_gain / avg_loss
        } else {
            0.0
        };
        rsi_values.push(100.0 - (100.0 / (1.0 + rs)));
    }

    rsi_values
}

pub fn calculate_ema_series(prices: &[f64], period: u32) -> Vec<f64> {
    if prices.is_empty() {
        return vec![];
    }

    let period = period as usize;
    let multiplier = 2.0 / (period as f64 + 1.0);

    let mut ema_values = vec![0.0; prices.len()];

    if prices.len() < period {
        let sma: f64 = prices.iter().sum::<f64>() / prices.len() as f64;
        ema_values.iter_mut().for_each(|x| *x = sma);
        return ema_values;
    }

    let sma: f64 = prices[..period].iter().sum::<f64>() / period as f64;
    ema_values[period - 1] = sma;

    for i in period..prices.len() {
        ema_values[i] = (prices[i] - ema_values[i - 1]) * multiplier + ema_values[i - 1];
    }

    ema_values
}

pub fn calculate_sma_series(prices: &[f64], period: u32) -> Vec<f64> {
    let period = period as usize;
    if prices.is_empty() {
        return vec![];
    }

    let mut sma_values = vec![0.0; prices.len()];

    if prices.len() < period {
        for i in 0..prices.len() {
            let sum: f64 = prices[..=i].iter().sum();
            sma_values[i] = sum / (i + 1) as f64;
        }
        return sma_values;
    }

    for i in (period - 1)..prices.len() {
        let sum: f64 = prices[i - period + 1..=i].iter().sum();
        sma_values[i] = sum / period as f64;
    }

    sma_values
}

pub fn calculate_macd(
    prices: &[f64],
    timestamps: &[i64],
    fast: u32,
    slow: u32,
    signal: u32,
) -> Option<Indicator> {
    let fast_ema = calculate_ema_series(prices, fast);
    let slow_ema = calculate_ema_series(prices, slow);

    let macd_len = std::cmp::min(fast_ema.len(), slow_ema.len());
    let mut macd_line = vec![0.0; macd_len];

    for i in 0..macd_len {
        macd_line[i] = fast_ema[i] - slow_ema[i];
    }

    let signal_ema = calculate_ema_series(&macd_line, signal);

    let signal_start = signal_ema.len().saturating_sub(macd_len);
    let result_len = macd_len - signal_start;
    let mut result_macd = vec![0.0; result_len];
    let mut result_signal = vec![0.0; result_len];
    let mut result_hist = vec![0.0; result_len];
    let mut result_ts = vec![0; result_len];

    for i in 0..result_len {
        result_macd[i] = macd_line[signal_start + i];
        result_signal[i] = signal_ema[signal_start + i];
        result_hist[i] = result_macd[i] - result_signal[i];
        result_ts[i] = timestamps[signal_start + i];
    }

    Some(Indicator {
        name: "MACD".to_string(),
        indicator_type: IndicatorType::MACD,
        values: result_hist,
        timestamps: result_ts,
        parameters: HashMap::from([
            ("fast".to_string(), fast as f64),
            ("slow".to_string(), slow as f64),
            ("signal".to_string(), signal as f64),
        ]),
    })
}

pub fn calculate_bollinger_bands(
    prices: &[f64],
    timestamps: &[i64],
    period: u32,
    std_dev: f64,
) -> Option<Indicator> {
    let sma = calculate_sma_series(prices, period);

    let mut upper = vec![0.0; prices.len()];
    let mut middle = vec![0.0; prices.len()];
    let mut lower = vec![0.0; prices.len()];
    let mut ts = vec![0; prices.len()];

    let prices_len = prices.len();
    let period_usize = period as usize;

    for i in (period_usize - 1)..prices_len {
        let slice = &prices[i - period_usize + 1..=i];
        let mean = sma[i];
        let variance: f64 = slice.iter().map(|x| (x - mean).powi(2)).sum::<f64>() / period as f64;
        let std = variance.sqrt();

        upper[i] = mean + std_dev * std;
        middle[i] = mean;
        lower[i] = mean - std_dev * std;
        ts[i] = timestamps[i];
    }

    let all_values: Vec<f64> = upper
        .iter()
        .chain(middle.iter())
        .chain(lower.iter())
        .copied()
        .collect();

    Some(Indicator {
        name: "Bollinger Bands".to_string(),
        indicator_type: IndicatorType::BollingerBands,
        values: all_values,
        timestamps: ts,
        parameters: HashMap::from([
            ("period".to_string(), period as f64),
            ("std_dev".to_string(), std_dev),
        ]),
    })
}

pub fn calculate_atr(highs: &[f64], timestamps: &[i64], period: u32) -> Option<Indicator> {
    if highs.len() < 2 {
        return None;
    }

    let mut tr_values = vec![0.0; highs.len()];

    for i in 1..highs.len() {
        tr_values[i] = highs[i] - highs[i - 1];
    }

    let atr = calculate_ema_series(&tr_values, period);

    Some(Indicator {
        name: "ATR".to_string(),
        indicator_type: IndicatorType::ATR,
        values: atr,
        timestamps: timestamps.to_vec(),
        parameters: HashMap::from([("period".to_string(), period as f64)]),
    })
}
