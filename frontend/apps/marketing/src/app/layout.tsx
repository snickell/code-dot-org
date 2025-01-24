import type {Metadata} from 'next';
import '@code-dot-org/css/primitiveColors.css';
import '@code-dot-org/css/colors.css';

import './globals.css';

export const metadata: Metadata = {
  title: 'Code.org',
  description: 'Anyone can learn!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
