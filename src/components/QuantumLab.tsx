
import React, { useState } from 'react';
import { LayoutDashboard, Sliders, Brain, FileText, Zap, Settings, PlayCircle } from 'lucide-react';
import StrategyBuilder from './StrategyBuilder';
import BacktestConfigPanel from './BacktestConfigPanel';
import OptimizationPanel from './OptimizationPanel';
import MachineLearningPanel from './MachineLearningPanel';
import QuantumAnalytics from './QuantumAnalytics';
import { StrategyConfig, BacktestResult, BacktestSettings } from '../types';

interface QuantumLabProps {
    strategyConfig: StrategyConfig;
    setStrategyConfig: (c: StrategyConfig) => void;
    quantumResults: BacktestResult | null;
    runBacktest: () => void;
    isRunning: boolean;
}

const QuantumLab: React.FC<QuantumLabProps> = ({ 
    strategyConfig, 
    setStrategyConfig, 
    quantumResults, 
    runBacktest, 
    isRunning 
}) => {
    // New default tab is 'configure' to mimic MT5 starting point
    const [activeTab, setActiveTab] = useState<'compose' | 'configure' | 'optimize' | 'ml' | 'results'>('configure');

    const handleRunFromConfig = (settings: BacktestSettings) => {
        // In a real app, we would use the 'settings' object to configure the backend run
        console.log("Running with settings:", settings);
        runBacktest();
        setActiveTab('results');
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950">
            {/* Lab Navigation */}
            <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-1 bg-zinc-900/50">
                 <button 
                    onClick={() => setActiveTab('compose')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'compose' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <LayoutDashboard size={14} /> Compose
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <button 
                    onClick={() => setActiveTab('configure')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'configure' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Settings size={14} /> Configure & Run
                </button>
                <button 
                    onClick={() => setActiveTab('optimize')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'optimize' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Sliders size={14} /> Optimization
                </button>
                <button 
                    onClick={() => setActiveTab('ml')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'ml' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Brain size={14} /> AI Lab
                </button>
                <div className="w-px h-6 bg-zinc-800 mx-2"></div>
                <button 
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === 'results' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <FileText size={14} /> Results
                </button>
            </div>

            {/* Lab Content */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* COMPOSE TAB (Strategy Builder) */}
                {activeTab === 'compose' && (
                    <div className="absolute inset-0 flex">
                        <div className="w-80 border-r border-zinc-800 bg-zinc-900/30">
                            <StrategyBuilder 
                                config={strategyConfig} 
                                setConfig={setStrategyConfig} 
                                onRun={() => setActiveTab('configure')} // Redirect to config instead of immediate run
                                isRunning={isRunning} 
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center text-zinc-700 select-none bg-zinc-950/50">
                            <div className="text-center">
                                <Zap size={64} className="mx-auto mb-4 opacity-10" />
                                <p className="text-sm">Logic Node Canvas (Coming Soon)</p>
                                <p className="text-xs text-zinc-600 mt-2">Visual programming interface for strategy logic.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONFIGURE TAB (MT5 Style Settings) */}
                {activeTab === 'configure' && (
                    <div className="absolute inset-0">
                        <BacktestConfigPanel onRun={handleRunFromConfig} isRunning={isRunning} />
                    </div>
                )}

                {/* OPTIMIZATION TAB */}
                {activeTab === 'optimize' && (
                    <div className="absolute inset-0">
                        <OptimizationPanel />
                    </div>
                )}

                {/* ML TAB */}
                {activeTab === 'ml' && (
                    <div className="absolute inset-0">
                        <MachineLearningPanel />
                    </div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && (
                    <div className="absolute inset-0">
                        {quantumResults ? (
                            <QuantumAnalytics results={quantumResults} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>No backtest results available.</p>
                                <button onClick={() => setActiveTab('configure')} className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors flex items-center gap-2">
                                    <PlayCircle size={14} /> Go to Configuration
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuantumLab;
