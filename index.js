/**
 * Prize data will space out evenly on the deal wheel based on the amount of items available.
 * @param text [string] name of the prize
 * @param color [string] background color of the prize
 * @param reaction ['resting' | 'dancing' | 'laughing' | 'shocked'] Sets the reaper's animated reaction
 */
const pool = [
  {
    text: "10% Off Sticker Price",
    color: "hsl(197 30% 43%)",
    disable: false
  },
  {
    text: "Free Car",
    color: "hsl(173 58% 39%)",
    disable: false
  },
  {
    text: "No Money Down",
    color: "hsl(43 74% 66%)",
    disable: false
  },
  {
    text: "Half Off Sticker Price",
    color: "hsl(27 87% 67%)",
    disable: false
  },
  {
    text: "Free DIY Carwash",
    color: "hsl(12 76% 61%)",
    disable: false
  },
  {
    text: "Eternal Damnation",
    color: "hsl(350 60% 52%)",
    disable: false
  },
  {
    text: "Used Travel Mug",
    color: "hsl(91 43% 54%)",
    disable: false
  }
];

let prizes = []

// Wheel
const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".cap");
const ticker = wheel.querySelector(".ticker");

// Prize Dialog
const output = document.querySelector('.output');
const prizeShowcaseDialog = document.querySelector('#prizeShowcaseDialog');
document.querySelector('#closePrize').onclick = function () {
  prizeShowcaseDialog.classList.add('hide');
  prizeShowcaseDialog.addEventListener('webkitAnimationEnd', function () {
    prizeShowcaseDialog.classList.remove('hide');
    prizeShowcaseDialog.close();
    prizeShowcaseDialog.removeEventListener('webkitAnimationEnd', arguments.callee, false);
  }, false);
};


let prizeSlice = 0;
let prizeOffset = 0;
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);
let tickerAnim;
let rotation = 0;
let currentSlice = 0;
let prizeNodes;

prizes = pool.map(obj => ({ ...obj }));

const setOutput = (msg) => {
  prizeShowcaseDialog.showModal();
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  output.textContent = msg
};

const createPrizeNodes = () => {
  spinner.replaceChildren()
  prizes.forEach(({ text, color, reaction }, i) => {
    const rotation = ((prizeSlice * i) * -1) - prizeOffset;
    spinner.insertAdjacentHTML(
      "beforeend",
      `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
        <span class="text">${text}</span>
      </li>`
    );
  });
};

const createConicGradient = () => {
  spinner.setAttribute(
    "style",
    `background: conic-gradient(
      from -90deg,
      ${prizes
      .map(({ color }, i) => `${color} 0 ${(100 / prizes.length) * (prizes.length - i)}%`)
      .reverse()
    }
    );`
  );
};


const setupWheel = () => {
  prizes = prizes.filter(obj => obj.disable == false);
  prizeSlice = 360 / prizes.length;
  prizeOffset = Math.floor(180 / prizes.length);
  createConicGradient();
  createPrizeNodes();
  prizeNodes = wheel.querySelectorAll(".prize");
};

const spinertia = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const runTickerAnimation = () => {
  // https://css-tricks.com/get-value-of-css-rotation-through-javascript/
  const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
  const a = values[0];
  const b = values[1];
  let rad = Math.atan2(b, a);

  if (rad < 0) rad += (2 * Math.PI);

  const angle = Math.round(rad * (180 / Math.PI));
  const slice = Math.floor(angle / prizeSlice);

  if (currentSlice !== slice) {
    ticker.style.animation = "none";
    setTimeout(() => ticker.style.animation = null, 10);
    currentSlice = slice;
  }

  tickerAnim = requestAnimationFrame(runTickerAnimation);
};

const selectPrize = () => {
  const selected = Math.floor(rotation / prizeSlice);
  console.log(selected, prizeNodes[selected].textContent);

  prizeNodes[selected].classList.add(selectedClass);
  const currentlySelected = prizeNodes[selected].textContent.trim();
  prizes[selected].disable = true
  setOutput(currentlySelected)
  setupWheel()
};

trigger.addEventListener("click", () => {
  if (prizes.length == 0) {
    setOutput("No remaining options :(");
    return;
  }
  // setOutput("Spinning......")
  trigger.disabled = true;
  rotation = Math.floor(Math.random() * 360 + spinertia(2000, 5000));
  prizeNodes.forEach((prize) => prize.classList.remove(selectedClass));
  wheel.classList.add(spinClass);
  spinner.style.setProperty("--rotate", rotation);
  ticker.style.animation = "none";
  runTickerAnimation();
});

spinner.addEventListener("transitionend", () => {
  cancelAnimationFrame(tickerAnim);
  trigger.disabled = false;
  trigger.focus();
  rotation %= 360;
  selectPrize();
  wheel.classList.remove(spinClass);
  spinner.style.setProperty("--rotate", rotation);
});

document.querySelector('#reset').addEventListener('click', () => {
  prizes = pool.map(obj => ({ ...obj }));
  console.log(prizes);

  // setOutput("")
  output.textContent = ""

  setupWheel()
})

setupWheel();
