import { Manrope } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers"


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
 const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  return (
    <html lang="en">
         <SidebarProvider 
         defaultOpen={defaultOpen}
         style={{
          "--sidebar-width": "30rem",
          "--sidebar-width-mobile": "20rem",
        }}
         >
        <body
          className={`${manrope.className} antialiased no-scrollbar overflow-hidden`}
        >
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </body>
      </SidebarProvider>
    </html>

  );
}
