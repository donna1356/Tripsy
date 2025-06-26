const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    //to clean the database and delte any data which is already present
    await Listing.deleteMany({});
    //username-qwerty password-qwerty
    initData.data = initData.data.map((obj) => ({...obj, owner: '685a7eb2f92fd5e010ba7685'}));
    await Listing.insertMany(initData.data); // initData is an object and "data" is a key
    console.log("data was inserted");
};

initDB();