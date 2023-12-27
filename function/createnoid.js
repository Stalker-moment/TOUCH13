const fs = require('fs');

const jsoncount = './database/count.json'

async function getCount() {
    const count = await fs.promises.readFile(jsoncount, 'utf-8')
    return JSON.parse(count)
}

//memberikan id berdasarkan count
//dengan prefix tertentu : prefix + count
//contoh : prefix = '2413' maka id = 2413001

//penambahan 0 didepan count
//contoh : count = 1 maka id = 001
//contoh : count = 10 maka id = 010
//contoh : count = 100 maka id = 100

async function giveId(prefix) {
    const count = await getCount()
    const id = prefix + count.count.toString().padStart(3, '0')
    count.count++
    fs.writeFileSync(jsoncount, JSON.stringify(count, null, 2))
    return id
}

exports.giveId = giveId;