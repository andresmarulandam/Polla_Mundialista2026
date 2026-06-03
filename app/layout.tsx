import type { Metadata } from 'next';
// @ts-ignore: CSS side-effect import
import './globals.css';

export const metadata: Metadata = {
  title: 'Polla Mundialista 2026',
  description: 'Pool de apuestas familiares para el Mundial 2026',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
