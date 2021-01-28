const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const User     = require('../models/user');
const Category = require('../models/category');
const Event    = require('../models/event');

const Checker  = require('../js/checker');
const MakeView = require('../js/make_view');

// ========================================================================

// 기본 페이지 : 서버 상태만 점검
// METHOD : GET
// http://localhost:3000/category
router.get('/',
    function(req, res, next){
        res.json({success: true, status: "running : category_api"});
    }
);

// 카테고리 목록을 특정 id로 검색
// METHOD : GET
// http://localhost:3000/category/find/검색할id
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
    // [2] Category DB에서 카테고리 목록 읽어오기
    function(req, res, next){
        Category.find({id:req.params.param_id})
            .sort({categoryType: 1})
            .exec(function(err, categories){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else if(!categories){
                    res.json({success:false, error_code:0, message:'등록된 카테고리가 없습니다'});
                }
                else {
                    res.json({success:true, data:MakeView.categoryArrayView(categories)});
                }
            });
    }
);

// 유저 아이디로 검색 => 카테고리 추가
// Request 필수 요소 : id, title, textarea, input, checkbox, radio, color
/*
{
    "id"        : "user2",
    "title"     : "카테고리이름1",
    "color"     : "red",
    "textarea"  : ["", ""],
    "input"     : ["", ""],
    "checkbox"  : ["", ""],
    "radio"     : ["", ""]
}
*/
// METHOD : POST
// http://localhost:3000/category/add
router.post('/add',
    // [1] User DB에서 id 존재 확인 + 예외처리(각 프로퍼티 존재 여부 + 길이 1 이상 여부)
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
                    return res.json(Checker.falseJson(1, '카테고리 이름을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'color', req.body.color))
                {
                    return res.json(Checker.falseJson(2, '색상을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'checkbox', req.body.checkbox))
                {
                    return res.json(Checker.falseJson(3, '체크박스 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'radio', req.body.radio))
                {
                    return res.json(Checker.falseJson(4, '라디오 버튼 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'textarea', req.body.textarea))
                {
                    return res.json(Checker.falseJson(5, '텍스트 영역 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'input', req.body.input))
                {
                    return res.json(Checker.falseJson(6, '입력 목록을 입력하세요'));
                }
                else if(!user)
                {
                    return res.json(Checker.falseJson(7, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] 카테고리명 중복 검사
    function(req, res, next){
        Category.findOne({id:req.body.id, title:req.body.title})
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else if(category) {
                    return res.json({
                        success:false,
                        error_code:8,
                        message:'해당 유저에게 동일한 카테고리 이름이 존재합니다'
                    });
                }
                else {
                    next();
                }
            });
    },
    // [3] 새롭게 카테고리 등록
    function(req, res, next){
        const newCategory = new Category(req.body);

        newCategory.save(function(err, category){
            if(err) {
                res.status(500);
                return res.json({success:false, error_code:-3, message:err});
            }
            else {
                res.json({
                    success:true,
                    data: MakeView.categoryView(req.body),
                    message:'새로운 카테고리가 추가되었습니다'
                });
            }
        });
    }
);

// 유저 아이디+카테고리 이름으로 검색 => 카테고리 수정
// Request 필수 (기존) : id, title
// Request 필수 (변경) : title, color, checkbox, radio, textarea, input
/*
{
    "id": "user1",
    "title": "카테고리이름2",

    "new" :
    {
        "id"        : "user1",          // 필수 아님
        "title"     : "카테고리이름1",
        "color"     : "red",
        "textarea"  : ["", ""],
        "input"     : ["", ""],
        "checkbox"  : ["", ""],
        "radio"     : ["", ""]
    }
}
*/
// METHOD : POST
// http://localhost:3000/category/modify
let modifiedData = {};
router.post('/modify',
    // [1] User DB에서 id 존재 확인 + 예외 검사
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
                    return res.json(Checker.falseJson(1, '카테고리 이름을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body, 'new', req.body.new))
                {
                    return res.json(Checker.falseJson(2, '수정할 내용을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'title', req.body.new.title))
                {
                    return res.json(Checker.falseJson(3, '새 카테고리 이름을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'color', req.body.new.color))
                {
                    return res.json(Checker.falseJson(4, '새 색상을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'checkbox', req.body.new.checkbox))
                {
                    return res.json(Checker.falseJson(5, '새 체크박스 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'radio', req.body.new.radio))
                {
                    return res.json(Checker.falseJson(6, '새 라디오 버튼 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'textarea', req.body.new.textarea))
                {
                    return res.json(Checker.falseJson(7, '새 텍스트 영역 목록을 입력하세요'));
                }
                else if(Checker.NotContainsOrEmpty(req.body.new, 'input', req.body.new.input))
                {
                    return res.json(Checker.falseJson(8, '새 입력 목록을 입력하세요'));
                }
                else if(!user) {
                    return res.json(Checker.falseJson(9, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] 카테고리 존재 유무 확인
    function(req, res, next){
        Category.findOne({id:req.body.id, title: req.body.title})
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                // 해당 카테고리가 존재하지 않는 경우
                else if(!category) {
                    return res.json(Checker.falseJson(10, '사용자에게 해당 카테고리가 존재하지 않습니다'));
                }
                else {
                    next();
                }
            });
    },
    // [3] 중복 검사 : ID + 카테고리 이름 검사
    function(req, res, next){
        Category.findOne({id:req.body.id, title: req.body.new.title})
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                // 새로운 카테고리 이름이 중복되는 경우
                // 수정 전 카테고리 이름과 동일한 경우면 허용
                else if(category && !(category.title === req.body.title)) {
                    return res.json(Checker.falseJson(11, '동일 카테고리 이름이 존재합니다'));
                }
                else {
                    next();
                }
            });
    },
    // [3] 카테고리 내용 변경
    function(req, res, next){
        Category.findOneAndUpdate(
                {
                    id   : req.body.id,
                    title: req.body.title
                },
                {
                    id      : req.body.id,
                    title   : req.body.new.title,
                    color   : req.body.new.color,

                    checkbox: req.body.new.checkbox,
                    radio   : req.body.new.radio,
                    textarea: req.body.new.textarea,
                    input   : req.body.new.input,
                }
            )
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    modifiedData =
                        {
                            id      : req.body.id,
                            title   : req.body.new.title,
                            color   : req.body.new.color,

                            checkbox: req.body.new.checkbox,
                            radio   : req.body.new.radio,
                            textarea: req.body.new.textarea,
                            input   : req.body.new.input,
                        };
                    next();
                }
            });
    },
    // [5] 등록된 일정들에 카테고리 변경사항(카테고리 이름, 색상) 전파하여 수정
    function(req, res, next){
        Event.updateMany(
            {
                id      : req.body.id,
                category: req.body.title
            },
            {
                $set:
                {
                    category: req.body.new.title,
                    color   : req.body.new.color
                }
            }
        )
            .exec(function(err, event){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else
                {
                    return res.json(Checker.trueJson(
                        {
                            modified: modifiedData,
                            modifiedEventNum: event.nModified
                        }, '카테고리 수정완료'
                    ))
                }
            });
    }
);

// 유저 아이디+카테고리 이름으로 검색 => 카테고리 삭제
// Request 필수 요소 : id, title
/*
{
    "id": "user1",
    "title": "카테고리이름1"
}
*/

// METHOD : POST
// http://localhost:3000/category/delete
router.post('/delete',
    // [1] User DB에서 id 존재 확인 + request 예외 처리
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
                    return res.json(Checker.falseJson(1, '카테고리 이름을 입력하세요'));
                }
                else if(!user) {
                    return res.json(Checker.falseJson(2, '등록되지 않은 ID입니다'));
                }
                else {
                    next();
                }
            });
    },
    // [2] 아이디+카테고리 이름 일치하는 카테고리 제거
    function(req, res, next){
        Category.findOneAndRemove(
            {
                id   : req.body.id,
                title: req.body.title
            }
        )
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!category){
                    res.json(Checker.falseJson(3, '사용자에게 해당 카테고리 정보가 존재하지 않습니다'));
                }
                else {
                    res.json(Checker.trueJson(
                        MakeView.categoryView(category),
                        '카테고리가 삭제되었습니다')
                    );
                }
            });
    }
);

module.exports = router;
