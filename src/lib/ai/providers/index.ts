import { BaseAIProvider, UnavailableProvider } from './unavailable';
import { LocalWebGPUProvider } from './webgpu';
import { LocalWasmProvider } from './wasm';
import { AIProviderStatus } from '../../../types';

export * from './unavailable';
export * from './webgpu';
export * from './wasm';

/**
 * Initializes and detects the best available local AI provider.
 * Follows hierarchy:
 * 1. WebGPU (if hardware acceleration available)
 * 2. WebAssembly (CPU fallback)
 * 3. UnavailableProvider (if neither is supported)
 */
export async function detectBestAIProvider(): Promise<BaseAIProvider> {
  // 1. Try WebGPU
  const webgpu = new LocalWebGPUProvider();
  const webgpuOk = await webgpu.initialize();
  if (webgpuOk) {
    return webgpu;
  }

  // 2. Try WebAssembly
  const wasm = new LocalWasmProvider();
  const wasmOk = await wasm.initialize();
  if (wasmOk) {
    return wasm;
  }

  // 3. Fallback to Unavailable
  return new UnavailableProvider();
}

export function getProviderStatus(provider: BaseAIProvider): AIProviderStatus {
  return {
    type: provider.id,
    name: provider.name,
    isAvailable: provider.isAvailable,
    statusText: provider.statusDescription,
    deviceFeatures: provider.deviceFeatures,
  };
}
