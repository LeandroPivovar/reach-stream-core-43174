import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'nucleocrm.com.br',
      'www.nucleocrm.com.br',
      'localhost',
      '.localhost',
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: false, // Desativar minificação para depurar o ReferenceError de vez
    rollupOptions: {
      output: {
        // Mudando a versão para v5 para forçar novo hash
        entryFileNames: `assets/[name].v5.[hash].js`,
        chunkFileNames: `assets/[name].v5.[hash].js`,
        assetFileNames: `assets/[name].v5.[hash].[ext]`
      }
    }
  }
}));
