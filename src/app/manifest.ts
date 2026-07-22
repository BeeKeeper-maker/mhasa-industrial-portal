import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MHASA — Mohd H. Al Marhoon Cont. Est.",
    short_name: "MHASA",
    description: "Leading Saudi contractor for RTR, GRP, GRE, FRP pipe installation and industrial solutions.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1e3d",
    theme_color: "#0f1e3d",
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/hero-industrial.png", type: "image/png", sizes: "512x512", purpose: "any" },
    ],
  };
}
