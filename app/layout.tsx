import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Clinic Booking',
  description: 'Book your dental appointment online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}