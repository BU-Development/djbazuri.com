import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJ Bazuri - Professional DJ Services',
  description: 'Professional DJ for weddings, parties, and corporate events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
