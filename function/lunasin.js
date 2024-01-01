const fs = require('fs');

const databaselunas = './database/lunas.json';

//mencatat database 
async function catat_lunas(id, noujian, nama, Password, status) {
    try{
        let json = await fs.promises.readFile(databaselunas, 'utf-8');
        let data = JSON.parse(json);
        data.push({
            id : id,
            no_ujian: noujian,
            nama: nama,
            password: Password,
            metode: metode,
            status : status
        });
        await fs.promises.writeFile(databaselunas, JSON.stringify(data, null, 2));
        return 'success';
    } catch (error) {
        return error;
    }
}

//export
exports.catat_lunas = catat_lunas;


