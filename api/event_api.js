const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const User     = require('../models/user');
const Category = require('../models/category');
const Event    = require('../models/event');

const Checker  = require('../js/checker');
const MakeView = require('../js/make_view');

// ===================================================================

// 기본 페이지 : 서버 상태만 점검
// METHOD : GET
// http://localhost:3000/event
router.get('/',
    function(req, res, next){
        res.json({success: true, status: "running : event_api"});
    }
);

// 일정 목록을 특정 id로 검색
// METHOD : GET
// http://localhost:3000/event/find/검색할id
router.get('/find/:param_id',
    // [1] User DB에서 id 존재 확인
    function(req, res, next){
        User.findOne({id:req.params.param_id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json(Checker.falseJson(-1, err));
                }
                else if(!user)
                {
                    return res.json(Checker.falseJson(0, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] Event DB에서 ID로 검색
    function(req, res, next){
        Event.find({id:req.params.param_id})
            .sort({date: 1})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!events)
                {
                    return res.json(Checker.falseJson(0, '해당 사용자에게 등록된 일정이 없습니다'));
                }
                else
                {
                    return res.json(Checker.trueJson(MakeView.eventArrayView(events)));
                }
            });
    },
);

// 일정 목록을 특정 id + 카테고리이름으로 검색
// METHOD : GET
// http://localhost:3000/event/find/검색할id/카테고리이름
router.get('/find/:param_id/:param_category',
    // [1] User DB에서 id 존재 확인
    function(req, res, next){
        User.findOne({id:req.params.param_id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!user) {
                    return res.json(Checker.falseJson(0, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] Event DB에서 ID + 카테고리 이름으로 검색
    function(req, res, next){
        Event.find({id:req.params.param_id, category:req.params.param_category})
            .exec(function(err, events){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else if(!events){
                    return res.json(Checker.falseJson(1, '해당 카테고리로 등록된 일정이 없습니다'));
                }
                else {
                    return res.json(Checker.trueJson(MakeView.eventArrayView(events)));
                }
            });
    },
);


// 유저 아이디로 검색 => 일정 추가
// Request 필수 요소 : id, title, category, startTime, endTime, allDay,
//                    textarea, input, checkbox, radio
/*
{
  "id"           : "user2",
  "title"        : "스케줄이름1",
  "category"     : "카테고리이름1",
  "startTime"    : "시작시간스트링",
  "endTime"      : "종료시간스트링",
  "allDay"       : true,

  "textarea" :
  [
    {
      "name" : "이름1",
      "contents" : "내용내용"
    }
  ],
  "input" :
  [
    {
      "name" : "이름1",
      "contents" : "내용내용"
    }
  ],
  "checkbox" :
  [
    {
      "name" : "이름1",
      "contents" : true
    }
  ],
  "radio" :
  [
    {
      "name" : "이름1",
      "contents" : true
    }
  ]
}
*/
// METHOD : POST
// http://localhost:3000/event/add
let categoryColor = ""; // 해당 일정의 카테고리가 갖고 있는 색상
router.post('/add',
    // [1] User DB에서 id 존재 확인 + request body 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'id', req.body.id))
                {
                    return res.json(Checker.falseJson(0, 'ID를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'title', req.body.title))
                {
                    return res.json(Checker.falseJson(1, '일정 제목을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'category', req.body.category))
                {
                    return res.json(Checker.falseJson(2, '카테고리 이름을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'startTime', req.body.startTime))
                {
                    return res.json(Checker.falseJson(3, '시작 날짜를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'endTime', req.body.endTime))
                {
                    return res.json(Checker.falseJson(4, '종료 날짜를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'allDay', req.body.allDay))
                {
                    return res.json(Checker.falseJson(5, 'allDay 속성을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'textarea', req.body.textarea))
                {
                    return res.json(Checker.falseJson(6, 'text area 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'input', req.body.input))
                {
                    return res.json(Checker.falseJson(7, 'input 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'checkbox', req.body.checkbox))
                {
                    return res.json(Checker.falseJson(8, 'checkbox 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'radio', req.body.radio))
                {
                    return res.json(Checker.falseJson(9, 'radio 내용을 입력하세요'));
                }
                else if(!user)
                {
                    return res.json(Checker.falseJson(10, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] 유저에게 해당 카테고리가 등록되어 있는지 검사
    function(req, res, next){
        Category.findOne(
            {
                id:req.body.id,
                title:req.body.category
            }
        )
            .exec(function(err, category){
                if(err)
                {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else if(!category)
                {
                    return res.json(Checker.falseJson(11, '사용자에게 해당 카테고리가 존재하지 않습니다'));
                }
                else {
                    categoryColor = category.color;
                    next();
                }
            });
    },
    // [3] 일정 중복 검사 : id + 일정 이름 + 시작시간 + 종료시간
    function(req, res, next){
        Event.findOne(
            {
                id        : req.body.id,
                title     : req.body.title,
                startTime : req.body.startTime,
                endTime   : req.body.endTime,
            }
        )
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-3, message:err});
                }
                else if(event)
                {
                    return res.json(Checker.falseJson(12, '사용자에게 동일한 일정이 존재합니다'));
                }
                else {
                    next();
                }
            });
    },
    // [4] 새 일정 등록
    function(req, res, next){
        const newEvent = new Event(req.body);
        newEvent.color = categoryColor;

        newEvent.save(function(err, event){
            if(err)
            {
                res.status(500);
                return res.json({success:false, error_code:-4, message:err});
            }
            else
            {
                return res.json(Checker.trueJson(
                    MakeView.eventView(event),
                    '새로운 일정이 등록되었습니다'
                ));
            }
        });
    }
);


// 유저 아이디 + 날짜 + 일정 이름으로 검색 => 일정 수정(날짜, 이름 모두 변경할 수 있지만 중복 검사)
// Request 필수 요소 - 기존 : id, title, startTime, endTime
// Request 필수 요소 - 변경 : title, startTime, endTime, allDay,
// //                        textarea, input, checkbox, radio
/*
{
    "id"           : "user2",
    "title"        : "스케줄이름1",
    "startTime"    : "시작시간스트링",
    "endTime"      : "종료시간스트링",

    // 변경 내용 : 반드시 new로 감싸서 줄 것 !!!!!!!!!!!!!!!!
    "new" :
    {
        "id"           : "user2",
        "title"        : "스케줄이름2222",
        "category"     : "카테고리이름1",
        "startTime"    : "시작시간스트링",
        "endTime"      : "종료시간스트링",
        "allDay"       : true,

        "textarea"     : [{"name" : "이름1", "contents" : "내용1"} ],
        "input"        : [{"name" : "이름2", "contents" : "내용2"} ],
        "checkbox"     : [{"name" : "이름3", "contents" : false}   ],
        "radio"        : [{"name" : "이름4", "contents" : true}    ]
    }
}
*/
// METHOD : POST
// http://localhost:3000/event/modify
let categoryColor2 = "";
router.post('/modify',
    // [1] ID 존재 검사 + request body 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'id', req.body.id))
                {
                    return res.json(Checker.falseJson(0, 'ID를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'title', req.body.title))
                {
                    return res.json(Checker.falseJson(1, '기존 일정의 제목을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'startTime', req.body.startTime))
                {
                    return res.json(Checker.falseJson(2, '기존 일정의 시작 시간을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'endTime', req.body.endTime))
                {
                    return res.json(Checker.falseJson(3, '기존 일정의 종료 시간을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'new', req.body.new))
                {
                    return res.json(Checker.falseJson(4, '수정할 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'title', req.body.new.title))
                {
                    return res.json(Checker.falseJson(5, '새 일정의 제목을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'startTime', req.body.new.startTime))
                {
                    return res.json(Checker.falseJson(6, '새 일정의 시작 시간을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'endTime', req.body.new.endTime))
                {
                    return res.json(Checker.falseJson(7, '새 일정의 종료 시간 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'allDay', req.body.new.allDay))
                {
                    return res.json(Checker.falseJson(8, '새 일정의 allDay 속성을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'textarea', req.body.new.textarea))
                {
                    return res.json(Checker.falseJson(9, '새 일정의 text area 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'input', req.body.new.input))
                {
                    return res.json(Checker.falseJson(10, '새 일정의 inpupt 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'checkbox', req.body.new.checkbox))
                {
                    return res.json(Checker.falseJson(11, '새 일정의 checkbox 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'radio', req.body.new.radio))
                {
                    return res.json(Checker.falseJson(12, '새 일정의 radio 내용을 입력하세요'));
                }
                else if(!user) {
                    return res.json(Checker.falseJson(13, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] 카테고리 존재 유무 확인
    function(req, res, next){
        Category.findOne(
            {
                id    : req.body.id,
                title : req.body.new.category
            }
        )
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json(Checker.falseJson(-1, err));
                }
                // 해당 카테고리가 존재하지 않는 경우
                else if(!category)
                {
                    return res.json(Checker.falseJson(14, '사용자에게 해당 카테고리가 존재하지 않습니다'));
                }
                else{
                    categoryColor2 = category.color;
                    next();
                }
            });
    },
    // [3] 기존 일정 존재 확인 : id + 일정 이름 + 시작 시간 + 종료 시간
    function(req, res, next){
        Event.findOne({
            id        : req.body.id,
            title     : req.body.title,
            startTime : req.body.startTime,
            endTime   : req.body.endTime
        })
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!event)
                {
                    res.json({
                        success:false,
                        error_code:15,
                        message:'사용자에게 해당 일정이 존재하지 않습니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [4] 새로운 일정의 중복 검사 : ID + 일정 이름 + 시작 시간 + 종료 시간
    function(req, res, next){
        Event.findOne(
            {
                id        : req.body.id,
                title     : req.body.new.title,
                startTime : req.body.new.startTime,
                endTime   : req.body.new.endTime
            }
        )
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-3, message:err});
                }
                // 동일 날짜 + 일정이 DB에 이미 존재하는 경우
                else if(event)
                {
                    // 수정 전 일정과 동일한 경우면 허용
                    if((event.date      === req.body.date      &&
                        event.title     === req.body.title     &&
                        event.startTime === req.body.startTime &&
                        event.endTime   === req.body.endTime
                    )) {
                        next();
                    }
                    else {
                        return res.json({success:false,
                            error_code:16, message:'사용자에게 동일한 일정이 존재합니다'});
                    }
                }
                else {
                    next();
                }
            });
    },
    // [5] 일정 내용 변경
    function(req, res, next){
        let newEvent = new Object(
            {
                id        : req.body.id,

                title     : req.body.new.title,
                category  : req.body.new.category,
                startTime : req.body.new.startTime,
                endTime   : req.body.new.endTime,
                allDay    : req.body.new.allDay,
                color     : categoryColor2,

                textarea  : req.body.new.textarea,
                input     : req.body.new.input,
                checkbox  : req.body.new.checkbox,
                radio     : req.body.new.radio,
            }
        );

        Event.findOneAndUpdate(
            {
                id        : req.body.id,
                title     : req.body.title,
                startTime : req.body.startTime,
                endTime   : req.body.endTime
            },
            newEvent
        )
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-4, message:err});
                }
                else {
                    res.json({
                        success: true,
                        data: MakeView.eventView(newEvent),
                        message: '일정 내용이 수정되었습니다'
                    });
                }
            });
    }
);

// 유저 아이디 + 날짜 + 일정 이름으로 검색 => 일정 삭제
// Request 필수 요소 : id, title, startTime, endTime
/*
{
    "id"           : "user1",
    "title"        : "스케줄이름1",
    "startTime"    : "2019-12-05-000000",
    "endTime"      : "2019-12-08-001200"
}
*/
// METHOD : POST
// http://localhost:3000/category/delete
let deletedEvent = {};
router.post('/delete',
    // [1] User DB에서 id 존재 확인 + 입력 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'id', req.body.id))
                {
                    return res.json(Checker.falseJson(0, 'ID를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'title', req.body.title))
                {
                    return res.json(Checker.falseJson(1, '일정 제목을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'startTime', req.body.startTime))
                {
                    return res.json(Checker.falseJson(4, '시작 날짜를 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'endTime', req.body.endTime))
                {
                    return res.json(Checker.falseJson(5, '종료 날짜를 입력하세요'));
                }
                else if(!user) {
                    return res.json(Checker.falseJson(6, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] Event DB에서 id + 일정 이름 시작 시간 + 종료 시간으로 찾기
    function(req, res, next){
        Event.findOne({
            id        : req.body.id,
            title     : req.body.title,
            startTime : req.body.startTime,
            endTime   : req.body.endTime
        })
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else if(!event){
                    return res.json(Checker.falseJson(7, '해당 일정이 존재하지 않습니다'));
                }
                else {
                    deletedEvent = MakeView.eventView(event);
                    next();
                }
            });
    },
    // [3] id + 일정 이름 시작 시간 + 종료 시간 일치하는 일정 제거
    function(req, res, next){
        Event.deleteOne(
            {
                id        : req.body.id,
                title     : req.body.title,
                startTime : req.body.startTime,
                endTime   : req.body.endTime
            }
        )
            .exec(function(err, event){
                if(err)
                {
                    res.status(500);
                    return res.json(Checker.falseJson(-2, err));
                }
                else
                {
                    return res.json(Checker.trueJson(
                        deletedEvent,
                        '해당 일정이 삭제되었습니다'
                    ));
                }
            });
    }
);


module.exports = router;
