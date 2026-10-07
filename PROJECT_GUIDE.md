# BotForge: simple guide

How this website works, what it is built with, and how to explain it in an interview.

---

## 1. What is BotForge?

A website where people **make their own AI chatbots**. You give a bot a name, an emoji and a few lines about its personality, then chat with it. You can keep a bot **private** or make it **public** so other users can find and chat with it. Bots **remember the conversation** and can **reply with pictures**.

## 2. The 30-second answer

> "BotForge is a full-stack chatbot builder. The frontend is React with Tailwind CSS, and the backend is a FastAPI server in Python with a SQLite database through SQLAlchemy. Users sign up with JWT login, create bots with their own system prompt, and chat with them. For each message, the backend sends the bot's personality plus the last 20 messages to a language model API, so the bot remembers the conversation. It also supports public and private bots, image replies, a typing animation and day/night mode."

---

## 3. What I used, and why

| Part | Tool | What it does here | Why I picked it |
|---|---|---|---|
| Frontend | **React** | Builds all the screens out of components | Most common UI library |
| | **Vite** | Runs the React app while developing and builds it | Very fast and simple to set up |
| | **Tailwind CSS** | Styling with small classes like `p-4`, `text-sm` | No separate CSS files for every component |
| | **React Router** | Moves between pages (`/login`, `/my-bots`, `/chat/5`) without reloading | Standard for React apps |
| | **react-markdown** | Shows **bold**, lists and code in bot replies | AI replies often use markdown |
| Backend | **Python + FastAPI** | The API server: login, bots, chats | Fast, simple, gives automatic API docs at `/docs` |
| | **SQLAlchemy** | Talks to the database using Python classes instead of raw SQL | Can switch to PostgreSQL by changing one line |
| | **SQLite** | The database (one file, `chatbots.db`) | No setup needed |
| | **Pydantic** | Checks incoming data (e.g. password at least 6 characters) | Built into FastAPI |
| | **PyJWT** | Creates login tokens | Standard way to keep users logged in for an API |
| | **httpx** | Calls the AI API from the backend | Supports `async`, so the server doesn't freeze while waiting |
| AI | **Any OpenAI-compatible API** (Groq by default) | Writes the bot's replies | Groq and Gemini have free tiers; switch by editing `.env` |
| | **Pollinations.ai** | Makes the pictures | Free, no API key |
| Testing | **pytest** | 6 automated tests for the backend | Checks login, privacy rules, memory, images, AI errors |

---

## 4. How the pieces connect

```
 Browser (React app)                 Backend (FastAPI)                  Outside services
 ───────────────────                 ─────────────────                  ────────────────
  Login / Explore /    ── /api/... ─▶  routers/auth.py   ──▶  SQLite
  My bots / Chat pages ◀── JSON ────   routers/bots.py         database
                                       routers/chats.py
                                            │
                                            └── llm.py ── HTTP ──▶  AI model API (Groq…)
                                                                    Pollinations (images)
```

- The **frontend** never talks to the database or the AI directly. It only calls the backend's `/api/...` URLs.
- The **backend** checks who you are, reads and writes the database, and calls the AI.
- In development, Vite forwards every `/api` request from port 5173 to the backend on port 8000.

---

## 5. What happens when…

### …you sign up or log in
1. The form sends your username, email and password to `POST /api/auth/register` (or `/login`).
2. The backend **never stores the real password**. It stores a hash, made with PBKDF2-SHA256 plus a random salt (`backend/app/auth.py`).
3. It sends back a **JWT token**, a signed string that says "this is user 7" and expires after 24 hours.
4. The browser saves the token and attaches it to every request: `Authorization: Bearer <token>`.
5. On each request the backend checks the token's signature. If it's fake or expired, the answer is `401 Not authenticated`.

### …you create a bot
1. The "New bot" form sends name, emoji, description, personality, and the two switches to `POST /api/bots`.
2. The backend saves a row in the `bots` table with `owner_id` = you.
3. The **personality** is the bot's **system prompt**: hidden instructions the AI follows. Only the owner can see it; the API hides it from everyone else.

### …a bot is public or private
- **Private:** only the owner can see it or chat with it.
- **Public:** it shows up on Explore and anyone logged in can chat.
- One function, `get_visible_bot()` in `routers/bots.py`, does this check everywhere. If the owner later makes the bot private, other people's chats with it stop working.

### …you send a message (and how the memory works)
1. The frontend sends your text to `POST /api/conversations/{id}/messages`.
2. The backend saves your message in the `messages` table.
3. It builds the request for the AI (`llm.py`):
   - first the bot's **system prompt** (its personality),
   - then the **last 20 messages** of this chat.
4. That list of messages is the "memory". The AI itself remembers nothing, so we send the recent history every time.
5. The AI's answer is saved and sent back to the browser.
6. If there's no API key in `.env`, the app runs in **demo mode** and sends a sample reply instead, so it works without any account.

### …the bot sends a picture
- The system prompt tells the AI: *"if an image would help, add a line like `[IMAGE: description]`"*.
- The backend finds that tag, removes it from the text, and turns the description into an image link from Pollinations.ai.
- The link is saved with the message, and the browser shows the picture under the reply.

### …the reply "types" itself out
- This is **only in the frontend** (`components/Typewriter.jsx`). The full reply arrives at once, and the component reveals it a few words at a time with a blinking cursor.
- Long replies speed up so the animation never takes more than about 3 seconds.

### …you switch day / night mode
- All colors are **CSS variables** (like `--color-accent`) in `src/index.css`.
- Night mode is navy with teal; day mode is warm white with sun yellow.
- The sun/moon button sets `data-theme="light"` or `"dark"` on the page, and the browser swaps every color at once.
- Your choice is saved in the browser. The first visit follows your device's setting.

---

## 6. The database (4 tables)

| Table | Main columns | Meaning |
|---|---|---|
| `users` | id, username, email, hashed_password | People with accounts |
| `bots` | id, owner_id, name, avatar, description, system_prompt, is_public, image_replies | The bots people make |
| `conversations` | id, user_id, bot_id, title | One chat between a user and a bot |
| `messages` | id, conversation_id, role (`user`/`assistant`), content, image_url | Every message in a chat |

Links: a user has many bots, a bot has many conversations, a conversation has many messages. Deleting a bot also deletes its chats.

---

## 7. Every file, in one line

```
ai-chatbot-platform/
├── start-backend.bat        Double-click: sets up Python and starts the backend
├── start-frontend.bat       Double-click: installs packages and starts the website
├── README.md                Project summary for GitHub
├── PROJECT_GUIDE.md         This guide
│
├── backend/
│   ├── requirements.txt     Python packages to install
│   ├── .env.example         Settings template (API key, database, secret key)
│   ├── app/
│   │   ├── main.py          Creates the FastAPI app and connects the routers
│   │   ├── config.py        Reads settings from .env
│   │   ├── database.py      Connects to the database
│   │   ├── models.py        The 4 tables as Python classes
│   │   ├── schemas.py       Shapes of data going in and out (with validation)
│   │   ├── auth.py          Password hashing, JWT tokens, "who is logged in"
│   │   ├── llm.py           Builds the prompt + memory, calls the AI, finds image tags
│   │   └── routers/
│   │       ├── auth.py      /api/auth: register, login, me
│   │       ├── bots.py      /api/bots: create, list, search, edit, delete
│   │       └── chats.py     /api/conversations: start chat, send message, delete
│   └── tests/test_api.py    Automated tests
│
├── frontend/
│   ├── index.html           The single HTML page (also picks day/night before loading)
│   ├── package.json         JavaScript packages
│   ├── vite.config.js       Dev server + forwards /api to the backend
│   └── src/
│       ├── main.jsx         Starts React
│       ├── App.jsx          The list of pages (routes)
│       ├── api.js           One helper for all backend calls (adds the token)
│       ├── AuthContext.jsx  Remembers who is logged in, for every page
│       ├── index.css        Colors for both themes + shared styles
│       ├── pages/
│       │   ├── Landing.jsx  Home page before login
│       │   ├── AuthPage.jsx Log in / sign up
│       │   ├── Explore.jsx  Public bots with search
│       │   ├── MyBots.jsx   Your bots: create, edit, delete
│       │   └── Chat.jsx     The chat screen
│       └── components/
│           ├── Layout.jsx      Sidebar with your recent chats
│           ├── BotCard.jsx     One bot's card
│           ├── BotForm.jsx     The create/edit bot popup
│           ├── Typewriter.jsx  The typing animation
│           ├── ThemeToggle.jsx The day/night button
│           ├── theme.jsx       Bot colors, avatar tile, hand-drawn underline
│           └── icons.jsx       Small SVG icons and the logo
│
└── docs/screenshots/        Pictures used in the README
```

---

## 8. How to run it (Windows)

You need **Python 3.10+** and **Node.js 18+**.

1. Double-click `start-backend.bat` (the first time it installs everything).
2. Double-click `start-frontend.bat`.
3. Open **http://localhost:5173**.
4. For real AI replies: get a free key at console.groq.com, open `backend\.env`, paste it after `LLM_API_KEY=`, and restart the backend.

**Free plan limits:** Groq allows about 30 messages a minute and 1,000 a day. If someone goes over, the bot shows "too many messages right now, please wait a minute" instead of crashing. Online, the key goes in the hosting site's environment variables, never in GitHub.

Extra: the API docs are at **http://127.0.0.1:8000/docs**. Run the tests with `cd backend` then `pytest`.

---

## 9. Interview questions you might get

**Q: Why FastAPI and not Django or Express?**
FastAPI is light, quick to write, checks request data automatically with Pydantic, and gives free API docs. Django would bring a lot I didn't need, like templates and an admin panel.

**Q: How does login work?**
Passwords are stored as salted PBKDF2 hashes, never as plain text. After login the server returns a JWT that expires in 24 hours. The frontend sends it in the `Authorization` header and the backend checks the signature on every request.

**Q: How does the bot remember the conversation?**
The AI model has no memory of its own. Every time, I send the bot's system prompt plus the last 20 messages of that chat. 20 is a setting (`MEMORY_MESSAGES`) so it doesn't grow forever and cost too much.

**Q: How do you stop people from using someone else's private bot?**
Every endpoint that touches a bot goes through `get_visible_bot()`, which allows it only if you are the owner or the bot is public. Conversations are checked the same way: you can only open your own. The tests cover this.

**Q: How do image replies work?**
I ask the model to add `[IMAGE: description]` when a picture would help. The backend pulls that out with a regular expression and turns it into an image URL. The model never makes the image itself.

**Q: Is the typing animation real streaming?**
No. The reply arrives complete and the frontend reveals it word by word. Real streaming (server-sent events) is a next step I'd add.

**Q: How do the two color themes work?**
Every color is a CSS variable. The toggle changes one attribute on the page and the variables switch values, so no component needs special dark-mode code.

**Q: What would you improve?**
Real streaming replies, PostgreSQL and deployment (e.g. Render or Railway), rate limiting so one user can't burn through the API, and uploading your own image as a bot avatar.

**Q: What was tricky?** (one example you can use)
Getting the chat flow right: keeping the right message order, saving the user's message before calling the AI, and not saving anything if the AI call fails.

---

## 10. Known limits (good to say honestly)

- Replies aren't truly streamed (see above).
- SQLite is fine for a demo, but a real deployment should use PostgreSQL.
- The JWT is kept in the browser's localStorage. That's simple, but an httpOnly cookie is safer.
- No rate limiting yet.

---

## 11. A note on how it was made

This project was built with help from an AI coding assistant. If someone asks, it's fine to say so. What matters is that you can explain every part, and this guide covers all of it. Open each file next to its section above and read it once; most files are short.
