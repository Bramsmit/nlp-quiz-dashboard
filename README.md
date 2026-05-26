# NLP Quiz Dashboard

Interactive React dashboard for NLP exam practice. The app uses a local 250-question quiz bank, supports single- and multiple-answer questions, adds one open exam-style question at the end, and can generate extra AI explanations for mistakes through a local API helper.

## Features

- 250 NLP practice questions from a local JSON question bank.
- English question bank generated from the original Dutch source.
- Session setup by topic, difficulty, question count, and shuffle mode.
- Answer options are reshuffled and relabeled for each session.
- Deferred grading: answer all multiple-choice questions first, then review.
- Final open exam-style question with text input and browser voice input.
- Results page with score, topic accuracy, mistake review, and retry-mistakes mode.
- Optional AI-generated contextual explanations for incorrect answers.
- No backend or database required for normal quiz use.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Lucide React icons
- Optional local Node.js helper for OpenAI API calls

## Getting Started

Install dependencies:

```bash
npm install
```

Run the quiz without AI features:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## AI Explanations

AI explanations are optional. They are used only for extra feedback on questions answered incorrectly. The OpenAI API key is read by the local helper server from `.env` and is never bundled into the frontend.

Create `.env` from the example:

```bash
cp .env.example .env
```

Set one of the supported key names:

```env
Open_AI_Key=your_openai_api_key_here
```

Then run:

```bash
npm run dev:ai
```

This starts both:

- Vite frontend on `http://localhost:5173/`
- Local AI helper on `http://127.0.0.1:8787/`

## Voice Input

The open question screen supports voice input through the browser Web Speech API. This requires a compatible browser and microphone permission. No OpenAI key is needed for voice input.

## Scripts

```bash
npm run dev                 # Start the frontend only
npm run dev:ai              # Start frontend and local AI helper
npm run api                 # Start only the local AI helper
npm run build               # Typecheck and create production build
npm run lint                # Typecheck without emitting files
npm run translate:questions # Regenerate the English question bank via OpenAI
```

## Data

- `src/data/nlp_250_quiz_questions.json`: original Dutch question bank.
- `src/data/nlp_250_quiz_questions.en.json`: English question bank used by the app.

## Security Notes

- Do not commit `.env`; it is ignored by Git.
- API calls are proxied through the local Node helper so the key is not exposed in browser code.
- The normal quiz flow works entirely offline after dependencies are installed.

