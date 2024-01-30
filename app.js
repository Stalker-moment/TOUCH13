const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());

const numberadmin = '6282134580805'; //ganti dengan nomor admin yang akan menerima notifikasi
const groupid = '120363192369928690'; //ganti dengan group id yang akan menerima notifikasi
const base_api = 'https://wapi.tierkun.my.id/api/v1/'; //ganti dengan base api yang anda miliki
const spreadsheeturl = 'https://docs.google.com/spreadsheets/d/1QriWH3jYSjlkGWUKvxwKvb_MMVLwYGqsrbtVwFLMEug'; //ganti dengan spreadsheet url yang anda miliki
const spreadsheeturl_2 = 'https://docs.google.com/spreadsheets/d/1wMucqSNSb-0yLQ1DmBMLr2DC0U9OYnc_dcbuskDFDKo'; //ganti dengan spreadsheet url yang anda miliki
const spreadsheeturl_3 = 'https://docs.google.com/spreadsheets/d/18h_jKhhM1eK7BaJoXzZFq9tey_HLXDRob9oarhfoPfw'; //ganti dengan spreadsheet url yang anda miliki
const spreadsheeturl_4 = 'https://docs.google.com/spreadsheets/d/157C38P2UgaVPmg7YdLoO8gHufUtBDgfyxTB1ZQf9kKE'; //ganti dengan spreadsheet url yang anda miliki
const spreadsheeturl_5 = 'https://docs.google.com/spreadsheets/d/1fZ8oT4LIZPuMoylo1hRVdSpuXF3x6eJ-5qbH3qnx1gA'; //ganti dengan spreadsheet url yang anda miliki
const spreadsheeturl_6 = 'https://docs.google.com/spreadsheets/d/1ZermTQmj9XhkTf1Ng3QD4DN9FVhMusjyVgn89xQjoZI'; //ganti dengan spreadsheet url yang anda miliki

//database id
const databases = './database/userid.json';

//import function
const { createduser } = require('./function/createuser');
const { giveId } = require('./function/createnoid');
const { catat_database } = require('./function/writemaster');
const { catat_lunas } = require('./function/lunasin');
const { editStatusLunas } = require('./function/editlunas');
const fillReceipt = require('./function/kwitansi');
const rotateImage = require('./function/rotateimage');
const imgtopdf = require('./function/imgtopdf');

app.post('/notify', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres, Nama, Smp, NoWA, KIA, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA.charAt(0) == '0') {
        var newNoWa = NoWA.replace('0', '62');
    } else if(NoWA.charAt(0) == '+') {
        var newNoWa = NoWA.replace('+', '');
    } else if(NoWA.charAt(0) == '6') {
        var newNoWa = NoWA;
    } else if(NoWA.charAt(0) == '8') {
        var newNoWa = '62' + NoWA;
    } else {
        var newNoWa = NoWA;
    } 

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa.charAt(0) == '0') {
        var newNoWa = newNoWa.replace('0', '62');
    } else if(newNoWa.charAt(0) == '+') {
        var newNoWa = newNoWa.replace('+', '');
    } else if(newNoWa.charAt(0) == '6') {
        var newNoWa = newNoWa;
    } else if(newNoWa.charAt(0) == '8') {
        var newNoWa = '62' + newNoWa;
    } else {
        var newNoWa = newNoWa;
    }
    
    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa.includes('-')) {
        var newNoWa = newNoWa.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan = Nama.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa = `https://wa.me/`+newNoWa;

    //checking nomor wa valid atau tidak
    const urivalid = base_api + 'checknumber/' + newNoWa;
    const datanumbervalidation = await axios.get(urivalid)
    const datanyavalid = datanumbervalidation.data.result;

    if(datanyavalid == 'true') {
        var status_number = 'valid';
    } else {
        var status_number = 'invalid';
    }
    
    if(payment == 'QRIS') {
        var msgtouser = `Halo *${Nama}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 40.000
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm = await createduser(msgtouser, newNoWa);
        const iduser = await giveId('2413');
        const addmaster = await catat_database(iduser, Nama, EmailAddres);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* Mandiri
*Harag:* Rp. 40.000

     _*Data Person*_ 
*Nama:* ${Nama}
*Sekolah:* ${Smp}
*No WA:* ${formattedNoWa} (${status_number})
*Email:* ${EmailAddres}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser}
*Password:* ${EmailAddres}

    _*File Attachment*_
*KIA:* ${KIA}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl}

ID : ${idrndm} *${addmaster}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser = `Halo *${Nama}*, 
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 40.000
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm = await createduser(msgtouser, newNoWa);
        const iduser = await giveId('2413');
        const addmaster = await catat_database(iduser, Nama, EmailAddres);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* Mandiri
*Harag:* Rp. 40.000

    _*Data Person*_
*Nama:* ${Nama}
*Sekolah:* ${Smp}
*No WA:* ${formattedNoWa} (${status_number})
*Email:* ${EmailAddres}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser}
*Password:* ${EmailAddres}

    _*File Attachment*_
*KIA:* ${KIA}
*SpreadSheet :* ${spreadsheeturl}

ID : ${idrndm} *${addmaster}*`
    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }

    console.log(params)
    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);
});

//============================================================================================[ notify 2 user ]===========================================================================================//
app.post('/notify2', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres_1, Nama_1, Smp_1, NoWA_1, KIA_1, EmailAddres_2, Nama_2, Smp_2, NoWA_2, KIA_2, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_1.charAt(0) == '0') {
        var newNoWa_1 = NoWA_1.replace('0', '62');
    } else if(NoWA_1.charAt(0) == '+') {
        var newNoWa_1 = NoWA_1.replace('+', '');
    } else if(NoWA_1.charAt(0) == '6') {
        var newNoWa_1 = NoWA_1;
    } else if(NoWA_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + NoWA_1;
    } else {
        var newNoWa_1 = NoWA_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_2.charAt(0) == '0') {
        var newNoWa_2 = NoWA_2.replace('0', '62');
    } else if(NoWA_2.charAt(0) == '+') {
        var newNoWa_2 = NoWA_2.replace('+', '');
    } else if(NoWA_2.charAt(0) == '6') {
        var newNoWa_2 = NoWA_2;
    } else if(NoWA_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + NoWA_2;
    } else {
        var newNoWa_2 = NoWA_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_1.charAt(0) == '0') {
        var newNoWa_1 = newNoWa_1.replace('0', '62');
    } else if(newNoWa_1.charAt(0) == '+') {
        var newNoWa_1 = newNoWa_1.replace('+', '');
    } else if(newNoWa_1.charAt(0) == '6') {
        var newNoWa_1 = newNoWa_1;
    } else if(newNoWa_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + newNoWa_1;
    } else {
        var newNoWa_1 = newNoWa_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_2.charAt(0) == '0') {
        var newNoWa_2 = newNoWa_2.replace('0', '62');
    } else if(newNoWa_2.charAt(0) == '+') {
        var newNoWa_2 = newNoWa_2.replace('+', '');
    } else if(newNoWa_2.charAt(0) == '6') {
        var newNoWa_2 = newNoWa_2;
    } else if(newNoWa_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + newNoWa_2;
    } else {
        var newNoWa_2 = newNoWa_2;
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_1.includes('-')) {
        var newNoWa_1 = newNoWa_1.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_2.includes('-')) {
        var newNoWa_2 = newNoWa_2.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan_1 = Nama_1.split(' ')[0];
    const namadepan_2 = Nama_2.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa_1 = `https://wa.me/`+newNoWa_1;
    const formattedNoWa_2 = `https://wa.me/`+newNoWa_2;

    //checking nomor wa valid atau tidak
    const urivalid_1 = base_api + 'checknumber/' + newNoWa_1;
    const urivalid_2 = base_api + 'checknumber/' + newNoWa_2;
    const datanumbervalidation_1 = await axios.get(urivalid_1)
    const datanumbervalidation_2 = await axios.get(urivalid_2)
    const datanyavalid_1 = datanumbervalidation_1.data.result;
    const datanyavalid_2 = datanumbervalidation_2.data.result;

    if(datanyavalid_1 == 'true') {
        var status_number_1 = 'valid';
    } else {
        var status_number_1 = 'invalid';
    }
    if(datanyavalid_2 == 'true') {
        var status_number_2 = 'valid'; 
    } else {
        var status_number_2 = 'invalid';
    }

    if(payment == 'QRIS') {
        var msgtouser_1 = `Halo *${Nama_1}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. Rp. 78.000 (39.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 78.000 (39.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 2 Orang
*Harga:* Rp. 78.000 (39.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl_2}

ID : ${idrndm_2} *${addmaster_2}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser_1 = `Halo *${Nama_1}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 78.000 (39.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 78.000 (39.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_

`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type*: 2 Orang
*Harga*: Rp. 78.000 (39.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*
    
    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}
*SpreadSheet :* ${spreadsheeturl_2}

ID : ${idrndm_2} *${addmaster_2}*`
    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }


    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);
});

//============================================================================================[ notify 3 user ]===========================================================================================//
app.post('/notify3', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres_1, Nama_1, Smp_1, NoWA_1, KIA_1, EmailAddres_2, Nama_2, Smp_2, NoWA_2, KIA_2, EmailAddres_3, Nama_3, Smp_3, NoWA_3, KIA_3, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_1.charAt(0) == '0') {
        var newNoWa_1 = NoWA_1.replace('0', '62');
    } else if(NoWA_1.charAt(0) == '+') {
        var newNoWa_1 = NoWA_1.replace('+', '');
    } else if(NoWA_1.charAt(0) == '6') {
        var newNoWa_1 = NoWA_1;
    } else if(NoWA_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + NoWA_1;
    } else {
        var newNoWa_1 = NoWA_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_2.charAt(0) == '0') {
        var newNoWa_2 = NoWA_2.replace('0', '62');
    } else if(NoWA_2.charAt(0) == '+') {
        var newNoWa_2 = NoWA_2.replace('+', '');
    } else if(NoWA_2.charAt(0) == '6') {
        var newNoWa_2 = NoWA_2;
    } else if(NoWA_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + NoWA_2;
    } else {
        var newNoWa_2 = NoWA_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_3.charAt(0) == '0') {
        var newNoWa_3 = NoWA_3.replace('0', '62');
    } else if(NoWA_3.charAt(0) == '+') {
        var newNoWa_3 = NoWA_3.replace('+', '');
    } else if(NoWA_3.charAt(0) == '6') {
        var newNoWa_3 = NoWA_3;
    } else if(NoWA_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + NoWA_3;
    } else {
        var newNoWa_3 = NoWA_3;
    } 

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_1.charAt(0) == '0') {
        var newNoWa_1 = newNoWa_1.replace('0', '62');
    } else if(newNoWa_1.charAt(0) == '+') {
        var newNoWa_1 = newNoWa_1.replace('+', '');
    } else if(newNoWa_1.charAt(0) == '6') {
        var newNoWa_1 = newNoWa_1;
    } else if(newNoWa_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + newNoWa_1;
    } else {
        var newNoWa_1 = newNoWa_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_2.charAt(0) == '0') {
        var newNoWa_2 = newNoWa_2.replace('0', '62');
    } else if(newNoWa_2.charAt(0) == '+') {
        var newNoWa_2 = newNoWa_2.replace('+', '');
    } else if(newNoWa_2.charAt(0) == '6') {
        var newNoWa_2 = newNoWa_2;
    } else if(newNoWa_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + newNoWa_2;
    } else {
        var newNoWa_2 = newNoWa_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_3.charAt(0) == '0') {
        var newNoWa_3 = newNoWa_3.replace('0', '62');
    } else if(newNoWa_3.charAt(0) == '+') {
        var newNoWa_3 = newNoWa_3.replace('+', '');
    } else if(newNoWa_3.charAt(0) == '6') {
        var newNoWa_3 = newNoWa_3;
    } else if(newNoWa_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + newNoWa_3;
    } else {
        var newNoWa_3 = newNoWa_3;
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_1.includes('-')) {
        var newNoWa_1 = newNoWa_1.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_2.includes('-')) {
        var newNoWa_2 = newNoWa_2.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_3.includes('-')) {
        var newNoWa_3 = newNoWa_3.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan_1 = Nama_1.split(' ')[0];
    const namadepan_2 = Nama_2.split(' ')[0];
    const namadepan_3 = Nama_3.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa_1 = `https://wa.me/`+newNoWa_1;
    const formattedNoWa_2 = `https://wa.me/`+newNoWa_2;
    const formattedNoWa_3 = `https://wa.me/`+newNoWa_3;

    //checking nomor wa valid atau tidak
    const urivalid_1 = base_api + 'checknumber/' + newNoWa_1;
    const urivalid_2 = base_api + 'checknumber/' + newNoWa_2;
    const urivalid_3 = base_api + 'checknumber/' + newNoWa_3;
    const datanumbervalidation_1 = await axios.get(urivalid_1)
    const datanumbervalidation_2 = await axios.get(urivalid_2)
    const datanumbervalidation_3 = await axios.get(urivalid_3)
    const datanyavalid_1 = datanumbervalidation_1.data.result;
    const datanyavalid_2 = datanumbervalidation_2.data.result;
    const datanyavalid_3 = datanumbervalidation_3.data.result;

    if(datanyavalid_1 == 'true') {
        var status_number_1 = 'valid';
    } else {
        var status_number_1 = 'invalid';
    }

    if(datanyavalid_2 == 'true') {
        var status_number_2 = 'valid';
    } else {
        var status_number_2 = 'invalid';
    }

    if(datanyavalid_3 == 'true') {
        var status_number_3 = 'valid';
    } else {
        var status_number_3 = 'invalid';
    }

    if(payment == 'QRIS') {
        var msgtouser_1 = `Halo *${Nama_1}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_3 = `Halo *${Nama_3}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 3 Orang
*Harga:* Rp. 114.000 (38.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*
    
    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl_3}

ID : ${idrndm_3} *${addmaster_3}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser_1 = `Halo *${Nama_1}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_2 = `Halo *${Nama_2}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_3 = `Halo *${Nama_3}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 114.000 (38.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805 
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 3 Orang
*Harga:* Rp. 114.000 (38.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*
    
        _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*

    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}
*SpreadSheet :* ${spreadsheeturl_3}

ID : ${idrndm_3} *${addmaster_3}*`

    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }

    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);
});

//============================================================================================[ notify 4 user ]===========================================================================================//
app.post('/notify4', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres_1, Nama_1, Smp_1, NoWA_1, KIA_1, EmailAddres_2, Nama_2, Smp_2, NoWA_2, KIA_2, EmailAddres_3, Nama_3, Smp_3, NoWA_3, KIA_3, EmailAddres_4, Nama_4, Smp_4, NoWA_4, KIA_4, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_1.charAt(0) == '0') {
        var newNoWa_1 = NoWA_1.replace('0', '62');
    } else if(NoWA_1.charAt(0) == '+') {
        var newNoWa_1 = NoWA_1.replace('+', '');
    } else if(NoWA_1.charAt(0) == '6') {
        var newNoWa_1 = NoWA_1;
    } else if(NoWA_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + NoWA_1;
    } else {
        var newNoWa_1 = NoWA_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_2.charAt(0) == '0') {
        var newNoWa_2 = NoWA_2.replace('0', '62');
    } else if(NoWA_2.charAt(0) == '+') {
        var newNoWa_2 = NoWA_2.replace('+', '');
    } else if(NoWA_2.charAt(0) == '6') {
        var newNoWa_2 = NoWA_2;
    } else if(NoWA_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + NoWA_2;
    } else {
        var newNoWa_2 = NoWA_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_3.charAt(0) == '0') {
        var newNoWa_3 = NoWA_3.replace('0', '62');
    } else if(NoWA_3.charAt(0) == '+') {
        var newNoWa_3 = NoWA_3.replace('+', '');
    } else if(NoWA_3.charAt(0) == '6') {
        var newNoWa_3 = NoWA_3;
    } else if(NoWA_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + NoWA_3;
    } else {
        var newNoWa_3 = NoWA_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_4.charAt(0) == '0') {
        var newNoWa_4 = NoWA_4.replace('0', '62');
    } else if(NoWA_4.charAt(0) == '+') {
        var newNoWa_4 = NoWA_4.replace('+', '');
    } else if(NoWA_4.charAt(0) == '6') {
        var newNoWa_4 = NoWA_4;
    } else if(NoWA_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + NoWA_4;
    } else {
        var newNoWa_4 = NoWA_4;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_1.charAt(0) == '0') {
        var newNoWa_1 = newNoWa_1.replace('0', '62');
    } else if(newNoWa_1.charAt(0) == '+') {
        var newNoWa_1 = newNoWa_1.replace('+', '');
    } else if(newNoWa_1.charAt(0) == '6') {
        var newNoWa_1 = newNoWa_1;
    } else if(newNoWa_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + newNoWa_1;
    } else {
        var newNoWa_1 = newNoWa_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_2.charAt(0) == '0') {
        var newNoWa_2 = newNoWa_2.replace('0', '62');
    } else if(newNoWa_2.charAt(0) == '+') {
        var newNoWa_2 = newNoWa_2.replace('+', '');
    } else if(newNoWa_2.charAt(0) == '6') {
        var newNoWa_2 = newNoWa_2;
    } else if(newNoWa_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + newNoWa_2;
    } else {
        var newNoWa_2 = newNoWa_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_3.charAt(0) == '0') {
        var newNoWa_3 = newNoWa_3.replace('0', '62');
    } else if(newNoWa_3.charAt(0) == '+') {
        var newNoWa_3 = newNoWa_3.replace('+', '');
    } else if(newNoWa_3.charAt(0) == '6') {
        var newNoWa_3 = newNoWa_3;
    } else if(newNoWa_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + newNoWa_3;
    } else {
        var newNoWa_3 = newNoWa_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_4.charAt(0) == '0') {
        var newNoWa_4 = newNoWa_4.replace('0', '62');
    } else if(newNoWa_4.charAt(0) == '+') {
        var newNoWa_4 = newNoWa_4.replace('+', '');
    } else if(newNoWa_4.charAt(0) == '6') {
        var newNoWa_4 = newNoWa_4;
    } else if(newNoWa_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + newNoWa_4;
    } else {
        var newNoWa_4 = newNoWa_4;
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_1.includes('-')) {
        var newNoWa_1 = newNoWa_1.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_2.includes('-')) {
        var newNoWa_2 = newNoWa_2.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_3.includes('-')) {
        var newNoWa_3 = newNoWa_3.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip 
    if(newNoWa_4.includes('-')) {
        var newNoWa_4 = newNoWa_4.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan_1 = Nama_1.split(' ')[0];
    const namadepan_2 = Nama_2.split(' ')[0];
    const namadepan_3 = Nama_3.split(' ')[0];
    const namadepan_4 = Nama_4.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa_1 = `https://wa.me/`+newNoWa_1;
    const formattedNoWa_2 = `https://wa.me/`+newNoWa_2;
    const formattedNoWa_3 = `https://wa.me/`+newNoWa_3;
    const formattedNoWa_4 = `https://wa.me/`+newNoWa_4;

    //checking nomor wa valid atau tidak
    const urivalid_1 = base_api + 'checknumber/' + newNoWa_1;
    const urivalid_2 = base_api + 'checknumber/' + newNoWa_2;
    const urivalid_3 = base_api + 'checknumber/' + newNoWa_3;
    const urivalid_4 = base_api + 'checknumber/' + newNoWa_4;

    const datanumbervalidation_1 = await axios.get(urivalid_1)
    const datanumbervalidation_2 = await axios.get(urivalid_2)
    const datanumbervalidation_3 = await axios.get(urivalid_3)
    const datanumbervalidation_4 = await axios.get(urivalid_4)

    const datanyavalid_1 = datanumbervalidation_1.data.result;
    const datanyavalid_2 = datanumbervalidation_2.data.result;
    const datanyavalid_3 = datanumbervalidation_3.data.result;
    const datanyavalid_4 = datanumbervalidation_4.data.result;

    if(datanyavalid_1 == 'true') {
        var status_number_1 = 'valid';
    } else {
        var status_number_1 = 'invalid';
    }

    if(datanyavalid_2 == 'true') {
        var status_number_2 = 'valid';
    } else {
        var status_number_2 = 'invalid';
    }

    if(datanyavalid_3 == 'true') {
        var status_number_3 = 'valid';
    } else {
        var status_number_3 = 'invalid';
    }

    if(datanyavalid_4 == 'true') {
        var status_number_4 = 'valid';
    } else {
        var status_number_4 = 'invalid';
    }

    if(payment == 'QRIS') {
        var msgtouser_1 = `Halo *${Nama_1}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_3 = `Halo *${Nama_3}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_4 = `Halo *${Nama_4}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 4 Orang
*Harga:* Rp. 148.000 (37.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*
    
        _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*
    
        _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*

    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl_4}

ID : ${idrndm_4} *${addmaster_4}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser_1 = `Halo *${Nama_1}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_2 = `Halo *${Nama_2}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_3 = `Halo *${Nama_3}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_4 = `Halo *${Nama_4}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 148.000 (37.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

    var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 4 Orang
*Harga:* Rp. 148.000 (37.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*
    
        _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*
    
        _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*

    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}
*SpreadSheet :* ${spreadsheeturl_4}

ID : ${idrndm_4} *${addmaster_4}*`

    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }

    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);

});


//============================================================================================[ notify 5 user ]===========================================================================================//
app.post('/notify5', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres_1, Nama_1, Smp_1, NoWA_1, KIA_1, EmailAddres_2, Nama_2, Smp_2, NoWA_2, KIA_2, EmailAddres_3, Nama_3, Smp_3, NoWA_3, KIA_3, EmailAddres_4, Nama_4, Smp_4, NoWA_4, KIA_4, EmailAddres_5, Nama_5, Smp_5, NoWA_5, KIA_5, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_1.charAt(0) == '0') {
        var newNoWa_1 = NoWA_1.replace('0', '62');
    } else if(NoWA_1.charAt(0) == '+') {
        var newNoWa_1 = NoWA_1.replace('+', '');
    } else if(NoWA_1.charAt(0) == '6') {
        var newNoWa_1 = NoWA_1;
    } else if(NoWA_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + NoWA_1;
    } else {
        var newNoWa_1 = NoWA_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_2.charAt(0) == '0') {
        var newNoWa_2 = NoWA_2.replace('0', '62');
    } else if(NoWA_2.charAt(0) == '+') {
        var newNoWa_2 = NoWA_2.replace('+', '');
    } else if(NoWA_2.charAt(0) == '6') {
        var newNoWa_2 = NoWA_2;
    } else if(NoWA_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + NoWA_2;
    } else {
        var newNoWa_2 = NoWA_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_3.charAt(0) == '0') {
        var newNoWa_3 = NoWA_3.replace('0', '62');
    } else if(NoWA_3.charAt(0) == '+') {
        var newNoWa_3 = NoWA_3.replace('+', '');
    } else if(NoWA_3.charAt(0) == '6') {
        var newNoWa_3 = NoWA_3;
    } else if(NoWA_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + NoWA_3;
    } else {
        var newNoWa_3 = NoWA_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_4.charAt(0) == '0') {
        var newNoWa_4 = NoWA_4.replace('0', '62');
    } else if(NoWA_4.charAt(0) == '+') {
        var newNoWa_4 = NoWA_4.replace('+', '');
    } else if(NoWA_4.charAt(0) == '6') {
        var newNoWa_4 = NoWA_4;
    } else if(NoWA_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + NoWA_4;
    } else {
        var newNoWa_4 = NoWA_4;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_5.charAt(0) == '0') {
        var newNoWa_5 = NoWA_5.replace('0', '62');
    } else if(NoWA_5.charAt(0) == '+') {
        var newNoWa_5 = NoWA_5.replace('+', '');
    } else if(NoWA_5.charAt(0) == '6') {
        var newNoWa_5 = NoWA_5;
    } else if(NoWA_5.charAt(0) == '8') {
        var newNoWa_5 = '62' + NoWA_5;
    } else {
        var newNoWa_5 = NoWA_5;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_1.charAt(0) == '0') {
        var newNoWa_1 = newNoWa_1.replace('0', '62');
    } else if(newNoWa_1.charAt(0) == '+') {
        var newNoWa_1 = newNoWa_1.replace('+', '');
    } else if(newNoWa_1.charAt(0) == '6') {
        var newNoWa_1 = newNoWa_1;
    } else if(newNoWa_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + newNoWa_1;
    } else {
        var newNoWa_1 = newNoWa_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_2.charAt(0) == '0') {
        var newNoWa_2 = newNoWa_2.replace('0', '62');
    } else if(newNoWa_2.charAt(0) == '+') {
        var newNoWa_2 = newNoWa_2.replace('+', '');
    } else if(newNoWa_2.charAt(0) == '6') {
        var newNoWa_2 = newNoWa_2;
    } else if(newNoWa_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + newNoWa_2;
    } else {
        var newNoWa_2 = newNoWa_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_3.charAt(0) == '0') {
        var newNoWa_3 = newNoWa_3.replace('0', '62');
    } else if(newNoWa_3.charAt(0) == '+') {
        var newNoWa_3 = newNoWa_3.replace('+', '');
    } else if(newNoWa_3.charAt(0) == '6') {
        var newNoWa_3 = newNoWa_3;
    } else if(newNoWa_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + newNoWa_3;
    } else {
        var newNoWa_3 = newNoWa_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_4.charAt(0) == '0') {
        var newNoWa_4 = newNoWa_4.replace('0', '62');
    } else if(newNoWa_4.charAt(0) == '+') {
        var newNoWa_4 = newNoWa_4.replace('+', '');
    } else if(newNoWa_4.charAt(0) == '6') {
        var newNoWa_4 = newNoWa_4;
    } else if(newNoWa_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + newNoWa_4;
    } else {
        var newNoWa_4 = newNoWa_4;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_5.charAt(0) == '0') {
        var newNoWa_5 = newNoWa_5.replace('0', '62');
    } else if(newNoWa_5.charAt(0) == '+') {
        var newNoWa_5 = newNoWa_5.replace('+', '');
    } else if(newNoWa_5.charAt(0) == '6') {
        var newNoWa_5 = newNoWa_5;
    } else if(newNoWa_5.charAt(0) == '8') {
        var newNoWa_5 = '62' + newNoWa_5;
    } else {
        var newNoWa_5 = newNoWa_5;
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_1.includes('-')) {
        var newNoWa_1 = newNoWa_1.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_2.includes('-')) {
        var newNoWa_2 = newNoWa_2.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_3.includes('-')) {
        var newNoWa_3 = newNoWa_3.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_4.includes('-')) {
        var newNoWa_4 = newNoWa_4.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_5.includes('-')) {
        var newNoWa_5 = newNoWa_5.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan_1 = Nama_1.split(' ')[0];
    const namadepan_2 = Nama_2.split(' ')[0];
    const namadepan_3 = Nama_3.split(' ')[0];
    const namadepan_4 = Nama_4.split(' ')[0];
    const namadepan_5 = Nama_5.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa_1 = `https://wa.me/`+newNoWa_1;
    const formattedNoWa_2 = `https://wa.me/`+newNoWa_2;
    const formattedNoWa_3 = `https://wa.me/`+newNoWa_3;
    const formattedNoWa_4 = `https://wa.me/`+newNoWa_4;
    const formattedNoWa_5 = `https://wa.me/`+newNoWa_5;

    //checking nomor wa valid atau tidak
    const urivalid_1 = base_api + 'checknumber/' + newNoWa_1;
    const urivalid_2 = base_api + 'checknumber/' + newNoWa_2;
    const urivalid_3 = base_api + 'checknumber/' + newNoWa_3;
    const urivalid_4 = base_api + 'checknumber/' + newNoWa_4;
    const urivalid_5 = base_api + 'checknumber/' + newNoWa_5;

    const datanumbervalidation_1 = await axios.get(urivalid_1)
    const datanumbervalidation_2 = await axios.get(urivalid_2)
    const datanumbervalidation_3 = await axios.get(urivalid_3)
    const datanumbervalidation_4 = await axios.get(urivalid_4)
    const datanumbervalidation_5 = await axios.get(urivalid_5)

    const datanyavalid_1 = datanumbervalidation_1.data.result;
    const datanyavalid_2 = datanumbervalidation_2.data.result;
    const datanyavalid_3 = datanumbervalidation_3.data.result;
    const datanyavalid_4 = datanumbervalidation_4.data.result;
    const datanyavalid_5 = datanumbervalidation_5.data.result;

    if(datanyavalid_1 == 'true') {
        var status_number_1 = 'valid';
    } else {
        var status_number_1 = 'invalid';
    }

    if(datanyavalid_2 == 'true') {
        var status_number_2 = 'valid';
    } else {
        var status_number_2 = 'invalid';
    }

    if(datanyavalid_3 == 'true') {
        var status_number_3 = 'valid';
    } else {
        var status_number_3 = 'invalid';
    }

    if(datanyavalid_4 == 'true') {
        var status_number_4 = 'valid';
    } else {
        var status_number_4 = 'invalid';
    }

    if(datanyavalid_5 == 'true') {
        var status_number_5 = 'valid';
    } else {
        var status_number_5 = 'invalid';
    }

    if(payment == 'QRIS') {
        var msgtouser_1 = `Halo *${Nama_1}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_3 = `Halo *${Nama_3}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_4 = `Halo *${Nama_4}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_5 = `Halo *${Nama_5}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

        const idrndm_5 = await createduser(msgtouser_5, newNoWa_5);
        const iduser_5 = await giveId('2413');
        const addmaster_5 = await catat_database(iduser_5, Nama_5, EmailAddres_5);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 5 Orang
*Harga:* Rp. 180.000 (36.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*

    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*
    
    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}

ID : ${idrndm_4} *${addmaster_4}*

    _*Data Person 5*_
*Nama:* ${Nama_5}
*Sekolah:* ${Smp_5}
*No WA:* ${formattedNoWa_5} (${status_number_5})
*Email:* ${EmailAddres_5}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_5}
*Password:* ${EmailAddres_5}

    _*File Attachment*_
*KIA:* ${KIA_5}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl_5}

ID : ${idrndm_5} *${addmaster_5}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser_1 = `Halo *${Nama_1}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_2 = `Halo *${Nama_2}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_3 = `Halo *${Nama_3}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_4 = `Halo *${Nama_4}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_5 = `Halo *${Nama_5}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 180.000 (36.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

        const idrndm_5 = await createduser(msgtouser_5, newNoWa_5);
        const iduser_5 = await giveId('2413');
        const addmaster_5 = await catat_database(iduser_5, Nama_5, EmailAddres_5);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 5 Orang
*Harga:* Rp. 180.000 (36.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*

    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*
    
    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}

ID : ${idrndm_4} *${addmaster_4}*

    _*Data Person 5*_
*Nama:* ${Nama_5}
*Sekolah:* ${Smp_5}
*No WA:* ${formattedNoWa_5} (${status_number_5})
*Email:* ${EmailAddres_5}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_5}
*Password:* ${EmailAddres_5}

    _*File Attachment*_
*KIA:* ${KIA_5}
*SpreadSheet :* ${spreadsheeturl_5}

ID : ${idrndm_5} *${addmaster_5}*`

    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }

    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);

});

//============================================================================================[ notify 6 user ]===========================================================================================//
app.post('/notify6', async(req, res) => {
    console.log('Received new response:', req.body);
    const { timeStamp, EmailAddres_1, Nama_1, Smp_1, NoWA_1, KIA_1, EmailAddres_2, Nama_2, Smp_2, NoWA_2, KIA_2, EmailAddres_3, Nama_3, Smp_3, NoWA_3, KIA_3, EmailAddres_4, Nama_4, Smp_4, NoWA_4, KIA_4, EmailAddres_5, Nama_5, Smp_5, NoWA_5, KIA_5, EmailAddres_6, Nama_6, Smp_6, NoWA_6, KIA_6, payment, buktionline } = req.body.data;
    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_1.charAt(0) == '0') {
        var newNoWa_1 = NoWA_1.replace('0', '62');
    } else if(NoWA_1.charAt(0) == '+') {
        var newNoWa_1 = NoWA_1.replace('+', '');
    } else if(NoWA_1.charAt(0) == '6') {
        var newNoWa_1 = NoWA_1;
    } else if(NoWA_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + NoWA_1;
    } else {
        var newNoWa_1 = NoWA_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_2.charAt(0) == '0') {
        var newNoWa_2 = NoWA_2.replace('0', '62');
    } else if(NoWA_2.charAt(0) == '+') {
        var newNoWa_2 = NoWA_2.replace('+', '');
    } else if(NoWA_2.charAt(0) == '6') {
        var newNoWa_2 = NoWA_2;
    } else if(NoWA_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + NoWA_2;
    } else {
        var newNoWa_2 = NoWA_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_3.charAt(0) == '0') {
        var newNoWa_3 = NoWA_3.replace('0', '62');
    } else if(NoWA_3.charAt(0) == '+') {
        var newNoWa_3 = NoWA_3.replace('+', '');
    } else if(NoWA_3.charAt(0) == '6') {
        var newNoWa_3 = NoWA_3;
    } else if(NoWA_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + NoWA_3;
    } else {
        var newNoWa_3 = NoWA_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_4.charAt(0) == '0') {
        var newNoWa_4 = NoWA_4.replace('0', '62');
    } else if(NoWA_4.charAt(0) == '+') {
        var newNoWa_4 = NoWA_4.replace('+', '');
    } else if(NoWA_4.charAt(0) == '6') {
        var newNoWa_4 = NoWA_4;
    } else if(NoWA_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + NoWA_4;
    } else {
        var newNoWa_4 = NoWA_4;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_5.charAt(0) == '0') {
        var newNoWa_5 = NoWA_5.replace('0', '62');
    } else if(NoWA_5.charAt(0) == '+') {
        var newNoWa_5 = NoWA_5.replace('+', '');
    } else if(NoWA_5.charAt(0) == '6') {
        var newNoWa_5 = NoWA_5;
    } else if(NoWA_5.charAt(0) == '8') {
        var newNoWa_5 = '62' + NoWA_5;
    } else {
        var newNoWa_5 = NoWA_5;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62
    if(NoWA_6.charAt(0) == '0') {
        var newNoWa_6 = NoWA_6.replace('0', '62');
    } else if(NoWA_6.charAt(0) == '+') {
        var newNoWa_6 = NoWA_6.replace('+', '');
    } else if(NoWA_6.charAt(0) == '6') {
        var newNoWa_6 = NoWA_6;
    } else if(NoWA_6.charAt(0) == '8') {
        var newNoWa_6 = '62' + NoWA_6;
    } else {
        var newNoWa_6 = NoWA_6;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_1.charAt(0) == '0') {
        var newNoWa_1 = newNoWa_1.replace('0', '62');
    } else if(newNoWa_1.charAt(0) == '+') {
        var newNoWa_1 = newNoWa_1.replace('+', '');
    } else if(newNoWa_1.charAt(0) == '6') {
        var newNoWa_1 = newNoWa_1;
    } else if(newNoWa_1.charAt(0) == '8') {
        var newNoWa_1 = '62' + newNoWa_1;
    } else {
        var newNoWa_1 = newNoWa_1;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_2.charAt(0) == '0') {
        var newNoWa_2 = newNoWa_2.replace('0', '62');
    } else if(newNoWa_2.charAt(0) == '+') {
        var newNoWa_2 = newNoWa_2.replace('+', '');
    } else if(newNoWa_2.charAt(0) == '6') {
        var newNoWa_2 = newNoWa_2;
    } else if(newNoWa_2.charAt(0) == '8') {
        var newNoWa_2 = '62' + newNoWa_2;
    } else {
        var newNoWa_2 = newNoWa_2;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_3.charAt(0) == '0') {
        var newNoWa_3 = newNoWa_3.replace('0', '62');
    } else if(newNoWa_3.charAt(0) == '+') {
        var newNoWa_3 = newNoWa_3.replace('+', '');
    } else if(newNoWa_3.charAt(0) == '6') {
        var newNoWa_3 = newNoWa_3;
    } else if(newNoWa_3.charAt(0) == '8') {
        var newNoWa_3 = '62' + newNoWa_3;
    } else {
        var newNoWa_3 = newNoWa_3;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_4.charAt(0) == '0') {
        var newNoWa_4 = newNoWa_4.replace('0', '62');
    } else if(newNoWa_4.charAt(0) == '+') {
        var newNoWa_4 = newNoWa_4.replace('+', '');
    } else if(newNoWa_4.charAt(0) == '6') {
        var newNoWa_4 = newNoWa_4;
    } else if(newNoWa_4.charAt(0) == '8') {
        var newNoWa_4 = '62' + newNoWa_4;
    } else {
        var newNoWa_4 = newNoWa_4;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_5.charAt(0) == '0') {
        var newNoWa_5 = newNoWa_5.replace('0', '62');
    } else if(newNoWa_5.charAt(0) == '+') {
        var newNoWa_5 = newNoWa_5.replace('+', '');
    } else if(newNoWa_5.charAt(0) == '6') {
        var newNoWa_5 = newNoWa_5;
    } else if(newNoWa_5.charAt(0) == '8') {
        var newNoWa_5 = '62' + newNoWa_5;
    } else {
        var newNoWa_5 = newNoWa_5;
    }

    //checking nomor harus diawali 62, mengubah 0 menjadi 62 lagi
    if(newNoWa_6.charAt(0) == '0') {
        var newNoWa_6 = newNoWa_6.replace('0', '62');
    } else if(newNoWa_6.charAt(0) == '+') {
        var newNoWa_6 = newNoWa_6.replace('+', '');
    } else if(newNoWa_6.charAt(0) == '6') {
        var newNoWa_6 = newNoWa_6;
    } else if(newNoWa_6.charAt(0) == '8') {
        var newNoWa_6 = '62' + newNoWa_6;
    } else {
        var newNoWa_6 = newNoWa_6;
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_1.includes('-')) {
        var newNoWa_1 = newNoWa_1.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_2.includes('-')) {
        var newNoWa_2 = newNoWa_2.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_3.includes('-')) {
        var newNoWa_3 = newNoWa_3.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_4.includes('-')) {
        var newNoWa_4 = newNoWa_4.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_5.includes('-')) {
        var newNoWa_5 = newNoWa_5.replace('-', '');
    }

    //jika ada strip terdeteksi pada nomor, menghapus strip
    if(newNoWa_6.includes('-')) {
        var newNoWa_6 = newNoWa_6.replace('-', '');
    }

    //mendapatkan nama depan
    const namadepan_1 = Nama_1.split(' ')[0];
    const namadepan_2 = Nama_2.split(' ')[0];
    const namadepan_3 = Nama_3.split(' ')[0];
    const namadepan_4 = Nama_4.split(' ')[0];
    const namadepan_5 = Nama_5.split(' ')[0];
    const namadepan_6 = Nama_6.split(' ')[0];

    //mengubah format nomor menjadi format link wa
    const formattedNoWa_1 = `https://wa.me/`+newNoWa_1;
    const formattedNoWa_2 = `https://wa.me/`+newNoWa_2;
    const formattedNoWa_3 = `https://wa.me/`+newNoWa_3;
    const formattedNoWa_4 = `https://wa.me/`+newNoWa_4;
    const formattedNoWa_5 = `https://wa.me/`+newNoWa_5;
    const formattedNoWa_6 = `https://wa.me/`+newNoWa_6;

    //checking nomor wa valid atau tidak
    const urivalid_1 = base_api + 'checknumber/' + newNoWa_1;
    const urivalid_2 = base_api + 'checknumber/' + newNoWa_2;
    const urivalid_3 = base_api + 'checknumber/' + newNoWa_3;
    const urivalid_4 = base_api + 'checknumber/' + newNoWa_4;
    const urivalid_5 = base_api + 'checknumber/' + newNoWa_5;
    const urivalid_6 = base_api + 'checknumber/' + newNoWa_6;

    const datanumbervalidation_1 = await axios.get(urivalid_1)
    const datanumbervalidation_2 = await axios.get(urivalid_2)
    const datanumbervalidation_3 = await axios.get(urivalid_3)
    const datanumbervalidation_4 = await axios.get(urivalid_4)
    const datanumbervalidation_5 = await axios.get(urivalid_5)
    const datanumbervalidation_6 = await axios.get(urivalid_6)

    const datanyavalid_1 = datanumbervalidation_1.data.result;
    const datanyavalid_2 = datanumbervalidation_2.data.result;
    const datanyavalid_3 = datanumbervalidation_3.data.result;
    const datanyavalid_4 = datanumbervalidation_4.data.result;
    const datanyavalid_5 = datanumbervalidation_5.data.result;
    const datanyavalid_6 = datanumbervalidation_6.data.result;

    if(datanyavalid_1 == 'true') {
        var status_number_1 = 'valid';
    } else {
        var status_number_1 = 'invalid';
    }

    if(datanyavalid_2 == 'true') {
        var status_number_2 = 'valid';
    } else {
        var status_number_2 = 'invalid';
    }

    if(datanyavalid_3 == 'true') {
        var status_number_3 = 'valid';
    } else {
        var status_number_3 = 'invalid';
    }

    if(datanyavalid_4 == 'true') {
        var status_number_4 = 'valid';
    } else {
        var status_number_4 = 'invalid';
    }

    if(datanyavalid_5 == 'true') {
        var status_number_5 = 'valid';
    } else {
        var status_number_5 = 'invalid';
    }

    if(datanyavalid_6 == 'true') {
        var status_number_6 = 'valid';
    } else {
        var status_number_6 = 'invalid';
    }

    if(payment == 'QRIS') {
        var msgtouser_1 = `Halo *${Nama_1}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_2 = `Halo *${Nama_2}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_3 = `Halo *${Nama_3}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_4 = `Halo *${Nama_4}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_5 = `Halo *${Nama_5}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        var msgtouser_6 = `Halo *${Nama_6}*
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

        const idrndm_5 = await createduser(msgtouser_5, newNoWa_5);
        const iduser_5 = await giveId('2413');
        const addmaster_5 = await catat_database(iduser_5, Nama_5, EmailAddres_5);

        const idrndm_6 = await createduser(msgtouser_6, newNoWa_6);
        const iduser_6 = await giveId('2413');
        const addmaster_6 = await catat_database(iduser_6, Nama_6, EmailAddres_6);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Type:* 6 Orang
*Harga:* Rp. 210.000 (35.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*

    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*
    
    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}

ID : ${idrndm_4} *${addmaster_4}*

    _*Data Person 5*_
*Nama:* ${Nama_5}
*Sekolah:* ${Smp_5}
*No WA:* ${formattedNoWa_5} (${status_number_5})
*Email:* ${EmailAddres_5}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_5}
*Password:* ${EmailAddres_5}

    _*File Attachment*_
*KIA:* ${KIA_5}

ID : ${idrndm_5} *${addmaster_5}*

    _*Data Person 6*_
*Nama:* ${Nama_6}
*Sekolah:* ${Smp_6}
*No WA:* ${formattedNoWa_6} (${status_number_6})
*Email:* ${EmailAddres_6}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_6}
*Password:* ${EmailAddres_6}

    _*File Attachment*_ 
*KIA:* ${KIA_6}
*Bukti Pembayaran:* ${buktionline}
*SpreadSheet :* ${spreadsheeturl_6}

ID : ${idrndm_6} *${addmaster_6}*`
    } else if (payment == 'Datang ditempat') {
        var msgtouser_1 = `Halo *${Nama_1}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_2 = `Halo *${Nama_2}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_3 = `Halo *${Nama_3}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_4 = `Halo *${Nama_4}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_5 = `Halo *${Nama_5}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        var msgtouser_6 = `Halo *${Nama_6}*,
terimakasih telah mendaftar *TOUCH#13*
Berikut adalah detail pembayaran kamu:

----------------------------------
*Metode Pembayaran:* ${payment}
*Nominal Pembayaran:* Rp. 210.000 (35.000/Orang)
*Status Pembayaran:* Belum Lunas
----------------------------------

Silakan masuk ke grup whatsapp *TOUCH#13* untuk mendapatkan informasi lebih lanjut.
https://chat.whatsapp.com/CTjFZsNQWvG7dx0yb6b7Yb

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (18/02/2024).

Senin - Kamis : 16.00 - 17.30
Jumat : 15.00 - 17.30
Sabtu : 09.00 - 17.00

informasi maps : https://maps.app.goo.gl/SdRTtDKSHQ8MY36L7

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_`;

        const idrndm_1 = await createduser(msgtouser_1, newNoWa_1);
        const iduser_1 = await giveId('2413');
        const addmaster_1 = await catat_database(iduser_1, Nama_1, EmailAddres_1);

        const idrndm_2 = await createduser(msgtouser_2, newNoWa_2);
        const iduser_2 = await giveId('2413');
        const addmaster_2 = await catat_database(iduser_2, Nama_2, EmailAddres_2);

        const idrndm_3 = await createduser(msgtouser_3, newNoWa_3);
        const iduser_3 = await giveId('2413');
        const addmaster_3 = await catat_database(iduser_3, Nama_3, EmailAddres_3);

        const idrndm_4 = await createduser(msgtouser_4, newNoWa_4);
        const iduser_4 = await giveId('2413');
        const addmaster_4 = await catat_database(iduser_4, Nama_4, EmailAddres_4);

        const idrndm_5 = await createduser(msgtouser_5, newNoWa_5);
        const iduser_5 = await giveId('2413');
        const addmaster_5 = await catat_database(iduser_5, Nama_5, EmailAddres_5);

        const idrndm_6 = await createduser(msgtouser_6, newNoWa_6);
        const iduser_6 = await giveId('2413');
        const addmaster_6 = await catat_database(iduser_6, Nama_6, EmailAddres_6);

        var msgnya = `*[New Register]*
*Time:* ${timeStamp}
*Tipe:* 6 Orang
*Harga:* Rp. 210.000 (35.000/Orang)

    _*Data Person 1*_
*Nama:* ${Nama_1}
*Sekolah:* ${Smp_1}
*No WA:* ${formattedNoWa_1} (${status_number_1})
*Email:* ${EmailAddres_1}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_1}
*Password:* ${EmailAddres_1}

    _*File Attachment*_
*KIA:* ${KIA_1}

ID : ${idrndm_1} *${addmaster_1}*

    _*Data Person 2*_
*Nama:* ${Nama_2}
*Sekolah:* ${Smp_2}
*No WA:* ${formattedNoWa_2} (${status_number_2})
*Email:* ${EmailAddres_2}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_2}
*Password:* ${EmailAddres_2}

    _*File Attachment*_
*KIA:* ${KIA_2}

ID : ${idrndm_2} *${addmaster_2}*

    _*Data Person 3*_
*Nama:* ${Nama_3}
*Sekolah:* ${Smp_3}
*No WA:* ${formattedNoWa_3} (${status_number_3})
*Email:* ${EmailAddres_3}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_3}
*Password:* ${EmailAddres_3}

    _*File Attachment*_
*KIA:* ${KIA_3}

ID : ${idrndm_3} *${addmaster_3}*
    
    _*Data Person 4*_
*Nama:* ${Nama_4}
*Sekolah:* ${Smp_4}
*No WA:* ${formattedNoWa_4} (${status_number_4})
*Email:* ${EmailAddres_4}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_4}
*Password:* ${EmailAddres_4}

    _*File Attachment*_
*KIA:* ${KIA_4}

ID : ${idrndm_4} *${addmaster_4}*

    _*Data Person 5*_
*Nama:* ${Nama_5}
*Sekolah:* ${Smp_5}
*No WA:* ${formattedNoWa_5} (${status_number_5})
*Email:* ${EmailAddres_5}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_5}
*Password:* ${EmailAddres_5}

    _*File Attachment*_
*KIA:* ${KIA_5}

ID : ${idrndm_5} *${addmaster_5}*

    _*Data Person 6*_
*Nama:* ${Nama_6}
*Sekolah:* ${Smp_6}
*No WA:* ${formattedNoWa_6} (${status_number_6})
*Email:* ${EmailAddres_6}
*Payment:* ${payment}

    _*Account*_
*No. ujian:* ${iduser_6}
*Password:* ${EmailAddres_6}

    _*File Attachment*_ 
*KIA:* ${KIA_6}
*SpreadSheet :* ${spreadsheeturl_6}

ID : ${idrndm_6} *${addmaster_6}*`

    }

    //mengirimkan pesan ke group
    const urigroup = base_api + 'sendmessagegroup';
    const params = {
        number: groupid,
        message: msgnya
    }

    axios.post(urigroup, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.sendStatus(200);

});


app.get('/notifyuser/:id', async(req, res) => {
    const id = req.params.id;
    try{
        const data = JSON.parse(fs.readFileSync(databases));
        const datauser = data.find((item) => item.id == id);
        const msg = datauser.msg;
        //jika tidak ditemukan 
        if(!datauser) {
            return res.status(404).json({code: 404, message: 'User not found'});
        }
        if(!msg) {
            return res.status(404).json({code: 404, message: 'Message not found'});
        }
        const number = datauser.number;
        const urisend = base_api + 'sendmessage';
        const params = {
            number: number,
            message: msg
        }
        axios.post(urisend, params)
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.log(error);
        });
        res.status(200).json({code: 200, message: 'Success send message to user'});
    } catch (err) {
        console.log(err);
        res.status(500).json({code: 500, message: 'Internal server error'});
    }
});

app.get('/acc/:noujian', async(req, res) => {
    const noujian = req.params.noujian;
    const id = req.query.id;

    //mecari data user berdasarkan noujian
    const databasenya = `.database/master.json`;
    const data = JSON.parse(fs.readFileSync(databasenya));
    const datauser = data.find((item) => item.id == noujian);

    //jika tidak ditemukan
    if(!datauser) {
        return res.status(404).json({code: 404, message: 'User not found'});
    }

    const msg = `Berikut account kamu untuk mengakses ke website TOUCH#13 :

*Nama:* ${datauser.nama}
*No. ujian:* ${noujian}
*Password:* ${datauser.password}

Nb: Jangan bagikan account ini kepada siapapun, karena account ini bersifat rahasia.
`

    const params = {
        number: number,
        message: msg
    }
    axios.post(urisend, params)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
    });
    res.status(200).json({code: 200, message: 'Success send message to member'});
});

app.get('/lunas/:noujian', async(req, res) => {
    const noujian = req.params.noujian;
    const id = req.query.id;
    const payment = req.query.payment;
    const type = req.query.type;

    //mecari data user berdasarkan noujian
    const databasenya = `.database/master.json`;
    const data = JSON.parse(fs.readFileSync(databasenya));
    const datauser = data.find((item) => item.no_ujian == noujian);

    //jika tidak ditemukan
    if(!datauser) {
        return res.status(404).json({code: 404, message: 'User not found'});
    }

    const no_ujian = datauser.no_ujian;
    const nama = datauser.nama;
    const password = datauser.password;
    
    //hilangkan angka 2413
    const nomor = no_ujian.slice(4);

    if(payment == '1') { //QRIS
        var msg_kwitansi = `Halo *${nama}* Berikut adalah kwitansi pembayaran kamu

Simpan baik-baik kwitansi ini ditunjukkan saat hari H tryout, sebagai bukti pembayaran.

Berikut adalah account kamu untuk mengakses ke website TOUCH#13 :

*Nama:* ${nama}
*No. ujian:* ${no_ujian}
*Password:* ${password}

*Nb*: Jangan bagikan account ini kepada siapapun, karena account ini bersifat rahasia.
`
        if (type == '1') { //1 orang
            fillReceipt(nomor, nama, 'Empat Puluh Ribu Rupiah', 'Rp 40.000');
        } else if (type == '2') { //2 orang
            fillReceipt(nomor, nama, 'Tiga Puluh Sembilan Ribu Rupiah', 'Rp 39.000');
        } else if(type == '3') { 
            fillReceipt(nomor, nama, 'Tiga Puluh Delapan Ribu Rupiah', 'Rp 38.000');
        } else if(type == '4'){
            fillReceipt(nomor, nama, 'Tiga Puluh Tujuh Ribu Rupiah', 'Rp 37.000');
        } else if(type == '5'){
            fillReceipt(nomor, nama, 'Tiga Puluh Enam Ribu Rupiah', 'Rp 36.000');
        } else if(type == '6'){
            fillReceipt(nomor, nama, 'Tiga Puluh Lima Ribu Rupiah', 'Rp 35.000');
        }
    } else if(payment == '2') { //Offline
        var msg_kwitansi = `Halo *${nama}* terimakasih telah melunasi pembayaran kamu.

Harap simpan bukti pembayaran sebagai bukti pembayaran
Butki pembayaran akan ditunjukkan saat hari H tryout.

Berikut adalah account kamu untuk mengakses ke website TOUCH#13 :

*Nama:* ${nama}
*No. ujian:* ${no_ujian}
*Password:* ${password}

*Nb:* Jangan bagikan account ini kepada siapapun, karena account ini bersifat rahasia.
`
    }
});

app.listen(3001, () => console.log('Server is listening on port 3001'));
