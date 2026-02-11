import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

export interface BacktestRequest {
    strategy: StrategyConfigRequest;
    config: BacktestConfigRequest;
}

export interface StrategyConfigRequest {
    name: string;
    entry_conditions: ConditionRequest[];
    exit_conditions: ConditionRequest[];
    stop_loss_pips: number;
    take_profit_pips: number;
    lot_size: number;
    risk_percent: number;
}

export interface ConditionRequest {
    indicator: string;
    operator: string;
    value: number;
    period?: number;
}

export interface BacktestConfigRequest {
    symbol: string;
    timeframe: string;
    start_date: number;
    end_date: number;
    initial_deposit: number;
    leverage: number;
    modeling: string;
}

export interface BacktestResultResponse {
    success: boolean;
    message: string;
    trades: TradeResponse[];
    equity_curve: EquityPointResponse[];
    stats: BacktestStatsResponse;
}

export interface TradeResponse {
    id: string;
    time: number;
    position: string;
    entry_price: number;
    exit_price: number;
    pnl: number;
    pnl_percent: number;
    status: string;
    color: string;
}

export interface EquityPointResponse {
    time: number;
    value: number;
}

export interface BacktestStatsResponse {
    total_trades: number;
    net_profit: number;
    profit_factor: number;
    win_rate: number;
    max_drawdown: number;
    max_drawdown_percent: number;
    sharpe_ratio: number;
    gross_profit: number;
    gross_loss: number;
    expected_payoff: number;
    absolute_drawdown: number;
    short_positions: number;
    short_won: number;
    long_positions: number;
    long_won: number;
    profit_trades: number;
    loss_trades: number;
    largest_profit_trade: number;
    largest_loss_trade: number;
    average_profit_trade: number;
    average_loss_trade: number;
    max_consecutive_wins: number;
    max_consecutive_losses: number;
    modeling_quality: number;
    ticks_modelled: number;
}

export interface JobProgressEvent {
    jobId: string;
    progress: number;
    message: string;
}

export interface JobCompleteEvent {
    jobId: string;
    result: BacktestResultResponse;
}

export interface JobErrorEvent {
    jobId: string;
    error: string;
}

let progressListeners: Array<(e: JobProgressEvent) => void> = [];
let completeListeners: Array<(e: JobCompleteEvent) => void> = [];
let errorListeners: Array<(e: JobErrorEvent) => void> = [];
let unlistenProgress: UnlistenFn | null = null;
let unlistenComplete: UnlistenFn | null = null;
let unlistenError: UnlistenFn | null = null;

async function setupListeners() {
    if (unlistenProgress) return;

    unlistenProgress = await listen<JobProgressEvent>('quantum://job/progress', (event) => {
        progressListeners.forEach(cb => cb(event.payload));
    });

    unlistenComplete = await listen<JobCompleteEvent>('quantum://job/complete', (event) => {
        completeListeners.forEach(cb => cb(event.payload));
    });

    unlistenError = await listen<JobErrorEvent>('quantum://job/error', (event) => {
        errorListeners.forEach(cb => cb(event.payload));
    });
}

export async function onJobProgress(callback: (e: JobProgressEvent) => void): Promise<UnlistenFn> {
    await setupListeners();
    progressListeners.push(callback);
    return () => {
        progressListeners = progressListeners.filter(cb => cb !== callback);
    };
}

export async function onJobComplete(callback: (e: JobCompleteEvent) => void): Promise<UnlistenFn> {
    await setupListeners();
    completeListeners.push(callback);
    return () => {
        completeListeners = completeListeners.filter(cb => cb !== callback);
    };
}

export async function onJobError(callback: (e: JobErrorEvent) => void): Promise<UnlistenFn> {
    await setupListeners();
    errorListeners.push(callback);
    return () => {
        errorListeners = errorListeners.filter(cb => cb !== callback);
    };
}

function generateJobId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

export async function startBacktest(request: BacktestRequest): Promise<{ jobId: string }> {
    const jobId = generateJobId();

    const formattedRequest = {
        strategy: {
            name: request.strategy.name,
            entry_conditions: request.strategy.entry_conditions.map(c => ({
                indicator: c.indicator,
                operator: c.operator,
                value: c.value,
                period: c.period || 14,
            })),
            exit_conditions: request.strategy.exit_conditions.map(c => ({
                indicator: c.indicator,
                operator: c.operator,
                value: c.value,
                period: c.period || 14,
            })),
            stop_loss_pips: request.strategy.stop_loss_pips,
            take_profit_pips: request.strategy.take_profit_pips,
            lot_size: request.strategy.lot_size,
            risk_percent: request.strategy.risk_percent,
        },
        config: {
            symbol: request.config.symbol,
            timeframe: request.config.timeframe,
            start_date: request.config.start_date,
            end_date: request.config.end_date,
            initial_deposit: request.config.initial_deposit,
            leverage: request.config.leverage,
            modeling: request.config.modeling,
        },
    };

    try {
        const result = await invoke<BacktestResultResponse>('run_backtest', { request: formattedRequest });

        setTimeout(() => {
            completeListeners.forEach(cb => cb({ jobId, result }));
        }, 100);

        return { jobId };
    } catch (error) {
        throw new Error(String(error));
    }
}

export async function runOptimization(
    symbol: string,
    timeframe: string,
    paramName: string,
    paramMin: number,
    paramMax: number,
    paramStep: number
): Promise<any[]> {
    try {
        return await invoke('run_optimization', {
            symbol,
            timeframe,
            paramName,
            paramMin,
            paramMax,
            paramStep,
        });
    } catch (error) {
        console.error('Optimization failed:', error);
        return [];
    }
}

export async function runMonteCarlo(
    trades: TradeResponse[],
    initialDeposit: number,
    runs: number
): Promise<any[]> {
    try {
        return await invoke('run_equity_monte_carlo', {
            trades,
            initial_deposit: initialDeposit,
            runs,
        });
    } catch (error) {
        console.error('Monte Carlo failed:', error);
        return [];
    }
}

export async function loadSampleData(
    symbol: string,
    startDate: number,
    endDate: number
): Promise<any[]> {
    try {
        return await invoke('load_sample_data', {
            symbol,
            start_date: startDate,
            end_date: endDate,
        });
    } catch (error) {
        console.error('Failed to load sample data:', error);
        return [];
    }
}

export async function getAvailableSymbols(): Promise<string[]> {
    try {
        return await invoke('get_available_symbols');
    } catch {
        return [];
    }
}

export async function getAvailableTimeframes(): Promise<string[]> {
    try {
        return await invoke('get_available_timeframes');
    } catch {
        return [];
    }
}

export async function getAppVersion(): Promise<string> {
    try {
        return await invoke('get_app_version');
    } catch {
        return '0.1.0';
    }
}
