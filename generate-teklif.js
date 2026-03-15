/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
        TabStopType, TabStopPosition } = require('docx');

// === COLORS ===
const C = {
  primary: "1B4D3E",    // Koyu yeşil (emlak kurumsal)
  secondary: "2E7D5B",  // Orta yeşil
  accent: "D4AF37",     // Altın
  dark: "1A1A2E",       // Koyu lacivert
  gray: "6B7280",       // Gri metin
  lightGray: "F3F4F6",  // Açık gri bg
  white: "FFFFFF",
  black: "000000",
  greenBg: "E8F5E9",    // Açık yeşil bg
  goldBg: "FFF8E1",     // Açık altın bg
};

const border = (color = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(text, opts = {}) {
  const { bold, color = C.black, size = 20, align = AlignmentType.LEFT, fill, span, cellBorders, width, font = "Arial" } = opts;
  return new TableCell({
    borders: cellBorders || borders("DDDDDD"),
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: span,
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: String(text), bold, color, size, font })]
    })]
  });
}

function headerCell(text, opts = {}) {
  return cell(text, { bold: true, color: C.white, fill: C.primary, size: 20, align: AlignmentType.CENTER, ...opts });
}

function emptyPara(spacing = 100) {
  return new Paragraph({ spacing: { before: spacing, after: spacing }, children: [] });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text })] });
}

function para(text, opts = {}) {
  const { bold, color = C.black, size = 22, align, italic, spacing } = opts;
  return new Paragraph({
    alignment: align,
    spacing: spacing || { before: 80, after: 80 },
    children: [new TextRun({ text, bold, color, size, italic, font: "Arial" })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", color: C.secondary, size: 16, font: "Arial" })]
  });
}

// Total usable width: 9360 DXA (letter with 1" margins)
const W = 9360;

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: C.primary, font: "Arial" },
        paragraph: { spacing: { before: 0, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: C.primary, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: C.secondary, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 160 } } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: C.dark, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 } } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "features-1", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2713", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "features-2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2713", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "features-3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2713", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "tech-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "phase-list", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "payment-list", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ========== COVER PAGE ==========
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        emptyPara(800),
        emptyPara(800),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 },
          children: [new TextRun({ text: "[FIRMA LOGOSU]", color: C.gray, size: 24, font: "Arial", italic: true })]
        }),
        emptyPara(400),
        divider(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: "KURUMSAL EMLAK WEB SİTESİ", bold: true, color: C.primary, size: 52, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 200 },
          children: [new TextRun({ text: "HİZMET TEKLİFİ", bold: true, color: C.accent, size: 40, font: "Arial" })]
        }),
        divider(),
        emptyPara(200),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 40 },
          children: [new TextRun({ text: "Gelişmiş İlan Yönetimi | Akıllı Filtreleme | Harita Entegrasyonu", color: C.gray, size: 22, font: "Arial" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: "SEO Optimizasyonu | Admin Paneli | Mobil Uyumlu Tasarım", color: C.gray, size: 22, font: "Arial" })]
        }),
        emptyPara(600),
        new Table({
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                para("Teklif No: TEK-2026-002", { color: C.gray, size: 20 }),
                para("Tarih: 09.03.2026", { color: C.gray, size: 20 }),
              ]}),
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Sayın [Müşteri Adı]", color: C.gray, size: 20, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "[Müşteri Şirket Adı]", color: C.gray, size: 20, font: "Arial" })] }),
              ]}),
            ]})
          ]
        }),
      ]
    },

    // ========== CONTENT PAGES ==========
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Kurumsal Emlak Web Sitesi Teklifi", color: C.gray, size: 16, italic: true, font: "Arial" }),
              new TextRun({ text: "  |  TEK-2026-002", color: C.gray, size: 16, italic: true, font: "Arial" }),
            ]
          })
        ]})
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "[Şirket Adı] — Gizli ve Özeldir  |  Sayfa ", color: C.gray, size: 16, font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], color: C.gray, size: 16, font: "Arial" }),
              new TextRun({ text: " / ", color: C.gray, size: 16, font: "Arial" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: C.gray, size: 16, font: "Arial" }),
            ]
          })
        ]})
      },
      children: [
        // ===== 1. HAKKIMIZDA =====
        heading("1. HAKKIMIZDA"),
        para("[Şirket Adı], dijital dünyada müşterilerine yenilikçi ve etkili çözümler sunan bir teknoloji şirketidir. Deneyimli ekibimiz ile kurumsal web tasarım, e-ticaret çözümleri ve dijital pazarlama alanlarında hizmet vermekteyiz."),
        para("Emlak sektörüne özel geliştirdiğimiz çözümlerle, gayrimenkul firmalarının dijital varlığını güçlendiriyor, ilan yönetimini kolaylaştırıyor ve potansiyel müşteri kazanım süreçlerini optimize ediyoruz."),

        // ===== 2. PROJENİN AMACI =====
        heading("2. PROJENİN AMACI VE KAPSAMI"),
        para("Bu proje kapsamında, firmanız için güncel teknolojilerle donatılmış, gelişmiş ilan yönetim sistemine sahip, SEO dostu ve mobil uyumlu bir kurumsal emlak web sitesi geliştirilecektir."),
        emptyPara(100),

        heading("Temel Hedefler", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Profesyonel kurumsal imaj oluşturma", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Emlak ilanlarının detaylı kategorileme ve filtreleme ile listelenmesi", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Gelişmiş harita entegrasyonu ile konum bazlı ilan görüntüleme", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Admin paneli ile kolay ilan ve içerik yönetimi", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Google'da üst sıralarda yer almak için SEO optimizasyonu", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Mobil cihazlarda mükemmel kullanıcı deneyimi", font: "Arial", size: 22 })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Potansiyel müşterilerden gelen taleplerin anlık takibi", font: "Arial", size: 22 })] }),

        // ===== 3. TEKNOLOJİ ALTYAPISI =====
        heading("3. TEKNOLOJİ ALTYAPISI"),
        para("Projenizde en güncel ve güvenilir teknolojiler kullanılacaktır:"),
        emptyPara(60),

        new Table({
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [
              headerCell("Katman", { width: 3120 }),
              headerCell("Teknoloji", { width: 3120 }),
              headerCell("Avantajı", { width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Framework", { bold: true, width: 3120 }),
              cell("Next.js 15", { width: 3120 }),
              cell("Google SEO uyumu, hızlı yüklenme", { width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Veritabanı", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("Supabase (PostgreSQL)", { fill: C.lightGray, width: 3120 }),
              cell("Gerçek zamanlı veri, güvenli auth", { fill: C.lightGray, width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Hosting", { bold: true, width: 3120 }),
              cell("Vercel", { width: 3120 }),
              cell("Otomatik ölçekleme, CDN", { width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Tasarım", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("Tailwind CSS + shadcn/ui", { fill: C.lightGray, width: 3120 }),
              cell("Modern, tutarlı ve hızlı UI", { fill: C.lightGray, width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Harita", { bold: true, width: 3120 }),
              cell("Leaflet / Google Maps", { width: 3120 }),
              cell("İnteraktif konum görüntüleme", { width: 3120 }),
            ]}),
            new TableRow({ children: [
              cell("Dil", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("TypeScript", { fill: C.lightGray, width: 3120 }),
              cell("Hata azaltma, güvenli kod", { fill: C.lightGray, width: 3120 }),
            ]}),
          ]
        }),

        // ===== 4. PROJE KAPSAMI DETAYLARI =====
        new Paragraph({ children: [new PageBreak()] }),
        heading("4. PROJE KAPSAMI — DETAYLI ÖZELLİKLER"),

        heading("4.1 Herkese Açık Web Sitesi", HeadingLevel.HEADING_2),

        heading("İlan Listeleme ve Arama", HeadingLevel.HEADING_3),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Ana sayfa: Hero alanı + hızlı arama çubuğu + öne çıkan ilanlar", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Gelişmiş filtreleme: İşlem tipi, emlak tipi, konum (İl/İlçe/Mahalle), fiyat, m², oda sayısı, kat, bina yaşı, özellikler", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Kart / Liste / Harita görünüm değiştirme", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "URL tabanlı filtre durumu (SEO dostu, paylaşılabilir linkler)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Sıralama: Fiyat, tarih, m², popülerlik", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Tam ekran harita görünümü (kümeleme ile)", font: "Arial", size: 21 })] }),

        heading("İlan Detay Sayfası", HeadingLevel.HEADING_3),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Tam ekran fotoğraf galerisi (lightbox)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "360° sanal tur entegrasyonu (YouTube, Matterport)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Detaylı özellik bilgileri ve amenity etiketleri", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Harita üzerinde konum gösterimi", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Danışman iletişim kartı (arama, WhatsApp, e-posta)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Sosyal medya paylaşım butonları", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Benzer ilanlar karuseli", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Favorilere ekleme + İlan karşılaştırma (4'e kadar)", font: "Arial", size: 21 })] }),

        heading("Kurumsal Sayfalar", HeadingLevel.HEADING_3),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Hakkımızda, Hizmetlerimiz, SSS sayfaları (CMS ile yönetilebilir)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Ekibimiz / Danışmanlar sayfası + bireysel profil sayfaları", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "Blog / Haberler bölümü", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "İletişim sayfası (form + harita + WhatsApp)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-1", level: 0 }, children: [new TextRun({ text: "KVKK / Gizlilik Politikası sayfaları", font: "Arial", size: 21 })] }),

        heading("4.2 Admin Paneli", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Dashboard: KPI kartları, günlük istatistikler, son talepler, popüler ilanlar", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "İlan Yönetimi: Ekleme (6 adımlı form), düzenleme, silme, toplu işlem, durum değiştirme", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Fotoğraf Yönetimi: Sürükle-bırak yükleme, sıralama, kapak fotoğrafı seçimi", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Danışman Yönetimi: Ekleme, düzenleme, ilan atama, performans istatistikleri", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Blog Yönetimi: Zengin metin editörü, yayınla/geri çek, SEO alanları", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Talep Yönetimi: Gelen kutusu, durum takibi, danışmana atama, CSV dışa aktarma", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Sayfa Yönetimi: CMS sayfalarını düzenleme (Hakkımızda, Hizmetler vb.)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Site Ayarları: Firma bilgileri, sosyal medya linkleri, hero metinleri", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-2", level: 0 }, children: [new TextRun({ text: "Konum Yönetimi: İl / İlçe / Mahalle ekleme-düzenleme", font: "Arial", size: 21 })] }),

        heading("4.3 Gelişmiş Özellikler", HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Türkçe tam metin arama (PostgreSQL tsvector)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Anlık bildirimler: Yeni talep geldiğinde admin panelde gerçek zamanlı uyarı", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "E-posta bildirimleri: Yeni talep geldiğinde danışmana otomatik e-posta", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Dinamik Open Graph görselleri (sosyal medya paylaşımlarında otomatik önizleme)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Google yapılandırılmış veri (JSON-LD) — Emlak ilanları, blog yazıları, firma bilgisi", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Otomatik sitemap oluşturma ve güncelleme", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "Para birimi dönüştürme (TL / USD / EUR)", font: "Arial", size: 21 })] }),
        new Paragraph({ numbering: { reference: "features-3", level: 0 }, children: [new TextRun({ text: "WhatsApp entegrasyonu (yüzen buton + ilan bazlı mesaj şablonu)", font: "Arial", size: 21 })] }),

        // ===== 5. FİYATLANDIRMA =====
        new Paragraph({ children: [new PageBreak()] }),
        heading("5. FİYATLANDIRMA — PAKET SEÇENEKLERİ"),
        para("İhtiyaçlarınıza uygun üç farklı paket seçeneği sunuyoruz:"),
        emptyPara(100),

        // Pricing Table
        new Table({
          columnWidths: [2640, 2240, 2240, 2240],
          rows: [
            // Header
            new TableRow({ children: [
              new TableCell({ borders: borders(C.primary), width: { size: 2640, type: WidthType.DXA }, shading: { fill: C.lightGray, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ÖZELLİKLER", bold: true, color: C.dark, size: 20, font: "Arial" })] })] }),
              new TableCell({ borders: borders(C.primary), width: { size: 2240, type: WidthType.DXA }, shading: { fill: C.greenBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 20 }, children: [new TextRun({ text: "STARTER", bold: true, color: C.secondary, size: 24, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 80 }, children: [new TextRun({ text: "45.000 TL", bold: true, color: C.primary, size: 28, font: "Arial" })] }),
                ] }),
              new TableCell({ borders: borders(C.primary), width: { size: 2240, type: WidthType.DXA }, shading: { fill: C.goldBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 20 }, children: [new TextRun({ text: "PROFESYONEL", bold: true, color: C.accent, size: 24, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "85.000 TL", bold: true, color: C.primary, size: 28, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 80 }, children: [new TextRun({ text: "EN POPÜLERs", bold: true, color: C.accent, size: 16, font: "Arial" })] }),
                ] }),
              new TableCell({ borders: borders(C.primary), width: { size: 2240, type: WidthType.DXA }, shading: { fill: "E8EAF6", type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 20 }, children: [new TextRun({ text: "KURUMSAL", bold: true, color: C.dark, size: 24, font: "Arial" })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 80 }, children: [new TextRun({ text: "150.000 TL", bold: true, color: C.primary, size: 28, font: "Arial" })] }),
                ] }),
            ]}),
            // Rows
            ...createPricingRows([
              ["Sayfa Sayısı", "8 Sayfa", "15+ Sayfa", "Sınırsız"],
              ["Tasarım", "Tema Bazlı", "Özel Tasarım", "Premium Tasarım"],
              ["İlan Listeleme", "Temel Listeleme", "Gelişmiş Filtreleme", "Tam Filtreleme Sistemi"],
              ["Filtreleme", "Tip + Konum + Fiyat", "Tüm Filtreler", "Tüm Filtreler + Harita"],
              ["Harita Görünümü", "—", "İlan Detayda", "Tam Ekran + Kümeleme"],
              ["Admin Paneli", "Basit İlan CRUD", "Tam Admin Paneli", "Tam Admin + Analytics"],
              ["Blog Modülü", "—", "Basit Blog", "Blog + SEO Editörü"],
              ["Danışman Sayfaları", "—", "Ekip Sayfası", "Profil + İlan Atama"],
              ["Fotoğraf Galerisi", "Temel Galeri", "Lightbox Galeri", "Lightbox + Sanal Tur"],
              ["SEO Optimizasyonu", "Temel SEO", "Gelişmiş SEO", "Tam SEO + JSON-LD"],
              ["İletişim Formu", "Basit Form", "Form + WhatsApp", "Form + WhatsApp + E-posta"],
              ["Anlık Bildirimler", "—", "—", "Gerçek Zamanlı"],
              ["Favoriler/Karşılaştır", "—", "Favoriler", "Favoriler + Karşılaştırma"],
              ["Çoklu Dil Desteği", "—", "—", "Hazır Altyapı"],
              ["Para Birimi", "Sadece TL", "TL + USD + EUR", "TL + USD + EUR"],
              ["CMS Sayfaları", "—", "Temel", "Tam CMS"],
              ["Responsive Tasarım", "Dahil", "Dahil", "Dahil"],
              ["SSL Sertifikası", "Dahil", "Dahil", "Dahil"],
              ["1 Yıl Hosting (Vercel)", "Dahil", "Dahil", "Dahil"],
              ["Teknik Destek", "3 Ay", "6 Ay", "12 Ay"],
            ])
          ]
        }),

        emptyPara(100),
        para("* Tüm fiyatlara KDV dahil değildir.", { italic: true, color: C.gray, size: 18 }),
        para("* Hosting maliyeti Vercel ücretsiz plan kapsamında dahildir. Yüksek trafik durumunda Vercel Pro planı ($20/ay) gerekebilir.", { italic: true, color: C.gray, size: 18 }),
        para("* Supabase ücretsiz plan kapsamında başlanır. İhtiyaca göre Pro plan ($25/ay) önerilir.", { italic: true, color: C.gray, size: 18 }),

        // ===== 6. PROJE TAKVİMİ =====
        new Paragraph({ children: [new PageBreak()] }),
        heading("6. PROJE TAKVİMİ"),
        para("Seçilen pakete göre proje süreleri:"),
        emptyPara(60),

        new Table({
          columnWidths: [3120, 2080, 2080, 2080],
          rows: [
            new TableRow({ children: [
              headerCell("AŞAMA", { width: 3120 }),
              headerCell("STARTER", { width: 2080 }),
              headerCell("PROFESYONEL", { width: 2080 }),
              headerCell("KURUMSAL", { width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Analiz ve Planlama", { bold: true, width: 3120 }),
              cell("3 Gün", { align: AlignmentType.CENTER, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Veritabanı ve Altyapı", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("3 Gün", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("1.5 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Tasarım ve UI Geliştirme", { bold: true, width: 3120 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
              cell("2 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
              cell("3 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Backend ve Admin Panel", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("2 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("3 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Gelişmiş Özellikler", { bold: true, width: 3120 }),
              cell("—", { align: AlignmentType.CENTER, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
              cell("2 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("SEO ve Performans", { bold: true, fill: C.lightGray, width: 3120 }),
              cell("2 Gün", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
              cell("1.5 Hafta", { align: AlignmentType.CENTER, fill: C.lightGray, width: 2080 }),
            ]}),
            new TableRow({ children: [
              cell("Test ve Yayınlama", { bold: true, width: 3120 }),
              cell("2 Gün", { align: AlignmentType.CENTER, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
              cell("1 Hafta", { align: AlignmentType.CENTER, width: 2080 }),
            ]}),
            // Total
            new TableRow({ children: [
              cell("TOPLAM SÜRE", { bold: true, fill: C.primary, color: C.white, width: 3120 }),
              cell("~3.5 Hafta", { bold: true, fill: C.primary, color: C.white, align: AlignmentType.CENTER, width: 2080 }),
              cell("~9 Hafta", { bold: true, fill: C.primary, color: C.white, align: AlignmentType.CENTER, width: 2080 }),
              cell("~13 Hafta", { bold: true, fill: C.primary, color: C.white, align: AlignmentType.CENTER, width: 2080 }),
            ]}),
          ]
        }),

        // ===== 7. ÖDEME KOŞULLARI =====
        heading("7. ÖDEME KOŞULLARI"),
        emptyPara(60),
        new Table({
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [
              headerCell("1. ÖDEME", { width: 3120 }),
              headerCell("2. ÖDEME", { width: 3120 }),
              headerCell("3. ÖDEME", { width: 3120 }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: borders("DDDDDD"), width: { size: 3120, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "%40", bold: true, color: C.primary, size: 36, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 100 }, children: [new TextRun({ text: "Sözleşme İmzası", color: C.gray, size: 20, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: borders("DDDDDD"), width: { size: 3120, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "%30", bold: true, color: C.primary, size: 36, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 100 }, children: [new TextRun({ text: "Tasarım Onayı", color: C.gray, size: 20, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: borders("DDDDDD"), width: { size: 3120, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 }, children: [new TextRun({ text: "%30", bold: true, color: C.primary, size: 36, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 100 }, children: [new TextRun({ text: "Proje Teslimi", color: C.gray, size: 20, font: "Arial" })] }),
              ]}),
            ]}),
          ]
        }),

        // ===== 8. NEDEN BİZ =====
        heading("8. NEDEN BİZİ SEÇMELİSİNİZ?"),
        emptyPara(60),
        new Table({
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, shading: { fill: C.greenBg, type: ShadingType.CLEAR }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "Güncel Teknoloji", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Next.js 15 + Supabase + Vercel — Sektörün en yeni ve performanslı teknolojileri", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, shading: { fill: C.greenBg, type: ShadingType.CLEAR }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "SEO Odaklı Mimari", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Server-side rendering, JSON-LD, otomatik sitemap — Google'da üst sıralarda yer alın", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "Emlak Sektörü Uzmanlığı", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Sektöre özel filtreleme, harita entegrasyonu ve ilan yönetim çözümleri", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "Ölçeklenebilir Altyapı", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Vercel CDN + Supabase — Trafik artışında otomatik ölçekleme, sınırsız büyüme", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, shading: { fill: C.greenBg, type: ShadingType.CLEAR }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "Kolay Yönetim", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Kullanıcı dostu admin paneli — Teknik bilgi gerektirmeden ilan ekleme ve düzenleme", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: borders("EEEEEE"), width: { size: 4680, type: WidthType.DXA }, shading: { fill: C.greenBg, type: ShadingType.CLEAR }, children: [
                new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: "Sürekli Destek", bold: true, color: C.primary, size: 22, font: "Arial" })] }),
                new Paragraph({ spacing: { before: 40, after: 120 }, children: [new TextRun({ text: "Proje sonrası teknik destek, güncelleme ve bakım hizmeti", color: C.gray, size: 19, font: "Arial" })] }),
              ]}),
            ]}),
          ]
        }),

        // ===== 9. TEKLİF GEÇERLİLİĞİ =====
        heading("9. TEKLİF GEÇERLİLİK SÜRESİ"),
        para("Bu teklif, düzenlenme tarihinden itibaren 30 gün süreyle geçerlidir. Belirtilen süre içerisinde onaylanmayan teklifler için güncel fiyat bilgisi talep edilmelidir."),

        // ===== 10. İLETİŞİM =====
        heading("10. İLETİŞİM BİLGİLERİ"),
        emptyPara(60),
        new Table({
          columnWidths: [2340, 7020],
          rows: [
            new TableRow({ children: [
              cell("Şirket Adı", { bold: true, fill: C.lightGray, width: 2340 }),
              cell("[Şirket Adı]", { width: 7020 }),
            ]}),
            new TableRow({ children: [
              cell("Yetkili Kişi", { bold: true, width: 2340 }),
              cell("[Ad Soyad]", { width: 7020 }),
            ]}),
            new TableRow({ children: [
              cell("Telefon", { bold: true, fill: C.lightGray, width: 2340 }),
              cell("[0212 XXX XX XX]", { fill: C.lightGray, width: 7020 }),
            ]}),
            new TableRow({ children: [
              cell("E-posta", { bold: true, width: 2340 }),
              cell("[info@sirket.com]", { width: 7020 }),
            ]}),
            new TableRow({ children: [
              cell("Web", { bold: true, fill: C.lightGray, width: 2340 }),
              cell("[www.sirket.com]", { fill: C.lightGray, width: 7020 }),
            ]}),
          ]
        }),

        // ===== İMZA =====
        emptyPara(400),
        new Table({
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 }, children: [new TextRun({ text: "Bu teklifi kabul ediyorum.", color: C.gray, size: 20, font: "Arial" })] }),
                emptyPara(200),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "________________________", color: C.gray, size: 20, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Müşteri İmza / Kaşe", bold: true, color: C.dark, size: 20, font: "Arial" })] }),
              ]}),
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                emptyPara(60),
                emptyPara(200),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "________________________", color: C.gray, size: 20, font: "Arial" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Şirket İmza / Kaşe", bold: true, color: C.dark, size: 20, font: "Arial" })] }),
              ]}),
            ]}),
          ]
        }),
      ]
    }
  ]
});

function createPricingRows(data) {
  return data.map((row, i) => {
    const fill = i % 2 === 1 ? C.lightGray : undefined;
    return new TableRow({ children: [
      cell(row[0], { bold: true, size: 19, fill, width: 2640 }),
      cell(row[1], { align: AlignmentType.CENTER, size: 19, fill, width: 2240, color: row[1] === "—" ? "CCCCCC" : C.black }),
      cell(row[2], { align: AlignmentType.CENTER, size: 19, fill, width: 2240, color: row[2] === "—" ? "CCCCCC" : C.black }),
      cell(row[3], { align: AlignmentType.CENTER, size: 19, fill, width: 2240, color: row[3] === "—" ? "CCCCCC" : C.black }),
    ]});
  });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/piton/nexos/emlak-web-sitesi-teklifi.docx", buffer);
  console.log("Teklif dosyasi olusturuldu: emlak-web-sitesi-teklifi.docx");
});
