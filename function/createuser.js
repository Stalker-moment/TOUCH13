const fs = require('fs');

const databases = './database/userid.json';

async function randomId() { // Generate random id (6 digits)
    const id = Math.floor(Math.random() * 1000000);
    const data = JSON.parse(fs.readFileSync(databases));
    const cek = data.find((data) => data.id === id);
    if (cek) {
        return randomId();
    } else {
        return id;
    }
}

// Create new user
async function createduser(msg, number) { //id random, dan msg dipush ke json database
    const id = await randomId();
    const data = JSON.parse(fs.readFileSync(databases));
    data.push({id: id, number: number, msg: msg});
    fs.writeFileSync(databases, JSON.stringify(data, null, 2));
    return id;
}

exports.createduser = createduser;
