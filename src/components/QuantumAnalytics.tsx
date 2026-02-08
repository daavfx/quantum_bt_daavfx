
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { BacktestResult } from '../types';
import { TrendingUp, Activity, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';

interface QuantumAnalyticsProps {
    results: BacktestResult;
}

const QuantumAnalytics: React.FC<QuantumAnalyticsProps> = ({ results }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { 
                background: { type: ColorType.Solid, color: 'transparent' }, 
                textColor: '#71717a',
                fontFamily: "'Inter', sans-serif",
            },
            grid: { 
                vertLines: { visible: false }, 
                horzLines: { color: '#1f1f23' } 
            },
            width: chartContainerRef.current.clientWidth,
            height: 250,
            rightPriceScale: { borderColor: '#27272a' },
            timeScale: { borderColor: '#27272a', timeVisible: true },
        });

        const areaSeries = chart.addAreaSeries({
            topColor: 'rgba(59, 130, 246, 0.4)', // Corporate Blue
            bottomColor: 'rgba(59, 130, 246, 0.05)',
            lineColor: '#3b82f6',
            lineWidth: 2,
        });

        areaSeries.setData(results.equityCurve);

        const resizeObserver = new ResizeObserver(() => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [results]);

    const TableRow = ({ label, val1, val2, label2, isHeader = false }: any) => (
        <div className={`grid grid-cols-4 py-2 border-b border-zinc-800/50 ${isHeader ? 'text-zinc-500 font-semibold' : 'text-zinc-300 hover:bg-zinc-800/20'}`}>
            <div className="col-span-1 pl-4 text-xs flex items-center">{label}</div>
            <div className="col-span-1 text-right text-sm font-mono pr-4">{val1}</div>
            {label2 ? (
                <>
                    <div className="col-span-1 pl-4 text-xs flex items-center">{label2}</div>
                    <div className="col-span-1 text-right text-sm font-mono pr-4">{val2}</div>
                </>
            ) : (
                <div className="col-span-2"></div>
            )}
        </div>
    );

    const StatValue = ({ val, colorClass }: { val: string | number, colorClass?: string }) => (
        <span className={colorClass || 'text-zinc-200'}>{val}</span>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-950/50 overflow-y-auto animate-fadeIn">
            
            {/* Header / Summary Bar */}
            <div className="flex flex-col border-b border-zinc-800 bg-zinc-900/50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-blue-500" />
                            Backtest Report
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-zinc-500">Ticks modelled: <span className="text-zinc-300">{results.ticksModelled.toLocaleString()}</span></span>
                            <span className="text-xs text-zinc-500">Errors: <span className="text-zinc-300">0</span></span>
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="flex justify-between text-[10px] uppercase text-zinc-500 mb-1">
                            <span>Modelling Quality</span>
                            <span className="text-emerald-500">{results.modellingQuality}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-600 w-[10%] inline-block"></div>
                            <div className="h-full bg-emerald-500 w-[90%] inline-block"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Main Stats Table - Mimicking MT5 Layout */}
                <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
                    
                    <TableRow 
                        label="Initial Deposit" 
                        val1={<StatValue val={results.initialDeposit.toFixed(2)} />}
                        label2="Spread"
                        val2={<StatValue val="10" />}
                    />
                    
                    <TableRow 
                        label="Total Net Profit" 
                        val1={<StatValue val={results.netProfit.toFixed(2)} colorClass={results.netProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'} />}
                        label2="Gross Profit"
                        val2={<StatValue val={results.grossProfit.toFixed(2)} />}
                    />

                    <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Gross Loss</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4 text-red-400">{results.grossLoss.toFixed(2)}</div>
                         <div className="col-span-1 pl-4 text-xs flex items-center">Expected Payoff</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">{results.expectedPayoff.toFixed(2)}</div>
                    </div>

                    <TableRow 
                        label="Profit Factor" 
                        val1={<StatValue val={results.profitFactor.toFixed(2)} />}
                        label2="Sharpe Ratio"
                        val2={<StatValue val={results.sharpeRatio.toFixed(2)} />}
                    />

                     <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Absolute Drawdown</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">{results.absoluteDrawdown.toFixed(2)}</div>
                         <div className="col-span-1 pl-4 text-xs flex items-center">Maximal Drawdown</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.maxDrawdown.toFixed(2)} <span className="text-zinc-500 text-xs">({results.maxDrawdownPercent}%)</span>
                         </div>
                    </div>

                    <div className="h-2 bg-zinc-900/50 border-b border-zinc-800/50"></div>

                    <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Total Trades</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">{results.totalTrades}</div>
                         <div className="col-span-2"></div>
                    </div>

                    <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Short Positions (won %)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.shortPositions} <span className="text-zinc-500 text-xs">({((results.shortWon/results.shortPositions)*100).toFixed(2)}%)</span>
                         </div>
                         <div className="col-span-1 pl-4 text-xs flex items-center">Long Positions (won %)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.longPositions} <span className="text-zinc-500 text-xs">({((results.longWon/results.longPositions)*100).toFixed(2)}%)</span>
                         </div>
                    </div>

                    <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Profit Trades (% of total)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.profitTrades} <span className="text-zinc-500 text-xs">({((results.profitTrades/results.totalTrades)*100).toFixed(2)}%)</span>
                         </div>
                         <div className="col-span-1 pl-4 text-xs flex items-center">Loss Trades (% of total)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.lossTrades} <span className="text-zinc-500 text-xs">({((results.lossTrades/results.totalTrades)*100).toFixed(2)}%)</span>
                         </div>
                    </div>

                    <div className="h-2 bg-zinc-900/50 border-b border-zinc-800/50"></div>

                    <TableRow 
                        label="Largest Profit Trade" 
                        val1={<StatValue val={results.largestProfitTrade.toFixed(2)} colorClass="text-emerald-400" />}
                        label2="Largest Loss Trade"
                        val2={<StatValue val={results.largestLossTrade.toFixed(2)} colorClass="text-red-400" />}
                    />

                    <TableRow 
                        label="Average Profit Trade" 
                        val1={<StatValue val={results.averageProfitTrade.toFixed(2)} />}
                        label2="Average Loss Trade"
                        val2={<StatValue val={results.averageLossTrade.toFixed(2)} />}
                    />

                    <div className="h-2 bg-zinc-900/50 border-b border-zinc-800/50"></div>

                    <div className="grid grid-cols-4 py-2 border-b border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/20">
                         <div className="col-span-1 pl-4 text-xs flex items-center">Max Consecutive Wins ($)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.maxConsecutiveWins} <span className="text-zinc-500 text-xs">({results.maxConsecutiveWinsValue.toFixed(2)})</span>
                         </div>
                         <div className="col-span-1 pl-4 text-xs flex items-center">Max Consecutive Losses ($)</div>
                         <div className="col-span-1 text-right text-sm font-mono pr-4">
                             {results.maxConsecutiveLosses} <span className="text-zinc-500 text-xs">({results.maxConsecutiveLossesValue.toFixed(2)})</span>
                         </div>
                    </div>

                </div>

                {/* Equity Graph */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs font-semibold text-zinc-500 uppercase mb-4 pl-2">Balance/Equity Graph</div>
                    <div ref={chartContainerRef} className="w-full" />
                </div>
            </div>
        </div>
    );
};

export default QuantumAnalytics;
