const fs = require('fs');

const databases = './database/userid.json';

async function randomId() { // Generate random id (4 digits)
    let id = Math.floor(Math.random() * 10000);
    if (id < 1000) {
        id = '0' + id;
    } 
    if (id < 100) {
        id = '0' + id;
    }
    if (id < 10) {
        id = '0' + id;
    }
    return id;
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
