import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite"; // <--- Adicione esta linha

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(), // O target costuma ser detectado pelo Nitro
    nitro(),         // <--- Essencial para Vercel
    viteReact(),
  ],
});
