import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Deactivate all existing agents
const { error: deactErr } = await supabase
  .from("agents")
  .update({ is_active: false })
  .neq("id", "00000000-0000-0000-0000-000000000000"); // all rows

if (deactErr) console.error("Deactivate error:", deactErr.message);
else console.log("All existing agents deactivated.");

// New agents
const NEW_AGENTS = [
  {
    name: "Neşe Üzüm",
    slug: "nese-uzum",
    title: "Kıdemli Emlak Danışmanı",
    phone: "+90 548 850 50 50",
    email: "nese@nexos.com.tr",
    bio: "Kuzey Kıbrıs gayrimenkul sektöründe 12 yıllık deneyimi ile İskele ve çevresinde uzmanlaşmış danışman. Müşteri memnuniyetini ön planda tutarak güvenilir hizmet sunar.",
    is_active: true,
  },
  {
    name: "İsmail Pehlivan",
    slug: "ismail-pehlivan",
    title: "Gayrimenkul Yatırım Danışmanı",
    phone: "+90 548 850 60 60",
    email: "ismail@nexos.com.tr",
    bio: "Yatırım amaçlı gayrimenkul danışmanlığında uzmanlaşmış profesyonel. Kuzey Kıbrıs'ta yüksek getiri potansiyeli taşıyan projeleri müşterilerine sunmaktadır.",
    is_active: true,
  },
  {
    name: "Hakan Sürmeli",
    slug: "hakan-surmeli",
    title: "Kiralama ve Satış Uzmanı",
    phone: "+90 548 850 70 70",
    email: "hakan@nexos.com.tr",
    bio: "Konut ve ticari gayrimenkul kiralama ile satış süreçlerinde geniş tecrübeye sahip. Kıbrıs'ta yaşam ve yatırım konularında rehberlik eder.",
    is_active: true,
  },
];

const { data, error } = await supabase
  .from("agents")
  .upsert(NEW_AGENTS, { onConflict: "slug" })
  .select("id, name, slug");

if (error) {
  console.error("Upsert error:", error.message);
} else {
  console.log("New agents created:");
  data.forEach((a) => console.log(`  ✓ ${a.name} (${a.slug})`));
}
