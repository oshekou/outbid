import type { MetadataRoute } from "next";

// Lets phones install Outbid to the home screen and open it full-screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Outbid",
    short_name: "Outbid",
    description: "Silent auctions run by students. Local businesses donate, students make them famous, charities get every dollar.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFF",
    theme_color: "#061C43",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
