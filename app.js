const express=require("express");
const app=express();
const port=3000;
const path=require("path");
const mongoose=require("mongoose");
const Listing=require("./models/listings.js");
const ejsMate=require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const joi=require("joi");
const methodOverride=require("method-override");
app.use(methodOverride('_method'));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"/public")));


app.engine("ejs",ejsMate);
main().then((res)=> console.log("successful testing"))
.catch((err)=> console.log(err));

async function main(){
   await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.get("/",(req,res)=>{
    res.send("Hi,I am root");
})

//index route
app.get("/listings", wrapAsync 
    (async (req,res)=>{
const allListings=  await Listing.find({});
res.render("./listings/index.ejs",{allListings});
})
);

//new route to form
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync 
    (async (req,res)=>{
 let {id} =req.params;
 const listing =await Listing.findById(id);
res.render("listings/show.ejs",{listing});
})
);
 
//submit form-new listing
app.post("/listings",wrapAsync 
    (async (req,res)=>{
        if(!req.body.listing){
            throw new ExpressError(400,"send valid data for listing");
        }
//     let {title,description,image,price,location,country} =req.body;
//     //console.log(req.body);
//     let newListing=new Listing({
//         title:title,
//         description:description,
//         image:image,
//         price:price,
//         location:location,
//         country:country
//     })
//      newListing.save()
//     .then((res)=>{ //already async hai
//  console.log("chat saved");
//   })
//   .catch((err)=> {
//     console.log(err);
//   });
//   console.log(newListing);
const newListing=new Listing(req.body.listing);
if(!newListing.title){
    throw new ExpressError(400,"Title is missing");
}

if(!newListing.description){
    throw new ExpressError(400,"Description is missing");
}

if(!newListing.price){
    throw new ExpressError(400,"Price is missing");
}
await newListing.save();
console.log(newListing);
res.redirect("/listings");
})
);

//edit for get request
app.get("/listings/:id/edit",wrapAsync
    (async (req,res)=>{
    if(!req.body.listing){
            throw new ExpressError(400,"send valid data for listing");
        }
    let {id}=req.params;
    let listing= await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
);

//submit edit
app.put("/listings/:id", wrapAsync 
    (async (req,res)=>{

     let {id}=req.params;
   // let listing= req.body.listing;
 let updatedListing=await  Listing.findByIdAndUpdate(id,{...req.body.listing},{runValidators:true,new:true});
    console.log(updatedListing);
   res.redirect("/listings");
})
);

//delete route
app.delete("/listings/:id", async (req,res)=>{
    let {id}= req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})








//     let sampleListing=new Listing({
//         title: "My new villa",
//         description: "By the beach",
        
//         price: 12000,
//         location:"Calanagute Goa",
//         country:"India"
//     })

//    await sampleListing.save();
//    console.log("Sample was saved");
//    res.send("successful testing");
app.use((req, res,next)=>{
    next(new ExpressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
let{statusCode=500, message="something went wrong"}= err;
res.status(statusCode).render("Error.ejs",{message});
});

app.listen(port,(req,res)=>{
    console.log("app listening on port 3000");
});