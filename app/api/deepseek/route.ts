import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const model = typeof body.model === 'string' && body.model ? body.model : 'deepseek-chat';

  if (!messages.length) {
    return NextResponse.json({ error: 'Missing messages array in request body.' }, { status: 400 });
  }

  const rawApiKey = process.env.DEEPSEEK_API_KEY;
  const apiKey = rawApiKey?.trim().replace(/^['"]|['"]$/g, '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'DeepSeek API key is missing on the server. Set DEEPSEEK_API_KEY in .env.local.' },
      { status: 500 },
    );
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error?.message || data.message || 'DeepSeek API request failed.';
    return NextResponse.json({ error: errorMessage, details: data }, { status: response.status });
  }

  return NextResponse.json(data);
}
