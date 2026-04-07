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
    minify: 'terser', // Usar terser que é mais robusto que o esbuild para ReferenceErrors
    terserOptions: {
      compress: {
        keep_fnames: true, // Mantém nomes de funções para evitar ReferenceError
        keep_classnames: true
      }
    },
    rollupOptions: {
      output: {
        // Mudando a versão para v4 para forçar novo hash e remover manualChunks
        entryFileNames: `assets/[name].v4.[hash].js`,
        chunkFileNames: `assets/[name].v4.[hash].js`,
        assetFileNames: `assets/[name].v4.[hash].[ext]`
      }
    }
  }
}));
