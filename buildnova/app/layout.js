import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700']
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600']
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500']
});

export const metadata = {
  title: 'BuildNova — Infrastructure & Construction Management',
  description:
    'BuildNova connects engineers, managers and supervisors through one platform for planning, task allocation, resource tracking and construction progress.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script
          // Applies saved theme before paint to avoid a light/dark flash.
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('buildnova_theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
