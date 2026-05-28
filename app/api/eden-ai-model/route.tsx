import { NextRequest, NextResponse } from 'next/server';

import { resolveAiModelId } from '@/services/AiModelOptions';

type ChatMessage = {
  role: string;
  content: string;
};

const EDEN_AI_CHAT_URL = 'https://api.edenai.run/v2/llm/chat';

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
    for (const message of clientMessages) {
      if (!message?.role || !message?.content?.trim()) continue;
      messages.push({
        role: message.role,
        content: message.content.trim(),
      });
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
  });

  try {
    const response = await fetchEdenAiChat(body, headers);
    const result = await response.json();

    if (!response.ok) {
      const providerMessage =
        result?.error?.message ??
        result?.detail ??
        `API request failed with status ${response.status}`;

      return NextResponse.json({ error: providerMessage }, { status: response.status });
    }

    if (result.status === 'fail' || result.error) {
      const providerMessage =
        result.error?.message ?? 'The selected AI model could not complete this request';

      return NextResponse.json({ error: providerMessage }, { status: 502 });
    }

    if (!result.choices?.length) {
      return NextResponse.json(
        { error: 'Invalid response from AI model' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        role: 'assistant',
        content: result.choices[0].message.content,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { error: 'Unable to reach the AI provider. Please try again.' },
      { status: 503 }
    );
  }
}
