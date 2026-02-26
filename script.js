// ---------------------------
// CATEGORY DATA
// ---------------------------
const categories = {
    "Collections": [
        "Money","Heirlooms","Souvenirs","Antiques","Watches","Shoes","Hats","Clothes","Toys",
        "Jewelry","Art","Comic Books","Trading Cards","Action Figures","Rocks/Crystals","Coins"
    ],
    "People": [
        "Husband","Wife","Son","Daughter","Children","Family","Friends","Co-workers","Pets"
    ],
    "Transportation": [
        "Cars","Trucks","Motorcycles","Dirtbikes","4-Wheelers","Trains","Planes"
    ],
    "Occupation": [
        "Work/Job","Volunteering","Leading","Following","Supervising","Mentoring"
    ],
    "Exercise": [
        "Walking","Running","Lifting Weights","Crossfit","Gym Time","Yoga"
    ],
    "Outdoor Activities": [
        "Gardening","Lawncare","Driving","Racing","Cornhole","Horseshoes","Scuba Diving","Shopping",
        "Bike Riding","Surfing","Hunting","Beach Life","Tanning","Birdwatching","Paintball","Archery",
        "Photography","Off-roading","Mudding","Camping","Fishing","Hiking"
    ],
    "Sports": [
        "Football","Baseball","Soccer","Basketball","Golf","Tennis","Pickleball","Martial Arts",
        "Bowling","Skateboarding","Swimming","Gymnastics","Volleyball","Other Sport"
    ],
    "Indoor Activities": [
        "Puzzles","Reading","Writing","Journaling","Movies","Producing Music","Watching TV",
        "Video Games","Board/Card Games","Sewing","Eating","Cooking/Baking","Drawing","Crafting",
        "Digital Creator","Sculpting","Woodworking","Acting","Playing Music","Date Nights",
        "Dancing","Singing/Karaoke"
    ],
    "Home Related": [
        "Alone Time","Being Home","Traveling Local","Holidays","Family Time","Sleeping/Napping"
    ],
    "Beliefs": [
        "Religion","Culture","Science","Bible","God/Jesus/Holy Spirit","Evangelism",
        "Preaching/Teaching","Church","Church Family","Caring for Others","Prayer",
        "Praying for Others","Miracles, Signs, Wonders","Worship/Praise"
    ],
    "Other": [
        "Beer","Liquor","Alcohol","Smoking","Vaping"
    ]
};

// ---------------------------
// BUILD CATEGORY CHECKBOXES
// ---------------------------
const categoriesDiv = document.getElementById("categories");

Object.entries(categories).forEach(([category, items]) => {
    const div = document.createElement("div");
    div.className = "category";

    div.innerHTML = `<h2>${category}</h2><div class="item-list"></div>`;
    const list = div.querySelector(".item-list");

    items.forEach(item => {
        list.innerHTML += `
            <label><input type="checkbox" name="item" value="${item}"> ${item}</label><br>
        `;
    });

    categoriesDiv.appendChild(div);
});

// ---------------------------
// HANDLE TOP 8 SELECTION
// ---------------------------
document.getElementById("submitSelection").onclick = () => {
    const selected = [...document.querySelectorAll('input[name="item"]:checked')].map(i => i.value);

    if (selected.length !== 8) {
        alert("Please select exactly 8 items.");
        return;
    }

    const ratingForm = document.getElementById("ratingForm");
    ratingForm.innerHTML = "";

    selected.forEach(item => {
        ratingForm.innerHTML += `
            <div class="rating-item">
                <label>${item} — Rate 1–20:
                    <select name="rating-${item}">
                        ${Array.from({length:20}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join("")}
                    </select>
                </label>
            </div>
        `;
    });

    document.getElementById("ratingSection").style.display = "block";
};

// ---------------------------
// CALCULATE RESULTS + HIDDEN RULE
// ---------------------------
document.getElementById("seeResults").onclick = () => {
    const ratings = {};
    const selects = document.querySelectorAll("#ratingForm select");

    selects.forEach(sel => {
        const item = sel.name.replace("rating-", "");
        ratings[item] = parseInt(sel.value);
    });

    let sorted = Object.entries(ratings).sort((a,b) => b[1] - a[1]);

    const godIndex = sorted.findIndex(([item]) => item === "God/Jesus/Holy Spirit");

    if (godIndex > 0) {
        const godRating = sorted[godIndex][1];
        const aboveRating = sorted[godIndex - 1][1];

        if (godRating === aboveRating) {
            const godEntry = sorted.splice(godIndex, 1)[0];
            sorted.unshift(godEntry);
        }
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.style.display = "block";

    resultsDiv.innerHTML = "<h2>Your Ranked Results</h2>";
    sorted.forEach(([item, rating], index) => {
        resultsDiv.innerHTML += `<p><strong>${index+1}.</strong> ${item} — Rating: ${rating}</p>`;
    });
};
