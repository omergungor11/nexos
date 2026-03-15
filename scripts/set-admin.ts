/**
 * Bir kullanıcıya admin rolü atar.
 * Kullanım: npx tsx scripts/set-admin.ts <email>
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local'da tanımlı olmalı");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Kullanım: npx tsx scripts/set-admin.ts <email>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Kullanıcıyı bul
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Kullanıcılar listelenemedi:", listError.message);
    process.exit(1);
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    console.error(`"${email}" e-postasıyla kullanıcı bulunamadı.`);
    console.log("Mevcut kullanıcılar:");
    users.forEach((u) => console.log(`  - ${u.email} (id: ${u.id})`));
    process.exit(1);
  }

  // user_metadata'ya role: admin ekle
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: "admin" },
  });

  if (updateError) {
    console.error("Kullanıcı güncellenemedi:", updateError.message);
    process.exit(1);
  }

  console.log(`"${email}" kullanıcısına admin rolü atandı.`);
  console.log("Artık /admin paneline erişebilir.");
}

main();
