var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    // 카테고리명
    title: {
        type: String,
        required: true,
    },
    // 대표 색상
    color: {
        type: String,
        required: true,
    },

    // 카테고리 타입들
    checkbox: {
        type: [String],
        required: true,
    },
    radio: {
        type: [String],
        required: true,
    },
    textarea: {
        type: [String],
        required: true,
    },
    input: {
        type: [String],
        required: true,
    },
});

var Category = mongoose.model('category', categorySchema);
module.exports = Category;
