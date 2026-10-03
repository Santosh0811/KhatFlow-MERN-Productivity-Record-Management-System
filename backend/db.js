const mongoose = require('mongoose');
require('dotenv').config();

const mongoDbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("MongoDb is connected successfully");
    } catch (error) {
        console.log("MongoDb failed to connect", error);
    }
}


module.exports = mongoDbConnect;