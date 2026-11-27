(function (root) {
    const SUPPORTED_LANGS = ['en', 'id', 'es', 'pt', 'fr', 'de', 'ru', 'ja'];
    const TRUST_PAGES = ['index.html', 'guide.html', 'faq.html', 'about.html', 'privacy-policy.html', 'terms.html', 'disclaimer.html', 'contact.html'];
    const OG_LOCALE = {
        en: 'en_US',
        id: 'id_ID',
        es: 'es_ES',
        pt: 'pt_BR',
        fr: 'fr_FR',
        de: 'de_DE',
        ru: 'ru_RU',
        ja: 'ja_JP'
    };

    let originalEnglishSnapshot = null;

    function localizeInternalHref(rawHref, lang) {
        if (!rawHref) return rawHref;
        const hashIdx = rawHref.indexOf('#');
        const hashPart = hashIdx !== -1 ? rawHref.slice(hashIdx) : '';
        const cleanRaw = (hashIdx !== -1 ? rawHref.slice(0, hashIdx) : rawHref).split('?')[0];
        const normalized = cleanRaw.replace(/^\/+/, '');
        if (cleanRaw === '/' || normalized === '' || (pathPartsSingle(normalized) && SUPPORTED_LANGS.includes(normalized.replace(/\/$/, '')))) {
            if (!lang || lang === 'en') return `/${hashPart}`;
            return `/${lang}/${hashPart}`;
        }
        function pathPartsSingle(s) { return !s.replace(/\/$/, '').includes('/'); }
        let filePart = normalized;
        const pathParts = normalized.split('/');
        if (pathParts.length === 2 && SUPPORTED_LANGS.includes(pathParts[0])) {
            filePart = pathParts[1];
        }
        if (!TRUST_PAGES.includes(filePart)) {
            return rawHref;
        }
        if (!lang || lang === 'en') {
            return `/${filePart}${hashPart}`;
        }
        return `/${lang}/${filePart}${hashPart}`;
    }

    function getSiteUrl() {
        if (typeof document !== 'undefined') {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical && canonical.getAttribute('href')) {
                try {
                    return new URL(canonical.getAttribute('href')).origin;
                } catch (e) {}
            }
            if (typeof window !== 'undefined' && window.location && /^https?:/i.test(window.location.protocol)) {
                return window.location.origin;
            }
        }
        return 'https://domainname.web.id';
    }

    function getContactEmail() {
        if (typeof document !== 'undefined') {
            const emailMeta = document.querySelector('meta[name="contact-email"]');
            if (emailMeta && emailMeta.getAttribute('content')) {
                return emailMeta.getAttribute('content').trim();
            }
            const emailLink = document.getElementById('publisherEmailLink');
            if (emailLink && emailLink.textContent.trim()) {
                return emailLink.textContent.trim();
            }
            const mailLink = document.querySelector('a[href^="mailto:"]');
            if (mailLink && mailLink.textContent.trim()) {
                return mailLink.textContent.trim();
            }
        }
        return 'admin@domainname.web.id';
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const CHROME = {
        en: {
            navGenerator: 'Generator',
            navAbout: 'About',
            navPrivacy: 'Privacy Policy',
            navTerms: 'Terms',
            navDisclaimer: 'Disclaimer',
            navContact: 'Contact',
            openTool: 'Open Tool',
            home: 'Home',
            footerSlogan: 'Domain Ideas Permutation Generator • RFC 1035 Compliant',
            footerEditions: 'Editions',
            footerLegal: 'Information & Legal',
            footerAbout: 'About',
            footerPrivacy: 'Privacy Policy',
            footerTerms: 'Terms of Service',
            footerDisclaimer: 'Disclaimer',
            footerContact: 'Contact Us',
            copyright: '© 2026 Domain Name (domainname.web.id). All rights reserved.'
        },
        id: {
            navGenerator: 'Generator',
            navAbout: 'Tentang Kami',
            navPrivacy: 'Kebijakan Privasi',
            navTerms: 'Ketentuan',
            navDisclaimer: 'Sanggahan',
            navContact: 'Kontak',
            openTool: 'Buka Alat',
            home: 'Beranda',
            footerSlogan: 'Generator Permutasi Ide Domain • Standar RFC 1035',
            footerEditions: 'Edisi Bahasa',
            footerLegal: 'Informasi & Legal',
            footerAbout: 'Tentang Kami',
            footerPrivacy: 'Kebijakan Privasi',
            footerTerms: 'Ketentuan Layanan',
            footerDisclaimer: 'Sanggahan (Disclaimer)',
            footerContact: 'Hubungi Kami',
            copyright: '© 2026 Domain Name (domainname.web.id). Hak cipta dilindungi.'
        },
        es: {
            navGenerator: 'Generador',
            navAbout: 'Acerca de',
            navPrivacy: 'Privacidad',
            navTerms: 'Términos',
            navDisclaimer: 'Aviso Legal',
            navContact: 'Contacto',
            openTool: 'Abrir Herramienta',
            home: 'Inicio',
            footerSlogan: 'Generador de Permutaciones de Ideas de Dominio • Conforme a RFC 1035',
            footerEditions: 'Idiomas',
            footerLegal: 'Información y Legal',
            footerAbout: 'Acerca de',
            footerPrivacy: 'Política de Privacidad',
            footerTerms: 'Términos de Servicio',
            footerDisclaimer: 'Aviso Legal',
            footerContact: 'Contacto',
            copyright: '© 2026 Domain Name (domainname.web.id). Todos los derechos reservados.'
        },
        pt: {
            navGenerator: 'Gerador',
            navAbout: 'Sobre Nós',
            navPrivacy: 'Privacidade',
            navTerms: 'Termos',
            navDisclaimer: 'Aviso Legal',
            navContact: 'Contato',
            openTool: 'Abrir Ferramenta',
            home: 'Início',
            footerSlogan: 'Gerador de Permutações de Ideias de Domínio • Compatível com RFC 1035',
            footerEditions: 'Idiomas',
            footerLegal: 'Informações e Legal',
            footerAbout: 'Sobre Nós',
            footerPrivacy: 'Política de Privacidade',
            footerTerms: 'Termos de Uso',
            footerDisclaimer: 'Aviso Legal',
            footerContact: 'Contato',
            copyright: '© 2026 Domain Name (domainname.web.id). Todos os direitos reservados.'
        },
        fr: {
            navGenerator: 'Générateur',
            navAbout: 'À propos',
            navPrivacy: 'Confidentialité',
            navTerms: 'Conditions',
            navDisclaimer: 'Mentions légales',
            navContact: 'Contact',
            openTool: 'Ouvrir l’outil',
            home: 'Accueil',
            footerSlogan: 'Générateur de Permutations d’Idées de Domaines • Conforme RFC 1035',
            footerEditions: 'Éditions',
            footerLegal: 'Informations & Légal',
            footerAbout: 'À propos',
            footerPrivacy: 'Confidentialité',
            footerTerms: 'Conditions d’utilisation',
            footerDisclaimer: 'Mentions légales',
            footerContact: 'Contact',
            copyright: '© 2026 Domain Name (domainname.web.id). Tous droits réservés.'
        },
        de: {
            navGenerator: 'Generator',
            navAbout: 'Über uns',
            navPrivacy: 'Datenschutz',
            navTerms: 'Bedingungen',
            navDisclaimer: 'Haftungsausschluss',
            navContact: 'Kontakt',
            openTool: 'Tool öffnen',
            home: 'Startseite',
            footerSlogan: 'Domain-Ideen Permutations-Generator • RFC 1035-konform',
            footerEditions: 'Sprachen',
            footerLegal: 'Informationen & Rechtliches',
            footerAbout: 'Über uns',
            footerPrivacy: 'Datenschutz',
            footerTerms: 'Nutzungsbedingungen',
            footerDisclaimer: 'Haftungsausschluss',
            footerContact: 'Kontakt',
            copyright: '© 2026 Domain Name (domainname.web.id). Alle Rechte vorbehalten.'
        },
        ru: {
            navGenerator: 'Генератор',
            navAbout: 'О сервисе',
            navPrivacy: 'Конфиденциальность',
            navTerms: 'Условия',
            navDisclaimer: 'Отказ от ответственности',
            navContact: 'Контакты',
            openTool: 'Открыть инструмент',
            home: 'Главная',
            footerSlogan: 'Генератор перестановок идей доменов • Соответствие RFC 1035',
            footerEditions: 'Версии',
            footerLegal: 'Информация и право',
            footerAbout: 'О сервисе',
            footerPrivacy: 'Конфиденциальность',
            footerTerms: 'Условия использования',
            footerDisclaimer: 'Отказ от ответственности',
            footerContact: 'Контакты',
            copyright: '© 2026 Domain Name (domainname.web.id). Все права защищены.'
        },
        ja: {
            navGenerator: 'ジェネレータ',
            navAbout: '概要',
            navPrivacy: 'プライバシー',
            navTerms: '利用規約',
            navDisclaimer: '免責事項',
            navContact: 'お問い合わせ',
            openTool: 'ツールを開く',
            home: 'ホーム',
            footerSlogan: 'ドメインアイデア置換ジェネレーター • RFC 1035 準拠',
            footerEditions: '言語版',
            footerLegal: '情報・法務',
            footerAbout: '概要',
            footerPrivacy: 'プライバシーポリシー',
            footerTerms: '利用規約',
            footerDisclaimer: '免責事項',
            footerContact: 'お問い合わせ',
            copyright: '© 2026 Domain Name (domainname.web.id). All rights reserved.'
        }
    };

    const ABOUT_T = {
        id: {
            title: 'Tentang Kami — Domain Name (domainname.web.id)',
            desc: 'Tentang Domain Name (domainname.web.id), teknologi permutasi domain RFC 1035, standar editorial, dan komitmen riset domain yang menjaga privasi.',
            crumb: 'Tentang Kami',
            eyebrow: 'Profil Platform & Misi',
            h1: 'Tentang Domain Name (domainname.web.id)',
            lead: 'Alat generator permutasi nama domain multibahasa yang cepat dan utilitas riset teknis untuk pendiri startup, investor domain, peneliti SEO, dan pengembang web.',
            s1h: 'Siapa Kami & Apa yang Kami Bangun',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) dibuat untuk memecahkan kendala praktis saat mencari nama domain: menemukan kombinasi domain yang singkat, mudah diingat, dan valid secara teknis tanpa spreadsheet rumit.',
            s1p2: 'Platform ini mengubah hingga tiga kata kunci (<em>Utama</em>, <em>Sekunder</em>, dan <em>Tersier</em>) bersama formula pola kustom (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[vokal]</code>, <code>[konsonan]</code>, <code>[angka]</code>, dan <code>[dash]</code>) menjadi daftar kandidat domain siap pakai dalam 8 bahasa.',
            s2h: 'Standar Teknis & Kemampuan Inti',
            s2l: [
                '<strong>Kepatuhan DNS RFC 1035:</strong> Setiap kandidat domain otomatis disanitasi dan divalidasi mengikuti standar hostname DNS Internet—huruf kecil ASCII, tanda hubung internal saja, batas 63 karakter per label, dan batas panjang total hostname.',
                '<strong>Urutan Terpendek Terlebih Dahulu:</strong> Domain yang singkat lebih bernilai untuk branding. Hasil permutasi otomatis diurutkan dari karakter terpendek ke terpanjang agar kandidat terbaik langsung terlihat di bagian atas.',
                '<strong>Pemrosesan Lokal Menjaga Privasi:</strong> Kata kunci dan formula ide merek Anda diproses langsung di browser. Kami tidak menyimpan atau menjual kueri kata kunci Anda. Baca selengkapnya di <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kebijakan Privasi</a>.',
                '<strong>Pintasan Riset Aman SEO:</strong> Tautan pemeriksaan cepat ke Wayback Machine, Ahrefs, dan pencarian Google <code>site:</code> dilindungi atribut ketat <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Independensi Editorial & Transparansi',
            s3p1: 'Domain Name beroperasi sebagai utilitas web independen dan tidak menjual pendaftaran domain secara langsung maupun menerima komisi untuk mengutamakan ekstensi tertentu. Seluruh panduan di <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">Panduan & FAQ</a> disusun murni untuk tujuan edukasi dan riset.',
            s3p2: 'Sebelum mendaftarkan kandidat domain, pengguna tetap wajib memverifikasi ketersediaan, merek dagang, dan riwayat secara mandiri sesuai <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Ketentuan Layanan</a> dan <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Sanggahan (Disclaimer)</a>.',
            boxH: 'Hubungi Kami',
            boxP: (email) => `Punya masukan, permintaan fitur, laporan bug, atau pertanyaan kepatuhan? Kunjungi <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Halaman Kontak</a> atau kirim email ke <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        es: {
            title: 'Acerca de Nosotros — Domain Name (domainname.web.id)',
            desc: 'Conoce Domain Name (domainname.web.id), nuestra tecnología de permutación de dominios RFC 1035 y compromiso con la privacidad.',
            crumb: 'Acerca de',
            eyebrow: 'Resumen y Misión',
            h1: 'Acerca de Domain Name (domainname.web.id)',
            lead: 'Un generador multilingüe de permutaciones de nombres de dominio y utilidad de investigación técnica para fundadores, inversores y especialistas SEO.',
            s1h: 'Quiénes Somos y Qué Construimos',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) nació para resolver un problema práctico: descubrir nombres de dominio cortos, memorables y técnicamente válidos sin hojas de cálculo complejas.',
            s1p2: 'Nuestra plataforma combina hasta tres palabras clave (<em>Principal</em>, <em>Secundaria</em> y <em>Terciaria</em>) y fórmulas personalizadas (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[vocal]</code>, <code>[consonante]</code>, <code>[número]</code>, <code>[dash]</code>) en 8 idiomas.',
            s2h: 'Estándares Técnicos y Capacidades Clave',
            s2l: [
                '<strong>Cumplimiento DNS RFC 1035:</strong> Cada dominio se limpia y valida automáticamente según las reglas estándar de DNS (minúsculas ASCII, guiones internos, máximo 63 caracteres por etiqueta).',
                '<strong>Prioridad Más Cortos Primero:</strong> Los dominios breves tienen mayor valor de marca, por lo que ordenamos automáticamente de menor a mayor longitud.',
                '<strong>Privacidad en el Navegador:</strong> Todas las combinaciones se procesan localmente sin almacenar ni revender tus palabras clave. Consulta la <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</a>.',
                '<strong>Accesos Directos Seguros para SEO:</strong> Enlaces a Wayback Machine, Ahrefs y Google <code>site:</code> protegidos con <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Independencia Editorial y Transparencia',
            s3p1: 'Domain Name es una herramienta independiente; no vendemos dominios ni cobramos comisiones por priorizar extensiones. Consulta la <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">Guía y FAQ</a> para fines educativos.',
            s3p2: 'Antes de registrar un dominio, verifica disponibilidad y marcas registradas según nuestros <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Términos de Servicio</a> y <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.',
            boxH: 'Contacto',
            boxP: (email) => `¿Tienes comentarios, reportes o consultas? Visita nuestra <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Página de Contacto</a> o escribe a <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        pt: {
            title: 'Sobre Nós — Domain Name (domainname.web.id)',
            desc: 'Conheça o Domain Name (domainname.web.id), nossa tecnologia de permutação RFC 1035 e transparência na pesquisa de domínios.',
            crumb: 'Sobre Nós',
            eyebrow: 'Visão Geral e Missão',
            h1: 'Sobre Domain Name (domainname.web.id)',
            lead: 'Um gerador multilíngue rápido de permutações de nomes de domínio e utilitário técnico para fundadores, investidores, especialistas em SEO e desenvolvedores.',
            s1h: 'Quem Somos e O Que Criamos',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) foi criado para simplificar a descoberta de domínios curtos, marcantes e tecnicamente válidos sem planilhas complexas.',
            s1p2: 'A ferramenta combina até três palavras-chave (<em>Principal</em>, <em>Secundária</em>, <em>Terciária</em>) e fórmulas (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[vogal]</code>, <code>[consoante]</code>, <code>[número]</code>, <code>[dash]</code>) em 8 idiomas.',
            s2h: 'Padrões Técnicos e Recursos Principais',
            s2l: [
                '<strong>Conformidade DNS RFC 1035:</strong> Cada domínio é higienizado e validado conforme regras DNS (minúsculas ASCII, hífens internos, até 63 caracteres por rótulo).',
                '<strong>Mais Curtos Primeiro:</strong> Domínios curtos têm maior valor de marca; ordenamos automaticamente do menor para o maior comprimento.',
                '<strong>Processamento Local e Privacidade:</strong> Suas palavras-chave rodam direto no navegador sem armazenamento no servidor. Veja nossa <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidade</a>.',
                '<strong>Atalhos Seguros para SEO:</strong> Links para Wayback Machine, Ahrefs e Google <code>site:</code> com <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Independência Editorial e Transparência',
            s3p1: 'Operamos de forma independente sem vender registros diretamente. Os materiais no <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">Guia e FAQ</a> são exclusivamente educativos.',
            s3p2: 'Verifique sempre disponibilidade e marcas antes de registrar conforme nossos <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Termos de Uso</a> e <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.',
            boxH: 'Fale Conosco',
            boxP: (email) => `Dúvidas, sugestões ou suporte? Acesse a <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Página de Contato</a> ou envie e-mail para <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        fr: {
            title: 'À propos — Domain Name (domainname.web.id)',
            desc: 'Découvrez Domain Name (domainname.web.id), notre moteur de permutation RFC 1035 et notre approche respectueuse de la vie privée.',
            crumb: 'À propos',
            eyebrow: 'Présentation & Mission',
            h1: 'À propos de Domain Name (domainname.web.id)',
            lead: 'Un générateur multilingue rapide de permutations de noms de domaine et un outil technique pour créateurs, investisseurs et experts SEO.',
            s1h: 'Qui Sommes-Nous',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) simplifie la recherche de noms de domaine courts, mémorables et conformes aux standards Internet.',
            s1p2: 'Notre moteur combine jusqu’à trois mots-clés et des formules personnalisées (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[voyelle]</code>, <code>[consonne]</code>, <code>[nombre]</code>, <code>[dash]</code>) dans 8 langues.',
            s2h: 'Standards Techniques',
            s2l: [
                '<strong>Conformité DNS RFC 1035 :</strong> Validation stricte en minuscules ASCII, tirets internes uniquement et limite de 63 caractères par étiquette.',
                '<strong>Tri du Plus Court au Plus Long :</strong> Les candidats les plus courts apparaissent en priorité en haut de liste.',
                '<strong>Traitement 100 % Local :</strong> Vos mots-clés restent dans votre navigateur. Consultez notre <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Politique de Confidentialité</a>.',
                '<strong>Raccourcis Sûrs :</strong> Liens Wayback Machine, Ahrefs et Google <code>site:</code> protégés par <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Indépendance & Transparence',
            s3p1: 'Domain Name est un outil utilitaire indépendant sans affiliation avec les bureaux d’enregistrement. Les guides de notre <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">section Aide & FAQ</a> sont purement informatifs.',
            s3p2: 'Vérifiez toujours la disponibilité et les marques conformément à nos <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Conditions d’utilisation</a> et <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Mentions légales</a>.',
            boxH: 'Nous Contacter',
            boxP: (email) => `Une question ou suggestion ? Rendez-vous sur notre <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Page Contact</a> ou écrivez à <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        de: {
            title: 'Über uns — Domain Name (domainname.web.id)',
            desc: 'Informationen über Domain Name (domainname.web.id), den RFC-1035-Domain-Permutationsgenerator und unsere Datenschutzstandards.',
            crumb: 'Über uns',
            eyebrow: 'Plattform & Mission',
            h1: 'Über Domain Name (domainname.web.id)',
            lead: 'Ein schneller, mehrsprachiger Domain-Permutationsgenerator für Gründer, Domain-Investoren, SEO-Spezialisten und Entwickler.',
            s1h: 'Wer wir sind & Was wir bieten',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) hilft dabei, kurze, markenstarke und technisch gültige Domainnamen ohne komplexe Tabellen zu finden.',
            s1p2: 'Die Engine kombiniert bis zu drei Keywords und individuelle Muster (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[vokal]</code>, <code>[konsonant]</code>, <code>[nummer]</code>, <code>[dash]</code>) in 8 Sprachen.',
            s2h: 'Technische Standards & Kernfunktionen',
            s2l: [
                '<strong>RFC 1035 DNS-Konformität:</strong> Automatische Bereinigung und Prüfung nach DNS-Syntaxregeln (Kleinbuchstaben, interne Bindestriche, max. 63 Zeichen pro Label).',
                '<strong>Kürzeste Domains zuerst:</strong> Ergebnisse werden automatisch nach Zeichenlänge aufsteigend sortiert.',
                '<strong>Datenschutz durch lokale Verarbeitung:</strong> Alle Keyword-Berechnungen laufen direkt im Browser. Details in unserer <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Datenschutzerklärung</a>.',
                '<strong>SEO-sichere Prüf-Shortcuts:</strong> Links zu Wayback Machine, Ahrefs und Google <code>site:</code> nutzen <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Redaktionelle Unabhängigkeit & Transparenz',
            s3p1: 'Domain Name arbeitet unabhängig und verkauft selbst keine Domains. Alle Hinweise in <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">Leitfaden & FAQ</a> dienen ausschließlich zu Informationszwecken.',
            s3p2: 'Prüfen Sie vor einer Registrierung stets Verfügbarkeit und Markenrechte gemäß unseren <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Nutzungsbedingungen</a> und dem <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Haftungsausschluss</a>.',
            boxH: 'Kontakt aufnehmen',
            boxP: (email) => `Fragen oder Feedback? Besuchen Sie unsere <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Kontaktseite</a> oder schreiben Sie an <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        ru: {
            title: 'О сервисе — Domain Name (domainname.web.id)',
            desc: 'О платформе Domain Name (domainname.web.id): генератор перестановок доменов по стандарту RFC 1035 и защита конфиденциальности.',
            crumb: 'О сервисе',
            eyebrow: 'О платформе и миссии',
            h1: 'О сервисе Domain Name (domainname.web.id)',
            lead: 'Быстрый мультиязычный генератор перестановок доменных имен для стартапов, доменных инвесторов, SEO-специалистов и разработчиков.',
            s1h: 'Кто мы и что создаем',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) создан, чтобы быстро находить короткие, запоминающиеся и технически корректные доменные имена без сложных таблиц.',
            s1p2: 'Платформа объединяет до трех ключевых слов и пользовательские формулы (<code>[primary]</code>, <code>[secondary]</code>, <code>[tertiary]</code>, <code>[гласная]</code>, <code>[согласная]</code>, <code>[цифра]</code>, <code>[dash]</code>) на 8 языках.',
            s2h: 'Технические стандарты',
            s2l: [
                '<strong>Соответствие DNS RFC 1035:</strong> Строгая очистка доменных имен (строчные символы, внутренние дефисы, не более 63 символов на метку).',
                '<strong>Сначала самые короткие:</strong> Автоматическая сортировка по возрастанию длины выводит лучшие имена наверх.',
                '<strong>Локальная обработка:</strong> Ключевые слова обрабатываются в вашем браузере и не сохраняются на сервере. Подробнее в <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Политике конфиденциальности</a>.',
                '<strong>Безопасные ссылки проверки:</strong> Переходы в Wayback Machine, Ahrefs и Google <code>site:</code> защищены атрибутом <code>rel="nofollow noopener noreferrer"</code>.'
            ],
            s3h: 'Независимость и прозрачность',
            s3p1: 'Сервис полностью независим и не является регистратором. Материалы в разделе <a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">Руководство и FAQ</a> предназначены для обучения и анализа.',
            s3p2: 'Перед регистрацией домена проверяйте права на товарные знаки согласно <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Условиям использования</a> и <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Отказу от ответственности</a>.',
            boxH: 'Связаться с нами',
            boxP: (email) => `Есть вопросы или предложения? Перейдите на страницу <a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Контакты</a> или напишите на <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
        },
        ja: {
            title: '概要 — Domain Name (domainname.web.id)',
            desc: 'Domain Name (domainname.web.id) の概要、RFC 1035準拠のドメイン置換アルゴリズム、プライバシー重視の設計について。',
            crumb: '概要',
            eyebrow: 'プラットフォーム概要とミッション',
            h1: 'Domain Name (domainname.web.id) について',
            lead: 'スタートアップ創業者、ドメイン投資家、SEOリサーチャー、開発者向けの高速・多言語ドメイン置換ジェネレーター。',
            s1h: 'サービス概要',
            s1p1: '<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) は、複雑な表計算を使わずに、短く覚えやすい技術的に正しいドメイン候補を素早く見つけるために開発されました。',
            s1p2: '最大3つのキーワードとカスタム式（<code>[primary]</code>、<code>[secondary]</code>、<code>[tertiary]</code>、<code>[母音]</code>、<code>[子音]</code>、<code>[数字]</code>、<code>[dash]</code>）から8言語対応で候補を生成します。',
            s2h: '技術標準と主な機能',
            s2l: [
                '<strong>RFC 1035 DNS準拠:</strong> 小文字ASCII・内部ハイフン制限・1ラベル最大63文字などDNS規格に基づき自動検証します。',
                '<strong>最短ドメイン優先表示:</strong> 文字数の短い順に自動ソートし、価値の高い候補を上部に表示します。',
                '<strong>ブラウザ内処理によるプライバシー保護:</strong> 入力キーワードはブラウザ内で処理され、サーバーに保存されません。詳細は<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</a>をご確認ください。',
                '<strong>安全な調査リンク:</strong> Wayback Machine、Ahrefs、Google検索 <code>site:</code> へのリンクには <code>rel="nofollow noopener noreferrer"</code> を適用しています。'
            ],
            s3h: '独立性と透明性',
            s3p1: '当サイトは独立したユーティリティであり、ドメイン登録代行や特定拡張子の優遇は行いません。<a href="guide.html" class="text-blue-600 dark:text-blue-400 hover:underline">ガイド・FAQ</a>は教育目的で提供されています。',
            s3p2: '登録前には必ず<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">利用規約</a>および<a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">免責事項</a>に従い、空き状況と商標権をご確認ください。',
            boxH: 'お問い合わせ',
            boxP: (email) => `ご意見・不具合報告は<a href="contact.html" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">お問い合わせページ</a>または <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a> までご連絡ください。`
        }
    };

    const PRIVACY_T = {
        id: {
            title: 'Kebijakan Privasi — Domain Name (domainname.web.id)',
            desc: 'Kebijakan Privasi Domain Name (domainname.web.id): pemrosesan lokal browser, cookie Google AdSense, Google Analytics, hak GDPR/CCPA, dan kontrol opt-out.',
            crumb: 'Kebijakan Privasi',
            eyebrow: 'Legal & Perlindungan Data',
            h1: 'Kebijakan Privasi',
            meta: 'Tanggal Berlaku: November 2026 • Situs: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                {
                    h: '1. Ringkasan & Pemrosesan Lokal di Browser',
                    p: [
                        'Di <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), perlindungan privasi pengguna adalah prioritas utama. Seluruh input kata kunci, formula pola, validasi RFC 1035, dan daftar permutasi diproses langsung di browser Anda.',
                        'Kami tidak mewajibkan pendaftaran akun atau data pribadi untuk menggunakan generator. Browser hanya menyimpan preferensi tampilan minimal (<code>preferredLanguage</code> dan <code>preferredTheme</code>) di <code>localStorage</code>.'
                    ]
                },
                {
                    h: '2. File Log & Infrastruktur Edge',
                    p: [
                        'Sebagaimana situs web statis pada umumnya, infrastruktur hosting dan CDN kami (seperti Cloudflare) dapat memproses metadata permintaan HTTP standar—seperti alamat IP, jenis browser, ISP, waktu akses, dan URL perujuk—semata-mata untuk keamanan jaringan, mitigasi DDoS, dan keandalan pengiriman halaman.'
                    ]
                },
                {
                    h: '3. Cookie Google AdSense & Periklanan Pihak Ketiga',
                    highlight: true,
                    p: [
                        'Untuk menjaga layanan Domain Name tetap gratis bagi semua pengguna, situs ini dapat menayangkan iklan melalui <strong>Google AdSense</strong> dan mitra jaringan iklan bersertifikat Google.'
                    ],
                    list: [
                        'Vendor pihak ketiga, termasuk <strong>Google</strong>, menggunakan cookie (seperti cookie Google Advertising / DoubleClick) untuk menayangkan iklan berdasarkan kunjungan pengguna sebelumnya ke situs ini atau situs web lain di Internet.',
                        'Penggunaan cookie periklanan oleh Google memungkinkan Google dan mitranya menampilkan iklan kepada pengguna berdasarkan kunjungan ke <strong>domainname.web.id</strong> maupun situs lain.',
                        'Pengguna dapat menonaktifkan iklan yang dipersonalisasi kapan saja melalui <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Setelan Iklan Google (Google Ads Settings)</a> atau menonaktifkan cookie vendor pihak ketiga di <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a>.'
                    ]
                },
                {
                    h: '4. Google Analytics',
                    p: [
                        'Kami dapat menggunakan <strong>Google Analytics (GA4)</strong> untuk memahami tren trafik secara agregat (jumlah kunjungan, bahasa yang sering dipakai, jenis perangkat) guna meningkatkan performa situs tanpa mencatat kata kunci domain pribadi yang Anda susun di browser.'
                    ]
                },
                {
                    h: '5. Tautan Eksternal Pihak Ketiga',
                    p: [
                        'Panel inspeksi domain menyediakan tautan opsional ke layanan pihak ketiga (Ahrefs, Wayback Machine, Google Search, dan DNSRobot). Saat Anda mengeklik tautan keluar, kebijakan privasi masing-masing platform tersebut berlaku. Baca juga halaman <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Sanggahan (Disclaimer)</a>.'
                    ]
                },
                {
                    h: '6. Hak Privasi GDPR (EEA/UK) & CCPA',
                    p: [
                        'Sesuai regulasi di wilayah Anda (termasuk EEA, Inggris, dan California), Anda berhak meminta akses, koreksi, atau penghapusan data yang diproses mitra iklan pihak ketiga serta menolak pelacakan cookie personalisasi melalui pengaturan browser atau tautan opt-out pada Bagian 3.'
                    ]
                },
                {
                    h: '7. Informasi Anak di Bawah Umur',
                    p: [
                        'Domain Name ditujukan bagi pengembang, peneliti, dan audiens bisnis umum serta tidak secara sadar mengumpulkan informasi pribadi dari anak di bawah usia 13 tahun.'
                    ]
                },
                {
                    h: '8. Kontak & Pembaruan Kebijakan',
                    pFn: (email) => `Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu dan perubahannya berlaku segera setelah diterbitkan di halaman ini. Pertanyaan dapat dikirim melalui <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Halaman Kontak</a>, baca <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Ketentuan Layanan</a>, atau hubungi <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.`
                }
            ]
        },
        es: {
            title: 'Política de Privacidad — Domain Name (domainname.web.id)',
            desc: 'Política de Privacidad de domainname.web.id: procesamiento local, cookies de Google AdSense, Google Analytics, derechos GDPR/CCPA y opciones de exclusión.',
            crumb: 'Política de Privacidad',
            eyebrow: 'Legal y Protección de Datos',
            h1: 'Política de Privacidad',
            meta: 'Fecha de vigencia: Noviembre de 2026 • Sitio web: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Resumen y Procesamiento Local', p: ['En <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), todas las combinaciones, fórmulas y validaciones RFC 1035 se ejecutan directamente en tu navegador.', 'No requerimos registro; solo guardamos idioma y tema visual en <code>localStorage</code>.'] },
                { h: '2. Registros de Servidor y CDN', p: ['Nuestra infraestructura estática y CDN (como Cloudflare) puede registrar metadatos HTTP estándar (IP, navegador, marca de tiempo) únicamente para seguridad y disponibilidad.'] },
                {
                    h: '3. Google AdSense y Cookies de Publicidad',
                    highlight: true,
                    p: ['Para mantener gratuito el servicio, podemos mostrar anuncios mediante <strong>Google AdSense</strong>.'],
                    list: [
                        'Proveedores externos, incluido <strong>Google</strong>, utilizan cookies (como las cookies de publicidad de Google / DoubleClick) para mostrar anuncios basados en visitas previas a este u otros sitios.',
                        'El uso de cookies publicitarias permite a Google y sus socios mostrar anuncios relevantes para los visitantes de <strong>domainname.web.id</strong>.',
                        'Puedes desactivar la publicidad personalizada en <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Configuración de Anuncios de Google</a> o en <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a>.'
                    ]
                },
                { h: '4. Google Analytics', p: ['Podemos usar <strong>Google Analytics (GA4)</strong> para medir tráfico agregado de forma anónima y mejorar el rendimiento.'] },
                { h: '5. Enlaces Externos', p: ['Los accesos a Ahrefs, Wayback Machine, Google Search y DNSRobot te llevan a sitios externos sujetos a sus propias políticas. Consulta nuestro <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.'] },
                { h: '6. Derechos GDPR y CCPA', p: ['Los usuarios en el EEE, Reino Unido o California pueden ejercer derechos de acceso, eliminación o exclusión de cookies publicitarias mediante su navegador o los enlaces de la Sección 3.'] },
                { h: '7. Privacidad Infantil', p: ['No recopilamos intencionalmente datos personales de menores de 13 años.'] },
                { h: '8. Contacto y Actualizaciones', pFn: (email) => `Consultas sobre privacidad en nuestra <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Página de Contacto</a>, revisa los <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Términos</a> o escribe a <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.` }
            ]
        },
        pt: {
            title: 'Política de Privacidade — Domain Name (domainname.web.id)',
            desc: 'Política de Privacidade do domainname.web.id: processamento local, cookies do Google AdSense, Analytics, direitos GDPR/CCPA e opt-out.',
            crumb: 'Política de Privacidade',
            eyebrow: 'Legal e Proteção de Dados',
            h1: 'Política de Privacidade',
            meta: 'Vigência: Novembro de 2026 • Site: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Visão Geral e Processamento Local', p: ['No <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), todas as permutações e validações RFC 1035 ocorrem diretamente no seu navegador.', 'Não exigimos conta; salvamos apenas idioma e tema no <code>localStorage</code>.'] },
                { h: '2. Logs e Infraestrutura CDN', p: ['Nossa infraestrutura estática (como Cloudflare) pode processar metadados HTTP padrão exclusivamente para segurança e proteção contra DDoS.'] },
                {
                    h: '3. Google AdSense e Cookies de Publicidade',
                    highlight: true,
                    p: ['Para manter o site gratuito, podemos exibir anúncios via <strong>Google AdSense</strong>.'],
                    list: [
                        'Fornecedores terceiros, incluindo o <strong>Google</strong>, usam cookies (DoubleClick / Google Ads) para veicular anúncios com base em visitas anteriores a este ou outros sites.',
                        'O uso de cookies de publicidade permite ao Google e parceiros exibir anúncios aos usuários que visitam <strong>domainname.web.id</strong>.',
                        'Você pode desativar anúncios personalizados em <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Configurações de Anúncios do Google</a> ou em <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a>.'
                    ]
                },
                { h: '4. Google Analytics', p: ['Podemos usar <strong>Google Analytics (GA4)</strong> para estatísticas agregadas de acesso e idioma sem capturar palavras-chave pesquisadas.'] },
                { h: '5. Links Externos', p: ['Atalhos para Ahrefs, Wayback Machine, Google e DNSRobot direcionam a sites de terceiros. Veja também o <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.'] },
                { h: '6. Direitos GDPR e CCPA', p: ['Usuários da UE, Reino Unido e Califórnia podem gerenciar ou revogar cookies personalizados via navegador ou pelos links da Seção 3.'] },
                { h: '7. Proteção de Menores', p: ['Não coletamos intencionalmente dados de menores de 13 anos.'] },
                { h: '8. Contato', pFn: (email) => `Dúvidas? Use nossa <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Página de Contato</a>, veja os <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Termos de Uso</a> ou escreva para <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.` }
            ]
        },
        fr: {
            title: 'Politique de Confidentialité — Domain Name (domainname.web.id)',
            desc: 'Politique de confidentialité de domainname.web.id : traitement local, cookies Google AdSense, Analytics, RGPD/CCPA et désactivation.',
            crumb: 'Confidentialité',
            eyebrow: 'Mentions & Protection des Données',
            h1: 'Politique de Confidentialité',
            meta: 'Date d’effet : Novembre 2026 • Site : <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Traitement Local dans le Navigateur', p: ['Sur <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), vos mots-clés et permutations RFC 1035 sont traités localement dans votre navigateur.', 'Aucun compte n’est requis ; seuls la langue et le thème sont mémorisés via <code>localStorage</code>.'] },
                { h: '2. Journaux et Infrastructure CDN', p: ['Notre hébergement statique (ex. Cloudflare) traite des métadonnées HTTP techniques uniquement pour la sécurité et la disponibilité.'] },
                {
                    h: '3. Google AdSense et Cookies Publicitaires',
                    highlight: true,
                    p: ['Pour financer ce service gratuit, nous pouvons diffuser des annonces via <strong>Google AdSense</strong>.'],
                    list: [
                        'Des prestataires tiers, dont <strong>Google</strong>, utilisent des cookies (DoubleClick / Google Ads) pour diffuser des annonces selon les visites antérieures des utilisateurs.',
                        'Ces cookies permettent à Google et ses partenaires d’afficher des publicités adaptées lors des visites sur <strong>domainname.web.id</strong>.',
                        'Vous pouvez désactiver la publicité personnalisée via <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Paramètres des annonces Google</a> ou <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a>.'
                    ]
                },
                { h: '4. Google Analytics', p: ['Nous utilisons éventuellement <strong>Google Analytics (GA4)</strong> pour mesurer l’audience globale de manière anonyme.'] },
                { h: '5. Liens Externes', p: ['Les liens vers Ahrefs, Wayback Machine, Google et DNSRobot mènent vers des sites tiers. Consultez nos <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Mentions légales</a>.'] },
                { h: '6. Droits RGPD & CCPA', p: ['Conformément au RGPD et au CCPA, vous pouvez refuser les cookies publicitaires depuis votre navigateur ou les liens de la section 3.'] },
                { h: '7. Mineurs', p: ['Nous ne collectons sciemment aucune donnée personnelle d’enfants de moins de 13 ans.'] },
                { h: '8. Contact', pFn: (email) => `Contactez-nous via la <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Page Contact</a>, nos <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Conditions</a> ou <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.` }
            ]
        },
        de: {
            title: 'Datenschutzerklärung — Domain Name (domainname.web.id)',
            desc: 'Datenschutzerklärung für domainname.web.id: lokale Verarbeitung, Google AdSense Cookies, Analytics, DSGVO/CCPA und Widerspruchsrechte.',
            crumb: 'Datenschutz',
            eyebrow: 'Rechtliches & Datenschutz',
            h1: 'Datenschutzerklärung',
            meta: 'Stand: November 2026 • Website: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Überblick & Lokale Verarbeitung', p: ['Auf <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) erfolgen alle Keyword-Permutationen und RFC-1035-Prüfungen direkt in Ihrem Browser.', 'Es ist keine Registrierung nötig; nur Sprache und Theme werden im <code>localStorage</code> gespeichert.'] },
                { h: '2. Server-Logs & CDN-Infrastruktur', p: ['Unsere Hosting- und CDN-Infrastruktur (z. B. Cloudflare) verarbeitet technische HTTP-Metadaten ausschließlich zur Sicherheit und DDoS-Abwehr.'] },
                {
                    h: '3. Google AdSense & Werbe-Cookies',
                    highlight: true,
                    p: ['Um das Tool kostenlos anzubieten, können wir Anzeigen über <strong>Google AdSense</strong> schalten.'],
                    list: [
                        'Drittanbieter, einschließlich <strong>Google</strong>, verwenden Cookies (z. B. DoubleClick-Cookies), um Anzeigen basierend auf früheren Besuchen zu schalten.',
                        'Durch Werbe-Cookies können Google und Partner passende Anzeigen für Besucher von <strong>domainname.web.id</strong> ausspielen.',
                        'Sie können personalisierte Werbung jederzeit unter <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Google Anzeigeneinstellungen</a> oder <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a> deaktivieren.'
                    ]
                },
                { h: '4. Google Analytics', p: ['Wir nutzen ggf. <strong>Google Analytics (GA4)</strong> zur anonymisierten Reichweitenmessung ohne Speicherung Ihrer Domain-Keywords.'] },
                { h: '5. Externe Links', p: ['Direktlinks zu Ahrefs, Wayback Machine, Google und DNSRobot führen zu externen Anbietern. Siehe auch den <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Haftungsausschluss</a>.'] },
                { h: '6. DSGVO- & CCPA-Rechte', p: ['Sie haben das Recht auf Auskunft, Löschung und Widerspruch gegen personalisierte Cookies über Ihre Browsereinstellungen oder Abschnitt 3.'] },
                { h: '7. Jugendschutz', p: ['Wir erheben wissentlich keine Daten von Kindern unter 13 Jahren.'] },
                { h: '8. Kontakt', pFn: (email) => `Fragen richten Sie bitte an unsere <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kontaktseite</a>, siehe <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Nutzungsbedingungen</a> oder <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.` }
            ]
        },
        ru: {
            title: 'Политика конфиденциальности — Domain Name (domainname.web.id)',
            desc: 'Политика конфиденциальности domainname.web.id: локальная обработка, файлы cookie Google AdSense, аналитика, права GDPR/CCPA.',
            crumb: 'Конфиденциальность',
            eyebrow: 'Правовая информация и защита данных',
            h1: 'Политика конфиденциальности',
            meta: 'Дата вступления в силу: ноябрь 2026 • Сайт: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Обзор и локальная обработка', p: ['На сайте <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) все перестановки и проверки RFC 1035 выполняются локально в вашем браузере.', 'Регистрация не требуется; в <code>localStorage</code> сохраняются только язык и тема оформления.'] },
                { h: '2. Журналы доступа и CDN', p: ['Инфраструктура хостинга и CDN (например, Cloudflare) обрабатывает стандартные HTTP-метаданные исключительно для защиты от атак и стабильной работы сайта.'] },
                {
                    h: '3. Google AdSense и рекламные файлы cookie',
                    highlight: true,
                    p: ['Для бесплатной работы сервиса может использоваться реклама <strong>Google AdSense</strong>.'],
                    list: [
                        'Сторонние поставщики, включая <strong>Google</strong>, используют файлы cookie (в том числе DoubleClick) для показа объявлений на основе прошлых посещений сайтов.',
                        'Использование рекламных cookie позволяет Google и партнерам подбирать релевантные объявления посетителям <strong>domainname.web.id</strong>.',
                        'Вы можете отключить персонализацию рекламы в <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Настройках рекламы Google</a> или на <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a>.'
                    ]
                },
                { h: '4. Google Analytics', p: ['Мы можем использовать <strong>Google Analytics (GA4)</strong> для обезличенной статистики посещаемости без сбора ваших доменных ключевых слов.'] },
                { h: '5. Внешние ссылки', p: ['Ссылки на Ahrefs, Wayback Machine, Google и DNSRobot ведут на сторонние ресурсы. См. также <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Отказ от ответственности</a>.'] },
                { h: '6. Права GDPR и CCPA', p: ['Пользователи из ЕЭЗ, Великобритании и Калифорнии вправе отказаться от персонализированных cookie в браузере или по ссылкам из раздела 3.'] },
                { h: '7. Информация о детях', p: ['Мы сознательно не собираем данные детей младше 13 лет.'] },
                { h: '8. Контакты', pFn: (email) => `Вопросы можно направить через <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Контакты</a>, см. <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Условия</a> или <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>.` }
            ]
        },
        ja: {
            title: 'プライバシーポリシー — Domain Name (domainname.web.id)',
            desc: 'Domain Name (domainname.web.id) のプライバシーポリシー：ブラウザ内処理、Google AdSense Cookie、アナリティクス、GDPR/CCPA対応について。',
            crumb: 'プライバシーポリシー',
            eyebrow: '法務・データ保護',
            h1: 'プライバシーポリシー',
            meta: '発効日: 2026年11月 • サイト: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. 概要とブラウザ内処理', p: ['<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) では、キーワード入力・置換計算・RFC 1035検証のすべてがお使いのブラウザ内で完結します。', 'アカウント登録は不要で、言語とテーマ設定のみを <code>localStorage</code> に保存します。'] },
                { h: '2. ログファイルとCDNインフラ', p: ['ホスティングおよびCDN（Cloudflare等）は、セキュリティ維持およびDDoS対策のために標準的なHTTPリクエスト情報を処理する場合があります。'] },
                {
                    h: '3. Google AdSense と広告配信Cookie',
                    highlight: true,
                    p: ['無料運営を継続するため、当サイトでは <strong>Google AdSense</strong> による広告を配信する場合があります。'],
                    list: [
                        '<strong>Google</strong> を含む第三者配信事業者は、過去のアクセス情報に基づいて広告を配信するためCookie（DoubleClick Cookie等）を使用します。',
                        '広告Cookieにより、Googleおよびそのパートナーは当サイト（<strong>domainname.web.id</strong>）や他サイトへのアクセス情報に基づく広告を表示できます。',
                        'パーソナライズ広告は <a href="https://adssettings.google.com" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">Google 広告設定</a> または <a href="https://www.aboutads.info/choices/" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">aboutads.info/choices</a> からいつでも無効化できます。'
                    ]
                },
                { h: '4. Google Analytics', p: ['サイト改善のため <strong>Google Analytics (GA4)</strong> による匿名統計データを取得する場合がありますが、生成キーワードは収集しません。'] },
                { h: '5. 外部サイトへのリンク', p: ['Ahrefs、Wayback Machine、Google検索、DNSRobotへのリンク先では各外部サイトのポリシーが適用されます。<a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">免責事項</a>もご覧ください。'] },
                { h: '6. GDPR・CCPAに基づく権利', p: ['EEA・英国・カリフォルニア州等の利用者は、ブラウザ設定または第3項のリンクよりパーソナライズCookieをオプトアウトできます。'] },
                { h: '7. お子様の個人情報', p: ['13歳未満の児童から意図的に個人情報を収集することはありません。'] },
                { h: '8. お問い合わせ', pFn: (email) => `お問い合わせは<a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">お問い合わせページ</a>（<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">利用規約</a>も参照）または <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a> までご連絡ください。` }
            ]
        }
    };

    const TERMS_T = {
        id: {
            title: 'Ketentuan Layanan — Domain Name (domainname.web.id)',
            desc: 'Ketentuan Layanan Domain Name (domainname.web.id) terkait penggunaan yang diizinkan, pengecekan merek dagang, dan batasan tanggung jawab.',
            crumb: 'Ketentuan Layanan',
            eyebrow: 'Perjanjian Penggunaan',
            h1: 'Ketentuan Layanan',
            meta: 'Tanggal Berlaku: November 2026 • Berlaku untuk <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Penerimaan Ketentuan', p: ['Dengan mengakses atau menggunakan <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), Anda menyetujui Ketentuan Layanan ini serta <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kebijakan Privasi</a> kami.'] },
                { h: '2. Penggunaan yang Diizinkan', p: ['Layanan ini gratis untuk brainstorming ide nama domain, permutasi RFC 1035, dan riset penamaan. Anda dilarang:'], list: ['Menggunakan layanan untuk aktivitas yang melanggar hukum.', 'Melakukan scraping berlebihan atau mencoba mengganggu keamanan/CDN situs.', 'Mendaftarkan domain dengan itikad buruk atau pelanggaran merek dagang pihak lain.'] },
                { h: '3. Tanggung Jawab Ketersediaan & Merek Dagang', p: ['Hasil domain dibentuk secara algoritmik sesuai sintaks RFC 1035 dan tidak menjamin status ketersediaan maupun bebas sengketa merek. Baca <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Sanggahan (Disclaimer)</a> sebelum mendaftarkan domain.'] },
                { h: '4. Hak Kekayaan Intelektual', p: ['Antarmuka dan dokumentasi milik pengelola situs, sedangkan daftar nama domain yang Anda hasilkan dari kata kunci sendiri bebas digunakan untuk proyek pribadi maupun komersial.'] },
                { h: '5. Tautan & Layanan Pihak Ketiga', p: ['Tautan ke DNSRobot, Ahrefs, Wayback Machine, dan Google Search disediakan demi kenyamanan pengguna; kami tidak bertanggung jawab atas konten situs eksternal.'] },
                { h: '6. Batasan Tanggung Jawab', p: ['Layanan disediakan sebagaimana adanya (<strong>"AS IS"</strong>). Kami tidak bertanggung jawab atas kerugian tidak langsung akibat keputusan pendaftaran domain.'] },
                { h: '7. Pembaruan & Kontak', pFn: (email) => `Kami dapat memperbarui ketentuan ini kapan saja. Hubungi kami lewat <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Halaman Kontak</a>, <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>, atau lihat <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">Tentang Kami</a>.` }
            ]
        },
        es: {
            title: 'Términos de Servicio — Domain Name (domainname.web.id)',
            desc: 'Términos de Servicio de Domain Name (domainname.web.id) sobre uso aceptable, marcas y limitación de responsabilidad.',
            crumb: 'Términos de Servicio',
            eyebrow: 'Acuerdo de Uso',
            h1: 'Términos de Servicio',
            meta: 'Fecha de vigencia: Noviembre de 2026 • <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Aceptación de los Términos', p: ['Al utilizar <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), aceptas estos términos y nuestra <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</a>.'] },
                { h: '2. Uso Permitido', p: ['La herramienta es gratuita para generar ideas y permutaciones RFC 1035. Queda prohibido:'], list: ['El uso ilícito del sitio.', 'El scraping abusivo o intento de eludir protecciones CDN.', 'El registro de dominios de mala fe o infringiendo marcas registradas.'] },
                { h: '3. Disponibilidad y Marcas', p: ['Las combinaciones generadas no garantizan disponibilidad ni ausencia de conflictos de marca. Revisa nuestro <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.'] },
                { h: '4. Propiedad Intelectual', p: ['La interfaz pertenece al editor; las listas generadas con tus palabras clave son libres para uso personal o comercial.'] },
                { h: '5. Enlaces de Terceros', p: ['Los enlaces a DNSRobot, Ahrefs, Wayback Machine y Google Search son externos y ajenos a nuestro control.'] },
                { h: '6. Limitación de Responsabilidad', p: ['El servicio se ofrece tal cual (<strong>"AS IS"</strong>) sin garantías implícitas ni responsabilidad por decisiones de registro.'] },
                { h: '7. Cambios y Contacto', pFn: (email) => `Contacto en <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Página de Contacto</a> o <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>. Más info en <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">Acerca de</a>.` }
            ]
        },
        pt: {
            title: 'Termos de Uso — Domain Name (domainname.web.id)',
            desc: 'Termos de Uso do Domain Name (domainname.web.id) sobre uso aceitável, marcas registradas e limitação de responsabilidade.',
            crumb: 'Termos de Uso',
            eyebrow: 'Contrato de Uso',
            h1: 'Termos de Uso',
            meta: 'Vigência: Novembro de 2026 • <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Aceitação', p: ['Ao usar o <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), você concorda com estes Termos e com a <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidade</a>.'] },
                { h: '2. Uso Aceitável', p: ['O serviço é gratuito para pesquisa de domínios RFC 1035. É proibido:'], list: ['Uso ilegal do site.', 'Sobrecarga, scraping abusivo ou violação de segurança.', 'Registro de má-fé infringindo marcas registradas.'] },
                { h: '3. Disponibilidade e Marcas', p: ['Não garantimos disponibilidade nem isenção de marca registrada. Leia o <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>.'] },
                { h: '4. Propriedade Intelectual', p: ['A interface é do editor; você pode usar livremente as listas geradas a partir de suas palavras-chave.'] },
                { h: '5. Links de Terceiros', p: ['Atalhos para DNSRobot, Ahrefs, Wayback Machine e Google são externos e regidos pelos respectivos termos.'] },
                { h: '6. Limitação de Responsabilidade', p: ['O serviço é fornecido <strong>no estado em que se encontra</strong> sem garantias comerciais.'] },
                { h: '7. Contato', pFn: (email) => `Dúvidas via <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Contato</a> ou <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>. Veja também <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">Sobre Nós</a>.` }
            ]
        },
        fr: {
            title: 'Conditions d’utilisation — Domain Name (domainname.web.id)',
            desc: 'Conditions d’utilisation de Domain Name (domainname.web.id) concernant l’usage autorisé, les marques et la responsabilité.',
            crumb: 'Conditions d’utilisation',
            eyebrow: 'Accord d’utilisation',
            h1: 'Conditions d’utilisation',
            meta: 'Date d’effet : Novembre 2026 • <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Acceptation', p: ['En accédant à <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), vous acceptez ces conditions et notre <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Politique de Confidentialité</a>.'] },
                { h: '2. Usage Autorisé', p: ['Cet outil gratuit sert à générer des idées conformes à la norme RFC 1035. Il est interdit de :'], list: ['Utiliser le site à des fins illégales.', 'Surcharger le service ou contourner les protections CDN.', 'Déposer des domaines en violation de marques existantes.'] },
                { h: '3. Disponibilité et Marques', p: ['Les résultats sont purement algorithmiques et ne garantissent ni la disponibilité ni l’absence de droits antérieurs. Voir nos <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Mentions légales</a>.'] },
                { h: '4. Propriété Intellectuelle', p: ['L’interface appartient à l’éditeur ; les listes générées avec vos mots-clés sont librement utilisables.'] },
                { h: '5. Services Tiers', p: ['Les liens vers DNSRobot, Ahrefs, Wayback Machine et Google Search mènent à des plateformes externes indépendantes.'] },
                { h: '6. Limitation de Responsabilité', p: ['Le service est fourni tel quel (<strong>« AS IS »</strong>) sans garantie sur les décisions d’enregistrement.'] },
                { h: '7. Contact', pFn: (email) => `Contactez-nous via la <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Page Contact</a> ou <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>. Voir aussi <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">À propos</a>.` }
            ]
        },
        de: {
            title: 'Nutzungsbedingungen — Domain Name (domainname.web.id)',
            desc: 'Nutzungsbedingungen für Domain Name (domainname.web.id) zu zulässiger Nutzung, Markenrechten und Haftungsbeschränkung.',
            crumb: 'Nutzungsbedingungen',
            eyebrow: 'Nutzungsvereinbarung',
            h1: 'Nutzungsbedingungen',
            meta: 'Stand: November 2026 • <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Geltung', p: ['Durch die Nutzung von <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) akzeptieren Sie diese Bedingungen und die <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Datenschutzerklärung</a>.'] },
                { h: '2. Zulässige Nutzung', p: ['Der Generator ist kostenlos für RFC-1035-Domain-Brainstorming verfügbar. Untersagt sind:'], list: ['Rechtswidrige Nutzung.', 'Missbräuchliches Scraping oder Umgehen von Sicherheits-/CDN-Schutzmaßnahmen.', 'Bösgläubige Registrierungen unter Verletzung von Markenrechten.'] },
                { h: '3. Verfügbarkeit & Markenrechte', p: ['Erzeugte Namen garantieren weder freie Registrierbarkeit noch Markenfreiheit. Beachten Sie unseren <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Haftungsausschluss</a>.'] },
                { h: '4. Geistiges Eigentum', p: ['Oberfläche und Dokumentation liegen beim Betreiber; Ihre erzeugten Namenslisten sind frei nutzbar.'] },
                { h: '5. Externe Dienste', p: ['Links zu DNSRobot, Ahrefs, Wayback Machine und Google verweisen auf fremde Webseiten ohne unsere Gewähr.'] },
                { h: '6. Haftungsbeschränkung', p: ['Die Bereitstellung erfolgt ohne Mängelgewähr (<strong>„AS IS“</strong>).'] },
                { h: '7. Kontakt', pFn: (email) => `Kontakt über unsere <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kontaktseite</a> oder <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>. Mehr unter <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">Über uns</a>.` }
            ]
        },
        ru: {
            title: 'Условия использования — Domain Name (domainname.web.id)',
            desc: 'Условия использования Domain Name (domainname.web.id): допустимое использование, проверка товарных знаков и ограничение ответственности.',
            crumb: 'Условия использования',
            eyebrow: 'Пользовательское соглашение',
            h1: 'Условия использования',
            meta: 'Дата вступления в силу: ноябрь 2026 • <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. Принятие условий', p: ['Используя <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>), вы соглашаетесь с данными условиями и <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Политикой конфиденциальности</a>.'] },
                { h: '2. Допустимое использование', p: ['Бесплатный сервис предназначен для подбора доменных идей по RFC 1035. Запрещается:'], list: ['Нарушать применимое законодательство.', 'Проводить агрессивный парсинг или обходить защиту CDN.', 'Регистрировать домены недобросовестно в нарушение прав на товарные знаки.'] },
                { h: '3. Ответственность за доступность и бренды', p: ['Сгенерированные комбинации не гарантируют свободный статус или отсутствие прав третьих лиц. См. <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Отказ от ответственности</a>.'] },
                { h: '4. Интеллектуальная собственность', p: ['Интерфейс принадлежит издателю, а списки доменов из ваших ключевых слов свободны для личного и коммерческого применения.'] },
                { h: '5. Сторонние сервисы', p: ['Ссылки на DNSRobot, Ahrefs, Wayback Machine и Google ведут на внешние ресурсы под их собственной ответственностью.'] },
                { h: '6. Ограничение ответственности', p: ['Сервис предоставляется <strong>«КАК ЕСТЬ»</strong> без каких-либо подразумеваемых гарантий.'] },
                { h: '7. Контакты', pFn: (email) => `Вопросы направляйте через <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Контакты</a> или <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a>. Подробнее: <a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">О сервисе</a>.` }
            ]
        },
        ja: {
            title: '利用規約 — Domain Name (domainname.web.id)',
            desc: 'Domain Name (domainname.web.id) の利用規約：禁止事項、商標確認の責任、免責・責任制限について。',
            crumb: '利用規約',
            eyebrow: '利用規約',
            h1: '利用規約',
            meta: '発効日: 2026年11月 • 対象: <span class="font-mono">https://domainname.web.id/</span>',
            sections: [
                { h: '1. 規約への同意', p: ['<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) をご利用になることで、本規約および<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</a>に同意したものとみなされます。'] },
                { h: '2. 許容される利用', p: ['本ツールはRFC 1035準拠のドメイン案生成に無料で利用できます。以下の行為を禁止します：'], list: ['法令に違反する目的での利用。', '過剰なスクレイピングやCDN・セキュリティ保護の回避行為。', '他者の商標権を侵害する悪意あるドメイン登録。'] },
                { h: '3. 空き状況および商標確認の責任', p: ['生成結果は構文上の候補であり、登録可能性や商標の安全性を保証するものではありません。登録前に<a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">免責事項</a>をご確認ください。'] },
                { h: '4. 知的財産権', p: ['UIおよび解説の権利は運営者に帰属しますが、ご自身のキーワードから生成されたドメイン候補リストは商用・個人利用を問わず自由にご利用いただけます。'] },
                { h: '5. 外部サービスへのリンク', p: ['DNSRobot、Ahrefs、Wayback Machine、Google検索への外部リンク先の利用条件について当サイトは責任を負いません。'] },
                { h: '6. 責任の制限', p: ['本サービスは<strong>現状有姿（AS IS）</strong>で提供され、ドメイン取得判断に伴う損害について一切の責任を負いません。'] },
                { h: '7. お問い合わせ', pFn: (email) => `<a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">お問い合わせページ</a>または <a href="mailto:${email}" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">${email}</a> までご連絡ください（<a href="about.html" class="text-blue-600 dark:text-blue-400 hover:underline">概要</a>も参照）。` }
            ]
        }
    };

    const DISCLAIMER_T = {
        id: {
            title: 'Sanggahan (Disclaimer) — Domain Name (domainname.web.id)',
            desc: 'Sanggahan resmi Domain Name (domainname.web.id) mengenai standar DNS RFC 1035, pengecekan merek dagang, non-afiliasi ICANN/pihak ketiga, dan iklan.',
            crumb: 'Sanggahan (Disclaimer)',
            eyebrow: 'Pemberitahuan Penting',
            h1: 'Sanggahan (Disclaimer)',
            meta: 'Tanggal Berlaku: November 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Sanggahan Output Algoritma & Informasi Umum', p: ['Seluruh panduan SEO dan kombinasi nama domain di <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) disediakan dengan itikad baik hanya untuk tujuan riset dan brainstorming umum.', 'Menghasilkan string domain sesuai standar DNS <strong>RFC 1035</strong> <strong>tidak</strong> menjamin ketersediaan DNS secara real-time, harga registrar, atau kelayakan hukum. Selalu verifikasi status pendaftaran di registrar terakreditasi <strong>ICANN</strong> sebelum mengambil keputusan komersial.'] },
                { h: '2. Bukan Nasihat Hukum, Merek Dagang, atau Keuangan', p: ['Konten di situs ini bukan merupakan nasihat hukum, kekayaan intelektual, merek dagang, maupun investasi. Pengguna bertanggung jawab penuh memeriksa basis data merek dagang (seperti <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong>, atau <strong>DJKI</strong>) sebelum mendaftarkan atau membangun merek komersial.'] },
                { h: '3. Pernyataan Non-Afiliasi', p: ['Domain Name adalah utilitas web independen dan <strong>tidak berafiliasi, tidak didukung, atau tidak disponsori oleh</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN, maupun registrar domain mana pun. Seluruh nama produk dan merek pihak ketiga adalah milik pemiliknya masing-masing.'] },
                { h: '4. Keterbukaan Iklan & Tautan Eksternal', p: ['Untuk mendukung pemeliharaan dan akses gratis, situs ini dapat menayangkan iklan pihak ketiga (termasuk Google AdSense). Penempatan iklan dikelola terpisah dari algoritma permutasi domain dan tidak pernah memengaruhi kandidat domain yang dihasilkan. Baca juga <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kebijakan Privasi</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Ketentuan Layanan</a>, atau <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Hubungi Kami</a>.'] }
            ]
        },
        es: {
            title: 'Aviso Legal — Domain Name (domainname.web.id)',
            desc: 'Aviso Legal de Domain Name (domainname.web.id) sobre disponibilidad DNS RFC 1035, marcas registradas (USPTO, EUIPO, WIPO, DJKI), no afiliación con ICANN y publicidad.',
            crumb: 'Aviso Legal',
            eyebrow: 'Aviso Importante',
            h1: 'Aviso Legal (Disclaimer)',
            meta: 'Fecha de vigencia: Noviembre de 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Descargo sobre Resultados Algorítmicos e Información General', p: ['Toda la orientación SEO y las combinaciones generadas en <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) se ofrecen de buena fe únicamente para fines informativos y de exploración.', 'Generar un nombre conforme al estándar DNS <strong>RFC 1035</strong> <strong>no</strong> garantiza disponibilidad DNS en tiempo real, tarifas de registro ni elegibilidad legal. Verifica siempre el estado con un registrador acreditado por <strong>ICANN</strong> antes de asumir compromisos financieros.'] },
                { h: '2. Sin Asesoría Legal, de Marcas ni Financiera', p: ['Nada en este sitio constituye asesoría legal, de propiedad intelectual, de marcas comerciales ni de inversión. Cada usuario es exclusivamente responsable de consultar bases de datos de marcas registradas (como <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong> o <strong>DJKI</strong>) antes de registrar o explotar un dominio comercialmente.'] },
                { h: '3. Declaración de No Afiliación', p: ['Domain Name es una utilidad web independiente y <strong>no está afiliada, respaldada ni patrocinada por</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN ni ningún registrador de dominios. Todas las marcas y nombres de terceros pertenecen a sus respectivos titulares.'] },
                { h: '4. Divulgación de Publicidad y Enlaces Externos', p: ['Para mantener el acceso gratuito, este sitio puede mostrar anuncios de terceros (incluido Google AdSense). La publicidad se gestiona de forma independiente del algoritmo de permutación y nunca influye en los resultados generados. Consulta nuestra <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Términos de Servicio</a> o <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Contacto</a>.'] }
            ]
        },
        pt: {
            title: 'Aviso Legal — Domain Name (domainname.web.id)',
            desc: 'Aviso Legal do Domain Name (domainname.web.id) sobre disponibilidade DNS RFC 1035, marcas registradas (USPTO, EUIPO, WIPO, DJKI), independência da ICANN e anúncios.',
            crumb: 'Aviso Legal',
            eyebrow: 'Aviso Importante',
            h1: 'Aviso Legal (Disclaimer)',
            meta: 'Vigência: Novembro de 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Isenção sobre Saída Algorítmica e Informações Gerais', p: ['Todas as orientações de SEO e combinações produzidas no <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) são fornecidas de boa-fé apenas para pesquisa e brainstorming.', 'Gerar uma cadeia em conformidade com o padrão DNS <strong>RFC 1035</strong> <strong>não</strong> garante disponibilidade de DNS em tempo real, preços ou elegibilidade legal. Sempre confirme o registro em um registrador credenciado pela <strong>ICANN</strong> antes de qualquer compra.'] },
                { h: '2. Sem Aconselhamento Jurídico, de Marcas ou Financeiro', p: ['Nada neste site constitui consultoria jurídica, de propriedade intelectual, de marca registrada ou de investimento. Os usuários são inteiramente responsáveis por consultar bases oficiais de marcas (como <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong>, INPI ou <strong>DJKI</strong>) antes de registrar ou usar qualquer nome comercialmente.'] },
                { h: '3. Declaração de Não Afiliação', p: ['O Domain Name é um utilitário independente e <strong>não é afiliado, endossado ou patrocinado por</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN ou qualquer registrador de domínios. Todos os nomes e marcas de terceiros pertencem aos seus respectivos proprietários.'] },
                { h: '4. Divulgação de Anúncios e Links Externos', p: ['Para manter a operação gratuita, podemos exibir anúncios de terceiros (incluindo Google AdSense), gerenciados de forma independente do algoritmo sem influenciar os domínios gerados. Veja nossa <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidade</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Termos de Uso</a> e <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Contato</a>.'] }
            ]
        },
        fr: {
            title: 'Mentions légales — Domain Name (domainname.web.id)',
            desc: 'Mentions légales de Domain Name (domainname.web.id) concernant la disponibilité DNS RFC 1035, les marques (USPTO, EUIPO, WIPO, DJKI), l’ICANN et la publicité.',
            crumb: 'Mentions légales',
            eyebrow: 'Avis Important',
            h1: 'Mentions légales (Disclaimer)',
            meta: 'Date d’effet : Novembre 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Avertissement sur les Résultats Algorithmiques', p: ['Les conseils SEO et suggestions générés sur <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) sont fournis de bonne foi à titre informatif et exploratoire uniquement.', 'La conformité à la norme DNS <strong>RFC 1035</strong> <strong>ne garantit pas</strong> la disponibilité DNS en temps réel ni l’éligibilité juridique. Vérifiez toujours auprès d’un bureau d’enregistrement accrédité par l’<strong>ICANN</strong> avant tout engagement financier.'] },
                { h: '2. Aucun Conseil Juridique, de Marque ou Financier', p: ['Ce site ne fournit aucun conseil juridique, financier ou en propriété intellectuelle. Il appartient à chaque utilisateur de vérifier les bases officielles de marques (telles que <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong>/OMPI, INPI ou <strong>DJKI</strong>) avant toute exploitation commerciale.'] },
                { h: '3. Déclaration de Non-Affiliation', p: ['Domain Name est un outil indépendant et <strong>n’est affilié, approuvé ni sponsorisé par</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN ou tout bureau d’enregistrement. Les marques citées appartiennent à leurs propriétaires respectifs.'] },
                { h: '4. Publicité et Liens Externes', p: ['Afin de financer l’accès gratuit, des annonces tierces (dont Google AdSense) peuvent apparaître sur le site. Elles sont gérées séparément de l’algorithme de permutation et n’influencent jamais les suggestions. Voir <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Confidentialité</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Conditions</a> et <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Contact</a>.'] }
            ]
        },
        de: {
            title: 'Haftungsausschluss — Domain Name (domainname.web.id)',
            desc: 'Haftungsausschluss für Domain Name (domainname.web.id) zu DNS RFC 1035, Markenprüfung (USPTO, EUIPO, WIPO, DJKI), ICANN-Unabhängigkeit und Werbung.',
            crumb: 'Haftungsausschluss',
            eyebrow: 'Wichtiger Hinweis',
            h1: 'Haftungsausschluss (Disclaimer)',
            meta: 'Stand: November 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Allgemeiner Haftungsausschluss & Algorithmische Ausgabe', p: ['Alle SEO-Hinweise und Domain-Kombinationen auf <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) dienen ausschließlich allgemeinen Informations- und Brainstorming-Zwecken.', 'Die Erzeugung einer Domain gemäß DNS-Standard <strong>RFC 1035</strong> garantiert <strong>keine</strong> Echtzeit-DNS-Verfügbarkeit, Registrar-Preise oder rechtliche Nutzbarkeit. Prüfen Sie die Verfügbarkeit stets bei einem <strong>ICANN</strong>-akkreditierten Registrar vor finanziellen Entscheidungen.'] },
                { h: '2. Keine Rechts-, Marken- oder Finanzberatung', p: ['Keine Angabe auf dieser Website stellt eine Rechts-, Marken-, IP- oder Anlageberatung dar. Nutzer tragen die alleinige Verantwortung dafür, Markenregister (wie <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong>, DPMA oder <strong>DJKI</strong>) vor einer Registrierung oder geschäftlichen Nutzung zu prüfen.'] },
                { h: '3. Unabhängigkeitserklärung', p: ['Domain Name ist ein unabhängiges Web-Tool und <strong>weder verbunden mit noch unterstützt oder gesponsert von</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN oder einem Domain-Registrar. Alle genannten Marken gehören den jeweiligen Rechteinhabern.'] },
                { h: '4. Werbung & Externe Links', p: ['Zur Finanzierung des kostenlosen Betriebs können Anzeigen Dritter (einschließlich Google AdSense) geschaltet werden. Werbeplatzierungen werden strikt getrennt vom Permutations-Algorithmus verwaltet und beeinflussen niemals die Domain-Vorschläge. Siehe <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Datenschutz</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Nutzungsbedingungen</a> und <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kontakt</a>.'] }
            ]
        },
        ru: {
            title: 'Отказ от ответственности — Domain Name (domainname.web.id)',
            desc: 'Отказ от ответственности Domain Name (domainname.web.id): проверка DNS RFC 1035, реестры товарных знаков (USPTO, EUIPO, WIPO, DJKI), отсутствие аффилированности с ICANN и реклама.',
            crumb: 'Отказ от ответственности',
            eyebrow: 'Важное уведомление',
            h1: 'Отказ от ответственности (Disclaimer)',
            meta: 'Дата вступления в силу: ноябрь 2026 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. Отказ от ответственности за алгоритмическую генерацию', p: ['Вся справочная информация по SEO и комбинации доменов на <strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) предоставляются добросовестно исключительно в исследовательских и ознакомительных целях.', 'Соответствие стандарту DNS <strong>RFC 1035</strong> <strong>не</strong> гарантирует реальную доступность домена в DNS, стоимость регистрации или юридическую чистоту. Всегда проверяйте статус у аккредитованных <strong>ICANN</strong> регистраторов перед оплатой.'] },
                { h: '2. Не является юридической, патентной или финансовой консультацией', p: ['Материалы сайта не являются юридической, финансовой или инвестиционной консультацией, а также экспертизой по товарным знакам. Пользователи самостоятельно проверяют официальные базы товарных знаков (такие как <strong>USPTO</strong>, <strong>EUIPO</strong>, <strong>WIPO</strong>, <strong>DJKI</strong> или Роспатент) перед регистрацией коммерческого бренда.'] },
                { h: '3. Заявление об отсутствии аффилированности', p: ['Domain Name является независимым веб-инструментом и <strong>не связан, не одобрен и не спонсируется</strong> Google LLC, Ahrefs, Internet Archive (Wayback Machine), DNSRobot, ICANN или какими-либо регистраторами доменов. Все сторонние товарные знаки принадлежат их законным правообладателям.'] },
                { h: '4. Раскрытие информации о рекламе и внешних ссылках', p: ['Для поддержания бесплатного доступа на сайте может отображаться сторонняя реклама (включая Google AdSense). Рекламные блоки управляются независимо от алгоритма перестановок и никогда не влияют на выдаваемый список доменов. См. <a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Конфиденциальность</a>, <a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Условия</a> и <a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">Контакты</a>.'] }
            ]
        },
        ja: {
            title: '免責事項 — Domain Name (domainname.web.id)',
            desc: 'Domain Name (domainname.web.id) の免責事項：DNS規格（RFC 1035）、商標調査（USPTO・EUIPO・WIPO・DJKI）、ICANNおよび第三者機関との非提携、広告開示について。',
            crumb: '免責事項',
            eyebrow: '重要なお知らせ',
            h1: '免責事項 (Disclaimer)',
            meta: '発効日: 2026年11月 • <span class="font-mono">domainname.web.id</span>',
            sections: [
                { h: '1. 生成結果および一般情報に関する免責', p: ['<strong>Domain Name</strong> (<a href="index.html" class="text-blue-600 dark:text-blue-400 hover:underline">domainname.web.id</a>) で提供されるSEOガイドおよびドメイン候補は、一般的な調査・ブレインストーミングのみを目的として誠実に提供されています。', 'DNS規格（<strong>RFC 1035</strong>）に準拠した文字列の生成は、リアルタイムのDNS空き状況、登録料金、または法的な取得適格性を<strong>保証するものではありません</strong>。購入や契約の前に、必ず<strong>ICANN</strong>公認レジストラにて最新の登録状況をご確認ください。'] },
                { h: '2. 法的助言・商標判断・投資助言の否認', p: ['当サイトのいかなる内容も、法律・知的財産・商標・投資に関する専門的助言を構成するものではありません。商用ブランドとして登録・使用する前に、<strong>USPTO</strong>、<strong>EUIPO</strong>、<strong>WIPO</strong>、<strong>DJKI</strong>（および各国の特許庁）等の公式商標データベースをご自身の責任で確認してください。'] },
                { h: '3. 第三者機関との非提携に関する表明', p: ['Domain Nameは独立したWebユーティリティであり、Google LLC、Ahrefs、Internet Archive（Wayback Machine）、DNSRobot、ICANN、またはいずれのドメインレジストラとも<strong>提携・推奨・後援の関係にありません</strong>。記載されている第三者の名称および商標は、各所有者に帰属します。'] },
                { h: '4. 広告配信および外部リンクに関する開示', p: ['継続的な無料運営を維持するため、当サイトでは第三者配信の広告（Google AdSenseを含む）を表示する場合があります。広告枠はドメイン生成アルゴリズムとは独立して管理されており、広告が生成結果に影響を与えることはありません。詳細は<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</a>、<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">利用規約</a>、または<a href="contact.html" class="text-blue-600 dark:text-blue-400 hover:underline">お問い合わせ</a>をご覧ください。'] }
            ]
        }
    };

    const CONTACT_T = {
        id: {
            title: 'Hubungi Kami — Domain Name (domainname.web.id)',
            desc: 'Hubungi pengelola Domain Name (domainname.web.id) untuk masukan, laporan bug, pertanyaan privasi, kepatuhan iklan, atau pemberitahuan hukum.',
            crumb: 'Hubungi Kami',
            eyebrow: 'Dukungan Pengelola',
            h1: 'Hubungi Kami',
            intro: 'Hubungi tim pengelola <span class="font-mono">domainname.web.id</span> untuk masukan teknis, permintaan privasi, atau pertanyaan legal & periklanan.',
            emailLabel: 'Email Kontak Resmi',
            copyBtn: 'Salin',
            copiedMsg: 'Alamat email berhasil disalin ke clipboard.',
            topicsTitle: 'Topik Pertanyaan Umum',
            topics: [
                'Laporan bug & saran validasi RFC 1035',
                'Penyempurnaan terjemahan (8 edisi bahasa)',
                'Privasi, opt-out cookie & permintaan GDPR/CCPA (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Kebijakan Privasi</a>)',
                'DMCA, hak cipta & kepatuhan (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Ketentuan</a> & <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Sanggahan</a>)'
            ],
            responseNote: 'Waktu respons rata-rata: 1–2 hari kerja.',
            formTitle: 'Kirim Pesan',
            formSub: 'Isi formulir di bawah ini untuk membuka draf email siap kirim di aplikasi email Anda.',
            labelName: 'Nama Anda',
            placeholderName: 'Budi Santoso',
            labelEmail: 'Email Anda',
            placeholderEmail: 'nama@contoh.com',
            labelTopic: 'Topik',
            topicsOpt: ['Masukan Umum & Permintaan Fitur', 'Laporan Bug / Masalah RFC 1035', 'Privasi / GDPR / Kepatuhan AdSense', 'Legal / DMCA / Merek Dagang'],
            labelMessage: 'Pesan',
            placeholderMessage: 'Tulis pesan Anda di sini...',
            submitBtn: 'Buat Email'
        },
        es: {
            title: 'Contacto — Domain Name (domainname.web.id)',
            desc: 'Contacta al equipo de Domain Name (domainname.web.id) para sugerencias, reportes técnicos o consultas legales y de privacidad.',
            crumb: 'Contacto',
            eyebrow: 'Soporte del Editor',
            h1: 'Contacto',
            intro: 'Comunícate con el equipo de <span class="font-mono">domainname.web.id</span> para comentarios, soporte técnico o consultas legales.',
            emailLabel: 'Correo Oficial de Contacto',
            copyBtn: 'Copiar',
            copiedMsg: 'Correo copiado al portapapeles.',
            topicsTitle: 'Temas Frecuentes',
            topics: [
                'Reportes de errores y mejoras RFC 1035',
                'Sugerencias de traducción (8 idiomas)',
                'Privacidad y derechos GDPR/CCPA (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidad</a>)',
                'Avisos legales o DMCA (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Términos</a> y <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>)'
            ],
            responseNote: 'Tiempo habitual de respuesta: 1–2 días hábiles.',
            formTitle: 'Enviar un Mensaje',
            formSub: 'Completa el formulario para abrir un borrador dirigido en tu cliente de correo.',
            labelName: 'Tu Nombre',
            placeholderName: 'Carlos García',
            labelEmail: 'Tu Correo',
            placeholderEmail: 'tu@ejemplo.com',
            labelTopic: 'Tema',
            topicsOpt: ['Comentarios Generales', 'Reporte de Error / RFC 1035', 'Privacidad / GDPR / AdSense', 'Legal / DMCA / Marcas'],
            labelMessage: 'Mensaje',
            placeholderMessage: 'Escribe tu mensaje aquí...',
            submitBtn: 'Redactar Correo'
        },
        pt: {
            title: 'Contato — Domain Name (domainname.web.id)',
            desc: 'Entre em contato com a equipe do Domain Name (domainname.web.id) para feedback, suporte, privacidade ou questões legais.',
            crumb: 'Contato',
            eyebrow: 'Suporte do Editor',
            h1: 'Contato',
            intro: 'Fale com a equipe do <span class="font-mono">domainname.web.id</span> para feedback técnico, solicitações de privacidade ou dúvidas legais.',
            emailLabel: 'E-mail Oficial de Contato',
            copyBtn: 'Copiar',
            copiedMsg: 'E-mail copiado para a área de transferência.',
            topicsTitle: 'Assuntos Comuns',
            topics: [
                'Relatos de bugs e validação RFC 1035',
                'Melhorias nas traduções (8 idiomas)',
                'Privacidade e direitos GDPR/CCPA (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Política de Privacidade</a>)',
                'Avisos legais e DMCA (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Termos</a> e <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Aviso Legal</a>)'
            ],
            responseNote: 'Prazo médio de resposta: 1–2 dias úteis.',
            formTitle: 'Enviar Mensagem',
            formSub: 'Preencha o formulário para abrir uma mensagem endereçada no seu aplicativo de e-mail.',
            labelName: 'Seu Nome',
            placeholderName: 'João Silva',
            labelEmail: 'Seu E-mail',
            placeholderEmail: 'voce@exemplo.com',
            labelTopic: 'Assunto',
            topicsOpt: ['Feedback Geral e Sugestões', 'Relato de Bug / RFC 1035', 'Privacidade / GDPR / AdSense', 'Legal / DMCA / Marcas'],
            labelMessage: 'Mensagem',
            placeholderMessage: 'Escreva sua mensagem aqui...',
            submitBtn: 'Escrever E-mail'
        },
        fr: {
            title: 'Contact — Domain Name (domainname.web.id)',
            desc: 'Contactez l’équipe de Domain Name (domainname.web.id) pour toute question technique, de confidentialité ou mention légale.',
            crumb: 'Contact',
            eyebrow: 'Support Éditeur',
            h1: 'Nous Contacter',
            intro: 'Écrivez à l’équipe de <span class="font-mono">domainname.web.id</span> pour vos retours, demandes de confidentialité ou questions légales.',
            emailLabel: 'E-mail de Contact Officiel',
            copyBtn: 'Copier',
            copiedMsg: 'Adresse e-mail copiée.',
            topicsTitle: 'Sujets Fréquents',
            topics: [
                'Signalements de bugs et règles RFC 1035',
                'Améliorations des traductions (8 langues)',
                'Confidentialité, cookies et RGPD (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Confidentialité</a>)',
                'DMCA et mentions légales (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Conditions</a> & <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Mentions</a>)'
            ],
            responseNote: 'Délai de réponse habituel : 1 à 2 jours ouvrés.',
            formTitle: 'Envoyer un Message',
            formSub: 'Remplissez ce formulaire pour ouvrir un e-mail pré-rempli dans votre messagerie.',
            labelName: 'Votre Nom',
            placeholderName: 'Camille Laurent',
            labelEmail: 'Votre E-mail',
            placeholderEmail: 'vous@exemple.fr',
            labelTopic: 'Objet',
            topicsOpt: ['Remarques Générales', 'Bug / Validation RFC 1035', 'Confidentialité / RGPD / AdSense', 'Légal / DMCA / Marques'],
            labelMessage: 'Message',
            placeholderMessage: 'Écrivez votre message ici...',
            submitBtn: 'Rédiger l’e-mail'
        },
        de: {
            title: 'Kontakt — Domain Name (domainname.web.id)',
            desc: 'Kontaktieren Sie das Team von Domain Name (domainname.web.id) für Feedback, Datenschutzanfragen oder rechtliche Hinweise.',
            crumb: 'Kontakt',
            eyebrow: 'Betreiber-Support',
            h1: 'Kontakt',
            intro: 'Erreichen Sie das Team von <span class="font-mono">domainname.web.id</span> für technisches Feedback, Datenschutz oder rechtliche Anfragen.',
            emailLabel: 'Offizielle Kontakt-E-Mail',
            copyBtn: 'Kopieren',
            copiedMsg: 'E-Mail-Adresse kopiert.',
            topicsTitle: 'Häufige Themen',
            topics: [
                'Fehlerberichte & RFC-1035-Hinweise',
                'Übersetzungsvorschläge (8 Sprachen)',
                'Datenschutz, Opt-out & DSGVO (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Datenschutz</a>)',
                'Rechtliches & DMCA (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Bedingungen</a> & <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Haftungsausschluss</a>)'
            ],
            responseNote: 'Übliche Antwortzeit: 1–2 Werktage.',
            formTitle: 'Nachricht senden',
            formSub: 'Füllen Sie das Formular aus, um eine voradressierte E-Mail in Ihrem E-Mail-Programm zu öffnen.',
            labelName: 'Ihr Name',
            placeholderName: 'Max Mustermann',
            labelEmail: 'Ihre E-Mail',
            placeholderEmail: 'sie@beispiel.de',
            labelTopic: 'Thema',
            topicsOpt: ['Allgemeines Feedback', 'Fehlerbericht / RFC 1035', 'Datenschutz / DSGVO / AdSense', 'Rechtliches / DMCA / Marken'],
            labelMessage: 'Nachricht',
            placeholderMessage: 'Schreiben Sie hier Ihre Nachricht...',
            submitBtn: 'E-Mail verfassen'
        },
        ru: {
            title: 'Контакты — Domain Name (domainname.web.id)',
            desc: 'Свяжитесь с командой Domain Name (domainname.web.id) по техническим вопросам, вопросам конфиденциальности и правовым уведомлениям.',
            crumb: 'Контакты',
            eyebrow: 'Поддержка издателя',
            h1: 'Контакты',
            intro: 'Свяжитесь с командой <span class="font-mono">domainname.web.id</span> по техническим вопросам, конфиденциальности или рекламе.',
            emailLabel: 'Официальный контактный email',
            copyBtn: 'Копировать',
            copiedMsg: 'Адрес скопирован в буфер обмена.',
            topicsTitle: 'Популярные темы',
            topics: [
                'Сообщения об ошибках и RFC 1035',
                'Улучшение переводов (8 языков)',
                'Конфиденциальность и права GDPR (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">Конфиденциальность</a>)',
                'Правовые вопросы и DMCA (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">Условия</a> и <a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">Отказ</a>)'
            ],
            responseNote: 'Обычное время ответа: 1–2 рабочих дня.',
            formTitle: 'Отправить сообщение',
            formSub: 'Заполните форму ниже, чтобы открыть готовое письмо в вашем почтовом клиенте.',
            labelName: 'Ваше имя',
            placeholderName: 'Иван Петров',
            labelEmail: 'Ваш email',
            placeholderEmail: 'you@example.com',
            labelTopic: 'Тема',
            topicsOpt: ['Общий отзыв и предложения', 'Ошибка / RFC 1035', 'Конфиденциальность / GDPR / AdSense', 'Правовые вопросы / DMCA'],
            labelMessage: 'Сообщение',
            placeholderMessage: 'Введите ваше сообщение...',
            submitBtn: 'Создать письмо'
        },
        ja: {
            title: 'お問い合わせ — Domain Name (domainname.web.id)',
            desc: 'Domain Name (domainname.web.id) へのご意見、不具合報告、プライバシー・広告・法的事項に関するお問い合わせ窓口。',
            crumb: 'お問い合わせ',
            eyebrow: '運営サポート',
            h1: 'お問い合わせ',
            intro: '機能のご要望、プライバシー関連、広告・法務に関するお問い合わせは <span class="font-mono">domainname.web.id</span> 運営チームまでお寄せください。',
            emailLabel: '公式連絡先メールアドレス',
            copyBtn: 'コピー',
            copiedMsg: 'メールアドレスをクリップボードにコピーしました。',
            topicsTitle: '主な問い合わせ内容',
            topics: [
                '不具合報告・RFC 1035検証の改善要望',
                '8言語翻訳の改善提案',
                'プライバシー・Cookie設定・GDPR対応 (<a href="privacy-policy.html" class="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</a>)',
                '著作権・DMCA・法的通知 (<a href="terms.html" class="text-blue-600 dark:text-blue-400 hover:underline">利用規約</a>・<a href="disclaimer.html" class="text-blue-600 dark:text-blue-400 hover:underline">免責事項</a>)'
            ],
            responseNote: '通常1〜2営業日以内にご返信いたします。',
            formTitle: 'メッセージを送る',
            formSub: '以下のフォームに入力すると、宛先設定済みのメール作成画面が開きます。',
            labelName: 'お名前',
            placeholderName: '山田 太郎',
            labelEmail: 'メールアドレス',
            placeholderEmail: 'you@example.jp',
            labelTopic: '件名・種別',
            topicsOpt: ['一般的なご意見・機能要望', '不具合報告 / RFC 1035関連', 'プライバシー / GDPR / AdSense関連', '法務 / DMCA / 商標関連'],
            labelMessage: 'メッセージ内容',
            placeholderMessage: 'お問い合わせ内容をご入力ください...',
            submitBtn: 'メールを作成する'
        }
    };

    function rewriteLinksInHtml(htmlSnippet, lang) {
        return String(htmlSnippet || '').replace(/href="([^"]+)"/g, (_, rawHref) => {
            if (rawHref.startsWith('http') || rawHref.startsWith('mailto:')) {
                return `href="${rawHref}"`;
            }
            return `href="${localizeInternalHref(rawHref, lang)}"`;
        });
    }

    function renderLegalSections(sections, email, lang, pageType) {
        return sections.map((sec, idx) => {
            const cls = sec.highlight
                ? 'space-y-3 p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60'
                : 'space-y-3';
            const paragraphs = [];
            if (Array.isArray(sec.p)) {
                sec.p.forEach((pHtml) => paragraphs.push(`<p>${rewriteLinksInHtml(pHtml, lang)}</p>`));
            }
            if (typeof sec.pFn === 'function') {
                paragraphs.push(`<p>${rewriteLinksInHtml(sec.pFn(escapeHtml(email)), lang)}</p>`);
            }
            const listHtml = Array.isArray(sec.list)
                ? `<ul class="list-disc pl-5 space-y-2">${sec.list.map((li) => `<li>${rewriteLinksInHtml(li, lang)}</li>`).join('')}</ul>`
                : '';
            let adAfterHtml = '';
            if (idx === 1 && (pageType === 'privacy' || pageType === 'terms' || pageType === 'disclaimer')) {
                adAfterHtml = `\n            <!-- ADSENSE MANUAL SLOT 1: Desktop 728x90 Leaderboard | Mobile 320x100 Large Banner -->\n            <div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="${pageType}-after-s2" data-ad-mode="mount" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="dn-ad-mount hidden"></div>`;
            } else if (idx === 4 && (pageType === 'privacy' || pageType === 'terms')) {
                adAfterHtml = `\n            <!-- ADSENSE MANUAL SLOT 2: Desktop 728x250 / 336x280 | Mobile 336x280 Rectangle -->\n            <div role="region" aria-label="AdSense Placement Slot 2" data-ad-slot-position="${pageType}-after-s5" data-ad-mode="mount" data-ad-recommended-size="728x250 / 336x280 (Desktop) | 336x280 (Mobile)" class="dn-ad-mount hidden"></div>`;
            }
            return `<section class="${cls}">
                <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${sec.h}</h2>
                ${paragraphs.join('\n')}
                ${listHtml}
            </section>${adAfterHtml}`;
        }).join('\n');
    }

    function getPagePack(pageType, lang) {
        if (pageType === 'about') return ABOUT_T[lang] || null;
        if (pageType === 'privacy') return PRIVACY_T[lang] || null;
        if (pageType === 'terms') return TERMS_T[lang] || null;
        if (pageType === 'disclaimer') return DISCLAIMER_T[lang] || null;
        if (pageType === 'contact') return CONTACT_T[lang] || null;
        return null;
    }

    function buildTrustMainHtml(pageType, targetLang, email) {
        const c = CHROME[targetLang] || CHROME.en;
        const homeHref = localizeInternalHref('index.html', targetLang);

        if (pageType === 'about' && ABOUT_T[targetLang]) {
            const d = ABOUT_T[targetLang];
            return `
                <nav aria-label="Breadcrumb" class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <a href="${homeHref}" id="breadcrumbHome" class="hover:text-blue-600 dark:hover:text-blue-400">${escapeHtml(c.home)}</a>
                    <span>/</span>
                    <span id="breadcrumbCurrent" class="text-slate-900 dark:text-slate-200">${escapeHtml(d.crumb)}</span>
                </nav>
                <article class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10 space-y-6">
                    <header class="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                        <p class="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">${d.eyebrow}</p>
                        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">${d.h1}</h1>
                        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">${d.lead}</p>
                    </header>
                    <section class="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${d.s1h}</h2>
                        <p>${rewriteLinksInHtml(d.s1p1, targetLang)}</p>
                        <p>${rewriteLinksInHtml(d.s1p2, targetLang)}</p>
                    </section>
                    <!-- ADSENSE MANUAL SLOT 1: Desktop 728x90 Leaderboard | Mobile 320x100 Large Banner -->
                    <div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="about-mid-article" data-ad-mode="mount" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="dn-ad-mount hidden"></div>
                    <section class="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${d.s2h}</h2>
                        <ul class="list-disc pl-5 space-y-2">${d.s2l.map((li) => `<li>${rewriteLinksInHtml(li, targetLang)}</li>`).join('')}</ul>
                    </section>
                    <section class="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                        <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${d.s3h}</h2>
                        <p>${rewriteLinksInHtml(d.s3p1, targetLang)}</p>
                        <p>${rewriteLinksInHtml(d.s3p2, targetLang)}</p>
                    </section>
                    <section class="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">${d.boxH}</h2>
                        <p class="text-sm text-slate-600 dark:text-slate-300">${rewriteLinksInHtml(d.boxP(escapeHtml(email)), targetLang)}</p>
                    </section>
                </article>
                <!-- ADSENSE MANUAL SLOT 2: Desktop 728x250 / 336x280 | Mobile 336x280 Rectangle -->
                <div role="region" aria-label="AdSense Placement Slot 2" data-ad-slot-position="about-post-article" data-ad-mode="mount" data-ad-recommended-size="728x250 / 336x280 (Desktop) | 336x280 (Mobile)" class="dn-ad-mount hidden"></div>`;
        }

        if (pageType === 'privacy' || pageType === 'terms' || pageType === 'disclaimer') {
            const pack = getPagePack(pageType, targetLang);
            if (!pack) return null;
            const postArticleAdHtml = pageType === 'disclaimer'
                ? `\n                <!-- ADSENSE MANUAL SLOT 2: Desktop 728x250 / 336x280 | Mobile 336x280 Rectangle -->\n                <div role="region" aria-label="AdSense Placement Slot 2" data-ad-slot-position="disclaimer-post-article" data-ad-mode="mount" data-ad-recommended-size="728x250 / 336x280 (Desktop) | 336x280 (Mobile)" class="dn-ad-mount hidden"></div>`
                : '';
            return `
                <nav aria-label="Breadcrumb" class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <a href="${homeHref}" id="breadcrumbHome" class="hover:text-blue-600 dark:hover:text-blue-400">${escapeHtml(c.home)}</a>
                    <span>/</span>
                    <span id="breadcrumbCurrent" class="text-slate-900 dark:text-slate-200">${escapeHtml(pack.crumb)}</span>
                </nav>
                <article class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    <header class="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-2">
                        <p class="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">${pack.eyebrow}</p>
                        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">${pack.h1}</h1>
                        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">${pack.meta}</p>
                    </header>
                    ${renderLegalSections(pack.sections, email, targetLang, pageType)}
                </article>${postArticleAdHtml}`;
        }

        if (pageType === 'contact' && CONTACT_T[targetLang]) {
            const d = CONTACT_T[targetLang];
            return `
                <nav aria-label="Breadcrumb" class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <a href="${homeHref}" id="breadcrumbHome" class="hover:text-blue-600 dark:hover:text-blue-400">${escapeHtml(c.home)}</a>
                    <span>/</span>
                    <span id="breadcrumbCurrent" class="text-slate-900 dark:text-slate-200">${escapeHtml(d.crumb)}</span>
                </nav>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <section class="md:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                        <header class="space-y-1.5">
                            <p class="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">${d.eyebrow}</p>
                            <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">${d.h1}</h1>
                            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${d.intro}</p>
                        </header>
                        <div class="space-y-4 text-sm">
                            <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                                <div class="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">${escapeHtml(d.emailLabel)}</div>
                                <div class="flex items-center justify-between gap-2 flex-wrap">
                                    <a id="publisherEmailLink" href="mailto:${escapeHtml(email)}" class="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all">${escapeHtml(email)}</a>
                                    <button type="button" onclick="copyEmail()" class="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">${escapeHtml(d.copyBtn)}</button>
                                </div>
                                <p id="copyEmailFeedback" class="hidden text-xs text-emerald-600 dark:text-emerald-400 font-medium">${escapeHtml(d.copiedMsg)}</p>
                            </div>
                            <div class="space-y-2 text-slate-600 dark:text-slate-300">
                                <h2 class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtml(d.topicsTitle)}</h2>
                                <ul class="list-disc pl-5 space-y-1 text-xs sm:text-sm">${d.topics.map((t) => `<li>${rewriteLinksInHtml(t, targetLang)}</li>`).join('')}</ul>
                                <p class="text-xs text-slate-500 dark:text-slate-400 pt-1">${escapeHtml(d.responseNote)}</p>
                            </div>
                        </div>
                    </section>
                    <section class="md:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
                        <div class="space-y-1">
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white">${escapeHtml(d.formTitle)}</h2>
                            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">${escapeHtml(d.formSub)}</p>
                        </div>
                        <form onsubmit="handleContactSubmit(event)" class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label for="contactName" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(d.labelName)}</label>
                                    <input type="text" id="contactName" required placeholder="${escapeHtml(d.placeholderName)}" class="w-full min-h-[42px] px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                </div>
                                <div class="space-y-1.5">
                                    <label for="contactSender" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(d.labelEmail)}</label>
                                    <input type="email" id="contactSender" required placeholder="${escapeHtml(d.placeholderEmail)}" class="w-full min-h-[42px] px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <label for="contactTopic" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(d.labelTopic)}</label>
                                <select id="contactTopic" class="w-full min-h-[42px] px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                                    ${d.topicsOpt.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
                                </select>
                            </div>
                            <div class="space-y-1.5">
                                <label for="contactMessage" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(d.labelMessage)}</label>
                                <textarea id="contactMessage" rows="4" required placeholder="${escapeHtml(d.placeholderMessage)}" class="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"></textarea>
                            </div>
                            <div class="flex flex-wrap items-center gap-3">
                                <button type="submit" class="min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">${escapeHtml(d.submitBtn)}</button>
                                <p id="formStatus" aria-live="polite" class="hidden text-xs font-medium text-emerald-600 dark:text-emerald-400"></p>
                            </div>
                        </form>
                    </section>
                </div>
                <!-- ADSENSE MANUAL SLOT 1 (Max 1 on Contact Page, safely spaced below form): Desktop 728x90 | Mobile 320x100 -->
                <div role="region" aria-label="AdSense Placement Slot 1" data-ad-slot-position="contact-below-grid" data-ad-mode="mount" data-ad-recommended-size="728x90 (Desktop) | 320x100 (Mobile)" class="dn-ad-mount hidden"></div>`;
        }

        return null;
    }

    function buildTrustJsonLd(pageType, lang, siteUrl, contactEmail, name, description, pageFile) {
        const cleanBase = String(siteUrl || 'https://domainname.web.id').replace(/\/+$/, '');
        const pageUrl = `${cleanBase}${localizeInternalHref(pageFile, lang)}`;
        let schemaType = 'WebPage';
        if (pageType === 'about') schemaType = 'AboutPage';
        if (pageType === 'contact') schemaType = 'ContactPage';
        return {
            '@context': 'https://schema.org',
            '@type': schemaType,
            name,
            url: pageUrl,
            description,
            inLanguage: lang,
            isPartOf: {
                '@type': 'WebSite',
                name: 'Domain Name',
                url: `${cleanBase}/`
            },
            publisher: {
                '@type': 'Organization',
                name: 'Domain Name',
                url: `${cleanBase}/`,
                email: contactEmail || 'admin@domainname.web.id'
            }
        };
    }

    function detectCurrentPageFile() {
        if (typeof window === 'undefined' || !window.location) return 'about.html';
        const parts = window.location.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || 'about.html';
        if (TRUST_PAGES.includes(last)) return last;
        const pageType = typeof document !== 'undefined' ? document.body.getAttribute('data-trust-page') : null;
        if (pageType === 'privacy') return 'privacy-policy.html';
        if (pageType === 'terms') return 'terms.html';
        if (pageType === 'disclaimer') return 'disclaimer.html';
        if (pageType === 'contact') return 'contact.html';
        return 'about.html';
    }

    function detectPathLang() {
        if (typeof window === 'undefined' || !window.location) return null;
        const match = window.location.pathname.match(/^\/(en|id|es|pt|fr|de|ru|ja)(?:\/|$)/i);
        return match ? match[1].toLowerCase() : null;
    }

    function updateInternalLinksForLang(lang) {
        if (typeof document === 'undefined') return;
        const currentPage = detectCurrentPageFile();

        document.querySelectorAll('a[href]').forEach((a) => {
            const rawHref = a.getAttribute('href');
            if (!rawHref || rawHref.startsWith('http') || rawHref.startsWith('mailto:')) return;
            if (a.hasAttribute('data-trust-edition')) return;

            const rewritten = localizeInternalHref(rawHref, lang);
            if (rewritten !== rawHref) {
                a.setAttribute('href', rewritten);
            }
        });

        // Update footer Editions links using Option A dedicated URLs
        document.querySelectorAll('a[data-trust-edition]').forEach((link) => {
            const code = link.getAttribute('data-trust-edition');
            if (!code) return;
            link.setAttribute('href', localizeInternalHref(currentPage, code));
            link.setAttribute('hreflang', code);
            link.setAttribute('lang', code);
            if (code === lang) {
                link.className = 'px-2.5 py-1.5 text-xs rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold transition-colors';
                link.setAttribute('aria-current', 'page');
            } else {
                link.className = 'px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors';
                link.removeAttribute('aria-current');
            }
        });
    }

    function syncSeoMeta(pageType, targetLang, title, desc) {
        if (typeof document === 'undefined') return;
        const currentPage = detectCurrentPageFile();
        const siteUrl = getSiteUrl();
        const canonicalUrl = `${siteUrl}${localizeInternalHref(currentPage, targetLang)}`;
        const email = getContactEmail();

        document.title = title;
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', desc);

        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) canonicalLink.setAttribute('href', canonicalUrl);

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', desc);
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale && OG_LOCALE[targetLang]) ogLocale.setAttribute('content', OG_LOCALE[targetLang]);

        const schemaEl = document.getElementById('schemaJsonLd');
        if (schemaEl) {
            const schemaObj = buildTrustJsonLd(pageType, targetLang, siteUrl, email, title, desc, currentPage);
            schemaEl.textContent = JSON.stringify(schemaObj, null, 2);
        }
    }

    function applyTrustLanguage(lang) {
        if (typeof document === 'undefined') return;
        const targetLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
        const mainEl = document.querySelector('main');
        const pageType = document.body.getAttribute('data-trust-page');
        if (!mainEl || !pageType) return;

        if (!originalEnglishSnapshot) {
            originalEnglishSnapshot = {
                title: document.title,
                desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
                mainHtml: mainEl.innerHTML
            };
        }

        try {
            localStorage.setItem('preferredLanguage', targetLang);
            localStorage.setItem('preferredLang', targetLang);
        } catch (e) {}

        document.documentElement.setAttribute('lang', targetLang);
        document.body.setAttribute('data-page-lang', targetLang);
        const sel = document.getElementById('langSelect');
        if (sel && sel.value !== targetLang) sel.value = targetLang;

        // Update shared header & footer chrome
        const c = CHROME[targetLang] || CHROME.en;
        const navMap = {
            navGen: c.navGenerator,
            navAbout: c.navAbout,
            navPrivacy: c.navPrivacy,
            navTerms: c.navTerms,
            navDisclaimer: c.navDisclaimer,
            navContact: c.navContact,
            footerSlogan: c.footerSlogan,
            footerEditionsTitle: c.footerEditions,
            footerLegalTitle: c.footerLegal,
            footerAbout: c.footerAbout,
            footerPrivacy: c.footerPrivacy,
            footerTerms: c.footerTerms,
            footerDisclaimer: c.footerDisclaimer,
            footerContact: c.footerContact,
            footerCopyright: c.copyright
        };
        Object.keys(navMap).forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = navMap[id];
        });

        if (targetLang === 'en') {
            syncSeoMeta(pageType, 'en', originalEnglishSnapshot.title, originalEnglishSnapshot.desc);
            mainEl.innerHTML = originalEnglishSnapshot.mainHtml;
            updateInternalLinksForLang('en');
            return;
        }

        const pack = getPagePack(pageType, targetLang);
        const email = getContactEmail();
        if (pack) {
            syncSeoMeta(pageType, targetLang, pack.title, pack.desc);
            const html = buildTrustMainHtml(pageType, targetLang, email);
            if (html) mainEl.innerHTML = html;
        }

        updateInternalLinksForLang(targetLang);
    }

    if (typeof window !== 'undefined') {
        window.changeTrustLanguage = function (lang) {
            const targetLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
            try {
                localStorage.setItem('preferredLanguage', targetLang);
                localStorage.setItem('preferredLang', targetLang);
            } catch (e) {}

            // Option A: Perform real navigation to dedicated localized URL on HTTP/HTTPS hosting
            if (window.location && /^https?:/i.test(window.location.protocol)) {
                const currentPage = detectCurrentPageFile();
                const nextPath = localizeInternalHref(currentPage, targetLang);
                if (window.location.pathname !== nextPath || window.location.search) {
                    window.location.assign(nextPath);
                    return;
                }
            }

            // Fallback for file:// offline preview
            applyTrustLanguage(targetLang);
        };

        window.addEventListener('DOMContentLoaded', function () {
            const params = new URLSearchParams(window.location.search);
            const pathLang = detectPathLang();
            const preRenderedLang = document.body.getAttribute('data-page-lang');
            const queryLang = params.get('lang');

            let initialLang = pathLang || (SUPPORTED_LANGS.includes(queryLang) ? queryLang : null) || preRenderedLang || 'en';
            if (!SUPPORTED_LANGS.includes(initialLang)) {
                initialLang = 'en';
            }

            const sel = document.getElementById('langSelect');
            if (sel) sel.value = initialLang;
            try {
                localStorage.setItem('preferredLanguage', initialLang);
                localStorage.setItem('preferredLang', initialLang);
            } catch (e) {}

            // Only perform client-side DOM replacement if the static HTML isn't already rendered in initialLang
            if (preRenderedLang !== initialLang || document.documentElement.getAttribute('lang') !== initialLang) {
                applyTrustLanguage(initialLang);
            } else {
                updateInternalLinksForLang(initialLang);
            }
        });
    }

    const exportedApi = {
        SUPPORTED_LANGS,
        TRUST_PAGES,
        OG_LOCALE,
        CHROME,
        ABOUT_T,
        PRIVACY_T,
        TERMS_T,
        DISCLAIMER_T,
        CONTACT_T,
        localizeInternalHref,
        getPagePack,
        buildTrustMainHtml,
        buildTrustJsonLd
    };

    if (root && typeof root === 'object') {
        root.__TRUST_I18N__ = exportedApi;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exportedApi;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);

