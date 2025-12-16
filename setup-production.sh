#!/bin/bash

# Script de Setup para Produção - Frontend
# Execute: bash setup-production.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando setup do Núcleo CRM Frontend em Produção..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo "   Instale Node.js v18 ou superior: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado:$(node --version)${NC}"

echo ""
echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔧 Verificando arquivo .env.production..."

if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.production não encontrado!${NC}"
    echo ""
    echo "Criando arquivo .env.production..."
    
    read -p "Digite a URL do backend API (ex: https://api.seu-dominio.com): " API_URL
    
    if [ -z "$API_URL" ]; then
        API_URL="http://localhost:3000"
        echo -e "${YELLOW}Usando URL padrão: $API_URL${NC}"
    fi
    
    # Criar .env.production
    cat > .env.production << EOF
# URL do Backend API
VITE_API_URL=$API_URL
EOF
    
    echo -e "${GREEN}✅ Arquivo .env.production criado!${NC}"
    echo ""
    echo "Configuração:"
    echo "  VITE_API_URL=$API_URL"
    echo ""
    echo -e "${YELLOW}⚠️  Você pode editar o arquivo .env.production a qualquer momento${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env.production encontrado${NC}"
    echo ""
    echo "Configuração atual:"
    cat .env.production
fi

echo ""
echo "🏗️  Compilando código para produção..."
npm run build

echo ""
echo -e "${GREEN}✅ Build concluído!${NC}"
echo ""
echo "Arquivos compilados estão em: dist/"
echo ""
echo "Próximos passos:"
echo "1. Configure o Nginx para servir os arquivos de dist/"
echo "2. Configure SSL/HTTPS (recomendado)"
echo "3. Verifique se o backend permite CORS do seu domínio"
echo ""
echo "📖 Para mais detalhes, consulte: DEPLOY.md"
echo ""
echo "Para testar localmente antes de configurar Nginx:"
echo "  npm run preview"

