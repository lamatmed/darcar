import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "داركار",
    short_name: "داركار",
    description: "Agence de marketing digital en Mauritanie - Solutions créatives et stratégiques pour votre entreprise.",
    start_url: "/",
    display: "standalone",
    background_color: "#001f3f",
    theme_color: "#001f3f",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
