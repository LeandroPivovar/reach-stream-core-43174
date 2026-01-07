# 🚀 Guia de Deploy do Frontend em Produção

Este guia explica como configurar e fazer deploy do frontend React/Vite em um servidor de produção.

## 📋 Pré-requisitos

- Node.js (v18 ou superior) instalado no servidor
- Nginx ou Apache instalado (para servir arquivos estáticos)
- Acesso SSH ao servidor
- Git instalado (para clonar o repositório)

---

## 🔧 Passo 1: Acessar o Servidor e Clonar o Código

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor.com

# Navegar até a pasta onde deseja instalar (exemplo: /var/www)
cd /var/www

# Clonar o repositório (ou fazer upload do código)
git clone seu-repositorio.git nucleo-crm
cd nucleo-crm/frontend
```

---

## 📦 Passo 2: Instalar Dependências

```bash
# Instalar dependências do Node.js
npm install

# OU se usar yarn
yarn install
```

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### Criar arquivo `.env.production`

```bash
# Na pasta frontend/
nano .env.production
# OU
vi .env.production
```

### Conteúdo do arquivo `.env.production`

```env
# URL do Backend API
# ⚠️ ALTERE para a URL real do seu backend em produção!
VITE_API_URL=https://api.seu-dominio.com
# OU se backend estiver na mesma máquina:
# VITE_API_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Substitua `https://api.seu-dominio.com` pela URL real do seu backend
- Se o backend estiver na mesma máquina, use `http://localhost:3000`
- Se usar HTTPS, certifique-se de que o backend também tenha SSL configurado

### Outros arquivos de ambiente (opcional)

Você pode criar diferentes arquivos para diferentes ambientes:

- `.env` - Desenvolvimento local
- `.env.production` - Produção (usado automaticamente no build)
- `.env.staging` - Ambiente de staging

**Salvar o arquivo:**
- **Nano**: `Ctrl + X`, depois `Y`, depois `Enter`
- **Vi**: `Esc`, depois `:wq`, depois `Enter`

---

## 🏗️ Passo 4: Fazer Build do Frontend

O build compila o código React/TypeScript em arquivos estáticos otimizados.

```bash
# Build para produção
npm run build
```

**O que isso faz?**
- Compila todo o código TypeScript/React
- Otimiza e minifica os arquivos
- Gera arquivos estáticos na pasta `dist/`
- Inclui as variáveis de ambiente do `.env.production`

**Verificar se funcionou:**
```bash
# Verificar se a pasta dist foi criada
ls -la dist/

# Deve conter arquivos como:
# - index.html
# - assets/ (com JS e CSS compilados)
```

---

## 🌐 Passo 5: Configurar Servidor Web (Nginx)

### Opção A: Servir arquivos estáticos diretamente

Criar configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/nucleo-frontend
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Caminho para os arquivos compilados
    root /var/www/nucleo-crm/frontend/dist;
    index index.html;

    # Configuração para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos (CSS, JS, imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Não cachear index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Ativar o site:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/nucleo-frontend /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### Opção B: Usar proxy reverso (se backend estiver em outra máquina)

Se o backend estiver em outro servidor ou porta:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/nucleo-crm/frontend/dist;
    index index.html;

    # Servir arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API do backend
    location /api {
        proxy_pass http://localhost:3000;
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Neste caso, ajuste o `.env.production`:**
```env
VITE_API_URL=https://seu-dominio.com/api
```

---

## 🔒 Passo 6: Configurar SSL/HTTPS

### Usando Certbot (Let's Encrypt - Grátis)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática (já configurado automaticamente)
sudo certbot renew --dry-run
```

Após configurar SSL, o Nginx será atualizado automaticamente para usar HTTPS.

---

## 🔄 Passo 7: Configurar CORS no Backend

Certifique-se de que o backend permite requisições do frontend.

No arquivo `backend/src/main.ts`, verifique:

```typescript
app.enableCors({
  origin: [
    'http://localhost:8080',        // Desenvolvimento
    'https://seu-dominio.com',      // Produção
    'https://www.seu-dominio.com'   // Produção com www
  ],
  credentials: true,
});
```

**⚠️ IMPORTANTE:** Adicione a URL do seu frontend em produção!

---

## 🚀 Passo 8: Testar o Deploy

### Verificar se o site está acessível:

```bash
# Testar localmente no servidor
curl http://localhost

# Ou abrir no navegador
# https://seu-dominio.com
```

### Verificar se a API está conectada:

1. Abra o site no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Tente fazer login ou registro
4. Verifique se não há erros de CORS ou conexão

---

## 🔄 Atualizar o Frontend (Após Deploy Inicial)

Quando houver novas atualizações:

```bash
# 1. Atualizar código
git pull origin main
# OU fazer upload dos novos arquivos

# 2. Instalar novas dependências (se houver)
npm install

# 3. Fazer novo build
npm run build

# 4. Recarregar Nginx (se necessário)
sudo systemctl reload nginx
```

**Nota:** Os arquivos na pasta `dist/` são substituídos automaticamente pelo novo build.

---

## 📝 Checklist de Deploy

- [ ] Código clonado/uploadado no servidor
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.production` criado e configurado
- [ ] URL da API configurada corretamente
- [ ] Build executado com sucesso (`npm run build`)
- [ ] Nginx configurado e funcionando
- [ ] SSL/HTTPS configurado (se necessário)
- [ ] CORS configurado no backend
- [ ] Site acessível e funcionando
- [ ] Testes realizados (login, registro, etc.)

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch" ou CORS

- Verifique se a URL da API no `.env.production` está correta
- Verifique se o backend permite CORS do seu domínio
- Verifique se o backend está rodando

### Erro: "404 Not Found" ao navegar entre páginas

- Certifique-se de que o Nginx tem `try_files $uri $uri/ /index.html;`
- Isso é necessário para SPAs (Single Page Applications)

### Erro: "Cannot GET /"

- Verifique se o caminho `root` no Nginx aponta para `frontend/dist`
- Verifique se o build foi executado com sucesso

### Arquivos não atualizam após novo build

- Limpe o cache do navegador (Ctrl+Shift+R)
- Verifique se o build foi executado na pasta correta
- Verifique permissões da pasta `dist/`

### Erro de permissão no Nginx

```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/nucleo-crm/frontend/dist
sudo chmod -R 755 /var/www/nucleo-crm/frontend/dist
```

---

## 📊 Otimizações Adicionais

### 1. Habilitar compressão Gzip (já incluído na configuração)

O Nginx já está configurado para comprimir arquivos.

### 2. Cache de arquivos estáticos (já incluído)

Arquivos CSS/JS são cacheados por 1 ano.

### 3. CDN (Opcional)

Para melhor performance global, considere usar um CDN como:
- Cloudflare
- AWS CloudFront
- Cloudflare Pages

### 4. Monitoramento

Considere adicionar:
- Google Analytics
- Sentry (para erros)
- Uptime monitoring

---

## 🔐 Segurança

### Headers de Segurança (Adicionar ao Nginx)

```nginx
# Adicionar dentro do bloco server
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Content Security Policy (CSP)

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
2. Console do navegador (F12)
3. Arquivo `.env.production` (URL da API correta)
4. Configuração de CORS no backend
5. Status do Nginx: `sudo systemctl status nginx`

---

**✅ Pronto! Seu frontend está configurado e rodando em produção!**


