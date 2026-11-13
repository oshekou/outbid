import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { DeviceFrame } from "@/components/app/DeviceFrame";
import { ToastProvider } from "@/components/app/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headlines are heavy italic; buttons use the upright heavy weight.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Outbid", template: "%s · Outbid" },
  description:
    "Silent auctions run by students. Local businesses donate, students make them famous, charities get every dollar.",
  applicationName: "Outbid",
  appleWebApp: { capable: true, title: "Outbid", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#061C43",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DeviceFrame>
          <ToastProvider>{children}</ToastProvider>
        </DeviceFrame>
      </body>
    </html>
  );
}
