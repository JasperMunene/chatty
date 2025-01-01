import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-afacad",
  subsets: ["latin"],
  weight: ['400']
});

export const metadata = {
  title: "Chatty",
  description: "A chat app",
};

export default async function RootLayout({ children }) {


  return (
    <html lang="en">
  <body
        className={`${manrope.className} antialiased no-scrollbar overflow-hidden`}
      >
        <main>

          {children}
        </main>
      </body>

    </html>

  );
}
