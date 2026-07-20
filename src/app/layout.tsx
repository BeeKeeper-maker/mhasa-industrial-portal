import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mhaksa.com"),
  title: {
    default: "MHASA | Mohd H. Al Marhoon Cont. Est. — Pipe Installation & Industrial Solutions",
    template: "%s | MHASA",
  },
  description:
    "Mohd H. Al Marhoon Cont. Est. (MHASA) is a leading Saudi contractor specializing in RTR, GRP, GRE, and FRP pipe installation, sewer lines, and fiberglass engineering solutions for oil & gas, industrial, and EPC sectors across Jubail, Khobar, Qatif, and Dammam.",
  keywords: [
    "MHASA",
    "Mohd Al Marhoon",
    "Saudi Arabia contractor",
    "RTR pipe installation",
    "GRP pipe",
    "GRE pipe",
    "FRP pipe",
    "sewer line installation",
    "fiberglass works",
    "engineering solutions Saudi Arabia",
    "Jubail contractor",
    "Dammam pipe installation",
    "oil and gas contractor",
    "EPC contractor Saudi",
  ],
  authors: [{ name: "MHASA" }],
  creator: "Mohd H. Al Marhoon Cont. Est.",
  publisher: "MHASA",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: "https://mhaksa.com",
    siteName: "MHASA",
    title: "MHASA — Engineering Excellence in Pipe Installation",
    description:
      "Leading Saudi contractor for RTR, GRP, GRE, FRP pipe installation, sewer lines, and fiberglass engineering solutions.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "MHASA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MHASA — Engineering Excellence in Pipe Installation",
    description: "Leading Saudi contractor for pipe installation and industrial solutions.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://mhaksa.com",
    languages: { "en-US": "/", "ar-SA": "/?lang=ar" },
  },
  category: "construction",
};

export const viewport = {
  themeColor: "#0f1e3d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mohd H. Al Marhoon Cont. Est.",
    alternateName: "MHASA",
    url: "https://mhaksa.com",
    email: "info@mhaksa.com",
    telephone: "+966592329710",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SA",
      addressRegion: "Eastern Province",
      addressLocality: "Jubail, Khobar, Qatif, Dammam",
    },
    areaServed: "Kingdom of Saudi Arabia",
    knowsAbout: [
      "RTR Pipe Installation",
      "GRP Pipe",
      "GRE Pipe",
      "FRP Pipe",
      "Sewer Line Installation",
      "Fiberglass Works",
      "Engineering Solutions",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
