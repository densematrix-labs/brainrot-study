# Brainrot Study 🧠💀

Transform boring PDFs into addictive, TikTok-style learning content!

## Features

- 📄 **PDF Upload** - Upload any study material (max 10MB)
- 🧠 **Brainrot Mode** - AI converts content to Gen-Z style with memes and slang
- 🎮 **Quiz Games** - Interactive quizzes to test your knowledge
- 🎧 **Voice Mode** - Text-to-speech with engaging voices
- 🌍 **7 Languages** - EN, 中文, 日本語, Deutsch, Français, 한국어, Español

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **AI**: Claude via llm-proxy
- **TTS**: Edge TTS (free)
- **Payment**: Creem

## Development

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up -d --build
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `LLM_PROXY_KEY` - API key for llm-proxy
- `CREEM_API_KEY` - Creem payment API key
- `CREEM_WEBHOOK_SECRET` - Webhook verification secret
- `CREEM_PRODUCT_IDS` - JSON mapping of product IDs

## Testing

```bash
# Backend
cd backend
pytest --cov=app --cov-fail-under=95

# Frontend
cd frontend
npm run test:coverage
```

## Deployment

Deployed to: https://brainrot-study.demo.densematrix.ai

- Frontend Port: 30067
- Backend Port: 30068

## License

© 2026 DenseMatrix. All rights reserved.
