import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { makeAutoObservable, runInAction } from 'mobx';

/**
 * Difficulties:
 * 1. Managing message history (user and assistant)
 * 2. Handling streaming response output and adapting the data structure
 * 3. Managing chat switching - chatid (TODO)
 */
export class Chat {
  private readonly _openai = createOpenAI({
    apiKey: import.meta.env['OPENAI_API_KEY'],
  });
  private _messages: UIMessage[] = [];
  private _status: 'idle' | 'streaming' | 'error' = 'idle';

  constructor() {
    makeAutoObservable(this);
  }

  public get messages(): UIMessage[] {
    return this._messages;
  }

  public get status(): 'idle' | 'streaming' | 'error' {
    return this._status;
  }

  public sendMessage(message: string): void {
    this._messages.push(this.createUserMessage(message));
    this.streamChatResponse();
  }

  private async streamChatResponse(): Promise<void> {
    try {
      const streamTextResult = streamText({
        model: this._openai('gpt-4o-mini'),
        messages: convertToModelMessages(this._messages),
      });

      const stream = streamTextResult.toUIMessageStream();

      for await (const chunk of stream) {
        runInAction(() => {
          if (chunk.type === 'text-start') {
            this._status = 'streaming';
            this._messages.push({
              id: chunk.id,
              role: 'assistant',
              parts: [],
            });
          } else if (chunk.type === 'text-delta') {
            this._messages[this._messages.length - 1].parts.push({
              type: 'text',
              text: chunk.delta,
            });
          } else if (chunk.type === 'text-end') {
            this._status = 'idle';
          }
        });
      }
    } catch (error) {
      runInAction(() => {
        this._status = 'error';
      });
      console.error(error);
    }
  }

  private createUserMessage(message: string): UIMessage {
    return {
      id: crypto.randomUUID(),
      role: 'user',
      parts: [{ type: 'text', text: message }],
    };
  }
}
