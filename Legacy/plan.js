var mongoose = require('mongoose');

var planSchema = new mongoose.Schema({
    // 유저 아이디
    id: {
        type: String,
        required: true
    },
    // 날짜               // "2000-00-00" 꼴 스트링
    date: {
        type: String,
        required: true,
    },
    // 계획 이름(구분용 : 해당 날짜에서 유일해야 함)
    planName: {
        type: String,
        required: true
    },
    // 카테고리 이름
    categoryName: {
        type: String,
        required: true,
    },
    // 스케줄 내용
    contents: {
        type: [String],
        required: true,
    },
    // ======================== 추가 항목 ===========================
    // 스케줄 요약
    summary: {
        type: String,
        required: false,
    },
    // 체크리스트
    checklist: {
        type: [String],
        required: false,
    },
    // 체크리스트 체크 여부
    checked: {
        type: [Boolean],
        required: false,
    }
});

var Plan = mongoose.model('plan', planSchema);
module.exports = Plan;
