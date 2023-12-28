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

//database id
const databases = './database/userid.json';

//import function
const { createduser } = require('./function/createuser');
const { giveId } = require('./function/createnoid');
const { catat_database } = require('./function/writemaster');

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

Untuk informasi lebih lanjut, silahkan hubungi contact person berikut:

*Tier:* wa.me/6282134580805
*Nayla:* wa.me/628895349282

_*Pesan Otomatis*_
`;

        const idrndm = await createduser(msgtouser, newNoWa);
        const iduser = await giveId('2413');
        const addmaster = await catat_database(iduser, Nama, EmailAddres);

        var msgnya = `*[New Register]*

     _*Data Person*_ 
*Time:* ${timeStamp}
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

Pembayaran secara offline atau di tempat, dimohon untuk mengunjungi SMK SMTI Yogyakarta melalui gerbang depan.
dilayani mulai hari Selasa (02/01/2024) hingga Selasa (20/02/2023).

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

    _*Data Person*_
*Time:* ${timeStamp}
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

app.get('/notifyuser/:id', async(req, res) => {
    const id = req.params.id;
    const data = JSON.parse(fs.readFileSync(databases));
    const datauser = data.find((item) => item.id == id);
    const msg = datauser.msg;
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
});


app.listen(3001, () => console.log('Server is listening on port 3001'));
