import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return NextResponse.json({ error: 'Missing messages array in request body.' }, { status: 400 });
  }

  const rawApiKey = process.env.COMFLY_API_KEY;
  const apiKey = rawApiKey?.trim().replace(/^['\"]|['\"]$/g, '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Comfly API key is missing on the server. Set COMFLY_API_KEY in .env.local.' },
      { status: 500 },
    );
  }

  const response = await fetch('https://ai.comfly.chat/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error?.message || data.message || 'Comfly relay request failed.';
    return NextResponse.json({ error: errorMessage, details: data }, { status: response.status });
  }

  return NextResponse.json(data);
}
