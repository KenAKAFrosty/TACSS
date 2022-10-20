import { Properties } from "./csstypes";
export interface CSSProperties extends Properties<string | number> {

}

let styles: { [key: string]: string } = {};

const isBackend = typeof document === "undefined"
const isFrontend = !isBackend

if (isFrontend) {
    for (const fullCssString of Array.from(document.querySelectorAll('.tacss')).map(element => element.innerHTML)) {
        const className = fullCssString.split("{")[0].slice(1);
        styles[className] = fullCssString
    }
}

export function tacssBracket(tacssProperties: TacssProperties) {
    let className = "tacss_" + getRandomChars(16);
    const fullCssString = buildCssStringForSelector("." + className, tacssProperties);
    const [, newCss] = extractSelectorAndCss(fullCssString);

    for (const className in styles) {
        const style = styles[className];
        const [preExistingSelector, preExistingCss] = extractSelectorAndCss(style);
        if (newCss === preExistingCss) {
            return preExistingSelector.slice(1) //remove the initial '.' that makes it a selector to just get class name
        }
    }

    //If we passed the for loop, no duplicates exist. Proceed: push & return for backend, or check front end again and possibly inject
    if (isBackend) {
        styles[className] = fullCssString;
        return className;
    }

    for (const element of Array.from(document.querySelectorAll('.tacss'))) {
        const [preExistingSelector, preExistingCss] = extractSelectorAndCss(element.innerHTML);
        if (newCss === preExistingCss) {
            return preExistingSelector.slice(1);
        }
    }

    const style = document.createElement('style');
    style.innerHTML = fullCssString;
    style.id = "." + className
    style.classList.add("tacss");
    document.head.appendChild(style);
    return className;
}


export function tacssReturn(component: JSX.Element) {
    const classNames: { [key: string]: boolean } = {};
    getAllClassNamesFromComponent(component, classNames);

    const theseStyles: string[] = []

    if (isBackend) {
        for (const className in styles) {
            const style = styles[className];
            theseStyles.push(style);
        }
        styles = {};
    } else {
        for (const className in classNames) {
            const style = styles[className];
            if (style) theseStyles.push(style);
        }
    }

    return <>
        {
            theseStyles.map((style, i) => <style
                className={"tacss"}
                id={style.split("{")[0]}
                key={style + i}
                dangerouslySetInnerHTML={{ __html: style }
                }
            />)}
        {component}
    </>
}

function getAllClassNamesFromComponent(component: JSX.Element, classNameStore: { [key: string]: boolean }) {
    if (component.props.children) {
        if (Array.isArray(component.props.children)) {
            for (const child of component.props.children) {
                getAllClassNamesFromComponent(child as JSX.Element, classNameStore)
            }
        } else if (typeof component.props.children === "object") {
            getAllClassNamesFromComponent(component.props.children as JSX.Element, classNameStore)
        }
    }
    if (component.props.className) {
        classNameStore[component.props.className] = true;
    }
}

function getRandomChars(length: number) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let randomChars = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        randomChars += alphabet[randomIndex]
    }
    return randomChars
}

export function extractSelectorAndCss(cssString: string) {
    let selector = "";
    let i = 0;
    for (i; i < cssString.length; i++) {
        const char = cssString[i];
        if (char === "{") break
        else selector += char
    }

    const regEx = new RegExp(selector, "g");
    return [selector, cssString.slice(i).replace(regEx, "")]
}

export function convertCssPropertiesToString(cssProperties: CSSProperties) {

    let string = '{';
    for (const prop in cssProperties) {
        const tacssProp = prop as keyof CSSProperties
        let value = cssProperties[tacssProp];
        if (typeof value === "number") value = standardizedNumberValues(prop as keyof CSSProperties, value);

        const convertedProp = convertFromCamelCaseToProperCssTerm(tacssProp as keyof CSSProperties);
        string += convertedProp + ":" + value + ";";
    }
    string += '}'
    return string;
}

function convertFromCamelCaseToProperCssTerm(cssProp: keyof CSSProperties) {
    let convertedProp = '';
    for (let i = 0; i < cssProp.length; i++) {
        const char = cssProp[i];
        const lowerCase = char.toLowerCase();
        const isLowercase = char === lowerCase;
        if (isLowercase) convertedProp += char
        else convertedProp += ("-" + lowerCase)
    }
    return convertedProp
}


function standardizedNumberValues(prop: keyof CSSProperties, value: number) {
    const pixelNumberProps: { [Property in keyof CSSProperties]?: boolean } = {
        fontSize: true,
        "font-size": true,
        height: true,
        width: true,
        gap: true,

        margin: true,
        marginTop: true,
        "margin-top": true,
        marginBottom: true,
        "margin-bottom": true,
        marginLeft: true,
        "margin-left": true,
        marginRight: true,
        "margin-right": true,

        padding: true,
        paddingTop: true,
        "padding-top": true,
        paddingBottom: true,
        "padding-bottom": true,
        paddingLeft: true,
        "padding-left": true,
        paddingRight: true,
        "padding-right": true,

    }

    if (pixelNumberProps[prop]) return `${value}px`
    else return value;
}


export function buildCssStringForSelector(selector: string, tacssProperties: TacssProperties) {
    const cssProperties: CSSProperties = {};
    const queries: QueryCSS = {};
    const pseudoElements: { [Property in PseudoElements]?: CSSProperties } = {};
    const pseudoClasses: { [Property in PseudoClasses]?: CSSProperties } = {};

    for (const prop in tacssProperties) {
        //@ts-ignore
        const value = tacssProperties[prop];
        if (prop.startsWith("@")) {
            queries[prop as `@${"media" | "supports" | "container"}${string}`] = value;

        } else if (prop === ":multiPseudo") {
            const [selectors, css] = value;
            const thesePseudoElements = [];
            const thesePseudoClasses = [];
            for (const thisSelector of selectors) {
                if (thisSelector.startsWith("::")) thesePseudoElements.push(thisSelector)
                else thesePseudoClasses.push(thisSelector);

            }
            if (thesePseudoElements.length > 1) {
                console.warn(`More than one pseudo element (the :: double colon ones) was passed into a multiPseudo. Multiple pseudo classes (the : single colon ones) can be chained, but only one pseudo element can be used. Using the first one encountered in the array: ${thesePseudoElements[0]}.`)
            }
            const unified = thesePseudoClasses.join("") + thesePseudoElements[0];
            //could be added to pseudoClasses or pseudoElements, just arbitrarily picking classes
            //maybe just clearer and cleaner to create its own object and run through that?
            pseudoClasses[unified as PseudoClasses] = css;

        } else if (prop.startsWith("::")) {
            pseudoElements[prop as PseudoElements] = value;

        } else if (prop.startsWith(":")) {
            pseudoClasses[prop as PseudoClasses] = value;

        } else {
            //@ts-ignore
            cssProperties[prop] = value;
        }
    }

    let string = selector;
    string += convertCssPropertiesToString(cssProperties);

    for (const pseudoClass in pseudoClasses) {
        const css = pseudoClasses[pseudoClass as PseudoClasses];
        string += selector + pseudoClass
        string += convertCssPropertiesToString(css!);
    }

    for (const pseudoElement in pseudoElements) {
        const css = pseudoElements[pseudoElement as PseudoElements];
        string += selector + pseudoElement
        string += convertCssPropertiesToString(css!);
    }

    for (const cssQueryString in queries) {
        const queryCss = queries[cssQueryString as `@${"media" | "supports" | "container"}${string}`];
        string += cssQueryString + "{"
        string += buildCssStringForSelector(selector, queryCss as TacssProperties)
        string += "}"
    }

    return string;
}



type PseudoElements =
    | "::after"
    | "::backdrop"
    | "::before"
    | "::cue"
    | "::cue-region"
    | "::first-letter"
    | "::first-line"
    | "::file-selector-button"
    | "::marker"
    | `::part(${string})`
    | "::placeholder"
    | "::selection"
    | `::slotted(${string})`

type PseudoClasses =
    | ":fullscreen"
    | ":picture-in-picture"
    | ":autofill"
    | ":enabled"
    | ":disabled"
    | ":read-only"
    | ":read-write"
    | ":placeholder-shown"
    | ":default"
    | ":checked"
    | ":indeterminate"
    | ":valid"
    | ":invalid"
    | ":in-range"
    | ":out-of-range"
    | ":required"
    | ":optional"
    | ":user-invalid"
    | `:lang(${string})`
    | ":any-link"
    | ":link"
    | ":visited"
    | ":target"
    | ":scope"
    | ":playing"
    | ":paused"
    | ":root"
    | ":empty"
    | `:nth-child(${number})`
    | `:nth-last-child(${number})`
    | ":first-child"
    | ":last-child"
    | ":only-child"
    | `:nth-of-type(${number})`
    | `:nth-last-of-type(${number})`
    | ":first-of-type"
    | ":last-of-type"
    | ":only-of-type"
    | ":hover"
    | ":active"
    | ":focus"
    | ":focus-visible"
    | ":focus-within"


type Pseudo = PseudoClasses | PseudoElements

type PseudosCss = {
    [Property in Pseudo]?: CSSProperties;
}

type CSSandPseudoProperties = CSSProperties & PseudosCss & {
    ":multiPseudo"?: [Pseudo[], CSSProperties]
}

type CSSQuery = `@${"media" | "supports" | "container"}${string}`
type QueryCSS = {
    [key: CSSQuery]: CSSandPseudoProperties
}

export type TacssProperties = CSSandPseudoProperties & QueryCSS


const test: TacssProperties = {
    backgroundColor: "red",
    ":active": {},
    ":nth-child(3)": {},
    ":hover": {
        content: "",
        fontSize: "14"
    },
    "@media (max-width: 768px)": {
        fontSize: "14px",
        backgroundColor: "green",
        ":multiPseudo": [[":active", "::after"], {

        }]
    },
    ":multiPseudo": [[":visited", ":hover", ":disabled", ":required", "::after"], {
        content: "Already visited!",
        backgroundColor: "red",
        color: "white",
        fontSize: "12px",
        height: "20px"
    }],
}



