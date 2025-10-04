import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
    title: 'Blackjack Game',
    description: 'Play blackjack online',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}