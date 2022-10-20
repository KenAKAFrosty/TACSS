# TACSS - Type-Assisted CSS (pronounced "tax")

### * Currently designed for React. Looking to expand out to vanilla and other framework usage
 
---

TODO: Show basic tacssBracket example for pure React client-only apps

TODO: Show easy implementation of tacssReturn in SSR + hydrate scenarios (Next.js as easy example)

---
### Shoutouts:

I was about 85% done with the first working version of TACSS when I happened to stumble onto the vanilla-extract package. At first I was a bit discouraged to keep working on this package. It looked like "Oh, guess someone else has already built this and they did a fantastic job even down to the docs". 

- We both treat the style definitions like the pure data they are, represented by plain-ol' javascript objects. 
- We both love the power of having TypeScript help avoid mistakes instead of spending time out in Unregulated String Land™, then spending 45 minutes cursing the heavens on why your style isn't applying the way it should, only to realize you missed a capital letter somewhere. 
- We both love keeping styles easily locally-scoped so you can really lean into a component-style architecture (even down to media-queries)

**But I looked further and realized their intended use case and audience is actually different.** 

Main difference is they want to purely pre-process CSS creation (as they describe it, like using something such as SASS but with TypeScript powering it instead) and generate a .css file output at build time, where as TACSS specifically *wants* to generate at runtime. 

My intent is to build "in-line styles but with the full power of media queries, pseudo-classes, etc.". 

The focus is on very fast implementation: specifically no pre-process steps or setup, no having to import a variable for every new css class created, but instead just import a function or two and it just * works *. 

The use-at-runtime approach also allows for the easy adaptability of styles based on other data available to your component (through props or network calls, anything) e.g.:
```js
const result = await fetch("someapi.com/resource").then(r => r.json());
const style = {
    fontSize: 20,
    color: result.memberStatus.vip ? "purple" : "black"
}
```
Rather than having to create arbitrary CSS classes to add and remove from the dom element according to that data (which also implies you have to chooose a baseline style and then *change* the style after the data is available, which can cause flashes of undesired style).

This is simply a development choice and tradeoff. Many times, the pre-built CSS is plenty suitable and the no runtime costs are far more important. But sometimes the DX, or the flexibility of on-the-fly style generation is more valuable and the runtime costs are negligible. 

----

### Anyway! I wanted to give a shout out to the vanilla-extract team because I was able to refine a lot of little pieces (and improve my deeper CSS and styling knowledge) after looking through their great documentation, and those little boosts really add up! Thanks vanilla-extract team 😎