const { askGemini } = require('../services/gemini.service');

/**
 * POST /api/chat
 * Menerima pertanyaan pengguna dan mengembalikan respons dari Gemini AI.
 */
exports.chat = async (req, res) => {
    const { message } = req.body;

    try {
        const reply = await askGemini(message, req.session?.user);

        return res.status(200).json({
            success: true,
            data: {
                reply
            }
        });
    } catch (err) {
        console.error('[ChatController] Error:', err.message);

        return res.status(503).json({
            success: false,
            error: err.message || 'Layanan AI sedang tidak tersedia. Silakan coba lagi nanti.'
        });
    }
};
