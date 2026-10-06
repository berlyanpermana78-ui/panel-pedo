import { AIContext } from '../../../types';

export interface BaseAIProvider {
  id: 'webgpu' | 'wasm' | 'unavailable';
  name: string;
  isAvailable: boolean;
  statusDescription: string;
  deviceFeatures: string[];
  initialize(): Promise<boolean>;
  generateResponse(prompt: string, context: AIContext, action?: string): Promise<string>;
}

export class UnavailableProvider implements BaseAIProvider {
  id = 'unavailable' as const;
  name = 'Unavailable Provider';
  isAvailable = false;
  statusDescription = 'Local AI tidak didukung pada browser atau perangkat ini (WebGPU & Wasm tidak aktif).';
  deviceFeatures = [];

  async initialize(): Promise<boolean> {
    return false;
  }

  async generateResponse(prompt: string, context: AIContext, action?: string): Promise<string> {
    return `[BILZX AI — Status: Unavailable]\nPerangkat Anda tidak mendukung akselerasi WebGPU maupun WebAssembly Worker untuk local inference. Editor dan runtime BILZX CODEX tetap dapat digunakan secara penuh.`;
  }
}
