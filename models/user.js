const mongoose = require('mongoose');
const crypto = require('crypto');   // 암호화(해싱) 모듈

// const Category = require('./category');
// const Plan = require('./plan');

var userSchema = new mongoose.Schema({
    // DB 내 인덱스
    index: {
        type: Number,
        required: true
    },
    // 유저 아이디
    id: {
        type: String,
        required: true
    },
    // 패스워드
    password: {
        type: String,
        required: true
    }
});

var User = mongoose.model('user', userSchema);
module.exports = User;
