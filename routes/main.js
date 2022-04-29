const router = require('express').Router();
const Gig = require('../models/gig');
const User = require('../models/user');
const Profile = require("../models/add-profile")
const Promocode = require('../models/promocode');
const async = require('async');

const algoliasearch = require('algoliasearch')
var client = algoliasearch('7OSIIDL1IN', '6ee4d0993e0ac0807d475c5403fbf9fe');
var index = client.initIndex('GigSchema');
const Vacancy = require("../models/vacancy")



//GET request to /
router.get('/', (req, res, next) => {
    Gig
    .find({
        
    }, function (err, gigs) {
        res.render('main/home', {gigs: gigs})
    })
   
});

router
    .route('/search')

    .get((req, res) => {
        if (req.query.q) {
            index
                .search(req.query.q, function (err, content) {
                    res.render('main/search_results', {
                        content: content,
                        search_result: req.query.q
                    });
                })
        }
    })
    .post((req, res) => {
        res.redirect('/search/?q=' + req.body.search_input)
    })

router
    .route('/search')
    .get((req,res)=>{
        const nameField = req.query.name;
        const category = req.query.category;
        User.find({name:{$regex: nameField ,$regex: category ,$options:"$i"}})
        .then(
            res.render('main/search_results', {
                content: content,
                search_result: req.query.q
            })

        )
    })

// Get request for add-profile
router.get("/addprofile" , (req,res) =>{
    res.render('accounts/add-profile')
}).post("/addprofile" , (req,res)=>{
    const NewProfile = new Profile({

        
    })
})

// get request for job vacancy
router.get("/post_vacancy" , (req,res)=>{
    Vacancy
    .find({
        owner: req.user._id
    }, function (err, vacancy) {
        res.render('main/vacancy', {vacancy: vacancy})
    })
})

// post request to add vacancy
router
    .route('/add-new-vacancy')
    .get((req, res) => {
        res.render('main/add-new-vacancy');
    })
    .post((req, res) => {
        async.waterfall([function (callback) {
                let vacancy = new Vacancy();
                vacancy.owner = req.user._id;
                vacancy.title = req.body.vacancy_title;
                vacancy.category = req.body.vacancy_category;
                vacancy.about = req.body.vacancy_about;
                vacancy.price = req.body.vacancy_price;
                // vacancy.source = req.body.vacancy_file;
                vacancy.save(function (err, vacancy) {
                    User
                        .update({
                            _id: req.user._id
                        }, {
                            $push: {
                                vacancys: vacancy._id
                            }
                        }, function (err, count) {
                            res.redirect('/post_vacancy');
                        })
                });
            }
        ]);
    });

//GET request to /gigs
router.get('/gigs', (req, res) => {
    Gig
    .find({
        owner: req.user._id
    }, function (err, gigs) {
        res.render('main/gigs', {gigs: gigs})
    })
});
// get request to browse gigs
router.get('/browse_gigs', (req, res) => {
    Gig
        .find({
            owner: {$ne : req.user._id}
        }, function (err, gigs) {
            res.render('main/buying', {gigs: gigs})
        })
    
});

// get request to view vacancy
router.get('/view_vacancy', (req, res) => {
    Vacancy
        .find({
            owner: {$ne : req.user._id}
        }, function (err, vacancy) {
            res.render('main/view-vacancy', {vacancy: vacancy})
        })
    
});



// get request to mygigs
router.get('/mygigs', (req, res) => {
    Gig
        .find({
            owner:  req.user._id
        }, function (err, gigs) {
            res.render('main/mygigs', {gigs: gigs})
        })
    
});
// get request to myvacancy
router.get('/myvacancy', (req, res) => {
    Vacancy
        .find({
            owner:  req.user._id
        }, function (err, vacancy) {
            res.render('main/myvacancy', {vacancy: vacancy})
        })
    
});

//Handle GET and POST request to /add-new-gig
router
    .route('/add-new-gig')
    .get((req, res) => {
        res.render('main/add-new-gig');
    })
    .post((req, res) => {
        async.waterfall([function (callback) {
                let gig = new Gig();
                gig.owner = req.user._id;
                gig.ownername = req.user.name;
                gig.title = req.body.gig_title;
                gig.category = req.body.gig_category;
                gig.about = req.body.gig_about;
                gig.price = req.body.gig_price;
                gig.save(function (err, gig) {
                    User
                        .update({
                            _id: req.user._id
                        }, {
                            $push: {
                                gigs: gig._id
                            }
                        }, function (err, count) {
                            res.redirect('/gigs');
                        })
                });
            }
        ]);
    });

// handle post and get  add-new gigs request
// router.get('/add-new-gig' , (req , res ,next) =>{
//     res.render('main/add-new-gig')
// }).post('/add-new-gig' , async(req,res,next)=>{
//     try{
//         const newGigs = new Gig(req.body)
//         console.log(req.body);
//         const addedGig = await newGigs.save();
//         res.render('./main/gigs')
//     }catch(e){
//         res.send(e);
//     }    
// })

// edit gigs

router.get('/edit_gigs/:id', (req, res, next) => {
    Gig
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, gig) {
            res.render('main/edit-gigs', {gig: gig});
        })
})
// edit vacancy
router.get('/edit_vacancy/:id', (req, res, next) => {
    Vacancy
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, vacancy) {
            res.render('main/edit-vacancy', {vacancy: vacancy});
        })
})

// update gigs
router.post('/edit_gigs/:id', async(req, res, next) => {
    try{
        // const _id = req.params.id;
        // console.log(id)
        const updatedGig = await Gig.updateOne({_id:req.params.id},{$set : 
        {
            
            title : req.body.gig_title,
            price : req.body.gig_price,
            category : req.body.gig_category,
            about : req.body.gig_about,
        }})
        res.render("main/home")
        
        

    }catch(e){
        res.send(400)
        
    }
})
//del gigs
router.get('/del_gigs/:id', async(req, res, next) => {
    try{
        const deleteGig = await Gig.deleteOne({_id:req.params.id});
        console.log(deleteGig)
        res.render('main/home')
    }catch(e){
        res.send(500).send(e);

    }
    
        
})
   
// route to terms and condition
router.get('/termsandcondition' , async(req,res,next) =>{
    try{
        res.render("partials/terms")
    }catch(e){
        res.send(400)
    }
})    
//Handle single gig req
router.get('/service_detail/:id', (req, res, next) => {
    Gig
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, gig) {
            res.render('main/service_detail', {gig: gig});
        })
})
router.get('/service_detail_/:id', (req, res, next) => {
    Gig
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, gig) {
            res.render('main/service_detail_', {gig: gig});
        })
})

router.get('/vacancy_detail/:id', (req, res, next) => {
    Vacancy
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, vacancy) {
            res.render('main/vacancy_detail', {vacancy: vacancy});
        })
})
//HANDLING SINGLE MY GIG REQUEST
router.get('/vacancy_detail_/:id', (req, res, next) => {
    Vacancy
        .findOne({ _id: req.params.id })
        .populate('owner')
        .exec(function (err, vacancy) {
            res.render('main/vacancy_detail_', {vacancy: vacancy});
        })
})



// add profile
// router.get("/add-profile" , (req,res,next)=>{
//     try{

//         const addProfile = newProfile(req.body);
//         addProfile.save();
//     }catch{
//         res.send(400).send("Profile is not saved")

//     }
// })

//Handle Promo code API
router.get('/api/add-promocode', (req, res) => {
    var promocode = new Promocode();
    promocode.name = "testcoupon";
    promocode.discount = 0.4;
    promocode.save(function (err) {
        res.json("Successfull")
    })
})

//Handle Post promocode API
router.post('/promocode', (req, res) => {
    var promocode = req.body.promocode;
    var totalPrice = req.session.price;
    Promocode.findOne({
        name: promocode
    }, function (err, foundCode) {
        if (foundCode) {
            var newPrice = foundCode.discount * totalPrice;
            newPrice = totalPrice - newPrice;
            req.session.price = newPrice;
            res.json(newPrice);
        } else {
            res.json(0)
        }
    });
});

module.exports = router;
