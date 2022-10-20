import {
    buildCssStringForSelector,
    convertCssPropertiesToString,
    extractSelectorAndCss,
    TacssProperties,
} from "./index";

describe(`TACSS`, () => {
    test(`Converting a CSSProperties object with just standard properties to the proper css string`, () => {
        const properties: TacssProperties = {
            backgroundColor: "red",
            fontSize: "14px",
            color: "rgba(255,255,255,1)",
        };
        expect(convertCssPropertiesToString(properties)).toEqual(
            "{background-color:red;font-size:14px;color:rgba(255,255,255,1);}",
        );
    });

    test(`buildCssString: Passing in our own selector, basic example`, () => {
        expect(buildCssStringForSelector("a", { fontSize: "14px" })).toEqual("a{font-size:14px;}");
    });

    test(`buildCssString: Passing in our own selector, a few regular options plus media queries`, () => {
        expect(
            buildCssStringForSelector("a", {
                fontSize: "14px",
                color: "red",
                backgroundColor: "blue",
                "@media print": {
                    fontSize: "28px",
                },
            }),
        ).toEqual("a{font-size:14px;color:red;background-color:blue;}@media print{a{font-size:28px;}}");
    });

    test(`buildCssString: Passing in our own selector, a few regular options plus pseudos`, () => {
        expect(
            buildCssStringForSelector("a", {
                fontSize: "14px",
                color: "red",
                backgroundColor: "blue",
                ":hover": {
                    backgroundColor: "green",
                },
                "::after": {
                    content: "'hi'",
                    height: "20px",
                    fontSize: "10px",
                },
            }),
        ).toEqual(
            "a{font-size:14px;color:red;background-color:blue;}a:hover{background-color:green;}a::after{content:'hi';height:20px;font-size:10px;}",
        );
    });

    test(`buildCssString: Passing in our own selector, pseudo inside media query`, () => {
        expect(
            buildCssStringForSelector("a", {
                fontSize: "14px",
                "@media print": {
                    fontSize: "28px",
                    ":hover": {
                        backgroundColor: "blue",
                    },
                },
            }),
        ).toEqual("a{font-size:14px;}@media print{a{font-size:28px;}a:hover{background-color:blue;}}");
    });

    test(`buildCssString: Passing in our own selector, fontsize as number is converted to px`, () => {
        expect(buildCssStringForSelector("a", { "font-size": 14 })).toEqual("a{font-size:14px;}");
    });

    test(`Parsing already constructed strings to break down`, () => {
        const sample =
            ".tacss_BQFFnuiNncZqJGaM{display:flex;flex-direction:column;width:100%;min-height:100vh;font-size:18px;}@media (max-width: 768px){.tacss_BQFFnuiNncZqJGaM{font-size:34px;background-color:red;}}";

        const expected = [
            ".tacss_BQFFnuiNncZqJGaM",
            "{display:flex;flex-direction:column;width:100%;min-height:100vh;font-size:18px;}@media (max-width: 768px){{font-size:34px;background-color:red;}}",
        ];

        expect(extractSelectorAndCss(sample)).toEqual(expected);
    });
});
