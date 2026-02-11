/**
 * Replay Service - Frontend service for market replay functionality
 */

import { invoke } from '@tauri-apps/api/core';

export interface ReplayInfo {
    totalCandles: number;
    currentIndex: number;
    startTime: number;
    endTime: number;
    symbol: string;
    timeframe: string;
    isPlaying: boolean;
    speed: number;
}

export interface ReplayStateResponse {
    isLoaded: boolean;
    isPlaying: boolean;
    currentIndex: number;
    totalCandles: number;
    speed: number;
    symbol: string;
    timeframe: string;
    progress: number;
}

export interface ReplayUpdate {
    currentIndex: number;
    totalCandles: number;
    candle: CandleData;
    progress: number;
}

export interface CandleData {
    time: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

export async function loadReplaySession(symbol: string, timeframe: string): Promise<ReplayInfo> {
    try {
        return await invoke<ReplayInfo>('load_replay_session', { symbol, timeframe });
    } catch (error) {
        console.error('Failed to load replay session:', error);
        throw error;
    }
}

export async function startReplay(): Promise<void> {
    try {
        await invoke('start_replay');
    } catch (error) {
        console.error('Failed to start replay:', error);
        throw error;
    }
}

export async function pauseReplay(): Promise<void> {
    try {
        await invoke('pause_replay');
    } catch (error) {
        console.error('Failed to pause replay:', error);
        throw error;
    }
}

export async function stopReplay(): Promise<void> {
    try {
        await invoke('stop_replay');
    } catch (error) {
        console.error('Failed to stop replay:', error);
        throw error;
    }
}

export async function stepForward(steps?: number): Promise<ReplayUpdate | null> {
    try {
        return await invoke<ReplayUpdate | null>('step_forward', { steps });
    } catch (error) {
        console.error('Failed to step forward:', error);
        throw error;
    }
}

export async function stepBackward(steps?: number): Promise<ReplayUpdate | null> {
    try {
        return await invoke<ReplayUpdate | null>('step_backward', { steps });
    } catch (error) {
        console.error('Failed to step backward:', error);
        throw error;
    }
}

export async function setReplaySpeed(speed: number): Promise<void> {
    try {
        await invoke('set_replay_speed', { speed });
    } catch (error) {
        console.error('Failed to set replay speed:', error);
        throw error;
    }
}

export async function seekToIndex(index: number): Promise<ReplayUpdate | null> {
    try {
        return await invoke<ReplayUpdate | null>('seek_to_index', { index });
    } catch (error) {
        console.error('Failed to seek:', error);
        throw error;
    }
}

export async function getReplayState(): Promise<ReplayStateResponse> {
    try {
        return await invoke<ReplayStateResponse>('get_replay_state');
    } catch (error) {
        console.error('Failed to get replay state:', error);
        throw error;
    }
}

export async function advanceReplay(deltaTimeMs: number): Promise<ReplayUpdate | null> {
    try {
        return await invoke<ReplayUpdate | null>('advance_replay', { deltaTimeMs });
    } catch (error) {
        console.error('Failed to advance replay:', error);
        throw error;
    }
}
