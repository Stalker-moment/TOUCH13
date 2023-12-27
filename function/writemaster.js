const fs = require('fs');

const default_sesi = 1;
const default_agama_code = 1;
const default_jurusan_code = 1945;

const databasemaster = './database/master.json';

//mencatat database 
async function catat_database(noujian, nama, Password) {
    try{
        let json = await fs.promises.readFile(databasemaster, 'utf-8');
        let data = JSON.parse(json);
        data.push({
            Sesi : default_sesi,
            no_ujian: noujian,
            nama: nama,
            password: Password,
            jurusan_code : default_jurusan_code,
            agama_code : default_agama_code
        });
        await fs.promises.writeFile(databasemaster, JSON.stringify(data, null, 2));
        return 'success';
    } catch (error) {
        return error;
    }
}

//export
exports.catat_database = catat_database;


