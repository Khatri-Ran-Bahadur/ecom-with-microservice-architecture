import './global.css';
import Header from './shared/widgets/header';
import Footer from './shared/widgets/footer';
import { Poppins, Roboto } from 'next/font/google'
import Providers from './providers';
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'Welcome to user-ui',
  description: 'Eshop is the best',
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto',
  display: 'swap'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap'
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`}>
        <Providers>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>

    </html>
  )
}
