import { openBangumi, nextPage, backPage } from '../../views/bangumi';
suite("VIEW TEST", () => {
    test("OPEN BANGUMI TEST",function() {
        openBangumi();
    });

    test("NEXT BANGUMI TEST", function () {
        nextPage();
    });

    test("BACK BANGUMI TEST", function () {
        backPage();
    });
});