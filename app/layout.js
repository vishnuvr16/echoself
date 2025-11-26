import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EchoSelf - Your Digital Self',
  description: 'Your complete digital life platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
