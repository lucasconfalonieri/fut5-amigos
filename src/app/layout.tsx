
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className="min-h-screen bg-zinc-950 text-white antialiased">
                <div className="app-bg" />
                <div className="relative z-10">{children}</div>
            </body>
        </html>
    );
}
