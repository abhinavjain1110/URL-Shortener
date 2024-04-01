const express=require("express");
const path=require('path');
const cookieParser=require('cookie-parser')
const {connectToMongoDB}=require('./connection');
const urlRoute=require("./routes/url");
const staticRoute=require('./routes/staticRouter');
const userRoute=require('./routes/user')
const {checkForAuthentication,restrictTo}=require('./middlewares/auth')
const URL=require("./models/url");

const app=express();
const PORT=8001;

connectToMongoDB('mongodb://localhost:27017/short-url').then(()=> console.log("Mongodb connected"));

app.set("view engine","ejs");
app.set('views',path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url",restrictTo(["NORMAL",'ADMIN']),urlRoute);
app.use("/user",userRoute);
app.use('/',staticRoute);

app.get('/:shortId',async (req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate({
        shortId
    },{ $push:{
            visitHistory:{
                timestamp: Date.now(),
            },
        }, });
        if(entry){
        res.redirect(entry.redirectURL);
        }
        else{
            res.send("Invalid URL")
        }
});


app.listen(PORT,()=>console.log(`Server Started at PORT ${8001}`))
