const imgToPDF = require('image-to-pdf');
const fs = require('fs');

async function imgtopdf(array, output) {        
    imgToPDF(array, imgToPDF.sizes.A4)
        .pipe(fs.createWriteStream(output));
    
    return 'success';
}
