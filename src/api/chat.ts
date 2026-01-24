import axios from "axios";
import type { Message } from "@/store/modules/chat";

export interface ChatCompletionRequest {
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class ChatAPI {
  private baseURL = "http://localhost:5000/api/chat/completions";

  async sendMessage(
    messages: Message[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    abortController: AbortController
  ): Promise<void> {
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: true
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === "data: [DONE]") {
            continue;
          }

          if (trimmedLine.startsWith("data: ")) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data: StreamChunk = JSON.parse(jsonStr);

              if (data.choices && data.choices[0]?.delta?.content) {
                onChunk(data.choices[0].delta.content);
              }

              if (data.choices[0]?.finish_reason) {
                onComplete();
                return;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request was aborted");
        } else {
          onError(error);
        }
      } else {
        onError(new Error("Unknown error occurred"));
      }
    }
  }

  async sendMessageNonStream(
    messages: Message[],
    abortController: AbortController
  ): Promise<string> {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false
        },
        {
          signal: abortController.signal,
          timeout: 60000
        }
      );

      return response.data.choices[0]?.message?.content || "";
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error("Request was cancelled");
      }
      throw error;
    }
  }
}

export const chatAPI = new ChatAPI();
