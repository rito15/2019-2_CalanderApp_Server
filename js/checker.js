
class Checker {

    // 문자열 길이 검사
    checkLength = function(prmString, min, max) {
        // const pattern = /^.{4,12}$/;
        // const pattern = new RegExp("[.]{"+ min + "," + max +"}");
        // return pattern.test(prmString);
        return prmString.length >= min && prmString.length <= max;
    };

    // 소문자+숫자로 이루어진 형식인지 검사
    checkSmallLetterDigit = function(prmString) {
        const pattern = /^[a-z0-9]{4,12}$/;
        return pattern.test(prmString);
    };

    // 오브젝트가 해당 프로퍼티를 갖고 있지 않거나, 갖고 있더라도 길이가 0인지 검사
    /**
     * @return {boolean}
     */
    NotContainsOrEmpty = function(obj, propertyName, fullProperty) {
        return (!obj.hasOwnProperty(propertyName) || fullProperty.length === 0);
    };

    // 날짜 형식(2000-00-00)인지 검사
    checkDateFormat = function(prmString) {
        // const pattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;    // 범위 제한 안함
        const pattern = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
        return pattern.test(prmString);
    };

    // 색상 포맷 검사(6자, 0-9, A-F)
    checkColorFormat = function (prmString) {
        const pattern = /^[A-F0-9]{6}$/;
        return pattern.test(prmString);
    };

    // {success:false, message: 에러 메시지} 형태 JSON 리턴
    falseJson = function(errorNum, messageString) {
        return {
            success: false,
            error_code: errorNum,
            message: messageString
        };
    };

    // {success:true, message: 성공 메시지, data: 전송할 데이터 형태 JSON 리턴
    trueJson = function(dataObj, messageString) {
        return {
            success: true,
            data: dataObj,
            message: messageString
        };
    };
}

// module.exports = Checker;

module.exports = new Checker();
