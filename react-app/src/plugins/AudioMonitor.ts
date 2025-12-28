import { registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";

export type AudioEvent = {
  type: "CRY" | "SCREAM" | "SILENCE" | "SOUND";
  confidence: number;
  ts: string;
};

export type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";

export type AudioMonitorPermissions = {
  microphone: PermissionState;
};

export interface AudioMonitorPlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): Promise<{ running: boolean }>;
  addListener(eventName: "audioEvent", listenerFunc: (event: AudioEvent) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const AudioMonitor = registerPlugin<AudioMonitorPlugin>("AudioMonitor");
