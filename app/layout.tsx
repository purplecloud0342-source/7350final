import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'TOKEN TRACE',
  description: 'Explore the hidden environmental cost of AI with secure Gemini backend calls.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
