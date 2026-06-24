import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { getAppUrl } from "@/lib/utils";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "siPandu - Asisten Pintar UMKM",
    template: "%s | siPandu",
  },
  description:
    "Platform chatbot WhatsApp, katalog, order, stok, QRIS, dan dashboard penjualan untuk UMKM lokal.",
  applicationName: "siPandu",
  keywords: [
    "siPandu",
    "chatbot UMKM",
    "WhatsApp AI",
    "dashboard UMKM",
    "katalog online",
    "Purbalingga",
  ],
  openGraph: {
    title: "siPandu - Asisten Pintar UMKM",
    description:
      "Chatbot WhatsApp dan dashboard penjualan untuk membantu UMKM membalas customer, mencatat order, dan memantau stok.",
    images: [
      {
        url: "/hero-sipandu.png",
        width: 1792,
        height: 1024,
        alt: "Pemilik UMKM memakai WhatsApp dan dashboard siPandu",
      },
    ],
    locale: "id_ID",
    siteName: "siPandu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "siPandu - Asisten Pintar UMKM",
    description:
      "Chatbot WhatsApp dan dashboard penjualan untuk UMKM lokal.",
    images: ["/hero-sipandu.png"],
  },
};

function getMetadataBase() {
  try {
    return new URL(getAppUrl());
  } catch {
    return new URL("http://localhost:3000");
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
            try {
              const saved = localStorage.getItem("sipandu-theme");
              const theme = saved === "dark" || saved === "light"
                ? saved
                : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
              document.documentElement.dataset.theme = theme;
            } catch {}
          `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
