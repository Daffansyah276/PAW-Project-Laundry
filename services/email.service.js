const nodemailer = require('nodemailer');

const getAdminEmails = () => (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

const isEmailConfigured = () => Boolean(
    process.env.SMTP_HOST
    && process.env.SMTP_PORT
    && process.env.SMTP_USER
    && process.env.SMTP_PASS
    && process.env.MAIL_FROM,
);

const transporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, text }) => {
    if (!isEmailConfigured()) {
        console.warn('[Email] SMTP belum dikonfigurasi; email tidak dikirim.');
        return false;
    }
    try {
        await transporter().sendMail({ from: process.env.MAIL_FROM, to, subject, text });
        return true;
    } catch (err) {
        console.error('[Email] Gagal mengirim email:', err.message);
        return false;
    }
};

const sendNewOrderToAdmin = (pesanan) => {
    const recipients = getAdminEmails();
    if (!recipients.length) return Promise.resolve(false);
    return sendEmail({
        to: recipients.join(','),
        subject: `Pesanan baru ${pesanan.kode}`,
        text: [
            'Ada pesanan laundry baru.',
            `Kode: ${pesanan.kode}`,
            `Pelanggan: ${pesanan.namaPelanggan}`,
            `Layanan: ${pesanan.layanan}`,
            `Berat: ${pesanan.berat} kg`,
            `Catatan: ${pesanan.catatan || '-'}`,
        ].join('\n'),
    });
};

const sendStatusToCustomer = (pesanan, customerEmail, status) => sendEmail({
    to: customerEmail,
    subject: `Update pesanan ${pesanan.kode}`,
    text: `Halo ${pesanan.namaPelanggan}, status pesanan laundry Anda (${pesanan.kode}) sekarang: ${status}.`,
});

module.exports = { sendNewOrderToAdmin, sendStatusToCustomer };
