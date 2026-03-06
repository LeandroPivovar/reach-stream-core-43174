# 🔒 Corrigir Erro: Mixed Content (HTTPS → HTTP)

## Problema
```
Mixed Content: The page at 'https://nucleocrm.com.br' was loaded over HTTPS, 
but requested an insecure resource 'http://nucleocrm.com.br:3010'
```

O frontend está em HTTPS mas a API está em HTTP. Navegadores bloqueiam isso.

## Solução: Proxy Reverso no Nginx

Configure o Nginx para fazer proxy HTTPS → HTTP internamente.

### 1. Editar configuração do Nginx do Frontend

```bash
sudo nano /etc/nginx/sites-available/nucleo-frontend
```

Adicione um bloco de proxy para a API:

```nginx
server {
    listen 80;
    server_name nucleocrm.com.br www.nucleocrm.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nucleocrm.com.br www.nucleocrm.com.br;

    # Certificados SSL (já configurados pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/nucleocrm.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nucleocrm.com.br/privkey.pem;

    # Caminho para os arquivos do frontend
    root /var/www/nucleo-crm/frontend/dist;
    index index.html;

    # Servir arquivos estáticos do frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ⭐ PROXY PARA API DO BACKEND
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Não cachear index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json;
}
```

### 2. Testar e recarregar Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Atualizar `.env.production` do Frontend

```bash
cd /var/www/nucleo-crm/frontend
nano .env.production
```

Altere para:
```env
VITE_API_URL=https://nucleocrm.com.br/api
```

### 4. Fazer novo build do frontend

```bash
npm run build
```

### 5. Recarregar Nginx novamente

```bash
sudo systemctl reload nginx
```

---

## Alternativa: Subdomínio separado para API

Se preferir usar `nucleocrm.com.brcrm.com.br`:

### 1. Criar configuração Nginx para API

```bash
sudo nano /etc/nginx/sites-available/nucleo-api
```

```nginx
server {
    listen 80;
    server_name nucleocrm.com.brcrm.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nucleocrm.com.brcrm.com.br;

    ssl_certificate /etc/letsencrypt/live/nucleocrm.com.brcrm.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nucleocrm.com.brcrm.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Ativar e configurar SSL

```bash
sudo ln -s /etc/nginx/sites-available/nucleo-api /etc/nginx/sites-enabled/
sudo certbot --nginx -d nucleocrm.com.brcrm.com.br
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Atualizar `.env.production`

```env
VITE_API_URL=https://nucleocrm.com.brcrm.com.br
```

---

## Verificar se funcionou

1. Abra: `https://nucleocrm.com.br`
2. Console (F12) → Network
3. Tente fazer login/registro
4. As requisições devem ir para `https://nucleocrm.com.br/api/...` ou `https://nucleocrm.com.brcrm.com.br/...`


