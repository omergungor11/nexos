-- 008: Replace location data with North Cyprus (Kuzey Kıbrıs) cities and districts
-- Deactivate all existing Turkey-based locations, insert 6 KKTC cities + their districts

BEGIN;

-- 1. Deactivate existing locations
UPDATE neighborhoods SET is_active = FALSE;
UPDATE districts SET is_active = FALSE;
UPDATE cities SET is_active = FALSE;

-- 2. Insert North Cyprus cities
INSERT INTO cities (name, slug, plate_code, is_active) VALUES
  ('Lefkoşa',    'lefkosa',    NULL, TRUE),
  ('Girne',      'girne',      NULL, TRUE),
  ('Gazimağusa', 'gazimagusa', NULL, TRUE),
  ('Güzelyurt',  'guzelyurt',  NULL, TRUE),
  ('İskele',     'iskele',     NULL, TRUE),
  ('Lefke',      'lefke',      NULL, TRUE);

-- 3. Insert districts for each city

-- LEFKOŞA (43 districts — from 101evler.com)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Akıncılar',          'akincilar'),
  ('Alayköy',            'alaykoy'),
  ('Balıkesir',          'balikesir'),
  ('Batıkent',           'batikent'),
  ('Beyköy',             'beykoy'),
  ('Cihangir',           'cihangir'),
  ('Çağlayan',           'caglayan'),
  ('Çukurova',           'cukurova'),
  ('Değirmenlik',        'degirmenlik'),
  ('Demirhan',           'demirhan'),
  ('Dilekkaya',          'dilekkaya'),
  ('Dumlupınar',         'dumlupinar'),
  ('Düzova',             'duzova'),
  ('Erdemli',            'erdemli'),
  ('Gaziköy',            'gazikoy'),
  ('Gelibolu',           'gelibolu'),
  ('Göçmenköy',          'gocmenkoy'),
  ('Gökhan',             'gokhan'),
  ('Gönyeli',            'gonyeli'),
  ('Gürpınar',           'gurpinar'),
  ('Hamitköy',           'hamitkoy'),
  ('Haspolat',           'haspolat'),
  ('Kalavaç',            'kalavac'),
  ('Kanlıköy',           'kanlikoy'),
  ('Kırklar',            'kirklar'),
  ('Kızılbaş',           'kizilbas'),
  ('Köşklüçiftlik',      'koskluciftlik'),
  ('Kumsal',             'kumsal'),
  ('Küçük Kaymaklı',     'kucuk-kaymakli'),
  ('Lefkoşa Surlariçi',  'lefkosa-surlarici'),
  ('Marmara',            'marmara'),
  ('Meriç',              'meric'),
  ('Metehan',            'metehan'),
  ('Minareliköy',        'minarelikoy'),
  ('Ortaköy',            'ortakoy'),
  ('Sanayi Bölgesi',     'sanayi-bolgesi'),
  ('Taşkınköy',          'taskinkoy'),
  ('Türkeli',            'turkeli'),
  ('Yeniceköy',          'yenicekoy'),
  ('Yenikent',           'yenikent'),
  ('Yenişehir',          'yenisehir'),
  ('Yılmazköy',          'yilmazkoy'),
  ('Yiğitler',           'yigitler')
) AS d(name, slug)
WHERE c.slug = 'lefkosa';

-- GIRNE (42 districts)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Ağırdağ',        'agirdag'),
  ('Akçiçek',        'akcicek'),
  ('Akdeniz',        'akdeniz'),
  ('Alemdağ',        'alemdag'),
  ('Alsancak',       'alsancak'),
  ('Arapköy',        'arapkoy'),
  ('Aşağı Dikmen',   'asagi-dikmen'),
  ('Aşağı Taşkent',  'asagi-taskent'),
  ('Bahçeli',        'bahceli'),
  ('Beşparmak',      'besparmak'),
  ('Beylerbeyi',     'beylerbeyi'),
  ('Boğazköy',       'bogazkoy'),
  ('Çamlıbel',       'camlibel'),
  ('Çatalköy',       'catalkoy'),
  ('Dağyolu',        'dagyolu'),
  ('Esentepe',       'esentepe'),
  ('Geçitköy',       'gecitkoy'),
  ('Girne Merkez',   'girne-merkez'),
  ('Göçeri',         'goceri'),
  ('Güngör',         'gungor'),
  ('Hisarköy',       'hisarkoy'),
  ('Ilgaz',          'ilgaz'),
  ('Karaağaç',       'karaagac'),
  ('Karaman',        'karaman'),
  ('Karpaşa',        'karpasa'),
  ('Karşıyaka',      'karsiyaka'),
  ('Kayalar',        'kayalar'),
  ('Kılıçarslan',    'kilicarslan'),
  ('Koruçam',        'korucam'),
  ('Kozanköy',       'kozankoy'),
  ('Kömürcü',        'komurcu'),
  ('Lapta',          'lapta'),
  ('Malatya',        'malatya'),
  ('Ozanköy',        'ozankoy'),
  ('Özhan',          'ozhan'),
  ('Pınarbaşı',      'pinarbasi'),
  ('Sadrazamköy',    'sadrazamkoy'),
  ('Şirinevler',     'sirinevler'),
  ('Tepebaşı',       'tepebasi'),
  ('Yeşiltepe',      'yesiltepe'),
  ('Yukarı Dikmen',  'yukari-dikmen'),
  ('Yukarı Taşkent', 'yukari-taskent')
) AS d(name, slug)
WHERE c.slug = 'girne';

-- GAZIMAĞUSA (42 districts)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Akdoğan',        'akdogan'),
  ('Akova',          'akova'),
  ('Alaniçi',        'alanici'),
  ('Arıdamı',        'aridami'),
  ('Aslanköy',       'aslankoy'),
  ('Beyarmudu',      'beyarmudu'),
  ('Çamlıca',        'camlica'),
  ('Çayönü',         'cayonu'),
  ('Çınarlı',        'cinarli'),
  ('Dörtyol',        'dortyol'),
  ('Düzce',          'duzce'),
  ('Ergenekon',      'ergenekon'),
  ('Gazimağusa Merkez', 'gazimagusa-merkez'),
  ('Geçitkale',      'gecitkale'),
  ('Gönendere',      'gonendere'),
  ('Görneç',         'gornec'),
  ('Güvercinlik',    'guvercinlik'),
  ('İncirli',        'incirli'),
  ('İnönü',          'inonu'),
  ('Korkuteli',      'korkuteli'),
  ('Köprü',          'kopru'),
  ('Kurudere',       'kurudere'),
  ('Mallıdağ',       'mallidag'),
  ('Mormenekşe',     'mormenekse'),
  ('Mutluyaka',      'mutluyaka'),
  ('Nergisli',       'nergisli'),
  ('Paşaköy',        'pasakoy'),
  ('Pile',           'pile'),
  ('Pınarlı',        'pinarli'),
  ('Pirhan',         'pirhan'),
  ('Serdarlı',       'serdarli'),
  ('Sütlüce',        'sutluce'),
  ('Şehitler',       'sehitler'),
  ('Tatlısu',        'tatlisu'),
  ('Tirmen',         'tirmen'),
  ('Turunçlu',       'turunclu'),
  ('Türkmenköy',     'turkmenkoy'),
  ('Ulukışla',       'ulukisla'),
  ('Vadili',         'vadili'),
  ('Yamaçköy',       'yamackoy'),
  ('Yeniboğaziçi',   'yenibogazici'),
  ('Yıldırım',       'yildirim')
) AS d(name, slug)
WHERE c.slug = 'gazimagusa';

-- GÜZELYURT (12 districts)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Akçay',      'akcay'),
  ('Aydınköy',   'aydinkoy'),
  ('Gayretköy',  'gayretkoy'),
  ('Güneşköy',   'guneskoy'),
  ('Güzelyurt Merkez', 'guzelyurt-merkez'),
  ('Kalkanlı',   'kalkanli'),
  ('Mevlevi',    'mevlevi'),
  ('Serhatköy',  'serhatkoy'),
  ('Şahinler',   'sahinler'),
  ('Yayla',      'yayla'),
  ('Yuvacık',    'yuvacik'),
  ('Zümrütköy',  'zumrutkoy')
) AS d(name, slug)
WHERE c.slug = 'guzelyurt';

-- İSKELE (43 districts)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Adaçay',       'adacay'),
  ('Ağıllar',      'agillar'),
  ('Altınova',     'altinova'),
  ('Ardahan',      'ardahan'),
  ('Avtepe',       'avtepe'),
  ('Aygün',        'aygun'),
  ('Bafra',        'bafra'),
  ('Balalan',      'balalan'),
  ('Boğaziçi',     'bogazici'),
  ('Boltaşlı',    'boltasli'),
  ('Büyükkonuk',   'buyukkonuk'),
  ('Çayırova',     'cayirova'),
  ('Derince',      'derince'),
  ('Dipkarpaz',    'dipkarpaz'),
  ('Ergazi',       'ergazi'),
  ('Esenköy',      'esenkoy'),
  ('Gelincik',     'gelincik'),
  ('İskele Merkez','iskele-merkez'),
  ('Kaleburnu',    'kaleburnu'),
  ('Kalecik',      'kalecik'),
  ('Kaplıca',      'kaplica'),
  ('Kilitkaya',    'kilitkaya'),
  ('Kumyalı',      'kumyali'),
  ('Kurtuluş',     'kurtulus'),
  ('Kuruova',      'kuruova'),
  ('Kuzucuk',      'kuzucuk'),
  ('Mehmetçik',    'mehmetcik'),
  ('Mersinlik',    'mersinlik'),
  ('Ötüken',       'otuken'),
  ('Pamuklu',      'pamuklu'),
  ('Sazlıköy',     'sazlikoy'),
  ('Sınırüstü',    'sinirustu'),
  ('Sipahi',       'sipahi'),
  ('Taşlıca',      'taslica'),
  ('Topçuköy',     'topcukoy'),
  ('Turnalar',     'turnalar'),
  ('Tuzluca',      'tuzluca'),
  ('Yarköy',       'yarkoy'),
  ('Yedikonuk',    'yedikonuk'),
  ('Yeni Erenköy', 'yeni-erenkoy'),
  ('Yeşilköy',     'yesilkoy'),
  ('Zeybekköy',    'zeybekkoy'),
  ('Ziyamet',      'ziyamet')
) AS d(name, slug)
WHERE c.slug = 'iskele';

-- LEFKE (23 districts)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT c.id, d.name, d.slug, TRUE
FROM cities c,
(VALUES
  ('Aşağı Kurtboğan', 'asagi-kurtbogan'),
  ('Bademliköy',   'bademlikoy'),
  ('Bademköy',     'bademkoy'),
  ('Bağlıköy',     'baglikoy'),
  ('Cengizköy',    'cengizkoy'),
  ('Çamlıköy',     'camlikoy'),
  ('Denizli',      'denizli'),
  ('Doğancı',      'doganci'),
  ('Erenköy',      'erenkoy'),
  ('Gaziveren',    'gaziveren'),
  ('Gemikonağı',   'gemikonagi'),
  ('Günebakan',    'gunebakan'),
  ('Kurutepe',     'kurutepe'),
  ('Lefke Merkez', 'lefke-merkez'),
  ('Madenliköy',   'madenkoy'),
  ('Ömerli',       'omerli'),
  ('Şirinköy',     'sirinkoy'),
  ('Süleymaniye',  'suleymaniye'),
  ('Taşköy',       'taskoy'),
  ('Taşpınar',     'taspinar'),
  ('Yağmuralan',   'yagmuralan'),
  ('Yeşilırmak',   'yesilirmak'),
  ('Yeşilyurt',    'yesilyurt')
) AS d(name, slug)
WHERE c.slug = 'lefke';

COMMIT;
