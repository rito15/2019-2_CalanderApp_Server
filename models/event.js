var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    // 유저 아이디
    id: {
        type: String,
        required: true
    },
    // 일정 이름
    title: {
        type: String,
        required: true
    },
    // 카테고리 이름
    category: {
        type: String,
        required: true
    },
    // 일정 시작 날짜-시간
    startTime: {
        type: String,
        required: true
    },
    // 일정 종료 날짜-시간
    endTime: {
        type: String,
        required: true
    },
    //
    allDay: {
        type: Boolean,
        required: true
    },

    // 색상 : 일정을 추가할 때 서버가 알아서 카테고리 DB에서 해당 색상을 찾아 일정 DB에 색상 추가
    color: {
        type: String,
        required: false
    },

    // 일정 내용들
    textarea: [],
    input   : [],
    checkbox: [],
    radio   : []
    /*
    radio: [
        {
            name: {
                type: String,
                required: true
            },
            contents: {
                type: Boolean,
                required: true
            }
        }
    ],
    */
});

var Event = mongoose.model('event', eventSchema);
module.exports = Event;
