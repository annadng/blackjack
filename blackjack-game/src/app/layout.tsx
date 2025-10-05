import './globals.css';
import type { ReactNode } from 'react';
import AuthProvider from '@/components/SessionProvider';

export const metadata = {
    title: 'Blackjack',
    description: 'Play blackjack online',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}