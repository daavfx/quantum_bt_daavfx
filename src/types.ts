
export interface OHLCData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface VolumeData {
    time: number;
    value: number;
    color: string;
}

export interface VaultItem {
    id: number;
    title: string;
    category: 'drawing' | 'replay' | 'idea' | 'lesson';
    asset: string;
    timeframe: string;
    tags: string[];
    notes: string;
    createdAt: string;
    thumbnail: null | string;
    drawingsCount: number;
    color: string;
}

export type ToolType = 
    | 'crosshair' | 'pointer' | 'trendline' | 'hline' | 'vline' 
    | 'ray' | 'extended' | 'fibretracement' | 'fibextension' 
    | 'pitchfork' | 'rectangle' | 'circle' | 'triangle' 
    | 'channel' | 'xabcd' | 'headshoulders' | 'elliott' 
    | 'text' | 'note' | 'callout' | 'arrow' | 'pricelabel' 
    | 'pricerange' | 'daterange' | 'longposition' | 'shortposition' 
    | 'magnet' | 'lock' | 'visibility' | 'delete';

export interface TradeEntry {
    id: string;
    pair: string;
    type: 'LONG' | 'SHORT';
    time: string;
    entry: number;
    exit: number;
    lots: number;
    pnl: number;
    r: number;
    status: 'WIN' | 'LOSS' | 'BE';
    setup: string;
}

export interface JournalDay {
    date: string;
    trades: TradeEntry[];
    note: string;
    mood: 'disciplined' | 'neutral' | 'tilted' | 'fearful' | 'greedy';
}

export type ChartType = 'Candle' | 'Bar' | 'Line' | 'Area';

export interface SessionStats {
    balance: number;
    startBalance: number;
    winRate: number;
    tradesCount: number;
    wins: number;
    losses: number;
    pnl: number;
}

// --- QUANTUM BACKTESTER TYPES ---

export interface StrategyCondition {
    id: string;
    indicator: 'RSI' | 'EMA' | 'Price' | 'Volume' | 'MACD' | 'Bollinger';
    operator: '>' | '<' | '==' | 'CrossOver' | 'CrossUnder';
    value: number | 'EMA' | 'Price' | 'RSI'; 
    param1?: number; // e.g. Period
}

export interface StrategyConfig {
    name: string;
    entryConditions: StrategyCondition[];
    exitConditions: StrategyCondition[];
    stopLossPips: number;
    takeProfitPips: number;
}

export interface BacktestResult {
    // Core
    totalTrades: number;
    netProfit: number;
    profitFactor: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    equityCurve: { time: number; value: number }[];
    trades: TradeEntry[];
    
    // Detailed MT5 Stats
    initialDeposit: number;
    grossProfit: number;
    grossLoss: number;
    expectedPayoff: number;
    absoluteDrawdown: number;
    relativeDrawdown: number;
    relativeDrawdownPercent: number;
    
    shortPositions: number;
    shortWon: number;
    longPositions: number;
    longWon: number;
    
    profitTrades: number;
    lossTrades: number;
    
    largestProfitTrade: number;
    largestLossTrade: number;
    averageProfitTrade: number;
    averageLossTrade: number;
    
    maxConsecutiveWins: number;
    maxConsecutiveWinsValue: number;
    maxConsecutiveLosses: number;
    maxConsecutiveLossesValue: number;
    
    ticksModelled: number;
    modellingQuality: number;
}

export interface OptimizationParam {
    id: string;
    name: string;
    min: number;
    max: number;
    step: number;
    current: number;
    enabled: boolean;
}

export interface OptimizationResult {
    pass: number;
    params: string;
    profit: number;
    drawdown: number;
    score: number;
}

export interface MLConfig {
    modelType: 'LSTM' | 'RandomForest' | 'Transformer';
    features: string[]; // e.g., ['RSI', 'MACD', 'Close']
    epochs: number;
    learningRate: number;
    status: 'Idle' | 'Training' | 'Ready';
    accuracy: number;
}

export interface BacktestSettings {
    algoFile: string;
    algoLanguage: 'Rust' | 'Python' | 'C++' | 'JSON';
    symbol: string; // "EURUSD" or "Multi-Pair"
    timeframe: string;
    dateRange: 'Last Month' | 'Last Year' | 'Custom';
    startDate?: string;
    endDate?: string;
    forwardMode: 'No' | '1/2' | '1/3' | '1/4' | 'Custom';
    modeling: 'Every Tick' | 'OHLC (Fast)' | 'Open Prices Only';
    latency: 'Zero' | 'Random (1-10ms)' | 'Network (50-200ms)';
    optimization: 'Disabled' | 'Slow Complete' | 'Fast Genetic'; // NEW
    deposit: number;
    leverage: number;
    visualMode: boolean;
    visualSpeed: number; // 1 to 100
}
