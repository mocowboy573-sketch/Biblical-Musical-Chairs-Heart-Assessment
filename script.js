// ----- DATA: ITEMS (MATCHING YOUR PDF CHECKBOXES) -----
const ITEMS = [
  "4Wheelers","Acting","ActionFigures","Alcohol","AloneTime","Antiques","Archery","Art",
  "Baseball","Basketball","BeachLife","Beer","BeingHome","Bible","BikeRiding","Birdwatching",
  "BoardCardGames","Bowling","Camping","CaringforOthers","Cars","Children","Church",
  "ChurchFamily","Clothes","Coins","ComicBooks","CookingBaking","Cornhole","Coworkers",
  "Crafting","Crossfit","Cruises","Culture","Dancing","DateNights","Daughter","DigitalCreator",
  "Dirtbikes","Drawing","Driving","Eating","Evangelism","Family","FamilyTime","Fishing",
  "Flying","Following","Football","Friends","Gardening","GodJesusHolySpirit","Golf","GymTime",
  "Gymnastics","Hats","Heirlooms","Hiking","Holidays","Horseshoes","Hunting","Husband",
  "Jewelry","Journaling","Lawncare","Leading","LiftingWeights","Liquor","MartialArts",
  "Mentoring","MiraclesSignsWonders","Money","Motorcycles","Movies","Mudding","OffRoading",
  "OtherSport","Paintball","Pets","Photography","Pickleball","Planes","PlayingMusic","Prayer",
  "PrayingforOthers","PreachingTeaching","ProducingMusic","Puzzles","Racing","Reading",
  "Religion","RocksCrystals","Running","Science","ScubaDiving","Sculpting","Sewing","Shoes",
  "Shopping","SingingKaraoke","Skateboarding","SleepingNapping","Smoking","Soccer","Son",
  "Souvenirs","Supervising","Surfing","Swimming","Tanning","Tennis","Toys","TradingCards",
  "Trains","Traveling","TravelingLocal","Trucks","Vaping","VideoGames","Volleyball",
  "Volunteering","Walking","Watches","WatchingTV","Wife","Woodworking","WorkJob",
  "WorshipPraise","Writing","Yoga"
];

const MAX_SELECTION = 8;

let selectedItems = []; // names
let ratings = {};       // name -> number

// ----- DOM ELEMENTS -----
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

const checkboxList = document.getElementById("checkboxList");
const selectionCounter = document.getElementById("selectionCounter");

const ratingsContainer = document.getElementById("ratingsContainer");
const resultsNarrative = document.getElementById("resultsNarrative");

const toStep2Btn = document.getElementById("toStep2");
const backToStep1Btn = document.getElementById("backToStep1");
const toStep3Btn = document.getElementById("toStep3");
const startOverBtn = document.getElementById("startOver");

// ----- INITIAL RENDER: CHECKBOXES -----
function renderCheckboxes() {
  ITEMS.forEach(name => {
    const id = "chk_" + name;
    const wrapper = document.createElement("label");
    wrapper.className = "checkbox-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.value = name;

    input.addEventListener("change", () => handleCheckboxChange(input));

    const span = document.createElement("span");
    span.textContent = name;

    wrapper.appendChild(input);
    wrapper.appendChild(span);
    checkboxList.appendChild(wrapper);
  });
}

function handleCheckboxChange(input) {
  const name = input.value;
  if (input.checked) {
    if (selectedItems.length >= MAX_SELECTION) {
      // prevent selecting more than 8
      input.checked = false;
      alert("You can only select exactly 8 items.");
      return;
    }
    selectedItems.push(name);
  } else {
    selectedItems = selectedItems.filter(n => n !== name);
  }
  updateSelectionCounter();
}

function updateSelectionCounter() {
  selectionCounter.textContent = `Selected: ${selectedItems.length} / ${MAX_SELECTION}`;
}

// ----- STEP NAVIGATION -----
function showStep(stepNumber) {
  step1.classList.add("hidden");
  step2.classList.add("hidden");
  step3.classList.add("hidden");

  if (stepNumber === 1) step1.classList.remove("hidden");
  if (stepNumber === 2) step2.classList.remove("hidden");
  if (stepNumber === 3) step3.classList.remove("hidden");
}

// ----- STEP 1 → STEP 2 -----
toStep2Btn.addEventListener("click", () => {
  if (selectedItems.length !== MAX_SELECTION) {
    alert("Please select exactly 8 items before continuing.");
    return;
  }
  renderRatings();
  showStep(2);
});

backToStep1Btn.addEventListener("click", () => {
  showStep(1);
});

// ----- RENDER RATINGS FOR SELECTED ITEMS -----
function renderRatings() {
  ratingsContainer.innerHTML = "";
  ratings = {};

  selectedItems.forEach(name => {
    const row = document.createElement("div");
    row.className = "rating-row";

    const label = document.createElement("div");
    label.className = "rating-label";
    label.textContent = name;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "10";
    input.value = "5";
    input.className = "rating-input";

    input.addEventListener("change", () => {
      let val = Number(input.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 10) val = 10;
      input.value = val;
      ratings[name] = val;
    });

    ratings[name] = 5; // default

    row.appendChild(label);
    row.appendChild(input);
    ratingsContainer.appendChild(row);
  });
}

// ----- STEP 2 → STEP 3 (CALCULATE) -----
toStep3Btn.addEventListener("click", () => {
  // Ensure all ratings are valid numbers
  for (const name of selectedItems) {
    const val = Number(ratings[name]);
    if (isNaN(val)) {
      alert("Please ensure all ratings are valid numbers.");
      return;
    }
  }

  const narrative = calculateNarrative();
  resultsNarrative.textContent = narrative;
  showStep(3);
});

// ----- START OVER -----
startOverBtn.addEventListener("click", () => {
  // Reset selections
  selectedItems = [];
  ratings = {};
  Array.from(checkboxList.querySelectorAll("input[type=checkbox]")).forEach(cb => {
    cb.checked = false;
  });
  updateSelectionCounter();
  showStep(1);
});

// ----- CORE LOGIC: SORT, TIE RULE, NARRATIVE -----
function calculateNarrative() {
  // 1. Load items and ratings
  let items = selectedItems.map(name => ({
    name,
    rating: Number(ratings[name])
  }));

  // 2. Sort normally (highest rating first)
  items.sort((a, b) => b.rating - a.rating);

  // 3. Apply special rule:
  // If GodJesusHolySpirit ties with anything, it loses the tie
  let specialRuleApplied = false;

  for (let i = 0; i < items.length - 1; i++) {
    const current = items[i];
    const next = items[i + 1];

    if (current.rating === next.rating) {
      // Case 1: God is in the upper position → swap down
      if (current.name === "GodJesusHolySpirit") {
        items[i] = next;
        items[i + 1] = current;
        specialRuleApplied = true;
      }
      // Case 2: God is in the lower position → still a tie
      else if (next.name === "GodJesusHolySpirit") {
        specialRuleApplied = true;
        // No swap needed
      }
    }
  }

  // 4. Build narrative text
  let narrative = "Here is your ranked list of what matters most to you right now:\n\n";

  for (let i = 0; i < items.length; i++) {
    narrative += `${i + 1}. ${items[i].name} (Weight: ${items[i].rating})\n`;
  }

  // 5. Scripture reflections
  narrative += "\n\nScripture Reflections:\n";

  narrative += "\nMatthew 6:19–20 (NKJV): ";
  narrative += "“Do not lay up for yourselves treasures on earth, where moth and rust destroy and where thieves break in and steal; ";
  narrative += "but lay up for yourselves treasures in heaven, where neither moth nor rust destroys and where thieves do not break in and steal.”";

  narrative += "\n\nLuke 14:26 (NLT): ";
  narrative += "“If you want to be my disciple, you must, by comparison, hate everyone else—your father and mother, wife and children, ";
  narrative += "brothers and sisters—yes, even your own life. Otherwise, you cannot be my disciple.”";

  narrative += "\n\nMatthew 6:20 (NKJV): ";
  narrative += "“For where your treasure is, there your heart will be also.”";

  // 6. Reflection paragraph BELOW the verses, only if rule was applied
  if (specialRuleApplied) {
    narrative += "\n\nReflection:\n";
    narrative += "When a tie occurs involving GodJesusHolySpirit, this assessment intentionally places Them slightly lower. ";
    narrative += "This is not to diminish Their importance, but to remind us that God should be loved above everything and everyone. ";
    narrative += "If God ties with anything in our hearts, it reveals an opportunity to realign our priorities so that our love for Him ";
    narrative += "remains first, highest, and unmatched.";
  }

  return narrative;
}

// ----- INIT -----
renderCheckboxes();
updateSelectionCounter();
showStep(1);
