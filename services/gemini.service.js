const { getGeminiModel } = require('../config/gemini');
const Produk = require('../models/produkModel');
const Pesanan = require('../models/pesananModel');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTemporaryGeminiError = (err) => {
    const message = String(err?.message || '');
    return /\b(429|500|502|503|504)\b|service unavailable|high demand|temporar|timeout|network|abort/i.test(message);
};

const getNumberFromMessage = (message) => {
    const match = message.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo(?:gram)?)/i);
    return match ? Number.parseFloat(match[1].replace(',', '.')) : null;
};

const getFabricFromMessage = (message) => {
    const fabrics = [
        ['sutra', 'sutra'],
        ['wol', 'wol'],
        ['wool', 'wol'],
        ['bayi', 'pakaian bayi'],
        ['katun', 'katun'],
        ['cotton', 'katun'],
        ['jeans', 'jeans'],
        ['denim', 'denim'],
        ['synthetic', 'bahan sintetis'],
        ['sintetis', 'bahan sintetis'],
    ];
    const found = fabrics.find(([keyword]) => message.toLowerCase().includes(keyword));
    return found ? found[1] : null;
};

/**
 * Respons lokal saat Gemini sedang tidak dapat dijangkau. Ini memastikan dua
 * kebutuhan utama pada PRD tetap dapat dilayani tanpa mengarang data antrean.
 */
const getOrderContext = async (user) => {
    if (!user) return 'Pengguna belum login, sehingga data pesanan pribadi tidak tersedia.';
    const orders = user.role === 'admin' ? await Pesanan.findActive() : await Pesanan.findActiveByCustomer(user.id);
    if (!orders.length) return user.role === 'admin' ? 'Tidak ada antrean pesanan aktif.' : 'Pengguna ini tidak memiliki pesanan aktif.';
    return `DATA PESANAN AKTIF (${user.role === 'admin' ? 'semua pelanggan' : 'pelanggan yang sedang login'}):\n${orders.map((order) => `- ${order.kode} | ${order.namaPelanggan} | ${order.layanan} | ${order.berat} kg | Status: ${order.status} | Estimasi: ${new Date(order.estimasiSelesai).toLocaleString('id-ID')}`).join('\n')}`;
};

const getFallbackReply = async (message, user) => {
    const normalized = message.toLowerCase();
    const asksFragrance = /pewangi|pewangian|parfum|aroma|wangi|softener/.test(normalized);
    const asksEstimate = /estimasi|kapan|selesai|antrean|antrian/.test(normalized);

    if (asksFragrance) {
        const weight = getNumberFromMessage(message);
        const fabric = getFabricFromMessage(message);

        if (!weight || !fabric) {
            return 'Agar saya bisa merekomendasikan pewangi dengan tepat, tuliskan berat cucian dan jenis bahannya. Contoh: "Rekomendasi pewangi untuk 3 kg katun."';
        }

        const dosage = Math.round(weight * 5);
        const fragrance = ['sutra', 'wol', 'pakaian bayi'].includes(fabric)
            ? 'aroma lembut atau hypoallergenic'
            : fabric === 'jeans'
                ? 'aroma segar yang tahan lama'
                : 'aroma floral atau fresh';

        return `Untuk ${weight} kg bahan ${fabric}, gunakan ${fragrance}. Mulai dari sekitar ${dosage} ml pewangi (±5 ml/kg), lalu sesuaikan dengan petunjuk pada kemasan agar tidak terlalu pekat.`;
    }

    if (asksEstimate) {
        if (!user) return 'Silakan masuk terlebih dahulu agar saya dapat memeriksa status dan estimasi pesanan Anda.';
        const orders = user.role === 'admin' ? await Pesanan.findActive() : await Pesanan.findActiveByCustomer(user.id);
        if (!orders.length) return user.role === 'admin' ? 'Saat ini tidak ada antrean cucian aktif.' : 'Anda belum memiliki pesanan aktif. Buat pesanan terlebih dahulu melalui menu Pilih Layanan.';
        const summary = orders.slice(0, 3).map((order) => {
            if (order.status === 'Siap Ambil') return `${order.kode} sudah siap diambil`;
            return `${order.kode} berstatus ${order.status}, estimasi selesai ${new Date(order.estimasiSelesai).toLocaleDateString('id-ID', { dateStyle: 'full' })}`;
        }).join('. ');
        return `Informasi pesanan: ${summary}.`;
    }

    return 'Maaf, layanan AI sedang sibuk. Anda tetap dapat menanyakan rekomendasi pewangi dengan format "3 kg katun" atau estimasi selesai cucian. Silakan coba lagi beberapa saat lagi untuk pertanyaan lainnya.';
};

/**
 * Mengambil semua data produk dari database dan memformatnya
 * sebagai context untuk dikirim ke Gemini.
 */
const buildProductContext = async () => {
    try {
        const produkList = await Produk.getAll();

        if (!produkList || produkList.length === 0) {
            return 'Saat ini tidak ada data layanan yang tersedia di database.';
        }

        const lines = produkList.map((p, i) =>
            `${i + 1}. Nama: ${p.nama} | Harga: Rp ${p.harga.toLocaleString('id-ID')}/kg | Kategori: ${p.kategori} | Ketersediaan: ${p.stok} | Deskripsi: ${p.deskripsi}`
        );

        return `DATA LAYANAN LAUNDRY SYAH JEHAN (sumber: database):\n${lines.join('\n')}`;
    } catch (err) {
        console.error('[GeminiService] Gagal mengambil data produk:', err.message);
        return 'Data layanan sedang tidak dapat diakses saat ini.';
    }
};

/**
 * Mendeteksi potensi prompt injection dari pesan pengguna.
 * @param {string} message
 * @returns {boolean} true jika terdeteksi prompt injection
 */
const detectPromptInjection = (message) => {
    const injectionPatterns = [
        /ignore (previous|above|all|system|prior) (instructions?|prompts?|rules?)/i,
        /forget (everything|all|your|previous|instructions?)/i,
        /you are now/i,
        /pretend (to be|you are|you're)/i,
        /act as (a|an|if)/i,
        /roleplay as/i,
        /disregard (your|all|previous|system)/i,
        /override (your|system|all)/i,
        /new (instructions?|system|persona|role)/i,
        /jangan ikuti/i,
        /abaikan (instruksi|aturan|sistem|perintah)/i,
        /lupakan (semua|instruksi|aturan)/i,
        /sekarang kamu adalah/i,
        /pura-pura (menjadi|kamu)/i,
        /\\[system\\]/i,
        /<system>/i,
    ];
    return injectionPatterns.some(pattern => pattern.test(message));
};

/**
 * Mengirim pertanyaan pengguna ke Gemini bersama context data aplikasi.
 * @param {string} userMessage - Pertanyaan dari pengguna
 * @returns {Promise<string>} Respons dari Gemini
 */
const askGemini = async (userMessage, user) => {
    // Deteksi prompt injection
    if (detectPromptInjection(userMessage)) {
        return 'Maaf, permintaan Anda tidak dapat diproses. Saya hanya dapat membantu pertanyaan seputar layanan Laundry Syah Jehan. Apakah ada yang ingin Anda ketahui tentang layanan atau harga laundry kami?';
    }

    // Ambil context produk dari database
    const [productContext, orderContext] = await Promise.all([buildProductContext(), getOrderContext(user)]);

    // Gabungkan context database dengan pertanyaan pengguna
    const promptWithContext = `${productContext}\n\n${orderContext}\n\nPertanyaan pelanggan: ${userMessage}`;

    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const result = await getGeminiModel().generateContent(promptWithContext);
            const text = result.response.text();

            if (!text || text.trim() === '') {
                return 'Maaf, saya tidak dapat memberikan respons saat ini. Silakan coba lagi.';
            }

            return text.trim();
        } catch (err) {
            lastError = err;
            if (!isTemporaryGeminiError(err) || attempt === 1) break;
            await sleep(400 * (attempt + 1));
        }
    }

    console.error('[GeminiService] Error dari Gemini API:', lastError.message);
    if (lastError.message && lastError.message.includes('API_KEY')) {
        throw new Error('Konfigurasi API tidak valid. Hubungi administrator.');
    }
    if (lastError.message && lastError.message.includes('SAFETY')) {
        return 'Maaf, pesan Anda tidak dapat diproses karena melanggar kebijakan keamanan. Silakan ajukan pertanyaan yang berkaitan dengan layanan laundry kami.';
    }
    if (isTemporaryGeminiError(lastError)) {
        return getFallbackReply(userMessage, user);
    }

    throw new Error('Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.');
};

module.exports = { askGemini, buildProductContext, detectPromptInjection, getFallbackReply, getOrderContext };
