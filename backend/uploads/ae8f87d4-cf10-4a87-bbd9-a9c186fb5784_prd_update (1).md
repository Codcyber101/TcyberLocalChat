# 📄 Product Requirements Document (PRD)

**Project Name**: Conversational AI Web Assistant\
**Platform**: Web Application (SPA + SSR)\
**Target Users**: Researchers, knowledge workers, students, and teams working with documents or complex queries.

---

## 🎯 1. Goals & Vision

Develop a secure, performant, and intuitive **web application** that enables users to:

- Upload and analyze documents in natural language
- Chat with an AI assistant about arbitrary topics
- Retrieve real-time web information
- Fall back to multiple cloud LLMs (Gemini, GPT-4, Claude, etc.) for complex tasks
- Offer a polished, accessible, and customizable user experience

---

## ✨ 2. Core Features & Functionality

**Update:** Now includes integrated memory system and LangChain-based tools for dynamic interaction.

| Feature                          | Description                                                                      |   |
| -------------------------------- | -------------------------------------------------------------------------------- | - |
| 🗂 **Document Upload & Parsing** | Upload PDFs, DOCX, TXT, Markdown. Parse and chunk on the backend.                |   |
| 🧠 **Conversational AI Chat**    | Engage in real-time natural language Q&A with memory and context switching       |   |
| 📄 **Citation-Aware Responses**  | Return answers with doc references and source anchors                            |   |
| 🌐 **Web RAG Integration**       | Pull real-time data from Wikipedia, ArXiv, GitHub, news, via hybrid RAG flow     |   |
| ⚙️ **Multi-Model Fallback**      | Use fallback LLMs based on task complexity or failure (Gemini, GPT-4, Claude)    |   |
| 💬 **Multi-Session Chat**        | Track multiple conversations with saved context, titles, and history             |   |
| 🔄 **Model + Plugin Panel**      | Select Ollama/local model (when supported) or fallback LLM. Toggle plugins       |   |
| 🎛 **Settings Panel**            | Theme, tone, verbosity, fallback logic, export format                            |   |
| 📤 **Export/Save Chats**         | Export session as Markdown, PDF, or JSON                                         |   |
| 📚 **Prompt Template Library**   | Predefined prompt formats for summarization, extraction, synthesis               |   |
| 🧠 **Memory System**             | Retains user preferences, recent queries, and context for smarter replies        |   |
| 🔌 **Tool Integration**          | Dynamically uses tools like calculator, web search, document parser, code runner |   |
| 🔐 **Authentication (optional)** | Anonymous or account-based (OAuth) for multi-device access and session sync      |   |

---

## 💡 3. Optional Enhancements (Strongly Recommended)

| Feature                     | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| 🧵 Threaded Conversations   | Organize messages into sub-chats by topic or document                  |
| 🔌 Plugin SDK               | Add tools: calculator, CSV/table visualizer, code explainer            |
| 🎤 Voice Input              | Push-to-talk with Whisper or Web Speech API                            |
| 🧠 AI-Powered Prompt Studio | Save + suggest prompt formats for summarization, extraction, synthesis |
| 📊 Token & Usage Metrics    | Monitor cost, token count, response time per query or session          |
| 🖼️ Visual Q&A              | Use BLIP2/CLIP to support image-based document analysis                |
| 📎 Browser Extension        | Chrome/Firefox tool to “Analyze this page” with one click              |
| 🔄 Real-Time Collaboration  | Shared chat sessions or docs between users (via Supabase or WebRTC)    |

---

## 🧠 3A. Memory & Tooling Integration

### Memory System (LangChain)

| Memory Type     | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| Short-Term      | Retain recent dialogue in context window                   |
| Long-Term       | Recall past chats or document topics via vector embeddings |
| Episodic        | Track tasks, document chains, summaries                    |
| User Preference | Memory of tone, verbosity, last used model, favorite tools |

- Use `ConversationBufferMemory` and `VectorStoreRetrieverMemory`
- Store user-entity embeddings in Qdrant or PostgreSQL
- Settings UI to toggle/clear memory scopes

### Tool Agent System (LangChain Agents)

| Tool            | Description                                    |
| --------------- | ---------------------------------------------- |
| 🔍 Web Search   | Uses Wikipedia + SerpAPI                       |
| 📊 Calculator   | Math tool with expression parser               |
| 📄 Doc Parser   | Semantic querying of uploaded files            |
| 💻 Python Tool  | Sandboxed REPL execution (server-side)         |
| 📈 CSV Analyzer | Preview, summarize, filter CSV/Excel documents |

- Tools defined using LangChain Tool class
- Dynamically routed based on user intent or UI buttons
- UI exposes plugin drawer for user-triggered tools

---

## 🧰 4. Web Tech Stack (Expanded)

### ✅ Frontend

| Tool                | Purpose                   | Notes                                              |
| ------------------- | ------------------------- | -------------------------------------------------- |
| **Next.js 15+**     | Fullstack React Framework | App Router, layouts, edge-ready routing            |
| **TypeScript**      | Type-safe JavaScript      | Industry standard for maintainable codebases       |
| **Tailwind CSS**    | Utility-first styling     | Rapid development, responsive by default           |
| **shadcn/ui**       | UI library                | Accessible, customizable Tailwind-based components |
| **Framer Motion**   | Animations                | Smooth page transitions, element fades             |
| **Zustand**         | Global state management   | Lightweight state store                            |
| **React Hook Form** | Form logic                | Easy input validation + dynamic fields             |

### ✅ Backend & APIs (Python)

| Tool                        | Purpose                      | Notes                                                       |
| --------------------------- | ---------------------------- | ----------------------------------------------------------- |
| **FastAPI**                 | REST API backend             | Pythonic async API framework with OpenAPI docs              |
| **LangChain (Python)**      | RAG pipeline + orchestration | Supports local models + fallback + chaining                 |
| **Wikipedia API**           | RAG source (web content)     | Used via LangChain document loader                          |
| **SerpAPI**                 | Search engine integration    | Access Google/Bing data as needed for real-time enhancement |
| **Qdrant**                  | Vector DB                    | Fast, scalable, easy Dockerized vector search               |
| **PostgreSQL (SQLAlchemy)** | Persistent storage           | For chat logs, doc metadata, prompt templates               |

### ✅ Infrastructure & DevOps

| Tool                          | Purpose                 | Notes                                      |
| ----------------------------- | ----------------------- | ------------------------------------------ |
| **Docker**                    | Environment consistency | Containers for backend, vector DB          |
| **Nginx**                     | Reverse proxy / SSL     | Gateway between FastAPI and frontend       |
| **GitHub Actions**            | CI/CD automation        | Python lint + test + deploy flows          |
| **Railway / Fly.io / Vercel** | Hosting                 | Choose per component (backend vs frontend) |

### ✨ Prompt Builder (New)

Add a dedicated **Prompt Builder** component that supports best practices in context engineering. It enables users to construct structured prompts that improve LLM reliability and reduce hallucinations.

#### Features:

- Role definition input ("Act as a legal assistant…")
- Task constraints ("Use short paragraphs", "Avoid citations")
- Example/Template insertion (user- or system-defined)
- Final Prompt Preview (live)
- Token usage estimator

#### UI Placement:

- Toggleable section above the chat input
- Previews the full final prompt assembled in real-time
- Integrated with slash commands like `/summarize`, `/analyze`

#### Benefits:

- Guides users through structured, reusable prompt formatting
- Promotes clearer, more effective interactions with LLMs
- Inspired by insights from context-engineering-intro by Cole Medin

### 🔧 Design Language

- **Visual Style**: Clean, minimal, semantic colors (inspired by Linear & Notion)
- **Themes**: Light/Dark toggle
- **Typography**: Inter (UI), JetBrains Mono (code)
- **Accessibility**: WCAG 2.1 AA, ARIA, keyboard navigation

### 🧩 Layout Structure

```
+--------------------------------------------------------------------+
| Sidebar        | Top Bar (🧠 Model Selector | 👤 Profile ▼)           |
|----------------+---------------------------------------------------|
| - ➕ New Chat   |                                                   |
| - 🗂 Chats      |  Main Chat Panel (Markdown Q&A, fallback badges)  |
| - 📄 Docs       |                                                   |
| -     |                                                   |
+----------------+---------------------------------------------------+
|  Input Box [ Type here... | 📎 | 🎤 | 🌐 Web Toggle | ➕ Plugins ]     |
+--------------------------------------------------------------------+
|                     ⚙️ Settings under Profile Dropdown              |
+--------------------------------------------------------------------+
```

### 🔍 Component Highlights

| Component               | Functionality                                                           |
| ----------------------- | ----------------------------------------------------------------------- |
| **New Chat Button**     | Resets context and starts fresh conversation                            |
| **Chat Panel**          | Markdown messages with citations, fallback model badges, nested replies |
| **Input Toolbar**       | File upload, plugin toggle, voice input, prompt templates               |
| **Settings Modal**      | Themes, fallback order, verbosity, export format                        |
| **Model Badge Display** | Tags each answer with model source (local/Gemini/GPT-4/etc.)            |

---

## 🧑‍💻 6. Key Functional Flows

### 🧠 Prompt Engineering Flow (NEW)

- User activates Prompt Builder
- Inputs Role, Constraints, and optionally, Example
- Adds the Task Prompt → system assembles the final formatted context
- Final prompt = [Role] + [Constraints] + [Example] + [Prompt]
- Preview shown → submission to Ollama/cloud model
- Token count updated live
- Used in both document-based and freeform chats

### 📂 Document Q&A Flow

- User uploads doc → backend parses, chunks → stores in vector DB
- User query → embedded → matched to chunks → AI responds
- UI displays: text + source quote + doc badge

### 🌐 Web Search + Fallback Flow

- Query goes to preferred model (local/Ollama)
- On fail or escalation, system invokes fallback (via OpenRouter)
- Gemini/GPT-4 responds → model badge + retry locally option shown

---

## 📋 7. Non-Functional Requirements

\| Context Engineering  | Prompt sections ordered as [Role → Constraint → Example → Query]         | | Token Budget Display | Token use calculated and shown per section in Prompt Builder UI         | | Prompt Reuse Support | Store/edit prompt templates locally; sync optionally to cloud backend    |

| Category          | Requirement                                                 |
| ----------------- | ----------------------------------------------------------- |
| ⏱ Performance     | Chat latency < 2s, doc parse under 5s                       |
| 🔐 Security       | JWT-based auth, encrypted chat store, sandboxed API uploads |
| 📈 Scalability    | Stateless backend, horizontally scalable RAG & search       |
| 🌐 Accessibility  | Fully keyboard operable, screen reader support              |
| 🌍 i18n Readiness | Use translation files for multilingual UI                   |

---

## 🚀 8. Milestones & Timeline

| Phase   | Objective                             | Duration |
| ------- | ------------------------------------- | -------- |
| Phase 1 | Chat UI + Doc Upload + State Logic    | Week 1–2 |
| Phase 2 | Vector Indexing + RAG Pipeline        | Week 3   |
| Phase 3 | Web Search API + Model Fallback Flow  | Week 4   |
| Phase 4 | Plugins + Export + History Management | Week 5   |
| Phase 5 | Auth, UI Settings, Prompt Library     | Week 6   |
| Phase 6 | Final polish + Deployment + Docs      | Week 7   |

---

## 🗄️ 10. Data Strategy: Local + Cloud

### Context Engineering Storage (NEW)

- Locally cache user-created prompts in IndexedDB
- Store examples, roles, and templates in reusable format
- Optionally sync with Supabase for multi-device use
- Token cost tracking for saved prompt sets

### Hybrid Storage Design

To support both privacy-first use cases and multi-device persistence, the application will implement a hybrid data storage model:

#### 🧠 Local Storage (Browser-side)

- **IndexedDB / LocalStorage** for:
  - Temporary chat sessions
  - Embedding/vector cache (if needed)
  - Preferences (theme, verbosity, UI settings)
  - Offline-first sessions and drafts

#### ☁️ Cloud Storage (Server-side)

- **Supabase (PostgreSQL + Auth)** or **MongoDB Atlas** for:
  - User accounts and OAuth integration
  - Document metadata and chat history
  - Plugin usage logs and preferences

#### 🔄 Sync Strategy

- Optional user-driven sync for offline → online conversion
- Merge local sessions into cloud history after login
- Cloud fallback enabled only with consent and encryption

---

## 📦 11. Final Deliverables

- Web application (Next.js + Tailwind + LangChain.js)
- Multi-LLM fallback + vector-based doc search
- Settings, export, plugin panel, prompt studio
- Markdown-rendered chat UI with model-aware UX
- Full README, Dockerfile, and deployment script (Vercel-ready)

