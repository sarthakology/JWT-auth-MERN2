const mongoose = require('mongoose');

const mongoURL = 'mongodb://localhost:27017/test1';

mongoose.connect(mongoURL,{
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const db = mongoose.connection;


db.on('connected',()=>{
    console.log("connected to mongo db server");
});
db.on('error', (err)=> {
    console.error ('MongoDB connection error:', err);
});
db.on('disconnected',()=>{
    console.log("mongo db server disconnected");
});

module.exports = db;