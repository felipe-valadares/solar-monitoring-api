# API de Monitoramento de Usinas Fotovoltaicas

API RESTful para monitoramento e análise de dados de usinas fotovoltaicas, desenvolvida com NestJS e TypeScript.

## Tabela de Conteúdos

- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
  - [Clone e Dependências](#clone-e-dependências)
  - [Configuração do Ambiente](#configuração-do-ambiente)
- [Migrações do Banco de Dados](#migrações-do-banco-de-dados)
- [Uso da API](#uso-da-api)
  - [Documentação Swagger](#documentação-swagger)
  - [Endpoints Principais](#endpoints-principais)
- [Testes](#testes)
- [Deploy](#deploy)
  - [Usando Docker](#usando-docker)
  - [Usando Docker Compose](#usando-docker-compose)
- [Arquitetura](#arquitetura)
- [Licença](#licença)

## Funcionalidades

- **Usinas Fotovoltaicas**
  - CRUD completo para gerenciamento de usinas.
  - Cálculo de geração total.

- **Inversores**
  - CRUD completo para gerenciamento de inversores.
  - Cálculo de potência máxima por dia.
  - Cálculo de temperatura média por dia.
  - Cálculo de geração total.

- **Importação de Dados**
  - Importação de métricas via arquivo JSON.
  - Importação de dados de amostra para testes.

## Requisitos

- **Node.js** (v14 ou superior)
- **PostgreSQL** (v12 ou superior)
- **npm** ou **yarn**

## Instalação

### Clone e Dependências

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/felipe-valadares/solar-monitoring-api.git
   cd solar-monitoring-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

### Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=solar_monitoring
   ```

## Migrações do Banco de Dados

O projeto utiliza as migrações do TypeORM para gerenciar o esquema do banco de dados.

- **Executar todas as migrações pendentes:**
  ```bash
  npm run migration:run
  ```

- **Reverter a última migração:**
  ```bash
  npm run migration:revert
  ```

- **Excluir todos os dados do banco de dados:**
  ```bash
  npm run schema:drop
  ```

- **Gerar uma nova migração (após alterações nas entidades):**
  ```bash
  npm run migration:generate -- -n solar_monitoring_migration
  ```

## Uso da API

Após a instalação e configuração, inicie o servidor de desenvolvimento:

   ```bash
   npm run start:dev
   ```

A API estará disponível em: 

   ```
   http://localhost:3000
   ```

### Documentação Swagger

A documentação completa da API pode ser acessada em:

```
http://localhost:3000/api
```

### Endpoints Principais

#### Usinas

- `GET /plants` - Listar todas as usinas
- `GET /plants/:id` - Obter uma usina pelo ID
- `POST /plants` - Criar uma nova usina
- `PATCH /plants/:id` - Atualizar uma usina
- `DELETE /plants/:id` - Remover uma usina
- `GET /plants/:id/generation?startDate=...&endDate=...` - Calcular geração total da usina

#### Inversores

- `GET /inverters` - Listar todos os inversores
- `GET /inverters/:id` - Obter um inversor pelo ID
- `POST /inverters` - Criar um novo inversor
- `PATCH /inverters/:id` - Atualizar um inversor
- `DELETE /inverters/:id` - Remover um inversor
- `GET /inverters/:id/max-power?startDate=...&endDate=...` - Obter potência máxima por dia
- `GET /inverters/:id/avg-temperature?startDate=...&endDate=...` - Obter temperatura média por dia
- `GET /inverters/:id/generation?startDate=...&endDate=...` - Calcular geração total do inversor

#### Importação de Dados

- `POST /import/metrics` - Importar métricas de um arquivo JSON
- `POST /import/metrics/sample` - Importar dados de amostra para testes

**Exemplo para importar dados de amostra via `curl`:**
```bash
curl -X POST http://localhost:3000/import/metrics/sample
```

## Testes

Para executar os testes unitários:
```bash
npm run test
```

Para executar os testes com cobertura:
```bash
npm run test:cov
```

## Deploy

### Usando Docker

1. **Construa a imagem Docker:**
   ```bash
   docker build -t solar-monitoring-api .
   ```

2. **Execute o contêiner:**
   ```bash
   docker run -p 3000:3000 --env-file .env solar-monitoring-api
   ```

### Usando Docker Compose

1. Crie um arquivo `docker-compose.yml` com o seguinte conteúdo:
   ```yaml
   version: '3'
   services:
     api:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DB_HOST=db
         - DB_PORT=5432
         - DB_USERNAME=postgres
         - DB_PASSWORD=postgres
         - DB_NAME=solar_monitoring
       depends_on:
         - db
     db:
       image: postgres:13
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_DB=solar_monitoring
       volumes:
         - postgres_data:/var/lib/postgresql/data
   volumes:
     postgres_data:
   ```

2. Execute o Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Arquitetura

O projeto adota uma arquitetura modular baseada em domínios:

- **Módulos:** Cada domínio (usinas, inversores, métricas) possui seu próprio módulo.
- **Controladores:** Gerenciam as requisições HTTP e retornam as respostas.
- **Serviços:** Contêm a lógica de negócio da aplicação.
- **Entidades:** Representam as tabelas do banco de dados.
- **DTOs:** Validação dos dados de entrada.

**Tecnologias Utilizadas:**

- **NestJS:** Framework para construção de APIs escaláveis com TypeScript.
- **TypeORM:** Facilita a interação com o banco de dados.
- **PostgreSQL:** Banco de dados relacional.
- **Swagger/OpenAPI:** Documentação interativa da API.
- **Jest:** Framework para testes unitários.


