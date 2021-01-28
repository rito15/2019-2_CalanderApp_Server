
class MakeView {

    // User에서 _id, __v 제거하고 리턴
    userView = function(user) {
        return {
            id: user.id,
            password: user.password
        };
    };

    // Category에서 _id, __v 제거하고 리턴
    categoryView = function(category) {
        return {
            id      : category.id,
            title   : category.title,
            color   : category.color,
            checkbox: category.checkbox,
            radio   : category.radio,
            textarea: category.textarea,
            input   : category.input,
        };
    };

    // Event에서 _id, __v 제거하고 리턴
    eventView = function(event) {
        return {
            id          : event.id,
            title       : event.title,
            category    : event.category,
            startTime   : event.startTime,
            endTime     : event.endTime,
            allDay      : event.allDay,

            textarea    : event.textarea,
            input       : event.input,
            checkbox    : event.checkbox,
            radio       : event.radio,

            color       : event.color
        };
    };

    // ================================== Array Views ==========================================

    // Array(User)를 파라미터로 받아 _id, __v 제거하고 리스트 리턴
    userArrayView = function(users) {
        let userView = [];

        for(let i = 0; i < users.length; i++) {
            userView.push({
                id: users[i].id,
                password: users[i].password
            });
        }

        return userView;
    };

    // Array(Category)를 파라미터로 받아 _id, __v 제거하고 Array 리턴
    categoryArrayView = function(categories) {
        let categoryView = [];

        for (let i = 0; i < categories.length; i++) {
            categoryView.push({
                id      : categories[i].id,
                title   : categories[i].title,
                color   : categories[i].color,
                checkbox: categories[i].checkbox,
                radio   : categories[i].radio,
                textarea: categories[i].textarea,
                input   : categories[i].input,
            });
        }

        return categoryView;
    };

    // Array(Plan)을 파라미터로 받아서 _id, __v를 제거한 Array 리턴
    eventArrayView = function(events) {
        let eventView = [];

        for (let i = 0; i < events.length; i++) {
            eventView.push({
                id          : events[i].id,
                title       : events[i].title,
                category    : events[i].category,
                startTime   : events[i].startTime,
                endTime     : events[i].endTime,
                allDay      : events[i].allDay,

                textarea    : events[i].textarea,
                input       : events[i].input,
                checkbox    : events[i].checkbox,
                radio       : events[i].radio,

                color       : events[i].color
            });
        }

        return eventView;
    };
}

module.exports = new MakeView();
