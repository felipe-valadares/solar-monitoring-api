#!/bin/sh
set -e

# Executar migrações
echo "Executando migrações..."
npm run migration:run

# Iniciar a aplicação
echo "Iniciando a aplicação..."
exec npm run start:prod 