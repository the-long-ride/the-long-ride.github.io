import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://the-long-ride.github.io",
  output: "static",
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
});
