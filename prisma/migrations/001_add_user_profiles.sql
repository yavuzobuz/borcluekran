-- CreateTable: Supabase kullanıcı profilleri için
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supabase_user_id" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user', -- admin, user
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_user_profiles_supabase_user_id" ON "user_profiles"("supabase_user_id");
CREATE INDEX IF NOT EXISTS "idx_user_profiles_email" ON "user_profiles"("email");
CREATE INDEX IF NOT EXISTS "idx_user_profiles_role" ON "user_profiles"("role");
