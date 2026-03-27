# Portal do Investidor Evoque

Projeto base completo para o portal do investidor com:

- **Frontend React + Vite** na porta **3020**
- **Backend FastAPI** na porta **3008**
- **SQLite** no desenvolvimento
- área **admin** e área **investidor**
- base de segurança com CORS restrito, headers de segurança, autenticação JWT, rate limit em endpoints sensíveis, upload seguro de PDF e autorização por perfil/unidade

## Estrutura

```bash
portal-investidor-evoque/
  backend/
  frontend/
  README.md
```

## Backend

### Instalação

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# ou .venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 3008
```

### Admin padrão

```txt
email: admin@evoque.local
senha: Admin@1234
```

## Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Fluxo já implementado

- cadastro de investidor pendente de aprovação
- login com JWT
- CRUD básico de unidades
- listagem e edição de usuários
- upload de PDFs vinculado a unidades
- listagem de arquivos com permissão por unidade
- dashboard com resumo de uploads, unidades e usuários
- página do investidor com unidades e arquivos liberados

## Observações

- O layout foi montado para seguir bem de perto os prints enviados, com sidebar laranja, cards, tabela/lista e modal no estilo apresentado.
- O projeto foi organizado de forma modular para evoluir depois com PostgreSQL, logs, refresh token, CSRF em cookie, testes automatizados, auditoria mais profunda e storage externo.
