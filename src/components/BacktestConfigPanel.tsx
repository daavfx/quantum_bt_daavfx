
import React, { useState } from 'react';
import { 
    Settings, FileCode, Play, Monitor, Layers, Calendar, 
    Database, Activity, Zap, HardDrive, Cpu, CheckCircle,
    Network, Server, Wifi, Sliders
} from 'lucide-react';
import { BacktestSettings } from '../types';

interface BacktestConfigPanelProps {
    onRun: (settings: BacktestSettings) => void;
    isRunning: boolean;
}

const BacktestConfigPanel: React.FC<BacktestConfigPanelProps> = ({ onRun, isRunning }) => {
    const [settings, setSettings] = useState<BacktestSettings>({
        algoFile: 'Quantum_RSI_Strategy_v4.rs',
        algoLanguage: 'Rust',
        symbol: 'EURUSD',
        timeframe: 'M15',
        dateRange: 'Custom',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        forwardMode: 'No',
        modeling: 'Every Tick',
        latency: 'Zero',
        optimization: 'Disabled',
        deposit: 10000,
        leverage: 100,
        visualMode: false,
        visualSpeed: 100
    });

    const handleRun = () => {
        onRun(settings);
    };

    const FileIcon = ({ lang }: { lang: string }) => {
        switch(lang) {
            case 'Rust': return <div className="text-orange-500 font-bold text-[10px]">RS</div>;
            case 'Python': return <div className="text-blue-400 font-bold text-[10px]">PY</div>;
            case 'C++': return <div className="text-blue-600 font-bold text-[10px]">CPP</div>;
            default: return <div className="text-zinc-400 font-bold text-[10px]">{lang}</div>;
        }
    };

    const AgentNode = ({ name, type, usage, status }: any) => (
        <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded mb-1">
            <div className="flex items-center gap-2">
                {type === 'local' ? <Cpu size={14} className="text-zinc-500" /> : <Server size={14} className="text-blue-500" />}
                <span className="text-xs text-zinc-300">{name}</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${status === 'Busy' ? 'bg-emerald-500' : 'bg-zinc-600'}`} style={{ width: `${usage}%` }}></div>
                </div>
                <span className={`text-[10px] w-8 text-right ${status === 'Busy' ? 'text-emerald-400' : 'text-zinc-500'}`}>{status}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-zinc-900/30 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings className="text-blue-500" />
                        Strategy Tester Configuration
                    </h2>
                    <p className="text-sm text-zinc-500">Configure simulation environment, load algorithms, and set execution parameters.</p>
                </div>
                
                {/* Visual Mode Toggle (Big Switch) */}
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
                    <div className="text-right">
                        <div className="text-xs font-semibold text-white">Visual Mode</div>
                        <div className="text-[10px] text-zinc-500">{settings.visualMode ? 'Chart Replay' : 'Headless (Fast)'}</div>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, visualMode: !settings.visualMode})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.visualMode ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.visualMode ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* SECTION 1: EXPERT ADVISOR */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <Cpu size={14} /> Expert Advisor (Algo)
                    </h3>
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 hover:border-zinc-700 transition-colors">
                        <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block">Strategy File</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-10 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center px-3 gap-3">
                                    <FileCode size={16} className="text-zinc-500" />
                                    <span className="text-sm text-white font-mono">{settings.algoFile}</span>
                                    <div className="ml-auto px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
                                        <FileIcon lang={settings.algoLanguage} />
                                    </div>
                                </div>
                                <button className="h-10 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium text-white transition-colors">
                                    Load
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Optimization</label>
                                <select 
                                    value={settings.optimization}
                                    onChange={(e) => setSettings({...settings, optimization: e.target.value as any})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Disabled">Disabled</option>
                                    <option value="Fast Genetic">Fast Genetic Algorithm</option>
                                    <option value="Slow Complete">Slow Complete Algorithm</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Language Runtime</label>
                                <select 
                                    value={settings.algoLanguage}
                                    onChange={(e) => setSettings({...settings, algoLanguage: e.target.value as any})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Rust">Rust (Native Speed)</option>
                                    <option value="Python">Python (PyO3 Bridge)</option>
                                    <option value="C++">C++ (WASM)</option>
                                    <option value="JSON">No-Code (JSON)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: MARKET DATA */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <Database size={14} /> Market & Data
                    </h3>
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 hover:border-zinc-700 transition-colors">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Symbol / Universe</label>
                                <div className="relative">
                                    <select 
                                        value={settings.symbol}
                                        onChange={(e) => setSettings({...settings, symbol: e.target.value})}
                                        className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500 appearance-none"
                                    >
                                        <option value="EURUSD">EURUSD</option>
                                        <option value="GBPUSD">GBPUSD</option>
                                        <option value="XAUUSD">XAUUSD (Gold)</option>
                                        <option value="Multi-Pair">Multi-Pair Portfolio</option>
                                    </select>
                                    <Layers size={14} className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Timeframe</label>
                                <select 
                                    value={settings.timeframe}
                                    onChange={(e) => setSettings({...settings, timeframe: e.target.value})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="M1">M1 (1 Minute)</option>
                                    <option value="M5">M5 (5 Minutes)</option>
                                    <option value="M15">M15 (15 Minutes)</option>
                                    <option value="H1">H1 (1 Hour)</option>
                                    <option value="H4">H4 (4 Hours)</option>
                                    <option value="D1">D1 (Daily)</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs text-zinc-400 mb-1.5 block">Period</label>
                                <select 
                                    value={settings.dateRange}
                                    onChange={(e) => setSettings({...settings, dateRange: e.target.value as any})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Last Month">Last Month</option>
                                    <option value="Last Year">Last Year</option>
                                    <option value="Custom">Custom Range</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-zinc-400 mb-1.5 block">Start Date</label>
                                <div className="relative">
                                    <input 
                                        type="date"
                                        value={settings.startDate}
                                        onChange={(e) => setSettings({...settings, startDate: e.target.value})}
                                        className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white px-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-zinc-400 mb-1.5 block">End Date</label>
                                <div className="relative">
                                    <input 
                                        type="date"
                                        value={settings.endDate}
                                        onChange={(e) => setSettings({...settings, endDate: e.target.value})}
                                        className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white px-2 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ENVIRONMENT & EXECUTION */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <Network size={14} /> Environment & Execution
                    </h3>
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 hover:border-zinc-700 transition-colors">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Initial Deposit ($)</label>
                                <input 
                                    type="number" 
                                    value={settings.deposit}
                                    onChange={(e) => setSettings({...settings, deposit: Number(e.target.value)})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Simulated Latency</label>
                                <div className="relative">
                                    <select 
                                        value={settings.latency}
                                        onChange={(e) => setSettings({...settings, latency: e.target.value as any})}
                                        className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Zero">Zero Latency (Ideal)</option>
                                        <option value="Random (1-10ms)">Random (1-10ms)</option>
                                        <option value="Network (50-200ms)">Network (50-200ms)</option>
                                    </select>
                                    <Wifi size={14} className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Forward Mode</label>
                                <select 
                                    value={settings.forwardMode}
                                    onChange={(e) => setSettings({...settings, forwardMode: e.target.value as any})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="No">No</option>
                                    <option value="1/2">1/2 (50%)</option>
                                    <option value="1/3">1/3 (33%)</option>
                                    <option value="1/4">1/4 (25%)</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Modeling</label>
                                <select 
                                    value={settings.modeling}
                                    onChange={(e) => setSettings({...settings, modeling: e.target.value as any})}
                                    className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white px-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Every Tick">Every Tick</option>
                                    <option value="OHLC (Fast)">OHLC</option>
                                    <option value="Open Prices Only">Open Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: DISTRIBUTED AGENTS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                        <Monitor size={14} /> Distributed Agents
                    </h3>
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2 hover:border-zinc-700 transition-colors h-[170px] overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-zinc-500 uppercase">Local Cores</span>
                            <span className="text-[10px] text-emerald-500">8 Active</span>
                        </div>
                        <AgentNode name="Core 1 (Local)" type="local" usage={85} status="Busy" />
                        <AgentNode name="Core 2 (Local)" type="local" usage={72} status="Busy" />
                        <AgentNode name="Core 3 (Local)" type="local" usage={12} status="Idle" />
                        
                        <div className="flex items-center justify-between mt-4 mb-2">
                            <span className="text-[10px] text-zinc-500 uppercase">Cloud Network</span>
                            <span className="text-[10px] text-blue-500">12 Available</span>
                        </div>
                        <AgentNode name="Cloud-US-East-1" type="cloud" usage={0} status="Ready" />
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-auto pt-6 border-t border-zinc-800">
                <div className="flex items-center justify-end gap-4">
                     <div className="text-right mr-4 hidden sm:block">
                        <div className="text-xs text-zinc-500">Estimated Duration</div>
                        <div className="text-sm font-mono text-white">{settings.visualMode ? 'Variable' : '< 1.5s'}</div>
                     </div>
                    <button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`px-8 py-3 rounded-xl flex items-center gap-3 font-bold text-sm uppercase tracking-wider transition-all shadow-xl ${
                            isRunning 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                            : 'bg-blue-700 hover:bg-blue-600 text-white shadow-blue-900/20 transform hover:-translate-y-0.5'
                        }`}
                    >
                        {isRunning ? (
                            <>
                                <Activity className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play size={18} fill="currentColor" />
                                Start Test
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BacktestConfigPanel;
