const app = require('./app')

const {connectDatabase}  = require('./config/database.js')

connectDatabase();

app.listen(process.env.PORT, ()=>{
    console.log(`sever is running on port ${process.env.PORT}`);
})

