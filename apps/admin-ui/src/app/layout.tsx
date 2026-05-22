import './global.css';
import { Providers } from '../components/Providers';
import { ThemeProvider } from '../components/ThemeProvider';
import { AdminThemeProvider } from '../context/AdminThemeContext';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Control Panel for eShop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AdminThemeProvider>
              {children}
            </AdminThemeProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
