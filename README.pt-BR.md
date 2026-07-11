# Cadastro de Dispositivos — SEDCON / PROCON-RJ

Um sistema interno de inventário e gerenciamento de dispositivos desenvolvido para a equipe **SEDCON** do **PROCON-RJ**.

O objetivo deste projeto é centralizar o controle sobre o inventário de equipamentos de TI (computadores, telefones, switches, impressoras e appliances de segurança), facilitando a visualização de quais dispositivos estão atribuídos a colaboradores, quais estão sem atribuição e quais estão com defeito.

## Funcionalidades

- Criar, editar e excluir dispositivos
- Atribuir colaboradores a cada dispositivo (com edição em linha)
- Filtrar por categoria, status de atribuição e dispositivos com defeito
- Buscar por nome, endereço MAC, número de série ou colaborador responsável
- Exportar o inventário para Excel (.xlsx)
- Autenticação simples por usuário e senha
- Suporte a tema claro/escuro

## Tecnologias Utilizadas

**Backend**
- Java 17
- Spring Boot 3.2.5
- Spring Data JPA / Hibernate
- Spring Security (autenticação HTTP Basic)
- PostgreSQL
- Maven

**Frontend**
- React + TypeScript
- Vite
- TanStack Query (React Query)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- wouter (roteamento)
- SheetJS (exportação para Excel)

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- [Java 17 (JDK)](https://adoptium.net/)
- [Maven](https://maven.apache.org/download.cgi)
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/download/)

## Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/device-registration.git
cd device-registration
```

### 2. Configure o banco de dados

Crie um banco de dados PostgreSQL local (o projeto espera o nome `pcregister` por padrão):

```sql
CREATE DATABASE pcregister;
```

### 3. Configure as variáveis de ambiente do backend

Copie o arquivo de exemplo e preencha com suas credenciais reais:

```bash
cd backend/src/main/resources
cp application.properties.example application.properties
```

Edite o `application.properties` com:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pcregister
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA_DO_BANCO

app.user.guilherme.password=SUA_SENHA_DE_LOGIN
app.user.supervisor.password=SENHA_DO_SUPERVISOR
```

> ⚠️ Este arquivo **não é versionado no repositório** (está listado no `.gitignore`), pois contém credenciais sensíveis.

### 4. Execute o backend

```bash
cd backend
mvn spring-boot:run
```

O backend roda por padrão em `http://localhost:8080`.

### 5. Execute o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend roda por padrão em `http://localhost:5173`.

### 6. Acesse a aplicação

Abra o navegador em `http://localhost:5173` e faça login com um dos usuários configurados no passo 3.

## Estrutura do Projeto

```
device-registration/
├── backend/          # API Spring Boot
│   └── src/main/java/com/pcregister/
│       ├── config/       # Configuração de segurança
│       ├── controller/   # Endpoints REST
│       ├── model/        # Entidades JPA
│       ├── repository/   # Repositórios Spring Data
│       └── service/       # Lógica de negócio
└── frontend/         # Aplicação React
    └── src/
        ├── components/   # Componentes de UI
        ├── contexts/      # Contexto de autenticação
        ├── pages/         # Páginas da aplicação
        └── lib/           # Utilitários e schemas
```

## Autor

Desenvolvido por **Guilherme**, membro da equipe **SEDCON / PROCON-RJ**, com o objetivo de agilizar a organização e o controle do inventário de equipamentos de TI da instituição.
