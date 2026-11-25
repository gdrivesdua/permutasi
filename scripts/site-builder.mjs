import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import '../assets/trust-i18n.js';

const __builderFilename = fileURLToPath(import.meta.url);
const __builderDirname = path.dirname(__builderFilename);
const DEFAULT_ROOT_DIR = path.resolve(__builderDirname, '..');

const trustI18n = globalThis.__TRUST_I18N__;
const EDU_FAQ_BY_LANG = JSON.parse(
  fs.readFileSync(new URL('./edu-faq-i18n.json', import.meta.url), 'utf8')
);

export const HEAD_MARKER_START = '<!-- SITE_CONFIG:HEAD_START -->';
export const HEAD_MARKER_END = '<!-- SITE_CONFIG:HEAD_END -->';

export const SUPPORTED_LANGUAGES = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];
export const ARTICLE_SECTIONS = ['guides', 'research', 'tools'];
export const ARTICLE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ARTICLE_TYPES = ['TechArticle', 'Article', 'WebApplication'];

export const STATIC_HTML_PAGES = [
  'index.html',
  'about.html',
  'privacy-policy.html',
  'terms.html',
  'disclaimer.html',
  'contact.html'
];

export const TRUST_PAGE_PATHS = [
  'about.html',
  'privacy-policy.html',
  'terms.html',
  'disclaimer.html',
  'contact.html'
];

const PAGE_FILE_TO_TYPE = {
  'about.html': 'about',
  'privacy-policy.html': 'privacy',
  'terms.html': 'terms',
  'disclaimer.html': 'disclaimer',
  'contact.html': 'contact'
};

const INDEX_SEO_BY_LANG = {
  en: {
    title: 'Domain Name — Domain Permutation Generator for Research & Portfolio',
    desc: 'Instantly generate domain name combination matrices for keyword business with RFC 1035 validation and global SEO optimization.',
    keywords: 'business, domain permutation, domain name generator, domain research, SEO, RFC 1035',
    ogLocale: 'en_US',
    ogSiteName: 'Domain Name — domainname.web.id',
    headline: '"business" Domain Permutation Generator & Bulk Checker',
    about: 'Domain Name Research Utility, SEO Domain Strategy, and RFC 1035 DNS Validation'
  },
  id: {
    title: 'Generator Permutasi Domain business untuk Riset & Portofolio',
    desc: 'Buat ratusan ide permutasi nama domain untuk keyword business secara instan dengan validasi RFC 1035 dan optimasi SEO global.',
    keywords: 'business, permutasi domain, generator nama domain, riset domain, SEO, RFC 1035',
    ogLocale: 'id_ID',
    ogSiteName: 'Domain Name — domainname.web.id (Indonesia)',
    headline: 'Generator Permutasi Domain & Bulk Checker "business"',
    about: 'Utilitas Riset Nama Domain, Strategi SEO Domain, dan Validasi DNS RFC 1035'
  },
  es: {
    title: 'Generador de Permutaciones de Dominio business para Investigación',
    desc: 'Genere matrices de combinación de dominios para la palabra clave business con validación RFC 1035 y optimización SEO global.',
    keywords: 'business, permutación de dominios, generador de dominios, investigación de dominios, SEO, RFC 1035',
    ogLocale: 'es_ES',
    ogSiteName: 'Domain Name — domainname.web.id (Español)',
    headline: 'Generador de Permutaciones de Dominio "business" y Verificador',
    about: 'Utilidad de Investigación de Dominios, Estrategia SEO y Validación DNS RFC 1035'
  },
  pt: {
    title: 'Gerador de Permutações de Domínio business para Pesquisa',
    desc: 'Gere matrizes de combinação de domínios para a palavra-chave business com validação RFC 1035 e otimização SEO global.',
    keywords: 'business, permutação de domínios, gerador de domínios, pesquisa de domínios, SEO, RFC 1035',
    ogLocale: 'pt_BR',
    ogSiteName: 'Domain Name — domainname.web.id (Português)',
    headline: 'Gerador de Permutações de Domínio "business" e Verificador',
    about: 'Utilitário de Pesquisa de Domínios, Estratégia SEO e Validação DNS RFC 1035'
  },
  fr: {
    title: 'Générateur de Permutations de Domaines business pour Recherche',
    desc: 'Générez des matrices de combinaison de domaines pour le mot-clé business avec validation RFC 1035 et optimisation SEO globale.',
    keywords: 'business, permutation de domaines, générateur de domaines, recherche de domaines, SEO, RFC 1035',
    ogLocale: 'fr_FR',
    ogSiteName: 'Domain Name — domainname.web.id (Français)',
    headline: 'Générateur de Permutations de Domaines "business" et Vérificateur',
    about: 'Utilitaire de Recherche de Domaines, Stratégie SEO et Validation DNS RFC 1035'
  },
  de: {
    title: 'business Domain Permutationsgenerator für Recherche & Portfolio',
    desc: 'Generieren Sie Domain-Kombinationsmatrizen für das Schlüsselwort business mit RFC 1035-Validierung und globaler SEO-Optimierung.',
    keywords: 'business, Domain-Permutation, Domain-Generator, Domain-Recherche, SEO, RFC 1035',
    ogLocale: 'de_DE',
    ogSiteName: 'Domain Name — domainname.web.id (Deutsch)',
    headline: '"business" Domain Permutationsgenerator & Bulk Checker',
    about: 'Domain-Recherche-Tool, SEO-Domain-Strategie und RFC-1035-DNS-Validierung'
  },
  ru: {
    title: 'Генератор перестановок доменов business для исследований',
    desc: 'Создавайте матрицы комбинаций доменных имен для ключевого слова business с проверкой RFC 1035 и глобальной SEO-оптимизацией.',
    keywords: 'business, перестановка доменов, генератор доменов, исследование доменов, SEO, RFC 1035',
    ogLocale: 'ru_RU',
    ogSiteName: 'Domain Name — domainname.web.id (Русский)',
    headline: 'Генератор перестановок доменов "business" и массовая проверка',
    about: 'Инструмент анализа доменных имен, SEO-стратегия и проверка DNS RFC 1035'
  },
  ja: {
    title: 'business ドメイン置換ジェネレータ (リサーチ & ポートフォリオ)',
    desc: 'RFC 1035検証とグローバルSEO最適化を備えたキーワード「business」のドメイン名組み合わせマトリックスを生成します。',
    keywords: 'business, ドメイン置換, ドメイン生成, ドメインリサーチ, SEO, RFC 1035',
    ogLocale: 'ja_JP',
    ogSiteName: 'Domain Name — domainname.web.id (日本語)',
    headline: '「business」ドメイン置換ジェネレータ & 一括チェック',
    about: 'ドメイン名リサーチツール、SEOドメイン戦略、RFC 1035 DNS検証'
  }
};

const EXT_STRATEGY_BY_LANG = {
  en: {
    title: 'Domain Extension Strategy & Google SERP Signals (Target Market & Regional)',
    intro: 'In Google Search algorithms and policies, domain extension choice provides strong geographical targeting (geotargeting) and brand authority signals:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Global generic extensions with no specific regional bias. Ideal for cross-border international target markets or general authority websites.',
    locTitle: 'Local ccTLDs (.us, .co.uk, .ca)',
    locDesc: 'Provide strong regional geotargeting signals to Google indicating the website targets local audiences. Great for boosting local SERP rankings.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Modern thematic extensions signaling specific intent (SaaS, e-commerce, developer tool). Treated equally to gTLDs in SERP signals.'
  },
  id: {
    title: 'Strategi Ekstensi Domain & Sinyal SERP Google (Target Market & Regional)',
    intro: 'Dalam algoritma dan kebijakan Google Search, pemilihan ekstensi domain memberikan sinyal penargetan geografis (geotargeting) dan otoritas brand yang kuat:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Ekstensi generik global tanpa bias regional khusus. Sangat ideal jika target market Anda lintas negara (internasional) atau untuk authority website umum.',
    locTitle: 'ccTLDs Lokal (.id, .co.id, .my.id)',
    locDesc: 'Memberikan sinyal kuat geotargeting regional ke Google bahwa website ditujukan untuk audiens lokal (misal: Indonesia). Sangat mendongkrak peringkat di SERP lokal.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Ekstensi tematik modern yang memberi sinyal intent spesifik (SaaS, e-commerce, developer tool). Diperlakukan setara dengan gTLD oleh Google dalam hal SERP signal.'
  },
  es: {
    title: 'Estrategia de Extensiones y Señales SERP de Google (Mercado y Región)',
    intro: 'En los algoritmos de Google Search, la elección de la extensión proporciona fuertes señales de segmentación geográfica (geotargeting) y autoridad:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Extensiones genéricas globales sin sesgo regional específico. Ideales para mercados internacionales o sitios de autoridad general.',
    locTitle: 'ccTLDs Locales (.es, .mx, .ar)',
    locDesc: 'Proporcionan fuertes señales de geotargeting regional a Google indicando que el sitio se dirige a audiencias locales, mejorando el ranking SERP local.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensiones temáticas modernas que señalan intención específica (SaaS, e-commerce, herramientas de desarrollador). Tratadas igual que gTLDs.'
  },
  pt: {
    title: 'Estratégia de Extensões e Sinais SERP do Google (Mercado & Regional)',
    intro: 'Nos algoritmos e políticas do Google Search, a escolha da extensão fornece fortes sinais de direcionamento geográfico (geotargeting) e autoridade:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Extensões genéricas globais sem viés regional específico. Ideales para mercados internacionais transfronteiriços ou sites de autoridade geral.',
    locTitle: 'ccTLDs Locales (.pt, .com.br)',
    locDesc: 'Fornecem fortes sinais de geotargeting regional ao Google, indicando que o site visa audiências locais. Ótimo para impulsionar rankings SERP locais.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensões temáticas modernas que sinalizam intenção específica (SaaS, e-commerce, ferramenta de desenvolvedor). Tratadas igualmente aos gTLDs.'
  },
  fr: {
    title: "Stratégie d'Extension et Signaux SERP de Google (Marché & Région)",
    intro: "Dans les algorithmes de Google Search, le choix de l'extension fournit de forts signaux de ciblage géographique (geotargeting) et d'autorité :",
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: "Extensions génériques mondiales sans biais régional spécifique. Idéales pour le marché international ou les sites d'autorité générale.",
    locTitle: 'ccTLDs Locaux (.fr, .be, .ch)',
    locDesc: 'Fournissent de forts signaux de ciblage géographique régional à Google indiquant que le site cible des audiences locales. Excellent pour les classements SERP locaux.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Extensions thématiques modernes signalant une intention spécifique (SaaS, e-commerce, outil dev). Traitées à égalité avec les gTLDs.'
  },
  de: {
    title: 'Domain-Endungs-Strategie & Google SERP-Signale (Zielmarkt & Region)',
    intro: 'In den Algorithmen der Google-Suche liefert die Wahl der Domain-Endung starke Geotargeting- und Markenautoritätssignale:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Globale generische Endungen ohne regionalen Bias. Ideal für internationale Zielmärkte oder allgemeine Authority-Websites.',
    locTitle: 'Lokale ccTLDs (.de, .at, .ch)',
    locDesc: 'Bieten starke regionale Geotargeting-Signale an Google, dass die Website auf lokale Zielmärkte ausgerichtet ist. Verbessert lokale SERP-Rankings.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Moderne thematische Endungen mit spezifischer Intent-Signalwirkung (SaaS, E-Commerce, Dev-Tool). Werden in SERP-Signalen wie gTLDs behandelt.'
  },
  ru: {
    title: 'Стратегия доменных зон и сигналы SERP Google (Регион и рынок)',
    intro: 'В алгоритмах Google выбор доменной зоны дает мощные сигналы географического таргетинга (geotargeting) и авторитета бренда:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: 'Глобальные общие зоны без специального регионального уклона. Идеально для трансграничных рынков или общих сайтов общего авторитета.',
    locTitle: 'Локальные ccTLDs (.ru, .su, .рф)',
    locDesc: 'Обеспечивают сильные сигналы регионального геотаргетинга для Google, указывая на русскоязычную аудиторию. Отлично повышает позиции в локальной выдаче.',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: 'Современные тематические зоны, сигнализирующие о конкретном намерении (SaaS, e-commerce, инструменты разработчика). Равны gTLD.'
  },
  ja: {
    title: 'ドメイン拡張子戦略 & Google SERPシグナル (ターゲット市場 & 地域)',
    intro: 'Google検索アルゴリズムにおいて、ドメイン拡張子の選択は強力なジオターゲティング（地域ターゲティング）とブランド権威のシグナルを提供します:',
    gTitle: 'gTLDs (.com, .net, .org)',
    gDesc: '特定の地域バイアスがないグローバルな汎用拡張子。国境を越えた国際市場や一般的な権威サイトに最適です。',
    locTitle: 'ローカル ccTLDs (.jp, .co.jp, .ne.jp)',
    locDesc: 'ウェブサイトが国内オーディエンスをターゲットにしていることをGoogleに強く示す地域ジオターゲティングシグナルを提供します。国内SERPの順位向上に最適です。',
    nTitle: 'nTLDs (.io, .app, .tech, .shop)',
    nDesc: '特定の意図（SaaS、EC、開発者ツール）を示す現代的なテーマ別拡張子。SERPシグナルではgTLDと同等に扱われます。'
  }
};

const DOMAIN_RISKS_BY_LANG = {
  en: {
    title: 'Domain Naming Risks & Google Penalty Warning',
    intro: 'When researching and generating domain permutations (especially for bulk campaigns or expired/dropped domains), beware of fatal risks that can trigger algorithmic penalties:',
    emdTitle: 'EMD (Exact Match Domain) Trap',
    emdDesc: 'Using exact commercial keyword matches (e.g., best-cheap-shoes.com) without high content quality makes sites vulnerable to Google EMD updates.',
    spamTitle: 'Low-Quality Automated Content Risk',
    spamDesc: 'Search ranking systems actively filter thousands of thin, low-value automated pages that lack original substance for visitors.',
    backlinkTitle: 'Prior Backlink & Reputation History (Aged Domains)',
    backlinkDesc: 'When acquiring previously registered domains, always verify archive history (Wayback Machine) and link profiles to avoid inheriting algorithmic downgrades from low-quality link networks.'
  },
  id: {
    title: 'Peringatan Risiko Penamaan Domain & Google Penalty',
    intro: 'Saat melakukan riset dan pembuatan permutasi domain (khususnya untuk proyek massal atau domain drop/expired), Anda harus mewaspadai beberapa risiko fatal yang dapat memicu penalti dari algoritma Google:',
    emdTitle: 'EMD (Exact Match Domain) Trap',
    emdDesc: 'Menggunakan domain yang persis sama dengan keyword komersial (misal: beli-sepatu-murah.com) tanpa kualitas konten yang memadai rentan terkena Google EMD Update.',
    spamTitle: 'Risiko Konten Otomatis Berkualitas Rendah',
    spamDesc: 'Algoritma mesin pencari memfilter ribuan halaman otomatis berkualitas rendah yang tidak memiliki nilai informasi unik bagi pengguna.',
    backlinkTitle: 'Riwayat Backlink & Reputasi Domain (Domain Bekas)',
    backlinkDesc: 'Jika Anda membeli domain bekas (expired domain), selalu periksa riwayat arsip (Wayback Machine) dan profil tautannya agar tidak mewarisi penalti algoritmik dari situs berkualitas rendah.'
  },
  es: {
    title: 'Riesgos en Nombres de Dominio y Advertencia de Penalización',
    intro: 'Al investigar y generar permutaciones de dominio (especialmente para proyectos masivos o dominios expirados), tenga cuidado con los riesgos fatales:',
    emdTitle: 'Trampa EMD (Exact Match Domain)',
    emdDesc: 'Usar coincidencias exactas de palabras clave comerciales sin contenido de calidad hace que los sitios sean vulnerables a actualizaciones EMD de Google.',
    spamTitle: 'Riesgo de Contenido Automatizado de Baja Calidad',
    spamDesc: 'Los algoritmos de búsqueda filtran páginas automatizadas sin valor original para los usuarios.',
    backlinkTitle: 'Historial de Enlaces y Reputación (Dominios Expirados)',
    backlinkDesc: 'Al comprar dominios expirados, verifique siempre el historial de archivo (Wayback Machine) y perfiles de enlaces para evitar heredar penalizaciones algorítmicas.'
  },
  pt: {
    title: 'Riscos de Nomes de Domínio e Alerta de Penalidade do Google',
    intro: 'Ao pesquisar e gerar permutações de domínio (especialmente para projetos em massa ou dominios expirados/drop), tome cuidado com riscos fatais:',
    emdTitle: 'Armadilha EMD (Exact Match Domain)',
    emdDesc: 'Usar correspondências exatas de palavras-chave comerciais (ex: comprar-sapatos-baratos.pt) sem conteúdo de qualidade torna os sites vulneráveis a atualizações EMD.',
    spamTitle: 'Risco de Conteúdo Automatizado de Baixa Qualidade',
    spamDesc: 'Os sistemas de busca filtram páginas automatizadas sem valor editorial original para os usuários.',
    backlinkTitle: 'Histórico de Links e Reputação (Domínios Expirados)',
    backlinkDesc: 'Ao comprar domínios expirados, sempre verifique o histórico de arquivos (Wayback Machine) e perfis de links para evitar herdar penalizações algorítmicas.'
  },
  fr: {
    title: 'Risques de Noms de Domaine et Alerte de Pénalité Google',
    intro: 'Lors de la recherche et de la génération de permutations de domaine (surtout pour les projets en masse ou les domaines expirés), attention aux risques fatals :',
    emdTitle: 'Piège EMD (Exact Match Domain)',
    emdDesc: 'Utiliser des correspondances exactes de mots-clés commerciaux (ex: acheter-chaussures-pas-cher.fr) sans contenu de qualité expose aux mises à jour EMD.',
    spamTitle: 'Risque de Contenu Automatisé de Faible Qualité',
    spamDesc: 'Les moteurs de recherche filtrent les pages automatisées à faible valeur ajoutée dépourvues de contenu original.',
    backlinkTitle: 'Historique de Liens et Réputation (Domaines Expirés)',
    backlinkDesc: "Lors de l'achat de domaines expirés, vérifiez toujours l'historique d'archive (Wayback Machine) et les profils de liens pour éviter d'hériter de pénalités."
  },
  de: {
    title: 'Domain-Risiken & Google Penalty Warnung',
    intro: 'Bei der Recherche und Generierung von Domain-Permutationen (besonders für große Projekte oder alte/Dropped-Domains) lauern fatale Risiken:',
    emdTitle: 'EMD (Exact Match Domain) Falle',
    emdDesc: 'Die Nutzung exakter kommerzieller Keyword-Matches (z. B. billige-schuhe-kaufen.de) ohne hohe Content-Qualität macht anfällig für EMD-Updates.',
    spamTitle: 'Risiko Minderwertiger Automatisierter Inhalte',
    spamDesc: 'Suchmaschinen filtern automatisch generierte Seiten ohne eigenen redaktionellen Mehrwert für Besucher.',
    backlinkTitle: 'Backlink-Historie & Domain-Reputation (Gebrauchte Domains)',
    backlinkDesc: 'Prüfen Sie beim Kauf gebrauchter Domains immer das Archiv (Wayback Machine) und Backlink-Profile, um keine historischen Abstrafungen zu erben.'
  },
  ru: {
    title: 'Риски нейминга и предупреждение о штрафах Google',
    intro: 'При исследовании и генерации перестановок (особенно для массовых кампаний или перехваченных доменов) опасайтесь фатальных рисков:',
    emdTitle: 'Ловушка EMD (Exact Match Domain)',
    emdDesc: 'Использование точных коммерческих совпадений ключевых слов (например, kupit-obuv-nedorogo.ru) без высокого качества контента уязвимо для EMD-обновлений.',
    spamTitle: 'Риск некачественного автоматического контента',
    spamDesc: 'Поисковые системы отфильтровывают шаблонные автоматические страницы без оригинальной пользы для пользователей.',
    backlinkTitle: 'История ссылок и репутация (Возрастные домены)',
    backlinkDesc: 'При покупке доменов с историей всегда проверяйте архив (Wayback Machine) и профиль ссылок во избежание наследования санкций.'
  },
  ja: {
    title: 'ドメイン命名のリスク & Googleペナルティの警告',
    intro: 'ドメインの置換や生成（特に大規模プロジェクトや中古ドメインの場合）を行う際は、アルゴリズムペナルティを引き起こす致命的なリスクに注意してください:',
    emdTitle: 'EMD（完全一致ドメイン）の罠',
    emdDesc: '高品質なコンテンツなしで商用キーワードと完全に一致するドメイン（例: best-cheap-shoes.jp）を使用すると、GoogleのEMDアップデートの対象になりやすくなります。',
    spamTitle: '低品質な自動生成コンテンツのリスク',
    spamDesc: '検索エンジンは、独自の有益な情報を持たない大量の低品質ページをフィルタリングします。',
    backlinkTitle: '被リンク履歴とドメイン評価 (中古ドメイン)',
    backlinkDesc: '中古ドメインを取得する際は、過去のアーカイブ履歴（Wayback Machine）と被リンクプロファイルを必ず確認してください。'
  }
};

const DEFAULT_CONFIG = {
  siteUrl: 'https://domainname.web.id',
  contactEmail: 'admin@domainname.web.id',
  languages: ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'],
  googleAnalytics: {
    measurementId: ''
  },
  googleSearchConsole: {
    verificationToken: ''
  },
  googleAdSense: {
    publisherId: '',
    directSellerId: 'f08c47fec0942fa0',
    enableAutoAdsScript: true,
    generateAdsTxt: true
  },
  otherVerifications: {
    bingMsvalidate: '',
    yandexVerification: '',
    ahrefsSiteVerification: ''
  },
  seo: {
    generateRobotsTxt: true,
    generateSitemapXml: true
  }
};

export function escapeHtmlAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function normalizeSiteUrl(rawUrl) {
  const trimmed = String(rawUrl || DEFAULT_CONFIG.siteUrl).trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
    return DEFAULT_CONFIG.siteUrl;
  }
  return trimmed;
}

export function normalizeContactEmail(rawEmail) {
  const trimmed = String(rawEmail || DEFAULT_CONFIG.contactEmail).trim();
  if (/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(trimmed)) {
    return trimmed;
  }
  return DEFAULT_CONFIG.contactEmail;
}

export function normalizeVerificationToken(rawValue) {
  const val = String(rawValue || '').trim();
  if (!val) return '';
  const contentMatch = val.match(/content\s*=\s*["']([^"']+)["']/i);
  if (contentMatch) {
    return contentMatch[1].trim();
  }
  return val;
}

export function normalizeAdSenseIds(rawPublisherId) {
  const val = String(rawPublisherId || '').trim();
  if (!val) return { clientId: '', adsTxtPubId: '' };
  const match = val.match(/(?:ca-)?(pub-\d{10,24})/i);
  if (match) {
    const pubId = match[1].toLowerCase();
    return {
      clientId: `ca-${pubId}`,
      adsTxtPubId: pubId
    };
  }
  return { clientId: '', adsTxtPubId: '' };
}

export function normalizeGaMeasurementId(rawId) {
  const val = String(rawId || '').trim();
  if (!val) return '';
  if (/^(G|GT|AW|DC)-[A-Z0-9-]+$/i.test(val)) {
    return val.toUpperCase();
  }
  return '';
}

export function loadSiteConfig(rootDir) {
  const configPath = path.join(rootDir, 'site.config.json');
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    fileConfig = JSON.parse(raw);
  }

  const rawLanguages = Array.isArray(fileConfig.languages) && fileConfig.languages.length > 0
    ? fileConfig.languages
    : DEFAULT_CONFIG.languages;
  const languages = rawLanguages.filter((l) => SUPPORTED_LANGUAGES.includes(l));

  return {
    siteUrl: normalizeSiteUrl(process.env.SITE_URL || fileConfig.siteUrl || DEFAULT_CONFIG.siteUrl),
    contactEmail: normalizeContactEmail(process.env.CONTACT_EMAIL || fileConfig.contactEmail || DEFAULT_CONFIG.contactEmail),
    languages: languages.length > 0 ? languages : DEFAULT_CONFIG.languages,
    googleAnalytics: {
      measurementId: normalizeGaMeasurementId(
        process.env.GA_MEASUREMENT_ID || fileConfig.googleAnalytics?.measurementId || ''
      )
    },
    googleSearchConsole: {
      verificationToken: normalizeVerificationToken(
        process.env.GSC_VERIFICATION || fileConfig.googleSearchConsole?.verificationToken || ''
      )
    },
    googleAdSense: {
      publisherId: String(
        process.env.ADSENSE_CLIENT_ID || fileConfig.googleAdSense?.publisherId || ''
      ).trim(),
      directSellerId: String(
        process.env.ADSENSE_DIRECT_SELLER_ID || fileConfig.googleAdSense?.directSellerId || DEFAULT_CONFIG.googleAdSense.directSellerId
      ).trim(),
      enableAutoAdsScript: process.env.ADSENSE_ENABLE_AUTO_ADS !== undefined
        ? String(process.env.ADSENSE_ENABLE_AUTO_ADS).trim().toLowerCase() === 'true'
        : fileConfig.googleAdSense?.enableAutoAdsScript !== false,
      generateAdsTxt: fileConfig.googleAdSense?.generateAdsTxt !== false
    },
    otherVerifications: {
      bingMsvalidate: normalizeVerificationToken(
        process.env.BING_VERIFICATION || fileConfig.otherVerifications?.bingMsvalidate || ''
      ),
      yandexVerification: normalizeVerificationToken(
        process.env.YANDEX_VERIFICATION || fileConfig.otherVerifications?.yandexVerification || ''
      ),
      ahrefsSiteVerification: normalizeVerificationToken(
        process.env.AHREFS_SITE_VERIFICATION || fileConfig.otherVerifications?.ahrefsSiteVerification || ''
      )
    },
    seo: {
      generateRobotsTxt: fileConfig.seo?.generateRobotsTxt !== false,
      generateSitemapXml: fileConfig.seo?.generateSitemapXml !== false
    }
  };
}

export function buildHeadTags(config) {
  const lines = [];

  if (config.googleSearchConsole.verificationToken) {
    lines.push(
      `    <meta name="google-site-verification" content="${escapeHtmlAttr(config.googleSearchConsole.verificationToken)}">`
    );
  }

  if (config.otherVerifications.bingMsvalidate) {
    lines.push(
      `    <meta name="msvalidate.01" content="${escapeHtmlAttr(config.otherVerifications.bingMsvalidate)}">`
    );
  }

  if (config.otherVerifications.yandexVerification) {
    lines.push(
      `    <meta name="yandex-verification" content="${escapeHtmlAttr(config.otherVerifications.yandexVerification)}">`
    );
  }

  if (config.otherVerifications.ahrefsSiteVerification) {
    lines.push(
      `    <meta name="ahrefs-site-verification" content="${escapeHtmlAttr(config.otherVerifications.ahrefsSiteVerification)}">`
    );
  }

  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  if (adsense.clientId) {
    lines.push(
      `    <meta name="google-adsense-account" content="${escapeHtmlAttr(adsense.clientId)}">`
    );
    if (config.googleAdSense.enableAutoAdsScript) {
      lines.push(
        `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsense.clientId)}" crossorigin="anonymous"></script>`
      );
    }
  }

  const gaId = config.googleAnalytics.measurementId;
  if (gaId) {
    const safeGaJson = JSON.stringify(gaId).replace(/</g, '\\u003c');
    lines.push(`    <!-- Google Analytics (GA4) -->`);
    lines.push(
      `    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}"></script>`
    );
    lines.push(
      `    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${safeGaJson});</script>`
    );
  }

  if (lines.length === 0) {
    return `${HEAD_MARKER_START}\n    <!-- Configure GA4, GSC, or AdSense IDs in site.config.json or Cloudflare Environment Variables -->\n    ${HEAD_MARKER_END}`;
  }

  return `${HEAD_MARKER_START}\n${lines.join('\n')}\n    ${HEAD_MARKER_END}`;
}

export function renderStaticHtml(rawHtml, config, _options = {}) {
  const headBlock = buildHeadTags(config);

  let html = rawHtml;
  const markerRegex = /<!-- SITE_CONFIG:HEAD_START -->[\s\S]*?<!-- SITE_CONFIG:HEAD_END -->/;

  if (markerRegex.test(html)) {
    html = html.replace(markerRegex, headBlock);
  } else {
    html = html.replace('</head>', `    ${headBlock}\n</head>`);
  }

  if (config.siteUrl && config.siteUrl !== DEFAULT_CONFIG.siteUrl) {
    html = html.replace(/https:\/\/domainname\.web\.id/g, escapeHtmlAttr(config.siteUrl));
  }

  if (config.contactEmail && config.contactEmail !== DEFAULT_CONFIG.contactEmail) {
    html = html.replace(/admin@domainname\.web\.id/g, escapeHtmlAttr(config.contactEmail));
  }

  return html;
}

function setElementInnerTextById(html, id, text) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(<([a-z0-9]+)[^>]*\\bid="${escapedId}"[^>]*>)([\\s\\S]*?)(<\\/\\2>)`, 'i');
  return html.replace(regex, (_m, open, _tag, _body, close) => `${open}${escapeHtmlText(text)}${close}`);
}

function updateSelectedLangOption(html, lang) {
  let out = html.replace(/(<option\s+value="[a-z-]+")\s+selected(?=>)/gi, '$1');
  const targetRegex = new RegExp(`(<option\\s+value="${lang}")(?=>)`, 'i');
  out = out.replace(targetRegex, '$1 selected');
  return out;
}

function localizeTrustPageHtml(rawHtml, pageFile, lang, config) {
  const pageType = PAGE_FILE_TO_TYPE[pageFile];
  if (!pageType || lang === 'en') {
    return renderStaticHtml(rawHtml, config);
  }

  const pack = trustI18n.getPagePack(pageType, lang);
  const chrome = trustI18n.CHROME[lang];
  if (!pack || !chrome) {
    return renderStaticHtml(rawHtml, config);
  }

  const siteUrl = config.siteUrl;
  const contactEmail = config.contactEmail;
  const canonicalUrl = `${siteUrl}${trustI18n.localizeInternalHref(pageFile, lang)}`;
  const ogLocale = trustI18n.OG_LOCALE[lang] || 'en_US';

  let html = renderStaticHtml(rawHtml, config);

  html = html.replace(/<html\s+lang="en"/i, `<html lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(/data-page-lang="en"/i, `data-page-lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlText(pack.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*">/i,
    `<meta name="description" content="${escapeHtmlAttr(pack.desc)}">`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*">/i,
    `<link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta\s+property="og:locale"\s+content="[^"]*">/i,
    `<meta property="og:locale" content="${escapeHtmlAttr(ogLocale)}">`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*">/i,
    `<meta property="og:title" content="${escapeHtmlAttr(pack.title)}">`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*">/i,
    `<meta property="og:description" content="${escapeHtmlAttr(pack.desc)}">`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*">/i,
    `<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}">`
  );

  const jsonLdObj = trustI18n.buildTrustJsonLd(
    pageType,
    lang,
    siteUrl,
    contactEmail,
    pack.title,
    pack.desc,
    pageFile
  );
  const safeJsonLd = JSON.stringify(jsonLdObj, null, 2).replace(/</g, '\\u003c');
  html = html.replace(
    /<script type="application\/ld\+json" id="schemaJsonLd">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="schemaJsonLd">\n    ${safeJsonLd}\n    </script>`
  );

  html = updateSelectedLangOption(html, lang);

  const mainHtml = trustI18n.buildTrustMainHtml(pageType, lang, contactEmail);
  if (mainHtml) {
    html = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/i, `$1\n${mainHtml}\n    $2`);
  }

  // Update header & footer chrome labels
  const labelMap = {
    navGen: chrome.navGenerator,
    navAbout: chrome.navAbout,
    navPrivacy: chrome.navPrivacy,
    navTerms: chrome.navTerms,
    navDisclaimer: chrome.navDisclaimer,
    navContact: chrome.navContact,
    footerSlogan: chrome.footerSlogan,
    footerEditionsTitle: chrome.footerEditions,
    footerLegalTitle: chrome.footerLegal,
    footerAbout: chrome.footerAbout,
    footerPrivacy: chrome.footerPrivacy,
    footerTerms: chrome.footerTerms,
    footerDisclaimer: chrome.footerDisclaimer,
    footerContact: chrome.footerContact,
    footerCopyright: chrome.copyright
  };
  for (const [id, text] of Object.entries(labelMap)) {
    html = setElementInnerTextById(html, id, text);
  }

  // Localize internal header/footer navigation links (except data-trust-edition pills)
  html = html.replace(/<a\s+([^>]*?)href="(\/|\/(?:index|about|privacy-policy|terms|disclaimer|contact)\.html)"([^>]*)>/gi, (full, pre, href, post) => {
    if (/data-trust-edition="/i.test(pre) || /data-trust-edition="/i.test(post)) {
      return full;
    }
    if (href === '/') {
      const homeHref = lang === 'en' ? '/' : `/${lang}/`;
      return `<a ${pre}href="${homeHref}"${post}>`;
    }
    return `<a ${pre}href="${trustI18n.localizeInternalHref(href, lang)}"${post}>`;
  });

  // Update active state on footer data-trust-edition pills
  html = html.replace(
    /<a\s+href="([^"]*)"\s+data-trust-edition="([a-z-]+)"([^>]*)>/gi,
    (_m, href, code) => {
      const isCurrent = code === lang;
      const cls = isCurrent
        ? 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors'
        : 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
      const ariaAttr = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${escapeHtmlAttr(href)}" data-trust-edition="${escapeHtmlAttr(code)}" hreflang="${escapeHtmlAttr(code)}" lang="${escapeHtmlAttr(code)}"${ariaAttr} class="${cls}">`;
    }
  );

  return html;
}

function localizeIndexHtml(rawHtml, lang, config) {
  if (!lang || lang === 'en' || !INDEX_SEO_BY_LANG[lang]) {
    return renderStaticHtml(rawHtml, config);
  }

  const seo = INDEX_SEO_BY_LANG[lang];
  const siteUrl = config.siteUrl;
  const canonicalUrl = `${siteUrl}/${lang}/`;

  let html = renderStaticHtml(rawHtml, config);
  html = html.replace(/<html\s+lang="en"/i, `<html lang="${escapeHtmlAttr(lang)}"`);
  html = html.replace(
    /<title id="metaTitle">[\s\S]*?<\/title>/i,
    `<title id="metaTitle">${escapeHtmlText(seo.title)}</title>`
  );
  html = html.replace(
    /<meta name="description" id="metaDesc" content="[^"]*">/i,
    `<meta name="description" id="metaDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );
  html = html.replace(
    /<meta name="keywords" id="metaKeywords" content="[^"]*">/i,
    `<meta name="keywords" id="metaKeywords" content="${escapeHtmlAttr(seo.keywords)}">`
  );
  html = html.replace(
    /<link rel="canonical" id="canonicalLink" href="[^"]*">/i,
    `<link rel="canonical" id="canonicalLink" href="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta property="og:locale" id="ogLocale" content="[^"]*">/i,
    `<meta property="og:locale" id="ogLocale" content="${escapeHtmlAttr(seo.ogLocale)}">`
  );
  html = html.replace(
    /<meta property="og:site_name" id="ogSiteName" content="[^"]*">/i,
    `<meta property="og:site_name" id="ogSiteName" content="${escapeHtmlAttr(seo.ogSiteName)}">`
  );
  html = html.replace(
    /<meta property="og:title" id="ogTitle" content="[^"]*">/i,
    `<meta property="og:title" id="ogTitle" content="${escapeHtmlAttr(seo.title)}">`
  );
  html = html.replace(
    /<meta property="og:description" id="ogDesc" content="[^"]*">/i,
    `<meta property="og:description" id="ogDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );
  html = html.replace(
    /<meta property="og:url" id="ogUrl" content="[^"]*">/i,
    `<meta property="og:url" id="ogUrl" content="${escapeHtmlAttr(canonicalUrl)}">`
  );
  html = html.replace(
    /<meta name="twitter:title" id="twitterTitle" content="[^"]*">/i,
    `<meta name="twitter:title" id="twitterTitle" content="${escapeHtmlAttr(seo.title)}">`
  );
  html = html.replace(
    /<meta name="twitter:description" id="twitterDesc" content="[^"]*">/i,
    `<meta name="twitter:description" id="twitterDesc" content="${escapeHtmlAttr(seo.desc)}">`
  );

  const schemaObj = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software-application`,
        url: canonicalUrl,
        name: seo.title,
        alternateName: seo.ogSiteName,
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Modern Web Browser.',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: seo.about,
        inLanguage: lang,
        availableLanguage: SUPPORTED_LANGUAGES,
        isAccessibleForFree: true,
        keywords: seo.keywords,
        description: seo.desc,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: seo.title,
        headline: seo.headline,
        description: seo.desc,
        inLanguage: lang,
        isAccessibleForFree: true,
        about: {
          '@type': 'Thing',
          name: seo.about
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domain Name',
          url: `${siteUrl}/`,
          email: config.contactEmail
        },
        mainEntity: {
          '@id': `${canonicalUrl}#software-application`
        }
      }
    ]
  };
  const safeSchema = JSON.stringify(schemaObj, null, 2).replace(/</g, '\\u003c');
  html = html.replace(
    /<script type="application\/ld\+json" id="schemaJsonLd">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" id="schemaJsonLd">\n    ${safeSchema}\n    </script>`
  );

  html = html.replace(
    /<a\s+href="([^"]*)"\s+hreflang="([a-z-]+)"\s+lang="([a-z-]+)"\s+data-footer-lang="([a-z-]+)"\s+onclick="([^"]*)"[^>]*>/gi,
    (_m, href, _hl, _l, code, onclickVal) => {
      const isCurrent = code === lang;
      const cls = isCurrent
        ? 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors'
        : 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
      const ariaAttr = isCurrent ? ' aria-current="page"' : '';
      return `<a href="${escapeHtmlAttr(href)}" hreflang="${escapeHtmlAttr(code)}" lang="${escapeHtmlAttr(code)}" data-footer-lang="${escapeHtmlAttr(code)}" onclick="${escapeHtmlAttr(onclickVal)}"${ariaAttr} class="${cls}">`;
    }
  );

  const extStrat = EXT_STRATEGY_BY_LANG[lang];
  if (extStrat) {
    html = html.replace(
      /(<article\s+id="extensionStrategySection"[^>]*\sdata-rendered-lang=")en(")/i,
      `$1${escapeHtmlAttr(lang)}$2`
    );
    html = setElementInnerTextById(html, 'uiExtStratTitle', extStrat.title);
    html = setElementInnerTextById(html, 'uiExtStratIntro', extStrat.intro);
    html = setElementInnerTextById(html, 'uiExtGTitle', extStrat.gTitle);
    html = setElementInnerTextById(html, 'uiExtGDesc', extStrat.gDesc);
    html = setElementInnerTextById(html, 'uiExtLocTitle', extStrat.locTitle);
    html = setElementInnerTextById(html, 'uiExtLocDesc', extStrat.locDesc);
    html = setElementInnerTextById(html, 'uiExtNTitle', extStrat.nTitle);
    html = setElementInnerTextById(html, 'uiExtNDesc', extStrat.nDesc);
  }

  const riskPack = DOMAIN_RISKS_BY_LANG[lang];
  if (riskPack) {
    html = html.replace(
      /(<article\s+id="domainRisksSection"[^>]*\sdata-rendered-lang=")en(")/i,
      `$1${escapeHtmlAttr(lang)}$2`
    );
    html = setElementInnerTextById(html, 'uiRiskTitle', riskPack.title);
    html = setElementInnerTextById(html, 'uiRiskIntro', riskPack.intro);
    html = setElementInnerTextById(html, 'uiRiskEmdTitle', riskPack.emdTitle);
    html = setElementInnerTextById(html, 'uiRiskEmdDesc', riskPack.emdDesc);
    html = setElementInnerTextById(html, 'uiRiskSpamTitle', riskPack.spamTitle);
    html = setElementInnerTextById(html, 'uiRiskSpamDesc', riskPack.spamDesc);
    html = setElementInnerTextById(html, 'uiRiskBacklinkTitle', riskPack.backlinkTitle);
    html = setElementInnerTextById(html, 'uiRiskBacklinkDesc', riskPack.backlinkDesc);
  }

  const eduFaqPack = EDU_FAQ_BY_LANG[lang];
  if (eduFaqPack) {
    for (const secId of ['keywordStrategySection', 'domainExamplesSection', 'faqSection']) {
      html = html.replace(
        new RegExp(`(<(?:article|section)\\s+id="${secId}"[^>]*\\sdata-rendered-lang=")en(")`, 'i'),
        `$1${escapeHtmlAttr(lang)}$2`
      );
    }

    const aboveFoldByLang = {
      id: {
        title: 'Generator Ide Nama Domain "business"',
        sub: 'Gabungkan kata kunci untuk menemukan ide nama domain yang singkat dan siap pakai dalam hitungan detik.',
        genTitle: 'Nama Bisnis Anda',
        extLabel: 'Ekstensi Domain (mis. .com, .id)',
        genBtn: 'Buat Nama Domain',
        resetBtn: 'Mulai Ulang',
        genMicrocopy: '✓ Standar RFC 1035 · ✓ Tanpa pelacakan · ✓ Berjalan offline di browser',
        advLabel: 'Opsi Lanjutan',
        advHint: '(Kata Sekunder, Tersier, Acak Kata, Pola, Gaya Nama)',
        quickExLabel: 'Contoh cepat:',
        quickExamples: [['toko', 'kopi'], ['jasa', 'web'], ['baju', 'anak'], ['skincare', 'lokal']],
        analysisTitle: 'Hasil Domain',
        analysisSub: 'Cek ketersediaan, skor merek, riwayat backlink, atau arsip secara instan.',
        availOnlyBtn: 'Hanya Available',
        howToBadge: '3 Langkah Cepat',
        howToTitle: 'Cara pakai alat ini dalam 3 langkah',
        step1Title: '1. Masukkan kata kunci',
        step1Desc: 'Ketik kata kunci utama dan pilih ekstensi domain yang diinginkan.',
        step2Title: '2. Buat & filter hasil',
        step2Desc: 'Bandingkan skor pengucapan lalu saring hanya domain yang masih tersedia.',
        step3Title: '3. Cek ketersediaan & salin',
        step3Desc: 'Salin atau ekspor kandidat terbaik, atau buka Opsi Lanjutan untuk pola khusus.',
        ctaBestPractices: 'Panduan & Tips Penamaan Domain →',
        ctaViewFaq: 'Lihat FAQ →',
        shareSummaryTitle: 'Bagikan & Ekspor Tautan',
        editOptionsShortcut: 'Ubah Kata Kunci & Pola',
        wordPermLabel: 'Acak Urutan Kata Kunci',
        wordPermDesc: 'Otomatis acak urutan kata kunci untuk variasi nama lebih banyak.',
        wordPermBadge: 'Susunan: 1 · Variasi: 1',
        wordPermSizeLabel: 'Jumlah Kata',
        wordPermFormatLabel: 'Pemisah',
        wordPermDashLabel: 'Pakai Dash (-)',
        wordPermNoDashLabel: 'Tanpa Dash'
      },
      es: {
        title: 'Generador de Dominios "business"',
        sub: 'Combina tus palabras clave y encuentra ideas de dominios cortos y listos para usar al instante.',
        genTitle: 'Nombre de Tu Negocio',
        extLabel: 'Extensiones (ej. .com, .es)',
        genBtn: 'Generar Nombres de Dominio',
        resetBtn: 'Empezar de Nuevo',
        genMicrocopy: '✓ Cumple RFC 1035 · ✓ Sin rastreo · ✓ Funciona offline tras cargar',
        advLabel: 'Opciones Avanzadas',
        advHint: '(Secundaria, Terciaria, Mezclar, Patrón, Estilos de Nombre)',
        quickExLabel: 'Ejemplos rápidos:',
        quickExamples: [['tienda', 'online'], ['ia', 'tools'], ['viajes', 'baratos'], ['curso', 'online']],
        analysisTitle: 'Resultados de Dominios',
        analysisSub: 'Revisa disponibilidad, puntuación de marca, backlinks y archivo al instante.',
        availOnlyBtn: 'Solo disponibles',
        howToBadge: '3 Pasos',
        howToTitle: 'Cómo usar esta herramienta en 3 pasos',
        step1Title: '1. Escribe tus palabras clave',
        step1Desc: 'Ingresa tu palabra clave principal y elige las extensiones.',
        step2Title: '2. Genera y filtra ideas',
        step2Desc: 'Revisa nombres pronunciables y filtra por disponibilidad al instante.',
        step3Title: '3. Verifica y exporta',
        step3Desc: 'Copia o exporta tus favoritos, o abre Opciones Avanzadas para fórmulas.',
        ctaBestPractices: 'Mejores Prácticas de Dominios →',
        ctaViewFaq: 'Ver FAQ →',
        shareSummaryTitle: 'Compartir y Exportar Enlace',
        editOptionsShortcut: 'Editar Palabras y Patrón',
        wordPermLabel: 'Combinar Orden de Palabras',
        wordPermDesc: 'Mezcla tus palabras clave automáticamente para crear más ideas.',
        wordPermBadge: 'Órdenes: 1 · Ideas: 1',
        wordPermSizeLabel: 'Cantidad de palabras',
        wordPermFormatLabel: 'Separador',
        wordPermDashLabel: 'Con Guion (-)',
        wordPermNoDashLabel: 'Sin Guion'
      },
      pt: {
        title: 'Gerador de Domínios "business"',
        sub: 'Combine suas palavras-chave e encontre ideias de domínios curtos e prontos para usar em segundos.',
        genTitle: 'Nome do Seu Negócio',
        extLabel: 'Extensões (ex. .com, .pt)',
        genBtn: 'Gerar Nomes de Domínio',
        resetBtn: 'Recomeçar',
        genMicrocopy: '✓ Padrão RFC 1035 · ✓ Sem rastreamento · ✓ Funciona offline após carregar',
        advLabel: 'Opções Avançadas',
        advHint: '(Secundária, Terciária, Misturar, Padrão, Estilos de Nome)',
        quickExLabel: 'Exemplos rápidos:',
        quickExamples: [['loja', 'online'], ['ia', 'app'], ['renda', 'extra'], ['saude', 'digital']],
        analysisTitle: 'Resultados de Domínios',
        analysisSub: 'Confira disponibilidade, pontuação de marca, backlinks e histórico na hora.',
        availOnlyBtn: 'Apenas disponíveis',
        howToBadge: '3 Passos',
        howToTitle: 'Como usar esta ferramenta em 3 passos',
        step1Title: '1. Digite suas palavras-chave',
        step1Desc: 'Informe sua palavra-chave principal e escolha as extensões.',
        step2Title: '2. Gere e filtre resultados',
        step2Desc: 'Compare nomes fáceis de pronunciar e filtre os disponíveis.',
        step3Title: '3. Verifique e exporte',
        step3Desc: 'Copie ou exporte sua lista, ou abra Opções Avançadas para padrões.',
        ctaBestPractices: 'Boas Práticas de Domínios →',
        ctaViewFaq: 'Ver FAQ →',
        shareSummaryTitle: 'Compartilhar e Exportar Link',
        editOptionsShortcut: 'Editar Palavras e Padrão',
        wordPermLabel: 'Combinar Ordem das Palavras',
        wordPermDesc: 'Misture suas palavras-chave automaticamente para gerar mais ideias.',
        wordPermBadge: 'Ordens: 1 · Ideias: 1',
        wordPermSizeLabel: 'Nº de palavras',
        wordPermFormatLabel: 'Separador',
        wordPermDashLabel: 'Com Hífen (-)',
        wordPermNoDashLabel: 'Sem Hífen'
      },
      fr: {
        title: 'Générateur de Domaines « business »',
        sub: 'Combinez vos mots-clés pour trouver des idées de domaines courts et prêts à l’emploi en quelques secondes.',
        genTitle: 'Nom de Votre Entreprise',
        extLabel: 'Extensions (ex. .com, .fr)',
        genBtn: 'Générer des Noms de Domaine',
        resetBtn: 'Recommencer',
        genMicrocopy: '✓ Conforme RFC 1035 · ✓ Sans suivi · ✓ Fonctionne hors ligne',
        advLabel: 'Options Avancées',
        advHint: '(Secondaire, Tertiaire, Mélange, Modèle, Styles de Nom)',
        quickExLabel: 'Exemples rapides :',
        quickExamples: [['ia', 'outil'], ['mode', 'femme'], ['immo', 'paris'], ['boutique', 'bio']],
        analysisTitle: 'Résultats de Domaines',
        analysisSub: 'Vérifiez disponibilité, score de marque, backlinks et archives en un clic.',
        availOnlyBtn: 'Disponibles uniquement',
        howToBadge: '3 Étapes',
        howToTitle: 'Comment utiliser cet outil en 3 étapes',
        step1Title: '1. Saisissez vos mots-clés',
        step1Desc: 'Entrez votre mot-clé principal et vos extensions favorites.',
        step2Title: '2. Générez et filtrez',
        step2Desc: 'Comparez la prononciation et filtrez les domaines libres.',
        step3Title: '3. Vérifiez et exportez',
        step3Desc: 'Copiez vos favoris ou ouvrez Options Avancées pour des formules.',
        ctaBestPractices: 'Bonnes Pratiques de Domaines →',
        ctaViewFaq: 'Voir la FAQ →',
        shareSummaryTitle: 'Partager & Exporter le Lien',
        editOptionsShortcut: 'Modifier Mots & Modèles',
        wordPermLabel: 'Mélanger l’ordre des mots',
        wordPermDesc: 'Mélange vos mots-clés automatiquement pour créer plus d’idées.',
        wordPermBadge: 'Ordres : 1 · Idées : 1',
        wordPermSizeLabel: 'Nombre de mots',
        wordPermFormatLabel: 'Séparateur',
        wordPermDashLabel: 'Avec Tiret (-)',
        wordPermNoDashLabel: 'Sans Tiret'
      },
      de: {
        title: '„business“ Domainnamen-Generator',
        sub: 'Kombinieren Sie Ihre Keywords und finden Sie in Sekunden kurze, sofort nutzbare Domain-Ideen.',
        genTitle: 'Ihr Firmenname',
        extLabel: 'Endungen (z. B. .com, .de)',
        genBtn: 'Domainnamen generieren',
        resetBtn: 'Neu Starten',
        genMicrocopy: '✓ RFC 1035-konform · ✓ Kein Tracking · ✓ Offline nutzbar',
        advLabel: 'Erweiterte Optionen',
        advHint: '(Sekundär, Tertiär, Mischen, Muster, Namensstile)',
        quickExLabel: 'Schnellbeispiele:',
        quickExamples: [['ki', 'tools'], ['online', 'shop'], ['solar', 'energie'], ['fitness', 'studio']],
        analysisTitle: 'Domain-Ergebnisse',
        analysisSub: 'Prüfen Sie Verfügbarkeit, Marken-Score, Backlinks und Archivdaten.',
        availOnlyBtn: 'Nur freie',
        howToBadge: '3 Schritte',
        howToTitle: 'So nutzen Sie das Tool in 3 Schritten',
        step1Title: '1. Keywords eingeben',
        step1Desc: 'Geben Sie Ihr Haupt-Keyword und gewünschte Endungen ein.',
        step2Title: '2. Generieren & filtern',
        step2Desc: 'Bewerten Sie die Aussprechbarkeit und filtern Sie freie Domains.',
        step3Title: '3. Prüfen & exportieren',
        step3Desc: 'Kopieren Sie Favoriten oder öffnen Sie Erweiterte Optionen.',
        ctaBestPractices: 'Domain-Naming Best Practices →',
        ctaViewFaq: 'FAQ ansehen →',
        shareSummaryTitle: 'Link teilen & exportieren',
        editOptionsShortcut: 'Keywords & Muster ändern',
        wordPermLabel: 'Wörter automatisch kombinieren',
        wordPermDesc: 'Kombiniert Ihre Keywords automatisch zu weiteren Namensideen.',
        wordPermBadge: 'Muster: 1 · Ideen: 1',
        wordPermSizeLabel: 'Wortanzahl',
        wordPermFormatLabel: 'Trennzeichen',
        wordPermDashLabel: 'Mit Bindestrich (-)',
        wordPermNoDashLabel: 'Ohne Bindestrich'
      },
      ru: {
        title: 'Генератор доменов «business»',
        sub: 'Объединяйте ключевые слова и за секунды находите короткие, готовые к использованию доменные имена.',
        genTitle: 'Название Вашего Бизнеса',
        extLabel: 'Доменные зоны (напр. .com, .ru)',
        genBtn: 'Подобрать домены',
        resetBtn: 'Начать заново',
        genMicrocopy: '✓ Стандарт RFC 1035 · ✓ Без отслеживания · ✓ Работает офлайн',
        advLabel: 'Расширенные настройки',
        advHint: '(Доп. слова, Перемешивание, Шаблон, Стили имен)',
        quickExLabel: 'Быстрые примеры:',
        quickExamples: [['ai', 'bot'], ['stroy', 'dom'], ['auto', 'servis'], ['tur', 'agentstvo']],
        analysisTitle: 'Результаты доменов',
        analysisSub: 'Проверяйте доступность, оценку бренда, ссылки и архив истории.',
        availOnlyBtn: 'Только свободные',
        howToBadge: '3 шага',
        howToTitle: 'Как пользоваться генератором за 3 шага',
        step1Title: '1. Введите ключевые слова',
        step1Desc: 'Укажите главное слово и нужные доменные зоны.',
        step2Title: '2. Создайте и отфильтруйте',
        step2Desc: 'Оцените звучание и отберите только свободные домены.',
        step3Title: '3. Проверьте и сохраните',
        step3Desc: 'Скопируйте список или откройте Расширенные настройки.',
        ctaBestPractices: 'Руководство по выбору домена →',
        ctaViewFaq: 'Открыть FAQ →',
        shareSummaryTitle: 'Поделиться и экспорт ссылки',
        editOptionsShortcut: 'Изменить слова и шаблон',
        wordPermLabel: 'Перемешать порядок слов',
        wordPermDesc: 'Автоматически меняет порядок слов для новых вариантов.',
        wordPermBadge: 'Сочетаний: 1 · Идей: 1',
        wordPermSizeLabel: 'Число слов',
        wordPermFormatLabel: 'Разделитель',
        wordPermDashLabel: 'С дефисом (-)',
        wordPermNoDashLabel: 'Без дефиса'
      },
      ja: {
        title: '「business」ドメイン名ジェネレーター',
        sub: 'キーワードを組み合わせるだけで、短くて使いやすいドメイン候補を数秒で見つけられます。',
        genTitle: 'ビジネス名',
        extLabel: 'ドメイン拡張子 (例: .com, .jp)',
        genBtn: 'ドメイン名を生成',
        resetBtn: '最初からやり直す',
        genMicrocopy: '✓ RFC 1035準拠 · ✓ 追跡なし · ✓ 読み込み後はオフライン動作',
        advLabel: '詳細オプション',
        advHint: '(第2/第3キーワード・シャッフル・独自パターン・スタイル)',
        quickExLabel: 'クイック例:',
        quickExamples: [['ai', 'tool'], ['cafe', 'shop'], ['game', 'app'], ['beauty', 'salon']],
        analysisTitle: 'ドメイン候補',
        analysisSub: '空き状況・発音スコア・被リンク・過去履歴をすぐに確認できます。',
        availOnlyBtn: '取得可能のみ',
        howToBadge: '3ステップ',
        howToTitle: '3ステップで使うドメイン作成',
        step1Title: '1. キーワードを入力',
        step1Desc: 'メインキーワードと拡張子（.com, .jpなど）を入力します。',
        step2Title: '2. 生成と絞り込み',
        step2Desc: '発音スコアを比較し、取得可能なドメインだけに絞り込みます。',
        step3Title: '3. 確認してエクスポート',
        step3Desc: '候補をコピーするか、詳細オプションで独自パターンを作成します。',
        ctaBestPractices: 'ドメイン命名のベストプラクティス →',
        ctaViewFaq: 'FAQを見る →',
        shareSummaryTitle: 'リンクを共有・エクスポート',
        editOptionsShortcut: 'キーワード・パターンを変更',
        wordPermLabel: 'キーワードの組み合わせ設定',
        wordPermDesc: 'キーワードの順番を自動で組み合わせて候補を増やします。',
        wordPermBadge: '並び: 1 · 候補: 1',
        wordPermSizeLabel: '単語数',
        wordPermFormatLabel: '区切り',
        wordPermDashLabel: 'ハイフンあり (-)',
        wordPermNoDashLabel: 'ハイフンなし'
      }
    };
    const atf = aboveFoldByLang[lang] || {};

    const eduMap = {
      uiHeaderTitle: atf.title,
      uiHeaderSub: atf.sub,
      uiSectionGenTitle: atf.genTitle,
      uiExtLabel: atf.extLabel,
      uiGenBtn: atf.genBtn,
      uiAdvGenBtn: atf.genBtn,
      uiMicroRfc: eduFaqPack.proofClaimRfc,
      uiMicroNoTrack: eduFaqPack.proofClaimNoTrack,
      uiMicroOffline: eduFaqPack.proofClaimOffline,
      uiResetFormLabel: atf.resetBtn,
      uiResetAdvLabel: atf.resetBtn,
      uiResetAnalysisLabel: atf.resetBtn,
      uiAdvOptionsLabel: atf.advLabel,
      uiAdvOptionsHint: atf.advHint,
      uiQuickExLabel: atf.quickExLabel,
      uiAnalysisTitle: atf.analysisTitle,
      uiAnalysisSub: atf.analysisSub,
      uiAvailOnlyBtn: atf.availOnlyBtn,
      uiHowToBadge: atf.howToBadge,
      uiHowToTitle: atf.howToTitle,
      uiStep1Title: atf.step1Title,
      uiStep1Desc: atf.step1Desc,
      uiStep2Title: atf.step2Title,
      uiStep2Desc: atf.step2Desc,
      uiStep3Title: atf.step3Title,
      uiStep3Desc: atf.step3Desc,
      uiCtaBestPractices: atf.ctaBestPractices,
      uiCtaViewFaq: atf.ctaViewFaq,
      uiShareSummaryTitle: atf.shareSummaryTitle,
      uiNavGuide: eduFaqPack.navGuide,
      uiNavFaq: eduFaqPack.navFaq,
      uiMobileNavGuide: eduFaqPack.navGuide,
      uiMobileNavFaq: eduFaqPack.navFaq,
      uiEditOptionsShortcutLabel: atf.editOptionsShortcut,
      uiWordPermLabel: atf.wordPermLabel,
      uiWordPermDesc: atf.wordPermDesc,
      wordPermCountBadge: atf.wordPermBadge,
      uiWordPermSizeLabel: atf.wordPermSizeLabel,
      uiWordPermFormatLabel: atf.wordPermFormatLabel,
      uiWordPermDashLabel: atf.wordPermDashLabel,
      uiWordPermNoDashLabel: atf.wordPermNoDashLabel,
      uiStratTitle: eduFaqPack.stratTitle,
      uiStratKwTitle: eduFaqPack.stratKwTitle,
      uiStratKw1: eduFaqPack.stratKw1,
      uiStratKw2: eduFaqPack.stratKw2,
      uiStratKw3: eduFaqPack.stratKw3,
      uiStratBpTitle: eduFaqPack.stratBpTitle,
      uiStratBp1: eduFaqPack.stratBp1,
      uiStratBp2: eduFaqPack.stratBp2,
      uiStratBp3: eduFaqPack.stratBp3,
      uiStratBp4: eduFaqPack.stratBp4,
      uiTipsCheckTitle: eduFaqPack.tipsCheckTitle,
      uiTipsCheck1: eduFaqPack.tipsCheck1,
      uiTipsCheck2: eduFaqPack.tipsCheck2,
      uiTipsCheck3: eduFaqPack.tipsCheck3,
      uiTipsAvoidTitle: eduFaqPack.tipsAvoidTitle,
      uiTipsAvoid1: eduFaqPack.tipsAvoid1,
      uiTipsAvoid2: eduFaqPack.tipsAvoid2,
      uiTipsAvoid3: eduFaqPack.tipsAvoid3,
      uiTipsCureTitle: eduFaqPack.tipsCureTitle,
      uiTipsCure1: eduFaqPack.tipsCure1,
      uiTipsCure2: eduFaqPack.tipsCure2,
      uiTipsCure3: eduFaqPack.tipsCure3,
      uiBadExTitle: eduFaqPack.badExTitle,
      uiGoodExTitle: eduFaqPack.goodExTitle,
      uiFaqTitle: eduFaqPack.faqTitle,
      uiFaqSub: eduFaqPack.faqSub
    };

    for (let i = 1; i <= 4; i++) {
      eduMap[`uiBad${i}Title`] = eduFaqPack[`bad${i}Title`];
      eduMap[`uiBad${i}ExLabel`] = eduFaqPack.exampleLabel;
      eduMap[`uiBad${i}Ex`] = eduFaqPack[`bad${i}Ex`];
      eduMap[`uiBad${i}Reason`] = eduFaqPack[`bad${i}Reason`];
      eduMap[`uiGood${i}Title`] = eduFaqPack[`good${i}Title`];
      eduMap[`uiGood${i}ExLabel`] = eduFaqPack.exampleLabel;
      eduMap[`uiGood${i}Ex`] = eduFaqPack[`good${i}Ex`];
      eduMap[`uiGood${i}Reason`] = eduFaqPack[`good${i}Reason`];
    }

    if (Array.isArray(eduFaqPack.faqs)) {
      eduFaqPack.faqs.forEach((item, idx) => {
        eduMap[`uiFaqQ${idx}`] = item.q;
        eduMap[`uiFaqA${idx}`] = item.a;
      });
    }

    for (const [id, text] of Object.entries(eduMap)) {
      if (text !== undefined) {
        html = setElementInnerTextById(html, id, text);
      }
    }

    if (Array.isArray(atf.quickExamples)) {
      atf.quickExamples.forEach((pair, idx) => {
        if (!Array.isArray(pair)) return;
        const btnId = `uiQuickExBtn${idx + 1}`;
        const k1 = String(pair[0] || '');
        const k2 = String(pair[1] || '');
        const label = [k1, k2].filter(Boolean).join(' ');
        const btnRegex = new RegExp(`(<button\\b[^>]*id="${btnId}"[^>]*data-kw1=")[^"]*("[^>]*data-kw2=")[^"]*("[^>]*>)([\\s\\S]*?)(<\\/button>)`, 'i');
        html = html.replace(btnRegex, `$1${escapeHtmlAttr(k1)}$2${escapeHtmlAttr(k2)}$3${escapeHtmlText(label)}$5`);
      });
    }
  }

  const hubChromeByLang = {
    en: { heroSlogan: 'Find the name that brings your idea to life.', resources: 'Resources', guides: 'Articles', research: 'Research', tools: 'Tools' },
    id: { heroSlogan: 'Temukan nama terbaik untuk memulai langkah besarmu.', resources: 'Sumber Daya', guides: 'Artikel', research: 'Riset', tools: 'Alat' },
    es: { heroSlogan: 'Encuentra el nombre que dará vida a tu próximo proyecto.', resources: 'Recursos', guides: 'Artículos', research: 'Estudios', tools: 'Herramientas' },
    pt: { heroSlogan: 'Encontre o nome ideal para tirar sua ideia do papel.', resources: 'Recursos', guides: 'Artigos', research: 'Pesquisas', tools: 'Ferramentas' },
    fr: { heroSlogan: 'Trouvez le nom qui donnera vie à votre projet.', resources: 'Ressources', guides: 'Articles', research: 'Études', tools: 'Outils' },
    de: { heroSlogan: 'Finde den Domainnamen, der deine Idee zum Leben erweckt.', resources: 'Ressourcen', guides: 'Artikel', research: 'Studien', tools: 'Tools' },
    ru: { heroSlogan: 'Найдите имя, с которого начнётся ваш проект.', resources: 'Ресурсы', guides: 'Статьи', research: 'Исследования', tools: 'Инструменты' },
    ja: { heroSlogan: 'アイデアを形にする、最初の名前を見つけよう。', resources: 'リソース', guides: '記事', research: 'リサーチ', tools: 'ツール' }
  };
  const hubLabels = hubChromeByLang[lang];
  if (hubLabels) {
    html = setElementInnerTextById(html, 'uiHeroSlogan', hubLabels.heroSlogan);
    html = setElementInnerTextById(html, 'uiFooterResourcesTitle', hubLabels.resources);
    for (const id of ['uiNavHubGuides', 'uiMobileHubGuides', 'uiFooterHubGuides']) {
      html = setElementInnerTextById(html, id, hubLabels.guides);
    }
    for (const id of ['uiNavHubResearch', 'uiMobileHubResearch', 'uiFooterHubResearch']) {
      html = setElementInnerTextById(html, id, hubLabels.research);
    }
    for (const id of ['uiNavHubTools', 'uiMobileHubTools', 'uiFooterHubTools']) {
      html = setElementInnerTextById(html, id, hubLabels.tools);
    }
  }
  html = html.replace(
    /<a\s+href="\/(guides|research|tools)\/"([^>]*data-hub-section="\1"[^>]*)>/gi,
    (_m, sec, rest) => `<a href="${escapeHtmlAttr(getHubPath(sec, lang))}"${rest}>`
  );
  html = html.replace(
    /<a\s+href="\/guides\/([a-z0-9-]+)\/"([^>]*data-article-section="guides"[^>]*data-article-slug="\1"[^>]*)>/gi,
    (_m, slug, rest) => `<a href="${escapeHtmlAttr(getArticlePath('guides', slug, lang))}"${rest}>`
  );
  html = html.replace(
    /href="\/(guide|faq)\.html"/gi,
    (_m, page) => `href="${escapeHtmlAttr(trustI18n.localizeInternalHref(`${page}.html`, lang))}"`
  );

  html = updateSelectedLangOption(html, lang);
  html = html.replace('</head>', `    <script>window.__STATIC_PAGE_LANG__ = ${JSON.stringify(lang)};</script>\n</head>`);
  return html;
}

export function renderLocalizedPage(rawHtml, pageFile, lang, config) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  if (pageFile === 'index.html') {
    return localizeIndexHtml(rawHtml, targetLang, config);
  }
  return localizeTrustPageHtml(rawHtml, pageFile, targetLang, config);
}

export function buildCloudflareRedirects() {
  return [
    '/en / 301',
    '/en/ / 301',
    '/en/* /:splat 301',
    ''
  ].join('\n');
}

export function buildCloudflareHeaders() {
  return [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: SAMEORIGIN',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=86400, stale-while-revalidate=604800',
    '',
    '/sitemap.xml',
    '  Cache-Control: public, max-age=3600',
    '',
    '/robots.txt',
    '  Cache-Control: public, max-age=3600',
    '',
    '/ads.txt',
    '  Cache-Control: public, max-age=3600',
    '',
    '/public/*.md',
    '  Content-Type: text/plain; charset=utf-8',
    '  Content-Disposition: inline',
    '  Cache-Control: public, max-age=300',
    '',
    '/public/doku.writer.html',
    '  X-Robots-Tag: noindex, nofollow',
    '  Cache-Control: public, max-age=300',
    '',
    '/admin-articles',
    '  X-Robots-Tag: noindex, nofollow',
    '  Cache-Control: no-store',
    '',
    '/admin-articles/*',
    '  X-Robots-Tag: noindex, nofollow',
    '  Cache-Control: no-store',
    '',
    '/api/articles/*',
    '  X-Robots-Tag: noindex, nofollow',
    '  Cache-Control: no-store',
    ''
  ].join('\n');
}

export function buildAdsTxt(config) {
  if (!config.googleAdSense.generateAdsTxt) return '';
  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  if (!adsense.adsTxtPubId) return '';
  const sellerId = config.googleAdSense.directSellerId || 'f08c47fec0942fa0';
  return `google.com, ${adsense.adsTxtPubId}, DIRECT, ${sellerId}\n`;
}

export function buildRobotsTxt(config) {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin-articles/',
    'Disallow: /api/articles/',
    '',
    `Sitemap: ${config.siteUrl}/sitemap.xml`,
    ''
  ].join('\n');
}

export function buildSitemapXml(config, rootDir = DEFAULT_ROOT_DIR) {
  const baseUrl = config.siteUrl;
  const langs = config.languages;
  const today = new Date().toISOString().slice(0, 10);

  const buildAlternates = (pageFile) => {
    const links = langs.map((lang) => {
      const href = pageFile === 'index.html'
        ? (lang === 'en' ? `${baseUrl}/` : `${baseUrl}/${lang}/`)
        : `${baseUrl}${trustI18n.localizeInternalHref(pageFile, lang)}`;
      return `    <xhtml:link rel="alternate" hreflang="${escapeHtmlAttr(lang)}" href="${escapeHtmlAttr(href)}" />`;
    });
    const xDefaultHref = pageFile === 'index.html' ? `${baseUrl}/` : `${baseUrl}/${pageFile}`;
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(xDefaultHref)}" />`);
    return links.join('\n');
  };

  const urls = [];

  for (const lang of langs) {
    urls.push({
      loc: lang === 'en' ? `${baseUrl}/` : `${baseUrl}/${lang}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: lang === 'en' ? '1.0' : '0.9',
      alternates: buildAlternates('index.html')
    });
  }

  for (const docPage of ['guide.html', 'faq.html']) {
    const alternates = buildAlternates(docPage);
    for (const lang of langs) {
      urls.push({
        loc: `${baseUrl}${trustI18n.localizeInternalHref(docPage, lang)}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: lang === 'en' ? '0.8' : '0.7',
        alternates
      });
    }
  }

  for (const pagePath of TRUST_PAGE_PATHS) {
    const alternates = buildAlternates(pagePath);
    for (const lang of langs) {
      urls.push({
        loc: `${baseUrl}${trustI18n.localizeInternalHref(pagePath, lang)}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: lang === 'en' ? '0.6' : '0.5',
        alternates
      });
    }
  }

  if (rootDir) {
    const manifest = loadArticleManifest(rootDir);
    const activeHubs = getActiveArticleHubs(rootDir, config, manifest);
    for (const hub of activeHubs) {
      const altLinks = hub.publishedLangs.map((altLang) => {
        const href = `${baseUrl}${getHubPath(hub.section, altLang)}`;
        return `    <xhtml:link rel="alternate" hreflang="${escapeHtmlAttr(altLang)}" href="${escapeHtmlAttr(href)}" />`;
      });
      const xDefaultLang = hub.publishedLangs.includes('en') ? 'en' : hub.publishedLangs[0];
      altLinks.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${baseUrl}${getHubPath(hub.section, xDefaultLang)}`)}" />`
      );
      urls.push({
        loc: `${baseUrl}${hub.path}`,
        lastmod: hub.lastmod || today,
        changefreq: 'weekly',
        priority: hub.lang === 'en' ? '0.8' : '0.7',
        alternates: altLinks.join('\n')
      });
    }

    for (const article of manifest.articles) {
      const publishedLangs = langs.filter((l) => article?.locales?.[l]?.published === true);
      if (publishedLangs.length === 0) continue;

      const altLinks = publishedLangs.map((altLang) => {
        const altSlug = resolveArticleSlug(article, altLang);
        const href = `${baseUrl}${getArticlePath(article.section, altSlug, altLang)}`;
        return `    <xhtml:link rel="alternate" hreflang="${escapeHtmlAttr(altLang)}" href="${escapeHtmlAttr(href)}" />`;
      });
      const xDefaultLang = publishedLangs.includes('en') ? 'en' : publishedLangs[0];
      altLinks.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${baseUrl}${getArticlePath(article.section, resolveArticleSlug(article, xDefaultLang), xDefaultLang)}`)}" />`
      );
      const alternatesXml = altLinks.join('\n');

      for (const lang of publishedLangs) {
        const slug = resolveArticleSlug(article, lang);
        const isPillar = Boolean(article.isPillar || article.section === 'guides');
        const priority = isPillar
          ? (lang === 'en' ? '0.8' : '0.7')
          : (lang === 'en' ? '0.7' : '0.6');
        urls.push({
          loc: `${baseUrl}${getArticlePath(article.section, slug, lang)}`,
          lastmod: article.dateModified || article.datePublished || today,
          changefreq: article.changefreq || 'monthly',
          priority,
          alternates: alternatesXml
        });
      }
    }
  }

  const urlBlocks = urls.map((entry) => [
    '  <url>',
    `    <loc>${escapeHtmlAttr(entry.loc)}</loc>`,
    `    <lastmod>${escapeHtmlText(entry.lastmod || today)}</lastmod>`,
    `    <changefreq>${escapeHtmlText(entry.changefreq || 'weekly')}</changefreq>`,
    `    <priority>${escapeHtmlText(entry.priority)}</priority>`,
    entry.alternates,
    '  </url>'
  ].join('\n')).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlBlocks,
    '</urlset>',
    ''
  ].join('\n');
}

const LANG_DISPLAY_LABELS = {
  en: 'English (EN)',
  id: 'Indonesia (ID)',
  es: 'Español (ES)',
  pt: 'Português (PT)',
  fr: 'Français (FR)',
  de: 'Deutsch (DE)',
  ru: 'Русский (RU)',
  ja: '日本語 (JA)'
};

const EDITORIAL_LABELS_BY_LANG = {
  en: {
    authorLabel: 'Author',
    publishedLabel: 'Published',
    updatedLabel: 'Updated',
    readTimeLabel: 'min read',
    datasetLabel: 'Dataset',
    keyTakeawaysTitle: 'Key Takeaways',
    tocTitle: 'Table of Contents',
    methodologyTitle: 'Methodology & Data Limitations',
    faqTitle: 'Frequently Asked Questions',
    relatedTitle: 'Related Articles & Research',
    ctaTitle: 'Test Naming Patterns Live',
    ctaDesc: 'Combine keywords, suffixes, and RFC 1035 rules directly in our multilingual permutation workspace.',
    ctaButton: 'Open Domain Generator'
  },
  id: {
    authorLabel: 'Penulis',
    publishedLabel: 'Terbit',
    updatedLabel: 'Diperbarui',
    readTimeLabel: 'menit baca',
    datasetLabel: 'Dataset',
    keyTakeawaysTitle: 'Ringkasan Utama (Key Takeaways)',
    tocTitle: 'Daftar Isi',
    methodologyTitle: 'Catatan Metodologi & Keterbatasan Data',
    faqTitle: 'Pertanyaan yang Sering Diajukan (FAQ)',
    relatedTitle: 'Artikel & Riset Terkait',
    ctaTitle: 'Uji Pola Nama Domain Secara Langsung',
    ctaDesc: 'Gabungkan kata kunci, akhiran, dan validasi RFC 1035 langsung di generator permutasi domain kami.',
    ctaButton: 'Buka Generator Domain'
  },
  es: {
    authorLabel: 'Autor',
    publishedLabel: 'Publicado',
    updatedLabel: 'Actualizado',
    readTimeLabel: 'min de lectura',
    datasetLabel: 'Conjunto de datos',
    keyTakeawaysTitle: 'Puntos Clave',
    tocTitle: 'Índice',
    methodologyTitle: 'Metodología y Limitaciones de Datos',
    faqTitle: 'Preguntas Frecuentes',
    relatedTitle: 'Artículos y Estudios Relacionados',
    ctaTitle: 'Pruebe Patrones de Dominio en Vivo',
    ctaDesc: 'Combine palabras clave y reglas RFC 1035 directamente en nuestro generador multilingüe.',
    ctaButton: 'Abrir Generador de Dominios'
  },
  pt: {
    authorLabel: 'Autor',
    publishedLabel: 'Publicado',
    updatedLabel: 'Atualizado',
    readTimeLabel: 'min de leitura',
    datasetLabel: 'Conjunto de dados',
    keyTakeawaysTitle: 'Principais Conclusões',
    tocTitle: 'Índice',
    methodologyTitle: 'Metodologia e Limitações dos Dados',
    faqTitle: 'Perguntas Frequentes',
    relatedTitle: 'Artigos e Pesquisas Relacionadas',
    ctaTitle: 'Teste Padrões de Domínio Agora',
    ctaDesc: 'Combine palavras-chave e regras RFC 1035 diretamente em nosso gerador multilíngue.',
    ctaButton: 'Abrir Gerador de Domínios'
  },
  fr: {
    authorLabel: 'Auteur',
    publishedLabel: 'Publié',
    updatedLabel: 'Mis à jour',
    readTimeLabel: 'min de lecture',
    datasetLabel: 'Jeu de données',
    keyTakeawaysTitle: 'Points Clés',
    tocTitle: 'Sommaire',
    methodologyTitle: 'Méthodologie et Limites des Données',
    faqTitle: 'Questions Fréquentes',
    relatedTitle: 'Articles & Études Associés',
    ctaTitle: 'Tester Vos Combinaisons en Direct',
    ctaDesc: 'Combinez mots-clés et règles RFC 1035 directement dans notre générateur multilingue.',
    ctaButton: 'Ouvrir le Générateur'
  },
  de: {
    authorLabel: 'Autor',
    publishedLabel: 'Veröffentlicht',
    updatedLabel: 'Aktualisiert',
    readTimeLabel: 'Min. Lesezeit',
    datasetLabel: 'Datensatz',
    keyTakeawaysTitle: 'Wichtigste Erkenntnisse',
    tocTitle: 'Inhaltsverzeichnis',
    methodologyTitle: 'Methodik & Datenlimitationen',
    faqTitle: 'Häufig gestellte Fragen',
    relatedTitle: 'Weiterführende Artikel & Studien',
    ctaTitle: 'Domain-Muster Direkt Testen',
    ctaDesc: 'Kombinieren Sie Keywords und RFC-1035-Regeln direkt in unserem Domain-Generator.',
    ctaButton: 'Domain-Generator öffnen'
  },
  ru: {
    authorLabel: 'Автор',
    publishedLabel: 'Опубликовано',
    updatedLabel: 'Обновлено',
    readTimeLabel: 'мин чтения',
    datasetLabel: 'Набор данных',
    keyTakeawaysTitle: 'Ключевые выводы',
    tocTitle: 'Содержание',
    methodologyTitle: 'Методология и ограничения данных',
    faqTitle: 'Часто задаваемые вопросы',
    relatedTitle: 'Связанные статьи и исследования',
    ctaTitle: 'Проверьте комбинации доменов',
    ctaDesc: 'Объединяйте ключевые слова и правила RFC 1035 прямо в нашем генераторе доменов.',
    ctaButton: 'Открыть генератор'
  },
  ja: {
    authorLabel: '著者',
    publishedLabel: '公開日',
    updatedLabel: '更新日',
    readTimeLabel: '分で読めます',
    datasetLabel: 'データセット',
    keyTakeawaysTitle: '重要ポイント',
    tocTitle: '目次',
    methodologyTitle: '調査手法とデータの制約',
    faqTitle: 'よくある質問 (FAQ)',
    relatedTitle: '関連記事・リサーチ',
    ctaTitle: 'ドメインパターンを今すぐ試す',
    ctaDesc: 'キーワードとRFC 1035ルールを組み合わせて、ブランドドメイン候補を即座に生成できます。',
    ctaButton: 'ジェネレーターを開く'
  }
};

export function loadArticleManifest(rootDir = DEFAULT_ROOT_DIR) {
  const manifestPath = path.join(rootDir, 'content', 'articles', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { schemaVersion: 1, sections: [...ARTICLE_SECTIONS], articles: [] };
  }
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return {
    schemaVersion: Number(raw?.schemaVersion || 1),
    sections: Array.isArray(raw?.sections) ? raw.sections : [...ARTICLE_SECTIONS],
    articles: Array.isArray(raw?.articles) ? raw.articles : []
  };
}

export function loadArticleHubs(rootDir = DEFAULT_ROOT_DIR) {
  const hubsPath = path.join(rootDir, 'content', 'articles', 'hubs.json');
  if (!fs.existsSync(hubsPath)) {
    return { sections: {} };
  }
  return JSON.parse(fs.readFileSync(hubsPath, 'utf8'));
}

export function resolveArticleSlug(article, lang = 'en') {
  const slug = article?.slugByLang?.[lang] || article?.defaultSlug || article?.id || '';
  return String(slug).trim().toLowerCase();
}

export function getHubPath(section, lang = 'en') {
  return lang === 'en' ? `/${section}/` : `/${lang}/${section}/`;
}

export function getArticlePath(section, slug, lang = 'en') {
  return lang === 'en' ? `/${section}/${slug}/` : `/${lang}/${section}/${slug}/`;
}

export function loadArticleContent(rootDir, article, lang) {
  const contentPath = path.join(rootDir, 'content', 'articles', article.section, article.id, `${lang}.json`);
  if (!fs.existsSync(contentPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
}

export function validateArticleManifest(rootDir, manifest = loadArticleManifest(rootDir), config = loadSiteConfig(rootDir)) {
  const errors = [];
  const seenRoutes = new Set();
  const seenIds = new Set();

  if (manifest.schemaVersion !== 1) {
    errors.push(`Unsupported manifest schemaVersion: ${manifest.schemaVersion}`);
  }

  for (const article of manifest.articles) {
    if (!article || !article.id || !ARTICLE_SLUG_REGEX.test(article.id)) {
      errors.push(`Invalid article id: "${article?.id || ''}"`);
      continue;
    }
    if (seenIds.has(article.id)) {
      errors.push(`Duplicate article id: "${article.id}"`);
    }
    seenIds.add(article.id);

    if (!ARTICLE_SECTIONS.includes(article.section)) {
      errors.push(`Article "${article.id}" has invalid section "${article.section}"`);
    }
    if (article.articleType && !ARTICLE_TYPES.includes(article.articleType)) {
      errors.push(`Article "${article.id}" has invalid articleType "${article.articleType}"`);
    }
    if (article.datePublished && article.dateModified && article.dateModified < article.datePublished) {
      errors.push(`Article "${article.id}" has dateModified (${article.dateModified}) earlier than datePublished (${article.datePublished})`);
    }

    for (const lang of config.languages) {
      const localeMeta = article?.locales?.[lang];
      if (!localeMeta || localeMeta.published !== true) continue;

      const slug = resolveArticleSlug(article, lang);
      if (!ARTICLE_SLUG_REGEX.test(slug)) {
        errors.push(`Article "${article.id}" (${lang}) has invalid slug "${slug}"`);
      }

      const routeKey = getArticlePath(article.section, slug, lang);
      if (seenRoutes.has(routeKey)) {
        errors.push(`Duplicate article route "${routeKey}"`);
      }
      seenRoutes.add(routeKey);

      if (!localeMeta.title || !localeMeta.metaDesc || !localeMeta.h1) {
        errors.push(`Article "${article.id}" (${lang}) missing required locale metadata (title, metaDesc, h1)`);
      }

      const content = loadArticleContent(rootDir, article, lang);
      if (!content) {
        errors.push(`Missing content JSON for published article "${article.id}" (${lang}) at content/articles/${article.section}/${article.id}/${lang}.json`);
      } else if (!Array.isArray(content.sections) || content.sections.length === 0) {
        errors.push(`Article "${article.id}" (${lang}) must define at least one content section`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function findPublishedArticleByRoute(rootDir, section, slug, lang = 'en', manifest = loadArticleManifest(rootDir)) {
  if (!ARTICLE_SECTIONS.includes(section) || !ARTICLE_SLUG_REGEX.test(slug)) {
    return null;
  }
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  for (const article of manifest.articles) {
    if (article.section !== section) continue;
    const localeMeta = article?.locales?.[targetLang];
    if (!localeMeta || localeMeta.published !== true) continue;
    if (resolveArticleSlug(article, targetLang) === slug) {
      return { article, manifest };
    }
  }
  return null;
}

export function getPublishedArticlesForHub(rootDir, section, lang = 'en', manifest = loadArticleManifest(rootDir)) {
  return manifest.articles
    .filter((article) => article.section === section && article?.locales?.[lang]?.published === true)
    .sort((a, b) => {
      const dateA = a.dateModified || a.datePublished || '';
      const dateB = b.dateModified || b.datePublished || '';
      return dateB.localeCompare(dateA);
    });
}

export function getActiveArticleHubs(rootDir, config = loadSiteConfig(rootDir), manifest = loadArticleManifest(rootDir)) {
  const hubs = [];
  for (const section of ARTICLE_SECTIONS) {
    const publishedLangs = config.languages.filter(
      (lang) => getPublishedArticlesForHub(rootDir, section, lang, manifest).length > 0
    );
    for (const lang of publishedLangs) {
      const items = getPublishedArticlesForHub(rootDir, section, lang, manifest);
      const latestMod = items
        .map((a) => a.dateModified || a.datePublished || '')
        .sort((a, b) => b.localeCompare(a))[0];
      hubs.push({
        section,
        lang,
        path: getHubPath(section, lang),
        lastmod: latestMod,
        publishedLangs
      });
    }
  }
  return hubs;
}

function getSectionLabel(hubsData, section, lang) {
  return hubsData?.sections?.[section]?.[lang]?.navLabel
    || hubsData?.sections?.[section]?.en?.navLabel
    || section;
}

function getEditorialNavItems(lang, activeSection, hubsData) {
  const chrome = trustI18n.CHROME[lang] || trustI18n.CHROME.en;
  const eduPack = EDU_FAQ_BY_LANG[lang] || EDU_FAQ_BY_LANG.en;
  const homeHref = lang === 'en' ? '/' : `/${lang}/`;
  return [
    { href: homeHref, label: chrome.navGenerator, active: false },
    { href: trustI18n.localizeInternalHref('guide.html', lang), label: eduPack.navGuide || 'Guide', active: activeSection === 'guide' },
    { href: trustI18n.localizeInternalHref('faq.html', lang), label: eduPack.navFaq || 'FAQ', active: activeSection === 'faq' },
    ...ARTICLE_SECTIONS.map((sec) => ({
      href: getHubPath(sec, lang),
      label: getSectionLabel(hubsData, sec, lang),
      active: sec === activeSection
    })),
    { href: trustI18n.localizeInternalHref('about.html', lang), label: chrome.navAbout, active: false },
    { href: trustI18n.localizeInternalHref('contact.html', lang), label: chrome.navContact, active: false }
  ];
}

function buildEditorialHeaderNav(lang, activeSection, hubsData) {
  return getEditorialNavItems(lang, activeSection, hubsData).map((item) => {
    if (item.active) {
      return `<a href="${escapeHtmlAttr(item.href)}" aria-current="page" class="text-blue-600 dark:text-blue-400 font-semibold">${escapeHtmlText(item.label)}</a>`;
    }
    return `<a href="${escapeHtmlAttr(item.href)}" class="hover:text-slate-900 dark:hover:text-white transition-colors">${escapeHtmlText(item.label)}</a>`;
  }).join('\n                ');
}

function buildEditorialMobileNav(lang, activeSection, hubsData) {
  return getEditorialNavItems(lang, activeSection, hubsData).map((item) => {
    if (item.active) {
      return `<a href="${escapeHtmlAttr(item.href)}" aria-current="page" class="min-h-[44px] flex items-center px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">${escapeHtmlText(item.label)}</a>`;
    }
    return `<a href="${escapeHtmlAttr(item.href)}" class="min-h-[44px] flex items-center px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">${escapeHtmlText(item.label)}</a>`;
  }).join('\n                ');
}

function buildEditorialFooterLinks(lang) {
  const chrome = trustI18n.CHROME[lang] || trustI18n.CHROME.en;
  const legalItems = [
    { file: 'about.html', label: chrome.footerAbout },
    { file: 'privacy-policy.html', label: chrome.footerPrivacy },
    { file: 'terms.html', label: chrome.footerTerms },
    { file: 'disclaimer.html', label: chrome.footerDisclaimer },
    { file: 'contact.html', label: chrome.footerContact }
  ];
  return legalItems.map((item) => {
    const href = trustI18n.localizeInternalHref(item.file, lang);
    return `<li><a href="${escapeHtmlAttr(href)}" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline">${escapeHtmlText(item.label)}</a></li>`;
  }).join('\n                        ');
}

function buildLanguageTargetsMarkup(currentLang, config, resolveHrefForLang) {
  const selectOptions = config.languages.map((code) => {
    const targetHref = resolveHrefForLang(code);
    const selectedAttr = code === currentLang ? ' selected' : '';
    const title = LANG_DISPLAY_LABELS[code] || code.toUpperCase();
    return `<option value="${escapeHtmlAttr(code)}" data-href="${escapeHtmlAttr(targetHref)}" title="${escapeHtmlAttr(title)}"${selectedAttr}>${escapeHtmlText(code.toUpperCase())}</option>`;
  }).join('\n                        ');

  const footerLinks = config.languages.map((code) => {
    const targetHref = resolveHrefForLang(code);
    const isCurrent = code === currentLang;
    const label = LANG_DISPLAY_LABELS[code] || code.toUpperCase();
    const cls = isCurrent
      ? 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors'
      : 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
    const ariaAttr = isCurrent ? ' aria-current="page"' : '';
    return `<a href="${escapeHtmlAttr(targetHref)}" hreflang="${escapeHtmlAttr(code)}" lang="${escapeHtmlAttr(code)}"${ariaAttr} class="${cls}">${escapeHtmlText(label)}</a>`;
  }).join('\n                        ');

  return { selectOptions, footerLinks };
}

function renderArticleSectionsHtml(sections) {
  if (!Array.isArray(sections)) return '';
  return sections.map((sec, idx) => {
    const anchor = escapeHtmlAttr(sec?.anchor || `section-${idx + 1}`);
    const parts = [`<section id="${anchor}" class="space-y-4 scroll-mt-20">`];
    if (sec?.heading) {
      parts.push(`<h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-2">${escapeHtmlText(sec.heading)}</h2>`);
    }
    if (Array.isArray(sec?.paragraphs)) {
      for (const p of sec.paragraphs) {
        parts.push(`<p>${escapeHtmlText(p)}</p>`);
      }
    }
    if (Array.isArray(sec?.bullets) && sec.bullets.length > 0) {
      const items = sec.bullets.map((b) => {
        if (b && typeof b === 'object' && b.label) {
          return `<li><strong class="text-slate-900 dark:text-white">${escapeHtmlText(b.label)}:</strong> ${escapeHtmlText(b.text || '')}</li>`;
        }
        return `<li>${escapeHtmlText(b)}</li>`;
      }).join('');
      parts.push(`<ul class="list-disc pl-5 space-y-2">${items}</ul>`);
    }
    if (sec?.callout && sec.callout.body) {
      const tone = sec.callout.tone === 'warning'
        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-100'
        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/70 text-blue-950 dark:text-blue-100';
      const titleHtml = sec.callout.title
        ? `<p class="font-semibold text-sm mb-1">${escapeHtmlText(sec.callout.title)}</p>`
        : '';
      parts.push(`<aside class="p-4 rounded-xl border ${tone} text-sm leading-relaxed">${titleHtml}<p>${escapeHtmlText(sec.callout.body)}</p></aside>`);
    }
    if (sec?.codeBlock && sec.codeBlock.code) {
      const codeCaption = sec.codeBlock.caption
        ? `<p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">${escapeHtmlText(sec.codeBlock.caption)}</p>`
        : '';
      parts.push(`<div>${codeCaption}<pre class="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"><code>${escapeHtmlText(sec.codeBlock.code)}</code></pre></div>`);
    }
    if (sec?.table && Array.isArray(sec.table.headers) && Array.isArray(sec.table.rows)) {
      const captionHtml = sec.table.caption
        ? `<caption class="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 pb-2">${escapeHtmlText(sec.table.caption)}</caption>`
        : '';
      const thHtml = sec.table.headers
        .map((h) => `<th scope="col" class="px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">${escapeHtmlText(h)}</th>`)
        .join('');
      const trHtml = sec.table.rows.map((row) => {
        const tds = (Array.isArray(row) ? row : [])
          .map((cell) => `<td class="px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">${escapeHtmlText(cell)}</td>`)
          .join('');
        return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">${tds}</tr>`;
      }).join('');
      parts.push(`<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table class="min-w-full border-collapse">${captionHtml}<thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`);
    }
    if (Array.isArray(sec?.subsections)) {
      for (const sub of sec.subsections) {
        parts.push('<div class="space-y-2.5 pt-1">');
        if (sub?.heading) {
          parts.push(`<h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">${escapeHtmlText(sub.heading)}</h3>`);
        }
        if (Array.isArray(sub?.paragraphs)) {
          for (const sp of sub.paragraphs) {
            parts.push(`<p>${escapeHtmlText(sp)}</p>`);
          }
        }
        if (Array.isArray(sub?.bullets) && sub.bullets.length > 0) {
          const sItems = sub.bullets.map((b) => `<li>${escapeHtmlText(b)}</li>`).join('');
          parts.push(`<ul class="list-disc pl-5 space-y-1.5">${sItems}</ul>`);
        }
        parts.push('</div>');
      }
    }
    parts.push('</section>');
    return parts.join('\n');
  }).join('\n');
}

function applyTemplateReplacements(templateHtml, tokens) {
  let out = templateHtml;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split(`{{${key}}}`).join(String(value ?? ''));
  }
  return out;
}

export function renderArticlePage(rootDir, article, lang = 'en', config = loadSiteConfig(rootDir), manifest = loadArticleManifest(rootDir)) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  const localeMeta = article?.locales?.[targetLang];
  if (!localeMeta || localeMeta.published !== true) {
    throw new Error(`Article "${article?.id}" is not published for language "${targetLang}".`);
  }
  const content = loadArticleContent(rootDir, article, targetLang);
  if (!content) {
    throw new Error(`Missing content JSON for "${article.id}" (${targetLang}).`);
  }

  const templatePath = path.join(rootDir, 'templates', 'article.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');
  const hubsData = loadArticleHubs(rootDir);
  const chrome = trustI18n.CHROME[targetLang] || trustI18n.CHROME.en;
  const labels = EDITORIAL_LABELS_BY_LANG[targetLang] || EDITORIAL_LABELS_BY_LANG.en;

  const slug = resolveArticleSlug(article, targetLang);
  const articlePath = getArticlePath(article.section, slug, targetLang);
  const canonicalUrl = `${config.siteUrl}${articlePath}`;
  const homeHref = targetLang === 'en' ? '/' : `/${targetLang}/`;
  const sectionHref = getHubPath(article.section, targetLang);
  const sectionLabel = getSectionLabel(hubsData, article.section, targetLang);

  const publishedLangs = config.languages.filter((l) => article?.locales?.[l]?.published === true);
  const xDefaultLang = publishedLangs.includes('en') ? 'en' : publishedLangs[0];
  const hreflangLines = publishedLangs.map((l) => {
    const href = `${config.siteUrl}${getArticlePath(article.section, resolveArticleSlug(article, l), l)}`;
    return `<link rel="alternate" hreflang="${escapeHtmlAttr(l)}" href="${escapeHtmlAttr(href)}">`;
  });
  hreflangLines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${config.siteUrl}${getArticlePath(article.section, resolveArticleSlug(article, xDefaultLang), xDefaultLang)}`)}">`
  );

  const { selectOptions, footerLinks } = buildLanguageTargetsMarkup(targetLang, config, (code) => {
    if (article?.locales?.[code]?.published === true) {
      return getArticlePath(article.section, resolveArticleSlug(article, code), code);
    }
    return getHubPath(article.section, code);
  });

  const authorName = article?.author?.name || 'Domain Name Research Team';
  const authorHref = trustI18n.localizeInternalHref(article?.author?.url || 'about.html', targetLang);
  const readMins = Number(content.readingTimeMinutes || 6);
  const metaPills = [
    `<span><strong class="text-slate-900 dark:text-white">${escapeHtmlText(labels.authorLabel)}:</strong> <a href="${escapeHtmlAttr(authorHref)}" class="text-blue-600 dark:text-blue-400 hover:underline">${escapeHtmlText(authorName)}</a></span>`,
    `<span><strong class="text-slate-900 dark:text-white">${escapeHtmlText(labels.publishedLabel)}:</strong> <time datetime="${escapeHtmlAttr(article.datePublished || '')}">${escapeHtmlText(article.datePublished || '')}</time></span>`,
    `<span><strong class="text-slate-900 dark:text-white">${escapeHtmlText(labels.updatedLabel)}:</strong> <time datetime="${escapeHtmlAttr(article.dateModified || article.datePublished || '')}">${escapeHtmlText(article.dateModified || article.datePublished || '')}</time></span>`,
    `<span>${escapeHtmlText(String(readMins))} ${escapeHtmlText(labels.readTimeLabel)}</span>`
  ];
  if (article?.dataSnapshot?.sampleSize) {
    const snapText = `${article.dataSnapshot.table || 'available_domains'} · N=${Number(article.dataSnapshot.sampleSize).toLocaleString('en-US')}${article.dataSnapshot.dateRange ? ` · ${article.dataSnapshot.dateRange}` : ''}`;
    metaPills.push(`<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">${escapeHtmlText(labels.datasetLabel)}: ${escapeHtmlText(snapText)}</span>`);
  }
  const eeatMetaBar = `<div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400">${metaPills.join('')}</div>`;

  const keyTakeawaysHtml = Array.isArray(content.keyTakeaways) && content.keyTakeaways.length > 0
    ? `<section aria-label="${escapeHtmlAttr(labels.keyTakeawaysTitle)}" class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
        <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(labels.keyTakeawaysTitle)}</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">${content.keyTakeaways.map((k) => `<li>${escapeHtmlText(k)}</li>`).join('')}</ul>
      </section>`
    : '';

  const tocEntries = (Array.isArray(content.sections) ? content.sections : [])
    .filter((s) => s?.heading)
    .map((s, idx) => ({
      anchor: s.anchor || `section-${idx + 1}`,
      heading: s.heading
    }));
  const tocHtml = tocEntries.length >= 2
    ? `<nav aria-label="${escapeHtmlAttr(labels.tocTitle)}" class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">${escapeHtmlText(labels.tocTitle)}</p>
        <ol class="list-decimal pl-5 space-y-1 text-sm text-blue-600 dark:text-blue-400">${tocEntries.map((t) => `<li><a href="#${escapeHtmlAttr(t.anchor)}" class="hover:underline">${escapeHtmlText(t.heading)}</a></li>`).join('')}</ol>
      </nav>`
    : '';

  const methodologyNoteHtml = content.methodologyNote
    ? `<section class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
        <h2 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(labels.methodologyTitle)}</h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(content.methodologyNote)}</p>
      </section>`
    : '';

  const faqsList = Array.isArray(content.faqs) ? content.faqs.filter((f) => f?.q && f?.a) : [];
  const faqsHtml = faqsList.length > 0
    ? `<section class="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${escapeHtmlText(labels.faqTitle)}</h2>
        <div class="space-y-3">${faqsList.map((f) => `<details class="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"><summary class="font-semibold text-sm sm:text-base text-slate-900 dark:text-white cursor-pointer">${escapeHtmlText(f.q)}</summary><p class="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(f.a)}</p></details>`).join('')}</div>
      </section>`
    : '';

  const relatedList = (Array.isArray(article.relatedIds) ? article.relatedIds : [])
    .map((relId) => manifest.articles.find((a) => a.id === relId && a?.locales?.[targetLang]?.published === true))
    .filter(Boolean);
  const relatedCards = relatedList.map((rel) => {
    const relMeta = rel.locales[targetLang];
    const relHref = getArticlePath(rel.section, resolveArticleSlug(rel, targetLang), targetLang);
    return `<a href="${escapeHtmlAttr(relHref)}" class="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-slate-50/70 dark:bg-slate-800/40">
      <p class="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 mb-1">${escapeHtmlText(getSectionLabel(hubsData, rel.section, targetLang))}</p>
      <p class="font-semibold text-sm text-slate-900 dark:text-white mb-1">${escapeHtmlText(relMeta.h1 || relMeta.title)}</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">${escapeHtmlText(relMeta.excerpt || relMeta.metaDesc)}</p>
    </a>`;
  }).join('');

  const relatedArticlesHtml = `<section class="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
      ${relatedCards ? `<div class="space-y-3"><h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">${escapeHtmlText(labels.relatedTitle)}</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${relatedCards}</div></div>` : ''}
      <div class="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(labels.ctaTitle)}</h3>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">${escapeHtmlText(labels.ctaDesc)}</p>
        </div>
        <a href="${escapeHtmlAttr(homeHref)}" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors">${escapeHtmlText(labels.ctaButton)}</a>
      </div>
    </section>`;

  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  const adSlot1 = adsense.clientId
    ? `<div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="article-mid-content" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="w-full max-w-[728px] mx-auto min-h-[100px] sm:min-h-[90px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"></div>`
    : '<!-- ADSENSE MANUAL SLOT 1: rendered when googleAdSense.publisherId is configured -->';
  const adSlot2 = adsense.clientId
    ? `<div role="region" aria-label="AdSense Placement Slot 2" data-ad-slot-position="article-post-content" data-ad-recommended-size="728x250 / 336x280 (Desktop) | 336x280 (Mobile)" class="w-full max-w-[336px] sm:max-w-[728px] mx-auto min-h-[280px] sm:min-h-[250px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"></div>`
    : '<!-- ADSENSE MANUAL SLOT 2: rendered when googleAdSense.publisherId is configured -->';

  const schemaType = ARTICLE_TYPES.includes(article.articleType) ? article.articleType : 'Article';
  const schemaGraph = [
    {
      '@type': schemaType,
      '@id': `${canonicalUrl}#article`,
      mainEntityOfPage: canonicalUrl,
      headline: localeMeta.h1 || localeMeta.title,
      description: localeMeta.metaDesc,
      inLanguage: targetLang,
      datePublished: article.datePublished || undefined,
      dateModified: article.dateModified || article.datePublished || undefined,
      author: {
        '@type': 'Organization',
        name: authorName,
        url: `${config.siteUrl}${authorHref}`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Domain Name',
        url: `${config.siteUrl}/`,
        email: config.contactEmail
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'Domain Name',
        url: `${config.siteUrl}/`
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: chrome.home, item: `${config.siteUrl}${homeHref}` },
        { '@type': 'ListItem', position: 2, name: sectionLabel, item: `${config.siteUrl}${sectionHref}` },
        { '@type': 'ListItem', position: 3, name: content.breadcrumbLabel || localeMeta.h1 || localeMeta.title, item: canonicalUrl }
      ]
    }
  ];
  if (faqsList.length >= 2) {
    schemaGraph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: faqsList.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a
        }
      }))
    });
  }
  const safeJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }, null, 2).replace(/</g, '\\u003c');

  const siteHost = config.siteUrl.replace(/^https?:\/\//i, '');
  const html = applyTemplateReplacements(rawTemplate, {
    PAGE_LANG: escapeHtmlAttr(targetLang),
    META_TITLE: escapeHtmlText(localeMeta.title),
    META_DESC: escapeHtmlAttr(localeMeta.metaDesc),
    META_KEYWORDS: escapeHtmlAttr(localeMeta.keywords || ''),
    CONTACT_EMAIL: escapeHtmlAttr(config.contactEmail),
    CANONICAL_URL: escapeHtmlAttr(canonicalUrl),
    HREFLANG_LINKS: hreflangLines.join('\n    '),
    OG_LOCALE: escapeHtmlAttr(trustI18n.OG_LOCALE[targetLang] || 'en_US'),
    OG_SITE_NAME: escapeHtmlAttr(INDEX_SEO_BY_LANG[targetLang]?.ogSiteName || 'Domain Name — domainname.web.id'),
    PUBLISHED_TIME_ISO: escapeHtmlAttr(`${article.datePublished || '2026-11-01'}T00:00:00Z`),
    MODIFIED_TIME_ISO: escapeHtmlAttr(`${article.dateModified || article.datePublished || '2026-11-01'}T00:00:00Z`),
    SECTION_LABEL: escapeHtmlText(sectionLabel),
    JSON_LD: safeJsonLd,
    ARTICLE_ID: escapeHtmlAttr(article.id),
    SECTION_KEY: escapeHtmlAttr(article.section),
    HOME_HREF: escapeHtmlAttr(homeHref),
    HOME_LABEL: escapeHtmlText(chrome.home),
    SECTION_HREF: escapeHtmlAttr(sectionHref),
    BREADCRUMB_CURRENT: escapeHtmlText(content.breadcrumbLabel || localeMeta.h1 || localeMeta.title),
    HEADER_NAV_LINKS: buildEditorialHeaderNav(targetLang, article.section, hubsData),
    LANG_SELECT_OPTIONS: selectOptions,
    ARTICLE_H1: escapeHtmlText(localeMeta.h1 || localeMeta.title),
    ARTICLE_EXCERPT: escapeHtmlText(localeMeta.excerpt || localeMeta.metaDesc),
    EEAT_META_BAR: eeatMetaBar,
    INTERACTIVE_WIDGET_HTML: content.interactiveWidgetNotice
      ? `<aside class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200">${escapeHtmlText(content.interactiveWidgetNotice)}</aside>`
      : '',
    KEY_TAKEAWAYS_HTML: keyTakeawaysHtml,
    ADSENSE_SLOT_1: adSlot1,
    TOC_HTML: tocHtml,
    ARTICLE_SECTIONS_HTML: renderArticleSectionsHtml(content.sections),
    METHODOLOGY_NOTE_HTML: methodologyNoteHtml,
    FAQS_HTML: faqsHtml,
    ADSENSE_SLOT_2: adSlot2,
    RELATED_ARTICLES_HTML: relatedArticlesHtml,
    FOOTER_SLOGAN: escapeHtmlText(chrome.footerSlogan),
    SITE_HOST: escapeHtmlText(siteHost),
    FOOTER_EDITIONS_TITLE: escapeHtmlText(chrome.footerEditions),
    FOOTER_EDITIONS_LINKS: footerLinks,
    FOOTER_LEGAL_TITLE: escapeHtmlText(chrome.footerLegal),
    FOOTER_LEGAL_LINKS: buildEditorialFooterLinks(targetLang),
    FOOTER_COPYRIGHT: escapeHtmlText(chrome.copyright)
  });

  return renderStaticHtml(html, config);
}

export function renderArticleHubPage(rootDir, section, lang = 'en', config = loadSiteConfig(rootDir), manifest = loadArticleManifest(rootDir)) {
  if (!ARTICLE_SECTIONS.includes(section)) {
    throw new Error(`Invalid article section "${section}".`);
  }
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  const templatePath = path.join(rootDir, 'templates', 'article-hub.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');
  const hubsData = loadArticleHubs(rootDir);
  const hubCopy = hubsData?.sections?.[section]?.[targetLang] || hubsData?.sections?.[section]?.en || {};
  const chrome = trustI18n.CHROME[targetLang] || trustI18n.CHROME.en;
  const items = getPublishedArticlesForHub(rootDir, section, targetLang, manifest);

  const hubPath = getHubPath(section, targetLang);
  const canonicalUrl = `${config.siteUrl}${hubPath}`;
  const homeHref = targetLang === 'en' ? '/' : `/${targetLang}/`;

  const activeHubLangs = config.languages.filter(
    (l) => getPublishedArticlesForHub(rootDir, section, l, manifest).length > 0
  );
  const hreflangLangs = activeHubLangs.length > 0 ? activeHubLangs : config.languages;
  const xDefaultLang = hreflangLangs.includes('en') ? 'en' : hreflangLangs[0];
  const hreflangLines = hreflangLangs.map((l) => (
    `<link rel="alternate" hreflang="${escapeHtmlAttr(l)}" href="${escapeHtmlAttr(`${config.siteUrl}${getHubPath(section, l)}`)}">`
  ));
  hreflangLines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${config.siteUrl}${getHubPath(section, xDefaultLang)}`)}">`
  );

  const { selectOptions, footerLinks } = buildLanguageTargetsMarkup(targetLang, config, (code) => getHubPath(section, code));

  const sectionTabsHtml = ARTICLE_SECTIONS.map((sec) => {
    const label = getSectionLabel(hubsData, sec, targetLang);
    const href = getHubPath(sec, targetLang);
    const cls = sec === section
      ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white'
      : 'px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
    return `<a href="${escapeHtmlAttr(href)}" class="${cls}">${escapeHtmlText(label)}</a>`;
  }).join('');

  let cardsHtml = '';
  if (items.length === 0) {
    cardsHtml = `<section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">${escapeHtmlText(hubCopy.emptyTitle || 'Coming Soon')}</h2>
          <p class="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">${escapeHtmlText(hubCopy.emptyBody || '')}</p>
        </div>
        <a href="${escapeHtmlAttr(homeHref)}" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors">${escapeHtmlText(hubCopy.ctaLabel || chrome.navGenerator)}</a>
      </section>`;
  } else {
    const cards = items.map((article) => {
      const meta = article.locales[targetLang];
      const content = loadArticleContent(rootDir, article, targetLang);
      const href = getArticlePath(article.section, resolveArticleSlug(article, targetLang), targetLang);
      const dateStr = article.dateModified || article.datePublished || '';
      const mins = Number(content?.readingTimeMinutes || 6);
      return `<article class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between gap-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        <div class="space-y-2.5">
          <div class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider">${escapeHtmlText(article.articleType || 'Article')}</span>
            ${dateStr ? `<span>${escapeHtmlText(hubCopy.updatedLabel || 'Updated')}: ${escapeHtmlText(dateStr)}</span>` : ''}
            <span>· ${escapeHtmlText(String(mins))} ${escapeHtmlText(hubCopy.minReadLabel || 'min read')}</span>
          </div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white leading-snug"><a href="${escapeHtmlAttr(href)}" class="hover:text-blue-600 dark:hover:text-blue-400">${escapeHtmlText(meta.h1 || meta.title)}</a></h2>
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(meta.excerpt || meta.metaDesc)}</p>
        </div>
        <div>
          <a href="${escapeHtmlAttr(href)}" class="inline-flex items-center text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">${escapeHtmlText(hubCopy.readMoreLabel || 'Read More')} &rarr;</a>
        </div>
      </article>`;
    }).join('\n');
    cardsHtml = `<section class="grid grid-cols-1 md:grid-cols-2 gap-5">${cards}</section>`;
  }

  const schemaGraph = [
    {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#collection`,
      url: canonicalUrl,
      name: hubCopy.title || section,
      description: hubCopy.metaDesc || '',
      inLanguage: targetLang,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Domain Name',
        url: `${config.siteUrl}/`
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: chrome.home, item: `${config.siteUrl}${homeHref}` },
        { '@type': 'ListItem', position: 2, name: hubCopy.navLabel || section, item: canonicalUrl }
      ]
    }
  ];
  const safeJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }, null, 2).replace(/</g, '\\u003c');
  const robotsMeta = items.length > 0 ? 'index, follow' : 'noindex, follow';
  const siteHost = config.siteUrl.replace(/^https?:\/\//i, '');

  const html = applyTemplateReplacements(rawTemplate, {
    PAGE_LANG: escapeHtmlAttr(targetLang),
    META_TITLE: escapeHtmlText(hubCopy.title || section),
    META_DESC: escapeHtmlAttr(hubCopy.metaDesc || ''),
    ROBOTS_META: escapeHtmlAttr(robotsMeta),
    CONTACT_EMAIL: escapeHtmlAttr(config.contactEmail),
    CANONICAL_URL: escapeHtmlAttr(canonicalUrl),
    HREFLANG_LINKS: hreflangLines.join('\n    '),
    OG_LOCALE: escapeHtmlAttr(trustI18n.OG_LOCALE[targetLang] || 'en_US'),
    OG_SITE_NAME: escapeHtmlAttr(INDEX_SEO_BY_LANG[targetLang]?.ogSiteName || 'Domain Name — domainname.web.id'),
    JSON_LD: safeJsonLd,
    SECTION_KEY: escapeHtmlAttr(section),
    HOME_HREF: escapeHtmlAttr(homeHref),
    HOME_LABEL: escapeHtmlText(chrome.home),
    SECTION_LABEL: escapeHtmlText(hubCopy.navLabel || section),
    HEADER_NAV_LINKS: buildEditorialHeaderNav(targetLang, section, hubsData),
    LANG_SELECT_OPTIONS: selectOptions,
    HUB_SUBTITLE: escapeHtmlText(hubCopy.subtitle || ''),
    SECTION_TABS_HTML: sectionTabsHtml,
    HUB_H1: escapeHtmlText(hubCopy.h1 || section),
    HUB_INTRO: escapeHtmlText(hubCopy.intro || ''),
    HUB_CARDS_HTML: cardsHtml,
    FOOTER_SLOGAN: escapeHtmlText(chrome.footerSlogan),
    SITE_HOST: escapeHtmlText(siteHost),
    FOOTER_EDITIONS_TITLE: escapeHtmlText(chrome.footerEditions),
    FOOTER_EDITIONS_LINKS: footerLinks,
    FOOTER_LEGAL_TITLE: escapeHtmlText(chrome.footerLegal),
    FOOTER_LEGAL_LINKS: buildEditorialFooterLinks(targetLang),
    FOOTER_COPYRIGHT: escapeHtmlText(chrome.copyright)
  });

  return renderStaticHtml(html, config);
}

export function renderGuidePage(rootDir, lang = 'en', config = loadSiteConfig(rootDir)) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  const templatePath = path.join(rootDir, 'templates', 'guide.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');
  const hubsData = loadArticleHubs(rootDir);
  const manifest = loadArticleManifest(rootDir);
  const chrome = trustI18n.CHROME[targetLang] || trustI18n.CHROME.en;
  const pack = EDU_FAQ_BY_LANG[targetLang] || EDU_FAQ_BY_LANG.en;
  const extPack = EXT_STRATEGY_BY_LANG[targetLang] || EXT_STRATEGY_BY_LANG.en;
  const riskPack = DOMAIN_RISKS_BY_LANG[targetLang] || DOMAIN_RISKS_BY_LANG.en;

  const pagePath = trustI18n.localizeInternalHref('guide.html', targetLang);
  const canonicalUrl = `${config.siteUrl}${pagePath}`;
  const homeHref = targetLang === 'en' ? '/' : `/${targetLang}/`;
  const faqHref = trustI18n.localizeInternalHref('faq.html', targetLang);

  const hreflangLines = config.languages.map((l) => (
    `<link rel="alternate" hreflang="${escapeHtmlAttr(l)}" href="${escapeHtmlAttr(`${config.siteUrl}${trustI18n.localizeInternalHref('guide.html', l)}`)}">`
  ));
  hreflangLines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${config.siteUrl}/guide.html`)}">`
  );

  const { selectOptions, footerLinks } = buildLanguageTargetsMarkup(
    targetLang,
    config,
    (code) => trustI18n.localizeInternalHref('guide.html', code)
  );

  const trustClaims = [
    { id: 'rfc-1035-domain-compliance', badge: pack.proofClaimRfc || '✓ RFC 1035 compliant' },
    { id: 'no-tracking-privacy-architecture', badge: pack.proofClaimNoTrack || '✓ No tracking' },
    { id: 'offline-browser-domain-generator', badge: pack.proofClaimOffline || '✓ Runs offline in browser' }
  ];
  const trustProofCards = trustClaims.map((claim) => {
    const article = manifest.articles.find((a) => a.id === claim.id && a?.locales?.[targetLang]?.published === true);
    if (!article) return '';
    const meta = article.locales[targetLang];
    const href = getArticlePath(article.section, resolveArticleSlug(article, targetLang), targetLang);
    return `<article class="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col justify-between gap-3.5">
      <div class="space-y-2">
        <p class="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">${escapeHtmlText(claim.badge)}</p>
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug"><a href="${escapeHtmlAttr(href)}" class="hover:text-blue-600 dark:hover:text-blue-400">${escapeHtmlText(meta.h1 || meta.title)}</a></h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(meta.excerpt || meta.metaDesc)}</p>
      </div>
      <div>
        <a href="${escapeHtmlAttr(href)}" class="inline-flex items-center text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">${escapeHtmlText(pack.proofReadBtn || 'Read Verification Article →')}</a>
      </div>
    </article>`;
  }).filter(Boolean).join('\n');
  const trustProofSectionHtml = trustProofCards
    ? `<section aria-labelledby="trustProofHeading" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
      <div class="space-y-1.5">
        <p class="text-[11px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">${escapeHtmlText(pack.proofEyebrow || 'Technical Verification')}</p>
        <h2 id="trustProofHeading" class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${escapeHtmlText(pack.proofTitle || 'Verify Our 3 Core Guarantees')}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">${escapeHtmlText(pack.proofIntro || '')}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${trustProofCards}
      </div>
    </section>`
    : '';

  const steps = Array.isArray(pack.guideSteps) ? pack.guideSteps : [];
  const guideStepsHtml = steps.map((step, idx) => {
    const spanClass = idx === steps.length - 1 && steps.length % 2 === 1 ? 'md:col-span-2' : '';
    return `<article class="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 ${spanClass}">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(step.title)}</h3>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(step.text)}</p>
    </article>`;
  }).join('\n');

  const stratCardsHtml = `
    <article class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(pack.stratKwTitle)}</h3>
      <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <li>${escapeHtmlText(pack.stratKw1)}</li>
        <li>${escapeHtmlText(pack.stratKw2)}</li>
        <li>${escapeHtmlText(pack.stratKw3)}</li>
      </ul>
    </article>
    <article class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
      <h3 class="text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(pack.stratBpTitle)}</h3>
      <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <li>${escapeHtmlText(pack.stratBp1)}</li>
        <li>${escapeHtmlText(pack.stratBp2)}</li>
        <li>${escapeHtmlText(pack.stratBp3)}</li>
        <li>${escapeHtmlText(pack.stratBp4)}</li>
      </ul>
    </article>`;

  const extStratCardsHtml = [
    { title: extPack.gTitle, desc: extPack.gDesc },
    { title: extPack.locTitle, desc: extPack.locDesc },
    { title: extPack.nTitle, desc: extPack.nDesc }
  ].map((c) => `<article class="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
    <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(c.title)}</h3>
    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtmlText(c.desc)}</p>
  </article>`).join('\n');

  const riskCardsHtml = [
    { title: riskPack.emdTitle, desc: riskPack.emdDesc },
    { title: riskPack.spamTitle, desc: riskPack.spamDesc },
    { title: riskPack.backlinkTitle, desc: riskPack.backlinkDesc }
  ].map((c) => `<article class="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
    <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">${escapeHtmlText(c.title)}</h3>
    <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtmlText(c.desc)}</p>
  </article>`).join('\n');

  const tipsCardsHtml = [
    { title: pack.tipsCheckTitle, items: [pack.tipsCheck1, pack.tipsCheck2, pack.tipsCheck3] },
    { title: pack.tipsAvoidTitle, items: [pack.tipsAvoid1, pack.tipsAvoid2, pack.tipsAvoid3] },
    { title: pack.tipsCureTitle, items: [pack.tipsCure1, pack.tipsCure2, pack.tipsCure3] }
  ].map((t) => `<article class="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
    <h4 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtmlText(t.title)}</h4>
    <ul class="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${t.items.map((it) => `<li>${escapeHtmlText(it)}</li>`).join('')}</ul>
  </article>`).join('\n');

  const badExCardsHtml = [1, 2, 3, 4].map((i) => `<article class="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtmlText(pack[`bad${i}Title`])}</h3>
    <p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-semibold">${escapeHtmlText(pack.exampleLabel)}</span> <code class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 font-mono text-[11px] break-all">${escapeHtmlText(pack[`bad${i}Ex`])}</code></p>
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtmlText(pack[`bad${i}Reason`])}</p>
  </article>`).join('\n');

  const goodExCardsHtml = [1, 2, 3, 4].map((i) => `<article class="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1.5">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtmlText(pack[`good${i}Title`])}</h3>
    <p class="text-xs text-slate-700 dark:text-slate-300"><span class="font-semibold">${escapeHtmlText(pack.exampleLabel)}</span> <code class="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] break-all">${escapeHtmlText(pack[`good${i}Ex`])}</code></p>
    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${escapeHtmlText(pack[`good${i}Reason`])}</p>
  </article>`).join('\n');

  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  const adSlot1 = adsense.clientId
    ? `<div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="guide-mid-content" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="w-full max-w-[728px] mx-auto min-h-[100px] sm:min-h-[90px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"></div>`
    : '<!-- ADSENSE MANUAL SLOT 1: rendered when googleAdSense.publisherId is configured -->';
  const adSlot2 = adsense.clientId
    ? `<div role="region" aria-label="AdSense Placement Slot 2" data-ad-slot-position="guide-post-content" data-ad-recommended-size="728x250 / 336x280 (Desktop) | 336x280 (Mobile)" class="w-full max-w-[336px] sm:max-w-[728px] mx-auto min-h-[280px] sm:min-h-[250px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"></div>`
    : '<!-- ADSENSE MANUAL SLOT 2: rendered when googleAdSense.publisherId is configured -->';

  const schemaGraph = [
    {
      '@type': 'TechArticle',
      '@id': `${canonicalUrl}#article`,
      mainEntityOfPage: canonicalUrl,
      headline: pack.guideH1,
      description: pack.guideMetaDesc,
      inLanguage: targetLang,
      author: {
        '@type': 'Organization',
        name: 'Domain Name',
        url: `${config.siteUrl}${homeHref}`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Domain Name',
        url: `${config.siteUrl}/`,
        email: config.contactEmail
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: chrome.home, item: `${config.siteUrl}${homeHref}` },
        { '@type': 'ListItem', position: 2, name: pack.navGuide || 'Guide', item: canonicalUrl }
      ]
    }
  ];
  const safeJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }, null, 2).replace(/</g, '\\u003c');
  const siteHost = config.siteUrl.replace(/^https?:\/\//i, '');

  const html = applyTemplateReplacements(rawTemplate, {
    PAGE_LANG: escapeHtmlAttr(targetLang),
    META_TITLE: escapeHtmlText(pack.guideMetaTitle),
    META_DESC: escapeHtmlAttr(pack.guideMetaDesc),
    CONTACT_EMAIL: escapeHtmlAttr(config.contactEmail),
    CANONICAL_URL: escapeHtmlAttr(canonicalUrl),
    HREFLANG_LINKS: hreflangLines.join('\n    '),
    OG_LOCALE: escapeHtmlAttr(trustI18n.OG_LOCALE[targetLang] || 'en_US'),
    OG_SITE_NAME: escapeHtmlAttr(INDEX_SEO_BY_LANG[targetLang]?.ogSiteName || 'Domain Name — domainname.web.id'),
    JSON_LD: safeJsonLd,
    HOME_HREF: escapeHtmlAttr(homeHref),
    HOME_LABEL: escapeHtmlText(chrome.home),
    FAQ_HREF: escapeHtmlAttr(faqHref),
    BREADCRUMB_LABEL: escapeHtmlText(pack.navGuide || 'Guide'),
    HEADER_NAV_LINKS: buildEditorialHeaderNav(targetLang, 'guide', hubsData),
    MOBILE_NAV_LINKS: buildEditorialMobileNav(targetLang, 'guide', hubsData),
    LANG_SELECT_OPTIONS: selectOptions,
    GUIDE_EYEBROW: escapeHtmlText(pack.guideEyebrow),
    GUIDE_H1: escapeHtmlText(pack.guideH1),
    GUIDE_INTRO: escapeHtmlText(pack.guideIntro),
    TRUST_PROOF_SECTION_HTML: trustProofSectionHtml,
    GUIDE_STEPS_TITLE: escapeHtmlText(pack.guideTitle),
    GUIDE_STEPS_HTML: guideStepsHtml,
    STRAT_TITLE: escapeHtmlText(pack.stratTitle),
    STRAT_CARDS_HTML: stratCardsHtml,
    ADSENSE_SLOT_1: adSlot1,
    EXT_STRAT_TITLE: escapeHtmlText(extPack.title),
    EXT_STRAT_INTRO: escapeHtmlText(extPack.intro),
    EXT_STRAT_CARDS_HTML: extStratCardsHtml,
    RISK_TITLE: escapeHtmlText(riskPack.title),
    RISK_INTRO: escapeHtmlText(riskPack.intro),
    RISK_CARDS_HTML: riskCardsHtml,
    TIPS_TITLE: escapeHtmlText(pack.tipsTitle),
    TIPS_CARDS_HTML: tipsCardsHtml,
    BAD_EX_TITLE: escapeHtmlText(pack.badExTitle),
    BAD_EX_CARDS_HTML: badExCardsHtml,
    GOOD_EX_TITLE: escapeHtmlText(pack.goodExTitle),
    GOOD_EX_CARDS_HTML: goodExCardsHtml,
    ADSENSE_SLOT_2: adSlot2,
    CTA_GEN_TITLE: escapeHtmlText(pack.ctaGenTitle),
    CTA_GEN_DESC: escapeHtmlText(pack.ctaGenDesc),
    CTA_GEN_BTN: escapeHtmlText(pack.ctaGenBtn),
    CTA_FAQ_LINK: escapeHtmlText(pack.ctaFaqLink),
    FOOTER_SLOGAN: escapeHtmlText(chrome.footerSlogan),
    SITE_HOST: escapeHtmlText(siteHost),
    FOOTER_EDITIONS_TITLE: escapeHtmlText(chrome.footerEditions),
    FOOTER_EDITIONS_LINKS: footerLinks,
    FOOTER_LEGAL_TITLE: escapeHtmlText(chrome.footerLegal),
    FOOTER_LEGAL_LINKS: buildEditorialFooterLinks(targetLang),
    FOOTER_COPYRIGHT: escapeHtmlText(chrome.copyright)
  });

  return renderStaticHtml(html, config);
}

export function renderFaqPage(rootDir, lang = 'en', config = loadSiteConfig(rootDir)) {
  const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  const templatePath = path.join(rootDir, 'templates', 'faq.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');
  const hubsData = loadArticleHubs(rootDir);
  const chrome = trustI18n.CHROME[targetLang] || trustI18n.CHROME.en;
  const pack = EDU_FAQ_BY_LANG[targetLang] || EDU_FAQ_BY_LANG.en;

  const pagePath = trustI18n.localizeInternalHref('faq.html', targetLang);
  const canonicalUrl = `${config.siteUrl}${pagePath}`;
  const homeHref = targetLang === 'en' ? '/' : `/${targetLang}/`;
  const guideHref = trustI18n.localizeInternalHref('guide.html', targetLang);

  const hreflangLines = config.languages.map((l) => (
    `<link rel="alternate" hreflang="${escapeHtmlAttr(l)}" href="${escapeHtmlAttr(`${config.siteUrl}${trustI18n.localizeInternalHref('faq.html', l)}`)}">`
  ));
  hreflangLines.push(
    `<link rel="alternate" hreflang="x-default" href="${escapeHtmlAttr(`${config.siteUrl}/faq.html`)}">`
  );

  const { selectOptions, footerLinks } = buildLanguageTargetsMarkup(
    targetLang,
    config,
    (code) => trustI18n.localizeInternalHref('faq.html', code)
  );

  const faqsList = Array.isArray(pack.faqs) ? pack.faqs : [];
  const faqItemsHtml = faqsList.map((item, idx) => `<details${idx === 0 ? ' open' : ''} class="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <summary class="w-full min-h-[52px] px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
      <span class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">${escapeHtmlText(item.q)}</span>
      <svg aria-hidden="true" class="w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </summary>
    <div class="px-5 pb-5 pt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
      <p>${escapeHtmlText(item.a)}</p>
    </div>
  </details>`).join('\n');

  const adsense = normalizeAdSenseIds(config.googleAdSense.publisherId);
  const adSlot1 = adsense.clientId
    ? `<div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="faq-post-list" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="w-full max-w-[728px] mx-auto min-h-[100px] sm:min-h-[90px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl"></div>`
    : '<!-- ADSENSE MANUAL SLOT 1: rendered when googleAdSense.publisherId is configured -->';

  const schemaGraph = [
    {
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      url: canonicalUrl,
      inLanguage: targetLang,
      mainEntity: faqsList.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a
        }
      }))
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: chrome.home, item: `${config.siteUrl}${homeHref}` },
        { '@type': 'ListItem', position: 2, name: pack.navFaq || 'FAQ', item: canonicalUrl }
      ]
    }
  ];
  const safeJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }, null, 2).replace(/</g, '\\u003c');
  const siteHost = config.siteUrl.replace(/^https?:\/\//i, '');

  const html = applyTemplateReplacements(rawTemplate, {
    PAGE_LANG: escapeHtmlAttr(targetLang),
    META_TITLE: escapeHtmlText(pack.faqMetaTitle),
    META_DESC: escapeHtmlAttr(pack.faqMetaDesc),
    CONTACT_EMAIL: escapeHtmlAttr(config.contactEmail),
    CANONICAL_URL: escapeHtmlAttr(canonicalUrl),
    HREFLANG_LINKS: hreflangLines.join('\n    '),
    OG_LOCALE: escapeHtmlAttr(trustI18n.OG_LOCALE[targetLang] || 'en_US'),
    OG_SITE_NAME: escapeHtmlAttr(INDEX_SEO_BY_LANG[targetLang]?.ogSiteName || 'Domain Name — domainname.web.id'),
    JSON_LD: safeJsonLd,
    HOME_HREF: escapeHtmlAttr(homeHref),
    HOME_LABEL: escapeHtmlText(chrome.home),
    GUIDE_HREF: escapeHtmlAttr(guideHref),
    BREADCRUMB_LABEL: escapeHtmlText(pack.navFaq || 'FAQ'),
    HEADER_NAV_LINKS: buildEditorialHeaderNav(targetLang, 'faq', hubsData),
    MOBILE_NAV_LINKS: buildEditorialMobileNav(targetLang, 'faq', hubsData),
    LANG_SELECT_OPTIONS: selectOptions,
    FAQ_EYEBROW: escapeHtmlText(pack.faqEyebrow),
    FAQ_H1: escapeHtmlText(pack.faqH1),
    FAQ_SUB: escapeHtmlText(pack.faqSub),
    FAQ_ITEMS_HTML: faqItemsHtml,
    ADSENSE_SLOT_1: adSlot1,
    CTA_GEN_TITLE: escapeHtmlText(pack.ctaGenTitle),
    CTA_GEN_DESC: escapeHtmlText(pack.ctaGenDesc),
    CTA_GEN_BTN: escapeHtmlText(pack.ctaGenBtn),
    CTA_GUIDE_LINK: escapeHtmlText(pack.ctaGuideLink),
    FOOTER_SLOGAN: escapeHtmlText(chrome.footerSlogan),
    SITE_HOST: escapeHtmlText(siteHost),
    FOOTER_EDITIONS_TITLE: escapeHtmlText(chrome.footerEditions),
    FOOTER_EDITIONS_LINKS: footerLinks,
    FOOTER_LEGAL_TITLE: escapeHtmlText(chrome.footerLegal),
    FOOTER_LEGAL_LINKS: buildEditorialFooterLinks(targetLang),
    FOOTER_COPYRIGHT: escapeHtmlText(chrome.copyright)
  });

  return renderStaticHtml(html, config);
}

