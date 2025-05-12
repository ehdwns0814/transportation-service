import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import ToasterProvider from './components/ToasterProvider';
import { setupProfilesTable } from './utils/database';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize database tables
if (typeof window !== 'undefined') {
  // Only run on client-side
  setupProfilesTable().catch(console.error);
}

export const metadata = {
  title: "프리매칭 - 프리랜서 용차 직접 매칭 플랫폼",
  description: "중개 수수료 없는 1:1 프리랜서 용차 매칭 플랫폼으로 기업과 프리랜서를 직접 연결합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
