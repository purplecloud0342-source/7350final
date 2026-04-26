import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return NextResponse.json({ error: 'Missing messages array in request body.' }, { status: 400 });
  }

  const apiKey = process.env.COMFLY_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Comfly API key is missing on the server. Set COMFLY_API_KEY in Vercel environment variables or .env.local.',
      },
      { status: 500 },
    );
  }

  const requestBody = {
    ...body,
    model: 'gpt-4-turbo', // 指定模型
  };

  const response = await fetch('https://ai.comfly.chat/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody), // 用新的 requestBody
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error?.message || data.message || 'Comfly relay request failed.';
    return NextResponse.json({ error: errorMessage, details: data }, { status: response.status });
  }

  return NextResponse.json(data);
}
