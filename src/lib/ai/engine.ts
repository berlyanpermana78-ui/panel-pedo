import { BaseAIProvider, detectBestAIProvider, getProviderStatus } from './providers';
import { AIContext, AIContextOptions, AIChatMessage, AIProviderStatus, AIQuickAction, Project, ProjectFile } from '../../types';
import { buildControlledContext, DEFAULT_CONTEXT_OPTIONS } from './context';

class LocalAIEngine {
  private provider: BaseAIProvider | null = null;
  private isInitializing = false;
  private chatHistory: AIChatMessage[] = [];

  /**
   * Lazily initializes local AI provider without blocking UI startup.
   */
  async getOrInitProvider(): Promise<BaseAIProvider> {
    if (this.provider) {
      return this.provider;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return this.provider!;
    }

    this.isInitializing = true;
    try {
      this.provider = await detectBestAIProvider();
      return this.provider;
    } finally {
      this.isInitializing = false;
    }
  }

  async getStatus(): Promise<AIProviderStatus> {
    const provider = await this.getOrInitProvider();
    return getProviderStatus(provider);
  }

  async askAI({
    prompt,
    project,
    activeFile,
    selectedText,
    consoleError,
    action,
    contextOptions = DEFAULT_CONTEXT_OPTIONS,
  }: {
    prompt: string;
    project: Project;
    activeFile: ProjectFile | null;
    selectedText?: string;
    consoleError?: string;
    action?: AIQuickAction;
    contextOptions?: AIContextOptions;
  }): Promise<string> {
    const provider = await this.getOrInitProvider();
    const context = buildControlledContext({
      project,
      activeFile,
      selectedText,
      consoleError,
      options: contextOptions,
    });

    return await provider.generateResponse(prompt, context, action);
  }
}

export const aiEngine = new LocalAIEngine();
