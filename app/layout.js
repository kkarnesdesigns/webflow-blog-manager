import './globals.css';

export const metadata = {
  title: 'Tampa Blog Manager',
  description: 'Manage blog posts for Webflow CMS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
