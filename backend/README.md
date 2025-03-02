# Backend - School Control

Este diretório contém a API e a lógica do servidor para o sistema de controle escolar.

## Tecnologias Utilizadas

- Node.js
- Express
- Mongoose
- TypeScript

## Configuração do Ambiente

1. Instale as dependências:
   ```sh
   pnpm install
   ```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` no diretório `backend` com as seguintes variáveis:
     ```env
     MONGO_URL=<sua-url-do-mongodb>
     PORT=<porta-do-servidor>
     ```

## Scripts Disponíveis

- `pnpm dev`: Inicia o servidor em modo de desenvolvimento.
- `pnpm start`: Inicia o servidor em modo de produção.

## Estrutura do Projeto

- `src/`: Contém o código-fonte do servidor.
  - `controllers/`: Controladores para as rotas da API.
  - `models/`: Modelos Mongoose.
  - `routes/`: Definições de rotas.
  - `services/`: Lógica de negócios e integração com o banco de dados.
  - `middleware/`: Middlewares personalizados.

## Licença

Este projeto está licenciado sob a licença MIT.