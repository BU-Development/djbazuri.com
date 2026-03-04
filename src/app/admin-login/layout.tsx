import '../../app/globals.css';

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-black min-h-screen flex items-center justify-center">
        {children}
      </body>
    </html>
  );
}
