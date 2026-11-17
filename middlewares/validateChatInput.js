/**
 * Middleware untuk memvalidasi input chat sebelum diproses controller.
 * Memeriksa: pesan kosong, tipe data, dan batas panjang pesan.
 */
const MAX_MESSAGE_LENGTH = 500;

const validateChatInput = (req, res, next) => {
    const { message } = req.body;

    // Periksa apakah field message ada
    if (message === undefined || message === null) {
        return res.status(400).json({
            success: false,
            error: 'Field "message" wajib disertakan.'
        });
    }

    // Periksa tipe data
    if (typeof message !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Field "message" harus berupa teks.'
        });
    }

    // Periksa apakah pesan kosong atau hanya spasi
    if (message.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Pesan tidak boleh kosong.'
        });
    }

    // Periksa batas panjang pesan
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            success: false,
            error: `Pesan terlalu panjang. Maksimal ${MAX_MESSAGE_LENGTH} karakter.`
        });
    }

    // Sanitasi: trim whitespace berlebih
    req.body.message = message.trim();

    next();
};

module.exports = validateChatInput;

