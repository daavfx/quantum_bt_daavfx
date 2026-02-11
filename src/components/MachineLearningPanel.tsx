
import React from 'react';
import { Brain, Construction } from 'lucide-react';

const MachineLearningPanel: React.FC = () => {
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
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                <Construction size={64} className="mb-4 text-zinc-600" />
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">Machine Learning Module</h3>
                <p className="text-sm text-center max-w-md">
                    This module is not yet implemented. ML backend integration with TensorFlow/PyTorch 
                    will be added in a future update.
                </p>
                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <p className="text-xs text-zinc-500">
                        Planned features:
                    </p>
                    <ul className="text-xs text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                        <li>LSTM/Transformer model training</li>
                        <li>Feature engineering pipeline</li>
                        <li>Model validation and backtesting</li>
                        <li>Export trained models</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MachineLearningPanel;
