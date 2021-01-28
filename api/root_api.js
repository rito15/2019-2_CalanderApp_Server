const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const User     = require('../models/user');
const Category = require('../models/category');
const Event    = require('../models/event');

const Checker  = require('../js/checker');
const MakeView = require('../js/make_view');

// 기본 페이지 : 서버 상태만 점검
// METHOD : GET
// http://localhost:3000/
router.get('/',
    function(req, res, next){
        res.json({success: true, status: "Server is Running"});
    }
);

// 개발자용 : 모든 DB 조회
// METHOD : POST
// http://localhost:3000/aww-wr225-chr5
let allData = {};
router.get('/aww-wr225-chr5',
    // [1] 전체 유저 정보 조회
    function(req, res, next){
        User.find({})
            .sort({index: 1})
            .exec(function(err, users){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    allData.users = MakeView.userArrayView(users);
                    next();
                }
            });
    },
    // [2] 전체 카테고리 목록 조회
    function(req, res, next){
        Category.find({})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    allData.categories = MakeView.categoryArrayView(categories);
                    next();
                }
            });
    },
    // [3] 전체 일정 목록 조회 + 결과 보여주기
    function(req, res, next){
        Event.find({})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else {
                    allData.events = MakeView.eventArrayView(events);
                    res.json({success: true, data: allData});
                }
            });
    },
);

// 개발자용 : 모든 유저 정보 조회
// METHOD : GET
// http://localhost:3000/rj-20f-w0
router.get('/rj-20f-w0',
    function(req, res, next){
        User.find({})
            .sort({index: 1})
            .exec(function(err, users){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    res.json({success:true, data:users});
                }
            });
    }
);

// 개발자용 : 모든 카테고리 DB 조회
// METHOD : GET
// http://localhost:3000/af9-3-0h-r
router.get('/af9-3-0h-r',
    function(req, res, next){
        Category.find({})
            .sort({id: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    res.json({success:true, data:MakeView.categoryArrayView(categories)});
                }
            });
    }
);

// 개발자용 : 모든 일정 DB 조회
// METHOD : GET
// http://localhost:3000/awf5f9-23-5aw
router.get('/awf5f9-23-5aw',
    function(req, res, next) {
        Event.find({})
            .sort({id: 1, date: 1})
            .exec(function(err, events) {
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    res.json({success:true, data:MakeView.eventArrayView(events)});
                }
            });
    }
);

// 개발자용 : 특정 유저 정보 + 카테고리 + 일정 조회
// METHOD : GET
// http://localhost:3000/a9b-3g-s1/아이디
let userDB = {};
router.get('/a9b-3g-s1/:userId',
    // [1] 유저 정보
    function(req, res, next){
        User.findOne({id:req.params.userId})
            .sort({index: 1})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    userDB.user = user;
                    next();
                }
            });
    },
    // [2] 카테고리 목록
    function(req, res, next){
        Category.find({id:req.params.userId})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    userDB.categories = MakeView.categoryArrayView(categories);
                    next();
                }
            });
    },
    // [3] 일정 목록
    function(req, res, next){
        Event.find({id:req.params.userId})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else {
                    userDB.events = MakeView.eventArrayView(events);
                    res.json(userDB);
                }
            });
    },
);

// 개발자용 : 모든 DB(유저,카테고리,일정) 삭제 + 삭제된 데이터 목록 보여주기
// METHOD : POST
// http://localhost:3000/14f3t-3t3w2-2e
let deletedAllData = {};
router.post('/14f3t-3t3w2-2e',
    // [1-1] 전체 유저 정보 조회
    function(req, res, next){
        User.find({})
            .sort({index: 1})
            .exec(function(err, users){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    deletedAllData.users = MakeView.userArrayView(users);
                    next();
                }
            });
    },
    // [1-2] 전체 카테고리 목록 조회
    function(req, res, next){
        Category.find({})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    deletedAllData.categories = MakeView.categoryArrayView(categories);
                    next();
                }
            });
    },
    // [1-3] 전체 일정 목록 조회
    function(req, res, next){
        Event.find({})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else {
                    deletedAllData.events = MakeView.eventArrayView(events);
                    next();
                }
            });
    },
    // [2-1] 전체 유저 정보 삭제
    function(req, res, next){
        User.deleteMany({})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-4, message:err});
                }
                else {
                    next();
                }
            });
    },
    // [2-2] 전체 유저 카테고리 삭제
    function(req, res, next){
        Category.deleteMany({})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-5, message:err});
                }
                else {
                    next();
                }
            });
    },
    // [2-3] 전체 유저 일정 삭제 + 결과 보여주기
    function(req, res, next){
        Event.deleteMany({})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-6, message:err});
                }
                else {
                    res.json({success: true, data: deletedAllData});
                }
            });
    }
);

// 개발자용 : 모든 카테고리 삭제 + 삭제된 카테고리 목록 보여주기
// METHOD : POST
// http://localhost:3000/c393t-322-5agr
let deletedAllcategories = {};
router.post('/c393t-322-5agr',
    // [1] 전체 카테고리 목록 조회
    function(req, res, next){
        Category.find({})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    deletedAllcategories.categories = MakeView.categoryArrayView(categories);
                    next();
                }
            });
    },
    // [2] 전체 유저 카테고리 삭제 + 결과 보여주기
    function(req, res, next){
        Category.deleteMany({})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({success: true, data: deletedAllcategories});
                }
            });
    }
);

// 개발자용 : 모든 일정 삭제 + 삭제된 데이터 목록 보여주기
// METHOD : POST
// http://localhost:3000/f0w-323t-3-sf9
let deletedAllEvents = {};
router.post('/f0w-323t-3-sf9',
    // [1] 전체 일정 목록 조회
    function(req, res, next){
        Event.find({})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else {
                    deletedAllEvents.events = MakeView.eventArrayView(events);
                    next();
                }
            });
    },
    // [2] 전체 유저 일정 삭제 + 결과 보여주기
    function(req, res, next){
        Event.deleteMany({})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({success: true, data: deletedAllEvents});
                }
            });
    }
);

// 개발자용 : 특정 유저,카테고리,일정 삭제 + 삭제된 데이터 목록 보여주기
// METHOD : POST
// http://localhost:3000/ad9g9-e3r9-wq
var deletedData = {};
router.post('/ad9g9-e3r9-wq',
    // [1-1] 유저 정보 조회
    function(req, res, next){
        User.findOne({id:req.body.id})
            .sort({index: 1})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else if(!user){
                    return res.json({success:false, error_code:0, message:'존재하지 않는 ID입니다'});
                }
                else {
                    deletedData.user = user;
                    next();
                }
            });
    },
    // [1-2] 카테고리 목록 조회
    function(req, res, next){
        Category.find({id:req.body.id})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!categories){
                    next();
                }
                else {
                    deletedData.categories = MakeView.categoryArrayView(categories);
                    next();
                }
            });
    },
    // [1-3] 일정 목록 조회
    function(req, res, next){
        Event.find({id:req.body.id})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else if(!events){
                    next();
                }
                else {
                    deletedData.events = MakeView.eventArrayView(events);
                    next();
                }
            });
    },
    // [2-1] 유저 정보 삭제
    function(req, res, next){
        User.deleteOne({id: req.body.id})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-4, message:err});
                }
                else {
                    next();
                }
            });
    },
    // [2-2] 해당 유저 카테고리 삭제
    function(req, res, next){
        Category.deleteMany({id: req.body.id})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-5, message:err});
                }
                else {
                    next();
                }
            });
    },
    // [2-3] 해당 유저 일정 삭제 + 결과 보여주기
    function(req, res, next){
        Event.deleteMany({id: req.body.id})
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-6, message:err});
                }
                else {
                    res.json({success: true, data: deletedData});
                }
            });
    }
);

module.exports = router;
