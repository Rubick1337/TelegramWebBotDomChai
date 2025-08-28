const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

const QR_CODE_DIR = path.join(__dirname, '..', 'static', 'qrcodes');
const QR_CODE_BASE_URL = '/static/qrcodes';

async function generateAndSaveOrderQRCode(orderId){

    const qrCodeDataURL = `http://localhost:3000/orders/${orderId}`;
    const fileName = `order_${orderId}.png`;
    const filePath = path.join(QR_CODE_DIR, fileName);

    await QRCode.toFile(filePath, qrCodeDataURL,{
        color: {
            dark: '#000',
            light: '#FFF'
        },
        width: 300,
        margin: 2
    });

    console.log(`QR-код для заказа ${orderId} сохранен: ${filePath}`);
    console.log(`Файл доступен по: ${QR_CODE_BASE_URL}/${fileName}`);

    return fileName;
}

module.exports = generateAndSaveOrderQRCode ;