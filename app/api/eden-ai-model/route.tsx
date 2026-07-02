import { NextRequest, NextResponse } from 'next/server';

import { resolveAiModelId } from '@/services/AiModelOptions';

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type ChatMessage = {
  role: string;
  content: string | ContentPart[];
};

const EDEN_AI_CHAT_URL = 'https://api.edenai.run/v3/llm/chat/completions';

export const runtime = 'nodejs';

async function fetchEdenAiChat(body: string, headers: HeadersInit) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetch(EDEN_AI_CHAT_URL, {
        method: 'POST',
        headers,
        body,
      });
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.EDEN_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Eden AI API key is not configured' },
      { status: 500 }
    );
  }

  const {
    modelId,
    userMessage,
    prevAssistantMessage,
    systemInstruction,
    messages: clientMessages,
  } = await req.json();

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const messages: ChatMessage[] = [];

  if (Array.isArray(clientMessages) && clientMessages.length > 0) {
    for (const msg of clientMessages) {
      if (!msg?.role) continue;

      const text = typeof msg.content === 'string' ? msg.content.trim() : '';
      const images: string[] = Array.isArray(msg.images) ? msg.images : [];

      if (!text && images.length === 0) continue;

      if (images.length > 0) {
        const parts: ContentPart[] = [];
        if (text) parts.push({ type: 'text', text });
        for (const url of images) {
          parts.push({ type: 'image_url', image_url: { url } });
        }
        messages.push({ role: msg.role, content: parts });
      } else {
        messages.push({ role: msg.role, content: text });
      }
    }
  } else {
    if (systemInstruction?.trim()) {
      messages.push({
        role: 'system',
        content: systemInstruction.trim(),
      });
    }

    if (prevAssistantMessage) {
      messages.push({
        role: 'assistant',
        content: prevAssistantMessage,
      });
    }

    if (userMessage?.trim()) {
      messages.push({
        role: 'user',
        content: userMessage.trim(),
      });
    }
  }

  if (!messages.length) {
    return NextResponse.json(
      { error: 'At least one message is required' },
      { status: 400 }
    );
  }

  const body = JSON.stringify({
    model: resolveAiModelId(modelId),
    messages,
    stream: true,
    stream_options: { include_usage: true },
  });

  try {
    const response = await fetchEdenAiChat(body, headers);

    // On a non-streaming error, Eden AI returns a normal JSON error body.
    if (!response.ok || !response.body) {
      let providerMessage = `API request failed with status ${response.status}`;
      try {
        const result = await response.json();
        providerMessage =
          result?.error?.message ?? result?.detail ?? providerMessage;
      } catch {
        // Body wasn't JSON; keep the status-based message.
      }
      return NextResponse.json(
        { error: providerMessage },
        { status: response.status || 502 }
      );
    }

    // Pipe the upstream SSE stream straight through to the client.
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { error: 'Unable to reach the AI provider. Please try again.' },
      { status: 503 }
    );
  }
}
