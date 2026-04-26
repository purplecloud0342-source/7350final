import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message : '';
  const model = typeof body.model === 'string' && body.model ? body.model : 'gemini-1.5-flash';

  if (!message.trim()) {
    return NextResponse.json({ error: 'Missing message in request body.' }, { status: 400 });
  }

  const rawApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const apiKey = rawApiKey?.trim().replace(/^['"]|['"]$/g, '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is missing on the server. Set GEMINI_API_KEY in .env.local.' },
      { status: 500 },
    );
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.error?.message || data.message || 'Gemini API request failed.';
    return NextResponse.json({ error: errorMessage, details: data }, { status: response.status });
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ text, usageMetadata: data.usageMetadata || data.usage || null });
}
