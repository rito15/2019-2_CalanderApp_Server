const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const User     = require('../models/user');
const Category = require('../models/category');
const Plan     = require('./plan');

const Checker  = require('../js/checker');
const MakeView = require('../js/make_view');

// ===================================================================

// 기본 페이지 : 서버 상태만 점검
// METHOD : GET
// http://localhost:3000/plan
router.get('/',
    function(req, res, next){
        res.json({success: true, status: "running : plan_api"});
    }
);

// 플랜 목록을 특정 id로 검색
// METHOD : GET
// http://localhost:3000/plan/find/검색할id
router.get('/find/:param_id',
    // [1] User DB에서 id 존재 확인
    function(req, res, next){
        User.findOne({id:req.params.param_id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] Plan DB에서 ID로 검색
    function(req, res, next){
        Plan.find({id:req.params.param_id})
            .sort({date: 1})
            .exec(function(err, plans){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!plans){
                    res.json({success:false, error_code:1, message:'등록된 일정이 없습니다.'});
                }
                else {
                    res.json({success:true, data:MakeView.planArrayView(plans)});
                }
            });
    },
);

// 플랜 목록을 특정 id + 날짜로 검색
// METHOD : GET
// http://localhost:3000/plan/find/검색할id/연-월-일
router.get('/find/:param_id/:param_date',
    // [1] User DB에서 id 존재 확인
    function(req, res, next){
        User.findOne({id:req.params.param_id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] Plan DB에서 ID+날짜로 검색
    function(req, res, next){
        Plan.find({id:req.params.param_id, date:req.params.param_date})
            .sort({date: 1})
            .exec(function(err, plans){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!plans){
                    res.json({success:false, error_code:1, message:'해당 날짜에 등록된 일정이 없습니다.'});
                }
                else {
                    res.json({success:true, data:MakeView.planArrayView(plans)});
                }
            });
    },
);


// 유저 아이디로 검색 => 플랜 추가
// Request 필수 요소 : id, date, planName, categoryName, contents
// Request 추가 요소 : summary, checklist, checked
/*
{
    "id"           : "user1",
    "date"         : "2019-12-25",
    "planName"     : "겨울잠계획",
    "categoryName" : "고냥고냥",
    "summary"      : "겨울잠",
    "contents"     :
    [
        "00:00 - 잠을 잔다",
        "06:00 - 잠을 잔다",
        "12:00 - 잠도 잔다"
    ],
        "checklist"    :
    [
        "00:00 - 꿀잠",
        "06:00 - 꿀잠",
        "12:00 - 또잠"
    ],
        "checked"       :
    [
        true,
        true,
        false
    ]
}
*/
// METHOD : POST
// http://localhost:3000/plan/add
router.post('/add',
    // [1] User DB에서 id 존재 확인 + request body 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!req.body.hasOwnProperty('id')) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'ID를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('date')) {
                    return res.json({
                        success:false,
                        error_code:1,
                        message:'날짜를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('planName')) {
                    return res.json({
                        success:false,
                        error_code:2,
                        message:'일정 이름을 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('categoryName')) {
                    return res.json({
                        success:false,
                        error_code:3,
                        message:'카테고리 이름을 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('contents')) {
                    return res.json({
                        success:false,
                        error_code:4,
                        message:'일정 내용을 입력하세요'
                    });
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:5,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else if(req.body.planName.length === 0) {
                    return res.json({
                        success:false,
                        error_code:6,
                        message:'일정 이름을 지정해야 합니다'
                    });
                }
                else if(!Checker.checkDateFormat(req.body.date)) {
                    return res.json({
                        success:false,
                        error_code:7,
                        message:'잘못된 날짜 형식입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] 유저에게 해당 카테고리가 등록되어 있는지 검사
    function(req, res, next){
        Category.findOne({id:req.body.id, categoryName:req.body.categoryName})
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else if(!category) {
                    return res.json({
                        success:false,
                        error_code:8,
                        message:'사용자에게 해당 카테고리가 존재하지 않습니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [3] 플랜 이름 중복 검사
    function(req, res, next){
        Plan.findOne({id:req.body.id, date: req.body.date, planName:req.body.planName})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-3, message:err});
                }
                else if(user) {
                    return res.json({
                        success:false,
                        error_code:9,
                        message:'해당 날짜에 동일한 일정이 존재합니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [4] 새 플랜 등록
    function(req, res, next){
        const newPlan = new Plan(req.body);

        newPlan.save(function(err, plan){
            if(err) {
                res.status(500);
                return res.json({success:false, error_code:-4, message:err});
            }
            else {
                res.json({
                    success:true,
                    data:{
                        id          : plan.id,
                        date        : plan.date,
                        planName    : plan.planName,
                        categoryName: plan.categoryName,
                        contents    : plan.contents,
                        summary     : plan.summary,
                        checklist   : plan.checklist,
                        checked     : plan.checked,
                    },
                    message:'새로운 일정이 등록되었습니다'
                });
            }
        });
    }
);


// 유저 아이디 + 날짜 + 플랜 이름으로 검색 => 플랜 수정(날짜, 이름 모두 변경할 수 있지만 중복 검사)
// Request 필수 요소 - 기존 : id, date, planName
// Request 필수 요소 - 변경 : date, planName, categoryName, contents
// Request 추가 요소 : summary, checklist, checked
/*
{
    "id"           : "user1",           // 필수
    "date"         : "2019-12-25",      // 필수
    "planName"     : "겨울잠계획",       // 필수
    "categoryName" : "고냥고냥",         // 선택
    "summary"      : "겨울잠",           // 선택
    "contents"     :                     // 선택
    [
        "00:00 - 잠을 잔다",
        "06:00 - 잠을 잔다",
        "12:00 - 잠도 잔다"
    ],
    "checklist"    :                    // 선택
    [
        "00:00 - 꿀잠",
        "06:00 - 꿀잠",
        "12:00 - 또잠"
    ],
    "checked"       :                   // 선택
    [
        true,
        true,
        false
    ],

    // 변경 내용 : 반드시 new로 감싸서 줄 것 !!!!!!!!!!!!!!!!
    "new" :
    {
        "date"         : "2019-12-25",     // 필수
        "planName"     : "겨울잠계획2",    // 필수
        "categoryName" : "고냥고냥",       // 필수
        "summary"      : "겨울잠2",          // 선택
        "contents"     :                  // 필수
        [
            "00:00 - 잠을 잔다",
            "06:00 - 잠을 잔다",
            "12:00 - 잠도 잔다"
        ],
        "checklist"    :                  // 선택
        [
            "00:00 - 꿀잠",
            "06:00 - 꿀잠",
            "12:00 - 또잠"
        ],
        "checked"       :                 // 선택
        [
            true,
            true,
            false
        ]
    }
}
*/
// METHOD : POST
// http://localhost:3000/plan/modify
router.post('/modify',
    // [1] ID 존재 검사 + 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!req.body.hasOwnProperty('id')) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'ID를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('date')) {
                    return res.json({
                        success:false,
                        error_code:1,
                        message:'날짜를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('planName')) {
                    return res.json({
                        success:false,
                        error_code:2,
                        message:'일정 이름을 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('new')) {
                    return res.json({
                        success:false,
                        error_code:3,
                        message:'변경할 내용을 입력하세요'
                    });
                }
                else if(!req.body.new.hasOwnProperty('date')) {
                    return res.json({
                        success:false,
                        error_code:4,
                        message:'새 날짜를 입력하세요'
                    });
                }
                else if(!req.body.new.hasOwnProperty('planName')) {
                    return res.json({
                        success:false,
                        error_code:5,
                        message:'새 일정 이름을 입력하세요'
                    });
                }
                else if(!req.body.new.hasOwnProperty('categoryName')) {
                    return res.json({
                        success:false,
                        error_code:6,
                        message:'새 카테고리 이름을 입력하세요'
                    });
                }
                else if(!req.body.new.hasOwnProperty('contents')) {
                    return res.json({
                        success:false,
                        error_code:7,
                        message:'새 일정 내용을 입력하세요'
                    });
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:8,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else if(req.body.planName.length === 0 ||
                        req.body.new.planName.length === 0) {
                    return res.json({
                        success:false,
                        error_code:9,
                        message:'일정 이름을 지정해야 합니다'
                    });
                }
                else if(!Checker.checkDateFormat(req.body.date) ||
                        !Checker.checkDateFormat(req.body.new.date)) {
                    return res.json({
                        success:false,
                        error_code:10,
                        message:'잘못된 날짜 형식입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] 카테고리 존재 유무 확인
    function(req, res, next){
        Category.findOne({id:req.body.id, categoryName: req.body.new.categoryName})
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                // 해당 카테고리가 존재하지 않는 경우
                else if(!category) {
                    return res.json({success:false,
                        error_code:11, message:'사용자에게 해당 카테고리가 존재하지 않습니다'});
                }
                else {
                    next();
                }
            });
    },
    // [3] 플랜 존재 유무 확인
    function(req, res, next){
        Plan.findOne({
            id:req.body.id,
            planName:req.body.planName,
            date:req.body.date
        })
            .exec(function(err, plan){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!plan){
                    res.json({
                        success:false,
                        error_code:12,
                        message:'해당 일정이 존재하지 않습니다'
                    });
                }
                else {
                    // originalPlan = MakeView.planView(plan);
                    next();
                }
            });
    },
    // [4] 중복 검사 : ID + 바꾸려는 날짜 + 바꾸려는 플랜 이름
    function(req, res, next){
        Plan.findOne({id:req.body.id, date: req.body.new.date, planName: req.body.new.planName})
            .exec(function(err, plan){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                // 동일 날짜 + 플랜이 DB에 이미 존재하는 경우
                // 수정 전 플랜과 동일한 경우면 허용
                else if(plan && !(plan.date === req.body.date && plan.planName === req.body.planName)) {
                    return res.json({success:false,
                        error_code:13, message:'해당 날짜에 동일한 일정이 존재합니다'});
                }
                else {
                    next();
                }
            });
    },
    // [5] 플랜 내용 변경
    function(req, res, next){

        let newPlan = {};
        newPlan.id           = req.body.id;
        newPlan.planName     = req.body.new.planName;
        newPlan.categoryName = req.body.new.categoryName;
        newPlan.contents     = req.body.new.contents;

        newPlan.summary     = req.body.new.hasOwnProperty('summary') ?
                                req.body.new.summary :
                                (
                                    req.body.hasOwnProperty('summary') ?
                                        req.body.summary :
                                        ""
                                );

        newPlan.checklist   = req.body.new.hasOwnProperty('checklist') ?
                                req.body.new.checklist :
                                (
                                    req.body.hasOwnProperty('checklist') ?
                                        req.body.checklist :
                                        []
                                );

        newPlan.checked     = req.body.new.hasOwnProperty('checked') ?
                                req.body.new.checked :
                                (
                                    req.body.hasOwnProperty('checked') ?
                                        req.body.checked :
                                        []
                                );

        Plan.findOneAndUpdate(
            {
                id      : req.body.id,
                date    : req.body.date,
                planName: req.body.planName
            },
            newPlan
        )
            .exec(function(err, plan){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({
                        success: true,
                        data: MakeView.planView(newPlan),
                        message: '일정 내용이 수정되었습니다'
                    });
                }
            });
    }
);

// 유저 아이디 + 날짜 + 플랜 이름으로 검색 => 플랜 삭제
// Request 필수 요소 : id, date, planName
// {
//     "id": "tkals1",
//     "date" : "2000-00-00",
//     "planName": "cat2"
// }
// METHOD : POST
// http://localhost:3000/category/delete
let deletedPlan = {};
router.post('/delete',
    // [1] User DB에서 id 존재 확인 + 입력 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!req.body.hasOwnProperty('id')) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'ID를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('date')) {
                    return res.json({
                        success:false,
                        error_code:1,
                        message:'날짜를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('planName')) {
                    return res.json({
                        success:false,
                        error_code:2,
                        message:'일정 이름을 입력하세요'
                    });
                }
                else if(req.body.planName.length === 0) {
                    return res.json({
                        success:false,
                        error_code:3,
                        message:'일정 이름을 올바르게 입력하세요'
                    });
                }
                else if(!Checker.checkDateFormat(req.body.date)) {
                    return res.json({
                        success:false,
                        error_code:4,
                        message:'잘못된 날짜 형식입니다'
                    });
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:5,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] Plan DB에서 플랜 이름 + 날짜 확인
    function(req, res, next){
        Plan.findOne({
            id:req.body.id,
            planName:req.body.planName,
            date:req.body.date
        })
            .exec(function(err, plan){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!plan){
                    res.json({
                        success:false,
                        error_code:6,
                        message:'해당 일정이 존재하지 않습니다'
                    });
                }
                else {
                    deletedPlan = MakeView.planView(plan);
                    next();
                }
            });
    },
    // [3] 아이디+플랜 이름+날짜 일치하는 플랜 제거
    function(req, res, next){
        Plan.deleteOne(
            {
                id:req.body.id,
                planName: req.body.planName,
                date: req.body.date
            },
            req.body
        )
            .exec(function(err, plan){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({
                        success:true,
                        data: {
                            plan: deletedPlan
                        },
                        message:'해당 일정이 삭제되었습니다'
                    });
                }
            });
    }
);

// 유저 아이디+날짜로 검색 => 해당 날짜 플랜 모두 삭제
// Request 필수 요소 : id, date
// {
//     "id": "tkals1",
//     "date": "2000-00-00"
// }
// METHOD : POST
// http://localhost:3000/category/deleteByDate
let deletedPlans = [];
router.post('/deleteByDate',
    // [1] User DB에서 id 존재 확인 + 입력 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!req.body.hasOwnProperty('id')) {
                    return res.json({
                        success:false,
                        error_code:0,
                        message:'ID를 입력하세요'
                    });
                }
                else if(!req.body.hasOwnProperty('date')) {
                    return res.json({
                        success:false,
                        error_code:1,
                        message:'날짜를 입력하세요'
                    });
                }
                else if(!Checker.checkDateFormat(req.body.date)) {
                    return res.json({
                        success:false,
                        error_code:2,
                        message:'잘못된 날짜 형식입니다'
                    });
                }
                else if(!user) {
                    return res.json({
                        success:false,
                        error_code:3,
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [2] Plan DB에서 id + 날짜 확인
    function(req, res, next){
        Plan.find({id:req.body.id, date:req.body.date})
            .exec(function(err, plans){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!plans || plans.length === 0){
                    res.json({
                        success:false,
                        error_code:4,
                        message:'해당 날짜에 일정이 존재하지 않습니다'
                    });
                }
                else {
                    deletedPlans = MakeView.planArrayView(plans);
                    next();
                }
            });
    },
    // [3] 아이디+날짜 일치하는 플랜 모두 제거
    function(req, res, next){
        Plan.deleteMany(
            {
                id:req.body.id,
                date: req.body.date
            },
            req.body
        )
            .exec(function(err){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({
                        success:true,
                        data: {
                            plans: deletedPlans
                        },
                        message:'해당 날짜의 일정이 모두 삭제되었습니다'
                    });
                }
            });
    }
);


module.exports = router;
