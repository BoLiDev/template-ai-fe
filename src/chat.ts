import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { makeAutoObservable } from 'mobx';

/**
 * Difficulties:
 * 1. Managing message history (user and assistant)
 * 2. Handling streaming response output and adapting the data structure
 * 3. Managing chat switching - chatid (TODO)
 */
export class Chat {
  private readonly _google = createGoogleGenerativeAI({
    apiKey: import.meta.env['GOOGLE_GENERATIVE_AI_API_KEY'],
  });
  private _messages: UIMessage[] = [];
  private _status: 'idle' | 'streaming' = 'idle';

  constructor() {
    makeAutoObservable(this);
  }

  public get messages(): UIMessage[] {
    return this._messages;
  }

  public get status(): 'idle' | 'streaming' {
    return this._status;
  }

  public sendMessage(message: string): void {
    this._messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      parts: [
        {
          type: 'text',
          text: message,
        },
      ],
    });

    this.stream();
  }

  private async stream(): Promise<void> {
    try {
      const streamTextResult = streamText({
        model: this._google('gemini-2.5-flash'),
        messages: convertToModelMessages(this._messages),
      });

      const stream = streamTextResult.toUIMessageStream();

      for await (const chunk of stream) {
        if (chunk.type === 'start') {
          this._status = 'streaming';
        }
        if (chunk.type === 'text-start') {
          this._messages.push({
            id: chunk.id,
            role: 'assistant',
            parts: [],
          });
        }
        if (chunk.type === 'text-delta') {
          this._messages[this._messages.length - 1].parts.push({
            type: 'text',
            text: chunk.delta,
          });
        }
      }
    } finally {
      this._status = 'idle';
    }
  }
}
