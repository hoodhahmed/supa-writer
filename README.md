# SupaWriter

A modern AI-assisted writing tool built with FastAPI and React.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Supabase Account

### 🛠️ Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor to create the necessary tables:

```sql
-- Create Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lastmodified BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create User Stats Table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  checksdone INTEGER DEFAULT 0,
  rephrasedcount INTEGER DEFAULT 0,
  wordsrephrased INTEGER DEFAULT 0,
  humancontent TEXT DEFAULT '0%',
  aicontent TEXT DEFAULT '0%',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);
```

### ⚙️ Environment Configuration

1. **Root Directory**: Copy `.env.example` to `.env` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env
   ```

2. **Backend**: The backend will read the `.env` from the root directory when running via Docker, or you can create one in `backend/`.

### 📦 Installation & Running

#### Using Docker (Recommended)
```bash
docker-compose up --build
```

#### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: FastAPI, Pydantic, Supabase Python SDK
- **AI Integration**: Custom rephrasing and AI detection endpoints

## 📝 License
MIT
