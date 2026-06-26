import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Norvex — Your Private Banker. Built by AI.",
  description: "AI-powered investing with principal protection. Starting at €100.",
  openGraph: {
    title: "Norvex",
    description: "Your private banker. Built by AI.",
    type: "website",
  },
};

const themeScript = `try{if(localStorage.getItem('norvex_theme')==='dark'){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
