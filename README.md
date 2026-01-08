# Classroom AI

Nền tảng giao bài tập & kiểm tra thông minh cho giáo viên và học sinh.

## Tính năng

- **Giáo viên**: Tạo lớp, upload tài liệu, AI tạo câu hỏi, giao bài tập, chấm bài
- **Học sinh**: Làm bài tập, xem kết quả, theo dõi tiến độ
- **AI**: Tự động tạo câu hỏi từ tài liệu, gợi ý chấm tự luận

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4o / Claude
- **Icons**: Lucide React

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd classroom-ai
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
pnpm install
```

### 3. Cấu hình môi trường

Tạo file `.env.local` từ template:

```bash
cp .env.local.example .env.local
```

Điền các giá trị:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-api-key
```

### 4. Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Chạy SQL schema:
   - Mở SQL Editor trong Supabase Dashboard
   - Copy nội dung file `supabase/schema.sql`
   - Chạy SQL

### 5. Chạy development server

```bash
npm run dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (đăng nhập, đăng ký)
│   ├── (teacher)/         # Teacher dashboard
│   ├── (student)/         # Student dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # UI components (Button, Card, etc.)
│   ├── layout/            # Layout components
│   └── features/          # Feature components
├── lib/
│   ├── supabase/          # Supabase clients
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra lint
npm run db:generate  # Generate TypeScript types từ Supabase
```

## Demo Accounts

- **Giáo viên**: teacher@demo.com / 123456
- **Học sinh**: student@demo.com / 123456

## License

MIT
