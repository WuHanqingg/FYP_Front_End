import axios from "axios";
import type { Message } from "@/store/modules/chat";
import { storageLocal } from "@pureadmin/utils";
import { userKey, type DataInfo } from "@/utils/auth";

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

export interface ConversationListItem {
  conversation_id: string;
  title: string;
}

export interface ConversationDetail {
  conversation_id: string;
  username: string;
  title: string;
  messages: Array<{
    sender: string;
    receiver: string;
    timestamp: string;
    content: string;
  }>;
  generated_files: Array<{
    filename: string;
    filepath: string;
    generated_time: string;
    file_type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  conversations?: ConversationListItem[];
  conversation?: ConversationDetail;
  message?: string;
  count?: number;
}

export class ChatAPI {
  private baseURL = "http://localhost:5000/api/chat/completions";
  private conversationsBaseURL = "http://localhost:5000/api/conversations";

  private generateConversationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  }

  async sendMessage(
    messages: Message[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    abortController: AbortController,
    conversationId?: string,
    title?: string
  ): Promise<void> {
    try {
      const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
      const username = userInfo?.username || "";
      const chatId = conversationId || this.generateConversationId();

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
          stream: true,
          username,
          conversation_id: chatId,
          title
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
    abortController: AbortController,
    conversationId?: string,
    title?: string
  ): Promise<string> {
    try {
      const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
      const username = userInfo?.username || "";
      const chatId = conversationId || this.generateConversationId();

      const response = await axios.post(
        this.baseURL,
        {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false,
          username,
          conversation_id: chatId,
          title
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

  async getUserConversations(username: string): Promise<ConversationListItem[]> {
    try {
      const response = await fetch(
        `${this.conversationsBaseURL}?username=${encodeURIComponent(username)}`
      );
      const data: APIResponse<ConversationListItem[]> = await response.json();

      if (data.success && data.conversations) {
        return data.conversations;
      } else {
        throw new Error(data.error || "Failed to fetch conversations");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while fetching conversations");
    }
  }

  async getConversationDetail(
    conversationId: string,
    username: string
  ): Promise<ConversationDetail> {
    try {
      const response = await fetch(
        `${this.conversationsBaseURL}/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(username)}`
      );
      const data: APIResponse<ConversationDetail> = await response.json();

      if (data.success && data.conversation) {
        return data.conversation;
      } else {
        throw new Error(data.error || "Failed to fetch conversation detail");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while fetching conversation detail");
    }
  }

  async deleteConversation(
    conversationId: string,
    username: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.conversationsBaseURL}/${encodeURIComponent(conversationId)}/delete?username=${encodeURIComponent(username)}`
      );
      const data: APIResponse<boolean> = await response.json();

      if (data.success) {
        return true;
      } else {
        throw new Error(data.error || "Failed to delete conversation");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while deleting conversation");
    }
  }

  async updateConversationTitle(
    conversationId: string,
    username: string,
    title: string
  ): Promise<ConversationDetail> {
    try {
      const response = await fetch(
        `${this.conversationsBaseURL}/${encodeURIComponent(conversationId)}/title`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            title
          })
        }
      );
      const data: APIResponse<ConversationDetail> = await response.json();

      if (data.success && data.conversation) {
        return data.conversation;
      } else {
        throw new Error(data.error || "Failed to update conversation title");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while updating conversation title");
    }
  }
}

export const chatAPI = new ChatAPI();
