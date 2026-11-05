const QRCode = require('qrcode');

/**
 * Generates a Base64 Data URL QR Code
 * @param {string} text - The text/URL to encode (e.g. invoice verification URL or payment link)
 */
const generateQRCode = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('[QR Service] Error generating QR code:', err.message);
    return '';
  }
};

module.exports = { generateQRCode };

