# 📋 Resumo Rápido - Deploy do Frontend

## 🚀 Passos Rápidos

### 1. No servidor, instalar dependências:
```bash
cd frontend
npm install
```

### 2. Criar arquivo `.env.production`:
```bash
nano .env.production
```

Conteúdo:
```env
VITE_API_URL=https://api.seu-dominio.com
```
**⚠️ Substitua pela URL real do seu backend!**

### 3. Fazer build:
```bash
npm run build
```

### 4. Configurar Nginx:

Criar arquivo: `/etc/nginx/sites-available/nucleo-frontend`

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/nucleo-crm/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/nucleo-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL (HTTPS):
```bash
sudo certbot --nginx -d seu-dominio.com
```

---

## ⚠️ IMPORTANTE

1. **URL da API**: Configure `VITE_API_URL` no `.env.production`
2. **CORS**: Configure o backend para permitir requisições do seu domínio
3. **Build**: Sempre execute `npm run build` após mudanças

---

📖 **Guia completo:** Veja `DEPLOY.md` para instruções detalhadas.

