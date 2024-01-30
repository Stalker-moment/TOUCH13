const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');
//../kwitansi/raw.jpg

const imagePath = path.join(__dirname, '../kwitansi/raw.jpg');
const signaturepng = path.join(__dirname, '../kwitansi/signature_raw_crop.png');

const namasignature = 'Farian Dwi'
const forPayment = 'Pembayaran TOUCH#13'

const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });

function potongNama(nama) {
    if (nama.length > 30) {
        let namaSplit = nama.split(' ');
        for (let i = 0; i < namaSplit.length; i++) {
            if (namaSplit.slice(0, i+1).join(' ').length > 30) {
                return namaSplit.slice(0, i).join(' ') + ' ' + namaSplit.slice(i).map(kata => kata[0]).join('. ') + '.';
            }
        }
    }
    return nama;
}

async function fillReceipt(number, nama, amountInWords, amount) {
    const receivedFrom = potongNama(nama);

    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0, image.width, image.height);

    context.font = '40px Comic Sans MS';
    context.fillText(number, 402, 95);
    context.fillText(date, 1349, 95);
    context.fillText(receivedFrom, 639, 145);
    context.fillText(amountInWords, 641, 212);
    context.fillText(forPayment, 648, 268);
    context.fillText(amount, 457, 521);

    //filltext dengan font 20px
    context.font = '20px Comic Sans MS';
    context.fillText(namasignature, 1281, 548);

    const signature = await loadImage(signaturepng); // Menggunakan signaturepng
    context.drawImage(signature, 1281, 381, 150, 150);

    //replace spasi dengan _
    const namaorang = nama.replace(/\s/g, '_');
    const namafile = number.toString() +'_'+namaorang+ '.jpg';

    const out = fs.createWriteStream(__dirname + namafile);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () =>  console.log('The JPG file was created.'));
}


module.exports = fillReceipt;
