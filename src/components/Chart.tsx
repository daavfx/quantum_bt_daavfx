import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';
import { OHLCData, VolumeData, ChartType } from '../types';

interface ChartProps {
    data: OHLCData[];
    volumeData: VolumeData[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    currentTool: string;
    chartType: ChartType;
}

export interface ChartRef {
    resize: () => void;
}

const Chart = forwardRef<ChartRef, ChartProps>(({ data, volumeData, currentIndex, onIndexChange, currentTool, chartType }, ref) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const volumeContainerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const chartApiRef = useRef<IChartApi | null>(null);
    const volumeApiRef = useRef<IChartApi | null>(null);
    
    const seriesRef = useRef<ISeriesApi<any> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const [candleInfo, setCandleInfo] = useState<OHLCData | null>(null);

    useImperativeHandle(ref, () => ({
        resize: () => {
            if (chartContainerRef.current && chartApiRef.current) {
                chartApiRef.current.applyOptions({ 
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight 
                });
            }
            if (volumeContainerRef.current && volumeApiRef.current) {
                volumeApiRef.current.applyOptions({ 
                    width: volumeContainerRef.current.clientWidth,
                    height: volumeContainerRef.current.clientHeight 
                });
            }
        }
    }));

    // Initialize Chart Instance (Once)
    useEffect(() => {
        if (!chartContainerRef.current || !volumeContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { 
                background: { type: ColorType.Solid, color: 'transparent' }, 
                textColor: '#71717a',
                fontFamily: "'Inter', sans-serif",
            },
            grid: { 
                vertLines: { color: '#1f1f23' }, 
                horzLines: { color: '#1f1f23' } 
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: '#3b82f6', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#18181b' },
                horzLine: { color: '#3b82f6', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#18181b' },
            },
            rightPriceScale: { 
                borderColor: '#27272a', 
                scaleMargins: { top: 0.1, bottom: 0.1 } 
            },
            timeScale: { 
                borderColor: '#27272a', 
                timeVisible: true, 
                secondsVisible: false 
            },
        });

        const volumeChart = createChart(volumeContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#71717a' },
            grid: { vertLines: { visible: false }, horzLines: { color: '#1f1f23' } },
            rightPriceScale: { borderColor: '#27272a', visible: false },
            timeScale: { visible: false },
        });

        const volumeSeries = volumeChart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
        });
        volumeSeriesRef.current = volumeSeries;

        chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            if (range) volumeChart.timeScale().setVisibleLogicalRange(range);
        });

        chartApiRef.current = chart;
        volumeApiRef.current = volumeChart;

        const resizeObserver = new ResizeObserver(() => {
             if (chartContainerRef.current && chartApiRef.current) {
                chartApiRef.current.applyOptions({ 
                    width: chartContainerRef.current.clientWidth, 
                    height: chartContainerRef.current.clientHeight 
                });
             }
             if (volumeContainerRef.current && volumeApiRef.current) {
                volumeApiRef.current.applyOptions({ 
                    width: volumeContainerRef.current.clientWidth, 
                    height: volumeContainerRef.current.clientHeight 
                });
             }
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            try {
                chart.remove();
            } catch (e) {
                console.warn('Failed to remove chart:', e);
            }
            try {
                volumeChart.remove();
            } catch (e) {
                console.warn('Failed to remove volume chart:', e);
            }
            chartApiRef.current = null;
            volumeApiRef.current = null;
            seriesRef.current = null;
            volumeSeriesRef.current = null;
        };
    }, []);

    // Handle Chart Type Switching
    useEffect(() => {
        if (!chartApiRef.current) return;

        // Remove existing series safely
        if (seriesRef.current) {
            try {
                chartApiRef.current.removeSeries(seriesRef.current);
            } catch (e) {
                console.warn('Failed to remove series:', e);
            }
            seriesRef.current = null;
        }

        let newSeries;
        const commonOptions = {
            priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
        };

        // Create new series based on type
        try {
            switch (chartType) {
                case 'Line':
                    newSeries = chartApiRef.current.addLineSeries({
                        ...commonOptions,
                        color: '#3b82f6',
                        lineWidth: 2,
                    });
                    break;
                case 'Area':
                    newSeries = chartApiRef.current.addAreaSeries({
                        ...commonOptions,
                        topColor: 'rgba(59, 130, 246, 0.56)',
                        bottomColor: 'rgba(59, 130, 246, 0.04)',
                        lineColor: '#3b82f6',
                        lineWidth: 2,
                    });
                    break;
                case 'Bar':
                    newSeries = chartApiRef.current.addBarSeries({
                        ...commonOptions,
                        upColor: '#22c55e',
                        downColor: '#ef4444',
                    });
                    break;
                case 'Candle':
                default:
                    newSeries = chartApiRef.current.addCandlestickSeries({
                        ...commonOptions,
                        upColor: '#22c55e',
                        downColor: '#ef4444',
                        borderUpColor: '#22c55e',
                        borderDownColor: '#ef4444',
                        wickUpColor: '#22c55e',
                        wickDownColor: '#ef4444',
                    });
                    break;
            }
            seriesRef.current = newSeries;
        } catch (e) {
            console.error('Failed to create series:', e);
        }
        
    }, [chartType]);

    // Handle Data Updates
    useEffect(() => {
        if (!seriesRef.current || !volumeSeriesRef.current) return;

        try {
            const visibleOHLC = data.slice(0, currentIndex + 1);
            const visibleVolume = volumeData.slice(0, currentIndex + 1);

            if (chartType === 'Line' || chartType === 'Area') {
                const lineData = visibleOHLC.map(d => ({ time: d.time, value: d.close }));
                seriesRef.current.setData(lineData);
            } else {
                seriesRef.current.setData(visibleOHLC);
            }

            volumeSeriesRef.current.setData(visibleVolume);

            if (visibleOHLC.length > 0) {
                setCandleInfo(visibleOHLC[visibleOHLC.length - 1]);
            }
        } catch (e) {
            console.error('Failed to update data:', e);
        }
    }, [currentIndex, data, volumeData, chartType]);

    return (
        <div ref={wrapperRef} className="flex-1 flex flex-col relative overflow-hidden">
            {/* Main Chart */}
            <div className="flex-1 relative min-h-0">
                <div ref={chartContainerRef} className="absolute inset-0" />
                
                {/* Price Info Overlay */}
                {candleInfo && (
                    <div className="absolute top-3 left-3 flex items-center gap-4 z-10 pointer-events-none">
                        <div className="flex items-center">
                            <span className="text-xs text-zinc-500 mr-1">O</span>
                            <span className="text-xs mono text-zinc-300">{candleInfo.open.toFixed(5)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs text-zinc-500 mr-1">H</span>
                            <span className="text-xs mono text-emerald-400">{candleInfo.high.toFixed(5)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs text-zinc-500 mr-1">L</span>
                            <span className="text-xs mono text-red-400">{candleInfo.low.toFixed(5)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs text-zinc-500 mr-1">C</span>
                            <span className="text-xs mono text-zinc-300">{candleInfo.close.toFixed(5)}</span>
                        </div>
                    </div>
                )}

                {/* Status Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-zinc-900/80 border border-zinc-800 rounded z-10">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    <span className="text-xs mono text-zinc-300">
                        {candleInfo ? new Date(candleInfo.time * 1000).toISOString().slice(0, 16).replace('T', ' ') : 'Loading...'}
                    </span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-zinc-900/80 border border-zinc-800 rounded z-10">
                    <span className="text-xs text-zinc-300 capitalize">{currentTool}</span>
                </div>
            </div>

            {/* Volume Chart */}
            <div className="h-16 border-t border-zinc-800/50 relative bg-zinc-950 flex-shrink-0">
                <div ref={volumeContainerRef} className="h-full w-full" />
            </div>
        </div>
    );
});

export default Chart;