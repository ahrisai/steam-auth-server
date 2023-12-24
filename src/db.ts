const Pool = require('pg').Pool

const pool=new Pool({
    user:'postgres',
    password:'dota228a',
    host:'localhost',
    port:5432,
    database:'squad_link'

})

module.exports=pool