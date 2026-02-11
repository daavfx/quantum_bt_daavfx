
import React, { useState } from 'react';
import { Sliders, Play, Construction } from 'lucide-react';
import { OptimizationParam } from '../types';

const OptimizationPanel: React.FC = () => {
    const [params, setParams] = useState<OptimizationParam[]>([
        { id: '1', name: 'RSI Period', min: 7, max: 21, step: 1, current: 14, enabled: true },
        { id: '2', name: 'Stop Loss', min: 10, max: 50, step: 5, current: 20, enabled: true },
        { id: '3', name: 'Take Profit', min: 20, max: 100, step: 10, current: 40, enabled: true },
        { id: '4', name: 'MA Filter', min: 20, max: 200, step: 20, current: 50, enabled: false },
    ]);

    const toggleParam = (id: string) => {
        setParams(params.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
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
                    disabled
                    className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
                >
                    <Construction size={18} />
                    Coming Soon
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

                {/* Placeholder for Results */}
                <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500">
                    <Construction size={64} className="mb-4 text-zinc-600" />
                    <h3 className="text-lg font-semibold text-zinc-400 mb-2">Optimization Engine</h3>
                    <p className="text-sm text-center max-w-md">
                        The genetic algorithm optimization module is not yet implemented. 
                        This will allow you to test multiple parameter combinations to find the most robust settings.
                    </p>
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <p className="text-xs text-zinc-500">
                            Planned features:
                        </p>
                        <ul className="text-xs text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                            <li>Walk-forward optimization</li>
                            <li>Multi-parameter grid search</li>
                            <li>Fitness landscape visualization</li>
                            <li>Robustness testing</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptimizationPanel;
