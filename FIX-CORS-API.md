# 🔧 Corrigir Erro de CORS e API

## Problema
O frontend está tentando acessar `http://localhost:3000` quando deveria acessar a URL do backend em produção.

## Solução

### 1. Criar/Editar `.env.production`

No servidor, na pasta `frontend/`:

```bash
cd frontend
nano .env.production
```

**Conteúdo (AJUSTE A URL DO BACKEND!):**

```env
# URL do Backend API em produção
# ⚠️ SUBSTITUA pela URL real do seu backend!
VITE_API_URL=http://api.nucleocrm.shop:3000
# OU se o backend estiver na mesma máquina mas em porta diferente:
# VITE_API_URL=http://nucleocrm.shop:3000
# OU se usar HTTPS:
# VITE_API_URL=https://api.nucleocrm.shop
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

### 2. Fazer novo build

```bash
# Na pasta frontend/
npm run build
```

Isso vai recompilar com a URL correta da API.

### 3. Recarregar Nginx

```bash
sudo systemctl reload nginx
```

---

## ⚠️ IMPORTANTE: Configurar CORS no Backend

O backend também precisa permitir requisições do frontend.

### Editar `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:8080',           // Desenvolvimento
    'http://nucleocrm.shop',           // Produção HTTP
    'https://nucleocrm.shop',          // Produção HTTPS
    'http://www.nucleocrm.shop',       // Produção com www
    'https://www.nucleocrm.shop',      // Produção HTTPS com www
  ],
  credentials: true,
});
```

### Reiniciar o backend:

```bash
# Se usar PM2
pm2 restart nucleo-backend

# Se usar systemd
sudo systemctl restart nucleo-backend
```

---

## Verificar se funcionou

1. Abra o site: `http://nucleocrm.shop`
2. Abra o Console (F12)
3. Tente fazer login/registro
4. Não deve mais aparecer erro de CORS

---

## Se ainda não funcionar

### Verificar qual URL está sendo usada:

1. Abra o Console (F12)
2. Vá em Network (Rede)
3. Tente fazer uma requisição
4. Veja qual URL está sendo chamada

Se ainda estiver usando `localhost:3000`, o build não pegou a variável. Verifique:
- O arquivo `.env.production` existe?
- O build foi feito após criar o arquivo?
- A variável está escrita corretamente? (deve ser `VITE_API_URL`)


