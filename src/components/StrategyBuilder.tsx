
import React from 'react';
import { Trash2, Plus, Zap, ArrowRight } from 'lucide-react';
import { StrategyConfig, StrategyCondition } from '../types';

interface StrategyBuilderProps {
    config: StrategyConfig;
    setConfig: (config: StrategyConfig) => void;
    onRun: () => void;
    isRunning: boolean;
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ config, setConfig, onRun, isRunning }) => {
    
    const addCondition = (type: 'entry' | 'exit') => {
        const newCondition: StrategyCondition = {
            id: Date.now().toString(),
            indicator: 'RSI',
            operator: '<',
            value: 30,
            param1: 14
        };
        
        if (type === 'entry') {
            setConfig({ ...config, entryConditions: [...config.entryConditions, newCondition] });
        } else {
            setConfig({ ...config, exitConditions: [...config.exitConditions, newCondition] });
        }
    };

    const removeCondition = (type: 'entry' | 'exit', id: string) => {
        if (type === 'entry') {
            setConfig({ ...config, entryConditions: config.entryConditions.filter(c => c.id !== id) });
        } else {
            setConfig({ ...config, exitConditions: config.exitConditions.filter(c => c.id !== id) });
        }
    };

    const updateCondition = (type: 'entry' | 'exit', id: string, field: keyof StrategyCondition, value: any) => {
        const list = type === 'entry' ? config.entryConditions : config.exitConditions;
        const updatedList = list.map(c => c.id === id ? { ...c, [field]: value } : c);
        
        if (type === 'entry') {
            setConfig({ ...config, entryConditions: updatedList });
        } else {
            setConfig({ ...config, exitConditions: updatedList });
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 border-r border-zinc-800 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                    <Zap size={20} className="text-sky-400" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quantum Engine</h2>
                    <p className="text-[10px] text-zinc-500">Logic Builder v1.0</p>
                </div>
            </div>

            {/* Entry Logic */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-400 uppercase">Entry Logic (Buy)</span>
                    <button onClick={() => addCondition('entry')} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                        <Plus size={14} />
                    </button>
                </div>
                <div className="space-y-2">
                    {config.entryConditions.map(c => (
                        <div key={c.id} className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-center gap-2 text-xs">
                            <select 
                                value={c.indicator}
                                onChange={(e) => updateCondition('entry', c.id, 'indicator', e.target.value)}
                                className="bg-transparent text-white font-medium focus:outline-none"
                            >
                                <option value="RSI">RSI</option>
                                <option value="EMA">EMA</option>
                                <option value="Price">Price</option>
                            </select>
                            
                            <select 
                                value={c.operator}
                                onChange={(e) => updateCondition('entry', c.id, 'operator', e.target.value)}
                                className="bg-zinc-900 rounded px-1 py-0.5 text-zinc-300 focus:outline-none"
                            >
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                                <option value="==">=</option>
                                <option value="CrossOver">Crosses Over</option>
                            </select>

                            <input 
                                type="number" 
                                value={c.value}
                                onChange={(e) => updateCondition('entry', c.id, 'value', Number(e.target.value))}
                                className="w-12 bg-zinc-900 rounded px-1 py-0.5 text-white focus:outline-none"
                            />
                            
                            <button onClick={() => removeCondition('entry', c.id)} className="ml-auto text-zinc-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {config.entryConditions.length === 0 && (
                        <div className="text-xs text-zinc-600 italic text-center py-2">No entry conditions</div>
                    )}
                </div>
            </div>

            <div className="w-full h-px bg-zinc-800 my-2"></div>

            {/* Exit Logic */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-red-400 uppercase">Risk Management</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Stop Loss (Pips)</label>
                        <input 
                            type="number" 
                            value={config.stopLossPips}
                            onChange={(e) => setConfig({ ...config, stopLossPips: Number(e.target.value) })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase block mb-1">Take Profit (Pips)</label>
                        <input 
                            type="number" 
                            value={config.takeProfitPips}
                            onChange={(e) => setConfig({ ...config, takeProfitPips: Number(e.target.value) })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <button 
                    onClick={onRun}
                    disabled={isRunning}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide transition-all ${
                        isRunning 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-blue-700 hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    }`}
                >
                    {isRunning ? (
                        <>Processing Quantum Chain...</>
                    ) : (
                        <>
                            <Zap size={16} fill="currentColor" />
                            Run Backtest
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StrategyBuilder;
