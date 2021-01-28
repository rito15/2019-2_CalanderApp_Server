const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

const User     = require('../models/user');
const Category = require('../models/category');
const Plan     = require('../Legacy/plan');

const Checker  = require('../js/checker');
const MakeView = require('../js/make_view');

/*
=============================================================================
[1] 기본 : 서버 구동 상태 점검
 <GET>
http://localhost:3000/user
JSON : {}

----------------------------------------------------------------------------
 [2] 개발자용 : 전체 DB 보여주기
 <GET>
http://localhost:3000/user/rito-cheat-show-all-w9th319ej92r29
JSON : {}

----------------------------------------------------------------------------
 [2+] 개발자용 : 특정 유저 DB 보여주기
 <GET>
http://localhost:3000/user/rito-cheat-show-all-w9th319ej92r29/아이디
JSON : {}

----------------------------------------------------------------------------
 [3] 개발자용 : 전체 DB 삭제
 <POST>
http://localhost:3000/user/rito-cheat-destroy-all-rq09r093thf33ra22f
JSON : {}

----------------------------------------------------------------------------
 [4] ID 일치하는 유저 검색
 <GET>
http://localhost:3000/user/find/유저아이디
JSON : {}

----------------------------------------------------------------------------
 [5] 새로운 유저 정보 등록
 <POST>
http://localhost:3000/user/add
JSON :
{
	"id": "id12345",
	"password" : "12345"
}

----------------------------------------------------------------------------
 [6] 유저 정보(비밀번호) 수정
 - request JSON의 id와 password가 DB의 유저 정보와 일치해야 함
 - 기존의 password, new_password가 동일하면 안됨
 <POST> (원래는 PUT 사용)
http://localhost:3000/user/modify
JSON :
{
	"id": "id12345",
	"password" : "12345",
	"new_password" : "56789"
}
=> password : 기존 비밀번호
=> new_password : 변경할 비밀번호

----------------------------------------------------------------------------
 [7] 유저 정보 삭제 (request JSON의 id와 password가 모두 일치해야 함)
 <POST> (원래는 DELETE 사용)
http://localhost:3000/user/delete
JSON :
{
	"id": "id12345",
	"password" : "12345"
}

----------------------------------------------------------------------------
 [8] 로그인 시도 (request JSON의 id와 password가 모두 일치해야 함)
 1. 아이디 존재 유무 검사
 2. 해당 아이디의 비번 일치 검사
 <POST>
http://localhost:3000/user/login
JSON :
{
	"id": "id12345",
	"password" : "12345"
}
=============================================================================
*/


// 비밀번호 암호화할지 여부
const useHashPWD = false;

// 비밀번호를 해싱하여 리턴
const hashPWD = function(paramPassword) {
    if(useHashPWD) {
        return crypto.createHash('sha512').
        update(paramPassword).digest('hex');
    } else {
        return paramPassword;
    }
};


// 기본 페이지 : 서버 상태만 점검
// METHOD : GET
// http://localhost:3000/user
router.get('/',
    function(req, res, next){
        res.json({success: true, status: "running : user_api"});
    }
);

// 특정 id로 검색(url 마지막에 /검색할id 넣어서 검색)
// METHOD : GET
// http://localhost:3000/user/검색할id
router.get('/find/:param_id',
    function(req, res, next){
        User.findOne({id:req.params.param_id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else if(!user){
                    res.json({
                        success:false, 
                        error_code:0, 
                        message:'등록되지 않은 ID입니다'
                    });
                }
                else {
                    res.json({success:true, data:{index: user.index, id: user.id}});
                }
            });
    }
);

// 새로운 유저 정보 등록
// 클라이언트 JSON의 id, password를 그대로 등록 (id 중복 체크함!)
// METHOD : POST
// http://localhost:3000/user/add
// JSON에 id, password를 줘야 함
router.post('/add',
    // [1] 중복 검사 : 클라이언트가 보낸 JSON의 id(req.body.id)와 User DB의 id
    // + 각종 예외 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .sort({index: -1})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(user) {
                    return res.json({success:false,
                                    error_code:0, message:'중복된 ID입니다'});
                }
                else if (!Checker.checkSmallLetterDigit(req.body.id)) {
                    res.json({
                        success:false,
                        error_code:1,
                        message:'ID는 4~12 길이의 소문자, 숫자만 가능합니다'
                    });
                }
                // 비밀번호 길이가 4~12자가 아닌 경우
                else if(!Checker.checkLength(req.body.password, 4, 12)){
                    res.json({success:false, error_code:2, message:'비밀번호는 4자 이상 12자 이하여야 합니다'});
                }
                else {
                    next();
                }
            });
    },
    // [2] 전체 검색하여 마지막 인덱스 얻어내기
    function(req, res, next){
        User.findOne({})
            .sort({index: -1})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.locals.lastId = user?user.index:0;
                    next();
                }
            });
    },
    // [3] 새롭게 등록
    function(req, res, next){
        var newUser = new User(req.body);
        newUser.index = res.locals.lastId + 1;
        newUser.password = hashPWD(req.body.password);
        newUser.save(function(err, user){
            if(err) {
                res.status(500);
                res.json({success:false, error_code:-3, message:err});
            }
            else {
                res.json({success:true, data:{id: user.id},
                    message:'ID 등록이 완료되었습니다'});
            }
        });
    }
);

// 유저 정보 수정
// 클라이언트 JSON의 id와 일치하는 id를 찾아, password 수정
// METHOD : PUT 써야 하지만 POST로 통일
// http://localhost:3000/user/modify
router.post('/modify',
    // [1] ID 존재 검사, 각종 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                // 해당 ID가 DB에 존재하지 않는 경우
                else if(!user) {
                    return res.json({success:false,
                        error_code:0, message:'존재하지 않는 ID입니다'});
                }
                // 입력한 비밀번호와 새로운 비밀번호가 동일한 경우
                else if(req.body.password === req.body.new_password){
                    res.json({success:false, error_code:1, message:'비밀번호가 기존과 동일합니다'});
                }
                // 비밀번호 길이가 4~12자가 아닌 경우
                else if(!Checker.checkLength(req.body.new_password, 4, 12)){
                    res.json({success:false, error_code:1, message:'비밀번호는 4자 이상 12자 이하여야 합니다'});
                }
                // 해당 ID의 비밀번호와 일치하지 않는 경우
                else if(!user){
                    res.json({success:false, error_code:2, message:'비밀번호가 일치하지 않습니다'});
                }
                else {
                    next();
                }
            });
    },
    // [2] 비밀번호가 일치할 경우, 새로운 비밀번호로 변경
    function(req, res, next){
        User.findOneAndUpdate({id:req.body.id, password:hashPWD(req.body.password)},
                              {id:req.body.id, password:hashPWD(req.body.new_password)})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else {
                    res.json({success:true, data:{id: user.id},
                            message:'성공적으로 변경되었습니다'});
                }
            });
    }
);

// 유저 정보 삭제
// 클라이언트 JSON의 id와 password가 모두 일치하는 유저 정보 찾아, 삭제
// METHOD : DELETE => POST로 변경
// http://localhost:3000/user/delete
router.post('/delete',
    // [1] ID 존재 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    return res.json({success:false, error_code:-1, message:err});
                }
                else if(!user) {
                    return res.json({success:false,
                        error_code:0, message:'존재하지 않는 ID입니다'});
                }
                else {
                    next();
                }
            });
    },
    // [2] 비밀번호가 일치할 경우, 제거
    // [2-1] User DB에서 제거
    function(req, res, next){
        User.findOneAndRemove(
            {
                id:req.body.id,
                password:hashPWD(req.body.password)
            },
            req.body
        )
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!user){
                    res.json({success:false, error_code:1, message:'비밀번호가 일치하지 않습니다'});
                }
                else {
                    // res.json({success:true,
                    //     data: {id: req.body.id},
                    //     message:'성공적으로 제거되었습니다'
                    // });
                    next();
                }
            });
    },
    // [2-2] Category DB에서 제거
    function(req, res, next){
        Category.deleteMany(
            {
                id:req.body.id
            },
            req.body
        )
            .exec(function(err, category){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-3, message:err});
                }
                else {
                    next();
                }
            });
    },
    // [2-3] Plan DB에서 제거
    function(req, res, next){
        Plan.deleteMany(
            {
                id:req.body.id
            },
            req.body
        )
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-4, message:err});
                }
                else {
                    res.json({success:true,
                        data: {id: req.body.id},
                        message:'성공적으로 제거되었습니다'
                    });
                }
            });
    }
);

// 로그인 시도
// 1. 아이디 존재 유무 검사
// 2. 해당 아이디의 비번 일치 검사
// METHOD : POST
// http://localhost:3000/user/login
router.post('/login',
    // 1. 아이디 존재 유무 검사
    function(req, res, next){
        User.findOne({id:req.body.id})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-1, message:err});
                }
                else if(!user){
                    res.json({success:false, error_code:0, message:'존재하지 않는 ID입니다'});
                }
                else {
                    next();
                }
            });
    },
    // 2. 해당 아이디의 비번 일치 유무 검사
    function(req, res, next){
        User.findOne({id:req.body.id, password:hashPWD(req.body.password)})
            .exec(function(err, user){
                if(err) {
                    res.status(500);
                    res.json({success:false, error_code:-2, message:err});
                }
                else if(!user){
                    res.json({success:false, error_code:1, message:'비밀번호가 일치하지 않습니다'});
                }
                else {
                    res.json({success:true, data: {id: user.id}});
                }
            });
    }
);

module.exports = router;
