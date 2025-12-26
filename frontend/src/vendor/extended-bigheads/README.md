<p align="center" >
  <img alt="Big Heads Demo" src="https://github.com/robertlinde/extended-bigheads/blob/main/demo.gif" />
</p>

## About

Did you ever want to create a Big Head version of your self? Or do you want to offer users an easy creation of avatars for your application? Here you go! 🚀\
This projects extends the [Original Big Heads implementation](https://github.com/RobertBroersma/bigheads) with features of the [React Native Big Heads implementation](https://github.com/felipecespedes/react-native-bigheads) and the [Vue Big Heads implementation](https://github.com/DerpyScripts/vue-bigheads), giving it a rich set of options to style your Big Head Avatar.

## Try it

### Getting Started

1. `npm i extended-bigheads`
2. ```js
   import { BigHead } from "extended-bigheads";
   // or
   const { BigHead } = require("extended-bigheads");
   ```

then, in your app:

```jsx
import { BigHead } from "extended-bigheads";
// or const { BigHead } = require("extended-bigheads");

const Example = () => (
  <BigHead
    showBackground={true}
    backgroundColor="blue"
    backgroundShape="square"
    accessory="shades"
    body="chest"
    clothing="tankTop"
    clothingColor="red"
    eyebrows="angry"
    eyes="wink"
    facialHair="mediumBeard"
    facialHairColor="blonde"
    graphic="vue"
    hair="short"
    hairColor="black"
    hat="none"
    hatColor="green"
    lashes={false}
    lipColor="purple"
    mouth="open"
    skinTone="brown"
    faceMask={true}
    faceMaskColor="blue"
  />
);
```

To retrieve an object with all options possible, use

```jsx
import { bigHeadOptions } from "extended-bigheads";
// or
const { bigHeadOptions } = require("extended-bigheads");
```

_bigHeadOptions_ will look like this:

```js
{
  accessory: ['none', 'roundGlasses', 'tinyGlasses', ...],
  backgroundColor: ['red', 'orange', 'yellow', ...],
  backgroundShape: ['circle', 'square', 'squircle'],
  ...
}
```

### Props

Leaving a prop empty will result in a random value being chosen.
| Property | Possible values |
| ------------------ | -------------------------- |
| showBackground | `true` , `false` |
| backgroundColor | `'red'` , `'orange'` , `'yellow'` , `'green'` , `'turqoise'` , `'blue'` , `'pink'` , `'purple'` |
| backgroundShape | `'none'` , `'circle'` , `'square'` , `'squircle'` |
| accessory | `'none'` , `'faceMask'` , `'hoopEarrings'` , `'roundGlasses'` , `'shades'` , `'tinyGlasses'` |
| body | `'chest'` , `'breasts'` |
| clothing | `'naked'` , `'chequeredShirt'` , `'chequeredShirtDark'` , `'shirt'` , `'denimJacket'` , `'dressShirt'` , `'hoodie'` , `'vneck'` , `'tankTop'` , `'dress'` |
| clothingColor | `'white'` , `'gray'` , `'black'` , `'red'` , `'lightRed'` , `'orange'` , `'lightOrange'` , `'yellow'` , `'lightYellow'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lighPurple'` |
| eyebrows | `'none'` , `'angry'` , `'concerned'` , `'leftLowered'` , `'raised'` , `'serious'` |
| eyes | `'normal'` , `'content'` , `'crazy'` , `'cute'` , `'cyborg'` , `'dizzy'` , `'dollars'` , `'eyePatch'` , `'eyePatch2'` , `'happy'` , `'hearts'` , `'leftTwitch'` , `'squint'` , `'simple'` , `'stars'` , `'wink'` |
| facialHair | `'none'` , `'goatee'` , `'mediumBeard'` , `'stubble'` |
| facialHairColor | `'white'` , `'silver'` , `'blonde'` , `'brown'` , `'black'` , `'red'` , `'lightRed'` , `'orange'` , `'lightOrange'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lighPurple'` |
| graphic | `'none'` , `'donut'` , `'gatsby'` , `'graphQL'` , `'rainbow'` , `'react'` , `'redwood'` , `'vue'` |
| hair | `'none'` , `'afro'` , `'balding'` , `'bob'` , `'bun'` , `'buzz'` , `'long'` , `'mohawk'` , `'pixie'` , `'short'` |
| hairColor | `'white'` , `'silver'` , `'blonde'` , `'brown'` , `'black'` , `'red'` , `'lightRed'` , `'orange'` , `'lightOrange'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lighPurple'` |
| hat | `'none` ', `'beanie'` , `'hijab'` , `'partyHat'` , `'turban'` |
| hatColor | `'white'` , `'gray'` , `'black'` , `'red'` , `'lightRed'` , `'orange'` , `'lightOrange'` , `'yellow'` , `'lightYellow'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lighPurple'` |
| lashes | `true` , `false` |
| lipColor | `'red'` , `'lightRed'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lightPurple'` |
| mouth | `'grin'` , `'lips'` , `'open'` , `'openSmile'` , `'piercedTongue'` , `'sad'` , `'serious'` , `'tongue'` , `'vomitingRainbow'` |
| skinTone | `'light'` , `'yellow'` , `'brown'` , `'dark'` , `'red'` , `'black'` |
| faceMask | `true` , `false` |
| faceMaskColor | `'white'` , `'gray'` , `'black'` , `'red'` , `'lightRed'` , `'orange'` , `'lightOrange'` , `'yellow'` , `'lightYellow'` , `'green'` , `'lightGreen'` , `'turqoise'` , `'lightTurqoise'` , `'blue'` , `'lightBlue'` , `'pink'` , `'lightPink'` , `'purple'` , `'lighPurple'` |

---

# Authors

- Some portions of this code belong to the [bigheads authors](https://github.com/RobertBroersma/bigheads) which are distributed under the [MIT License](https://github.com/RobertBroersma/bigheads/blob/main/LICENSE)
- Some portions of this code belong to the [react-native-bigheads authors](https://github.com/felipecespedes/react-native-bigheads) which are distributed under the [MIT License](https://github.com/felipecespedes/react-native-bigheads/blob/master/LICENSE)
- Some portions of this code belong to the [vue-bigheads authors](https://github.com/DerpyScripts/vue-bigheads) which are distributed under the [MIT License](https://github.com/DerpyScripts/vue-bigheads/blob/main/LICENSE)
- [Robert Linde](https://github.com/robertlinde)

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/robertlinde/bigheads/blob/main/LICENSE) file for details
