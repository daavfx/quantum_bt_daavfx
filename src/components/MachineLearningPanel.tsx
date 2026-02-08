
import React, { useState } from 'react';
import { Brain, Cpu, Database, Play, BarChart, CheckCircle2 } from 'lucide-react';
import { MLConfig } from '../types';

const MachineLearningPanel: React.FC = () => {
    const [config, setConfig] = useState<MLConfig>({
        modelType: 'LSTM',
        features: ['RSI', 'MACD', 'Close'],
        epochs: 50,
        learningRate: 0.001,
        status: 'Idle',
        accuracy: 0
    });

    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);

    const toggleFeature = (feature: string) => {
        if (config.features.includes(feature)) {
            setConfig({ ...config, features: config.features.filter(f => f !== feature) });
        } else {
            setConfig({ ...config, features: [...config.features, feature] });
        }
    };

    const startTraining = () => {
        setConfig({ ...config, status: 'Training', accuracy: 0 });
        setLogs(['Initializing TensorFlow backend...', 'Normalizing dataset...', `Building ${config.modelType} architecture...`]);
        setProgress(0);

        let epoch = 0;
        const interval = setInterval(() => {
            epoch++;
            const currentProgress = (epoch / config.epochs) * 100;
            setProgress(currentProgress);
            
            // Log updates
            if (epoch % 10 === 0) {
                const loss = (Math.random() * 0.5).toFixed(4);
                const acc = (0.5 + (epoch/config.epochs) * 0.35).toFixed(4);
                setLogs(prev => [`Epoch ${epoch}/${config.epochs}: loss=${loss} - accuracy=${acc}`, ...prev]);
            }

            if (epoch >= config.epochs) {
                clearInterval(interval);
                setConfig({ ...config, status: 'Ready', accuracy: 0.85 + Math.random() * 0.1 });
                setLogs(prev => ['Model successfully trained and saved.', ...prev]);
            }
        }, 100);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Brain className="text-sky-500" />
                        AI Neural Lab
                    </h2>
                    <p className="text-sm text-zinc-500">Train Deep Learning models on historical price action.</p>
                </div>
                <div className="flex items-center gap-4">
                    {config.status === 'Ready' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={14} /> Model Ready ({ (config.accuracy * 100).toFixed(1) }%)
                        </div>
                    )}
                    <button 
                        onClick={startTraining}
                        disabled={config.status === 'Training'}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                            config.status === 'Training' 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : 'bg-blue-700 hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                        }`}
                    >
                        {config.status === 'Training' ? <Cpu className="animate-pulse" size={18} /> : <Play size={18} fill="currentColor" />}
                        {config.status === 'Training' ? 'Training Model...' : 'Train Model'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Configuration Column */}
                <div className="space-y-4">
                    {/* Model Architecture */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                            <Cpu size={14} /> Architecture
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Model Type</label>
                                <select 
                                    value={config.modelType}
                                    onChange={(e) => setConfig({ ...config, modelType: e.target.value as any })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none"
                                >
                                    <option value="LSTM">Long Short-Term Memory (LSTM)</option>
                                    <option value="Transformer">Transformer (Attention)</option>
                                    <option value="RandomForest">Random Forest Regressor</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Epochs</label>
                                    <input 
                                        type="number" 
                                        value={config.epochs} 
                                        onChange={(e) => setConfig({ ...config, epochs: Number(e.target.value) })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Learning Rate</label>
                                    <input 
                                        type="number" 
                                        value={config.learningRate} 
                                        step="0.001"
                                        onChange={(e) => setConfig({ ...config, learningRate: Number(e.target.value) })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Engineering */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex-1">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                            <Database size={14} /> Feature Selection
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['Open', 'High', 'Low', 'Close', 'Volume', 'RSI', 'MACD', 'EMA 20', 'EMA 50', 'ATR', 'Bollinger', 'Stoch'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => toggleFeature(f)}
                                    className={`px-3 py-2 rounded text-xs text-left transition-colors ${
                                        config.features.includes(f)
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Training Visualization (Placeholder for Graph) */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col relative overflow-hidden">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                        <BarChart size={14} /> Loss / Accuracy
                    </h3>
                    
                    {config.status === 'Idle' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                            <Brain size={48} className="mb-4 opacity-20" />
                            <p>Configure model and start training</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-end relative">
                             {/* Simple CSS Bar Graph Simulation */}
                             <div className="flex items-end gap-1 h-64 w-full">
                                {Array.from({ length: 40 }).map((_, i) => {
                                    const h = config.status === 'Ready' 
                                        ? 30 + Math.random() * 60 
                                        : (progress > (i*2.5) ? 10 + Math.random() * 50 : 5);
                                    return (
                                        <div 
                                            key={i} 
                                            className="flex-1 bg-blue-500/50 rounded-t-sm transition-all duration-500" 
                                            style={{ height: `${h}%`, opacity: (i/40) }}
                                        ></div>
                                    )
                                })}
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                {config.status === 'Training' && (
                                    <div className="text-4xl font-mono font-bold text-white/10">{Math.round(progress)}%</div>
                                )}
                             </div>
                        </div>
                    )}
                </div>

                {/* Console / Logs */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col font-mono text-xs">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">System Logs</h3>
                    <div className="flex-1 overflow-y-auto space-y-1 text-zinc-400">
                        {logs.length === 0 && <span className="text-zinc-600 italic">System ready.</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-zinc-800 pl-2 py-0.5">
                                <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log.includes('successfully') ? 'text-emerald-400' : ''}>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MachineLearningPanel;
