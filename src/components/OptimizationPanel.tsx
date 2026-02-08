
import React, { useState } from 'react';
import { Sliders, Play, RotateCw, TrendingUp, Grid, List, Activity } from 'lucide-react';
import { OptimizationParam, OptimizationResult } from '../types';

const OptimizationPanel: React.FC = () => {
    const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
    const [params, setParams] = useState<OptimizationParam[]>([
        { id: '1', name: 'RSI Period', min: 7, max: 21, step: 1, current: 14, enabled: true },
        { id: '2', name: 'Stop Loss', min: 10, max: 50, step: 5, current: 20, enabled: true },
        { id: '3', name: 'Take Profit', min: 20, max: 100, step: 10, current: 40, enabled: true },
        { id: '4', name: 'MA Filter', min: 20, max: 200, step: 20, current: 50, enabled: false },
    ]);

    const [results, setResults] = useState<OptimizationResult[]>([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [progress, setProgress] = useState(0);

    const toggleParam = (id: string) => {
        setParams(params.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    };

    const runOptimization = () => {
        setIsOptimizing(true);
        setResults([]);
        setProgress(0);

        // Simulate Genetic Algorithm process
        let step = 0;
        const totalSteps = 20;
        const interval = setInterval(() => {
            step++;
            setProgress((step / totalSteps) * 100);

            // Generate mock result
            const profit = Math.floor(Math.random() * 5000) - 1000;
            const dd = Math.floor(Math.random() * 15);
            const score = (profit / (dd + 1)).toFixed(2);

            const newResult: OptimizationResult = {
                pass: step,
                params: `RSI=${7 + Math.floor(Math.random()*14)}, SL=${10 + Math.floor(Math.random()*40)}`,
                profit: profit,
                drawdown: dd,
                score: Number(score)
            };

            setResults(prev => [newResult, ...prev].sort((a, b) => b.score - a.score));

            if (step >= totalSteps) {
                clearInterval(interval);
                setIsOptimizing(false);
            }
        }, 150);
    };

    // Generate Mock Heatmap Data (2D array)
    // 10x10 grid simulation
    const renderHeatmap = () => {
        const gridSize = 12;
        const cells = [];
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Simulate fitness landscape
                // Higher values in the center
                const cx = 6, cy = 6;
                const dist = Math.sqrt(Math.pow(i - cx, 2) + Math.pow(j - cy, 2));
                const intensity = Math.max(0.1, 1 - (dist / 8));
                const noise = (Math.random() - 0.5) * 0.2;
                const value = Math.max(0, intensity + noise);
                
                // Color mapping: Green (High), Yellow (Med), Red (Low)
                let color;
                if (value > 0.7) color = `rgba(34, 197, 94, ${value})`; // Green
                else if (value > 0.4) color = `rgba(234, 179, 8, ${value})`; // Yellow
                else color = `rgba(239, 68, 68, ${value + 0.2})`; // Red

                cells.push(
                    <div 
                        key={`${i}-${j}`} 
                        className="rounded-sm hover:scale-110 transition-transform duration-200 cursor-pointer relative group border border-black/20"
                        style={{ backgroundColor: color }}
                    >
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-900 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-50">
                             Profit: ${(value * 5000).toFixed(0)}<br/>
                             Param A: {i * 2 + 10}<br/>
                             Param B: {j * 5 + 20}
                         </div>
                    </div>
                );
            }
        }
        return cells;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/30 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders className="text-blue-500" />
                        Genetic Optimization
                    </h2>
                    <p className="text-sm text-zinc-500">Find robust parameters using evolutionary algorithms.</p>
                </div>
                <button 
                    onClick={runOptimization}
                    disabled={isOptimizing}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        isOptimizing 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    }`}
                >
                    {isOptimizing ? <RotateCw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                    {isOptimizing ? 'Optimizing...' : 'Start Optimization'}
                </button>
            </div>

            <div className="flex gap-6 h-full min-h-0">
                {/* Parameters Settings */}
                <div className="w-1/3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-4">Parameter Configuration</h3>
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {params.map(p => (
                            <div key={p.id} className={`p-3 border rounded-lg transition-colors ${p.enabled ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-900/30 border-zinc-800 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={p.enabled} 
                                            onChange={() => toggleParam(p.id)}
                                            className="rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-0"
                                        />
                                        <span className="text-sm font-medium text-white">{p.name}</span>
                                    </div>
                                    <span className="text-xs mono text-zinc-400">Current: {p.current}</span>
                                </div>
                                {p.enabled && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] text-zinc-500 block">Start</label>
                                            <input type="number" value={p.min} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white" readOnly />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 block">Step</label>
                                            <input type="number" value={p.step} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white" readOnly />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-zinc-500 block">Stop</label>
                                            <input type="number" value={p.max} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white" readOnly />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results Panel */}
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase">Optimization Results</h3>
                            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5">
                                <button 
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    title="Table View"
                                >
                                    <List size={14} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('graph')}
                                    className={`p-1.5 rounded transition-colors ${viewMode === 'graph' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    title="Graph View"
                                >
                                    <Grid size={14} />
                                </button>
                            </div>
                        </div>
                        {isOptimizing && (
                            <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-hidden relative">
                        {viewMode === 'table' ? (
                            <div className="absolute inset-0 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-zinc-900/80 text-zinc-500 uppercase font-medium sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3">Pass</th>
                                            <th className="px-4 py-3">Parameters</th>
                                            <th className="px-4 py-3 text-right">Profit</th>
                                            <th className="px-4 py-3 text-right">Drawdown</th>
                                            <th className="px-4 py-3 text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {results.length === 0 && !isOptimizing && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 italic">
                                                    Start optimization to see results...
                                                </td>
                                            </tr>
                                        )}
                                        {results.map((r, i) => (
                                            <tr key={i} className={`hover:bg-zinc-800/30 transition-colors ${i === 0 ? 'bg-emerald-500/5' : ''}`}>
                                                <td className="px-4 py-2 font-mono text-zinc-500">#{r.pass}</td>
                                                <td className="px-4 py-2 text-zinc-300">{r.params}</td>
                                                <td className={`px-4 py-2 text-right font-mono font-medium ${r.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    ${r.profit.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-red-300">{r.drawdown}%</td>
                                                <td className="px-4 py-2 text-right font-bold text-blue-400">{r.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col p-6">
                                {/* Graph View Simulation */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xs text-zinc-400">
                                        X: <span className="text-white">RSI Period (7-21)</span>
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        Y: <span className="text-white">Stop Loss (10-50)</span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-1 bg-zinc-900/50 p-1 border border-zinc-800 rounded-lg">
                                    {renderHeatmap()}
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-zinc-500 uppercase font-medium">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/80 rounded-sm"></div> Low Profit</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500/80 rounded-sm"></div> Med Profit</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500/80 rounded-sm"></div> High Profit</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptimizationPanel;
