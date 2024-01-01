const { readFileSync, writeFileSync } = require('fs')

const databaselunas = './database/lunas.json'

//edit status lunas
async function editStatusLunas(id, status) {
    const lunas = loadDataLunas()
    const data = lunas.find((data) => data.id === id)
    if (data) {
        data.status = status
        saveDataLunas(lunas)
        return true
    } else {
        return false
    }
}

//load data lunas
function loadDataLunas() {
    const buffer = readFileSync(databaselunas)
    const data = buffer.toString() 
    const json = JSON.parse(data)
    return json
}

//save data lunas
function saveDataLunas(data) {
    writeFileSync(databaselunas, JSON.stringify(data, null, 2))
}

//export
module.exports = {
    editStatusLunas
}
