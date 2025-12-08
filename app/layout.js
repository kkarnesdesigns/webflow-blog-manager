import './globals.css';

export const metadata = {
  title: 'Resting Rainbow of Tampa - Blog Manager',
  description: 'Manage blog posts for Resting Rainbow of Tampa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-rr-cream">{children}</body>
    </html>
  );
}
