/* Treasure of Our Heart Assessment — script.js
   - Builds categories and items
   - Enforces exactly 8 selections
   - Allows rating each selected item 1–20 (duplicates allowed)
   - Tie-breaker: if God/Jesus/Holy Spirit ties with any item, God is moved DOWN
   - Narrative box shows static scriptures and tie message only if triggered
*/

const categories = {
  "Collections":[
    "Money","Heirlooms","Souvenirs","Antiques","Watches","Shoes","Hats","Clothes","Toys",
    "Jewelry","Art","Comic Books","Trading Cards","Action Figures","Rocks/Crystals","Coins"
  ],
  "People":[
    "Husband","Wife","Son","Daughter","Children","Family","Friends","Co-workers","Pets"
  ],
  "Transportation":[
    "Cars","Trucks","Motorcycles","Dirtbikes","4-Wheelers","Trains","Planes"
  ],
  "Occupation":[
    "Work/Job","Volunteering","Leading","Following","Supervising","Mentoring"
  ],
  "Exercise":[
    "Walking","Running","Lifting Weights","Crossfit","Gym Time","Yoga"
  ],
  "Outdoor Activities":[
    "Gardening","Lawncare","Driving","Racing","Cornhole","Horseshoes","Scuba Diving","Shopping",
    "Bike Riding","Surfing","Hunting","Beach Life","Tanning","Birdwatching","Paintball","Archery",
    "Photography","Off-roading","Mudding","Camping","Fishing","Hiking"
  ],
  "Sports":[
    "Football","Baseball","Soccer","Basketball","Golf","Tennis","Pickleball","Martial Arts",
    "Bowling","Skateboarding","Swimming","Gymnastics","Volleyball","Other Sport"
  ],
  "Indoor Activities":[
    "Puzzles","Reading","Writing","Journaling","Movies","Producing Music","Watching TV",
    "Video Games","Board/Card Games","Sewing","Eating","Cooking/Baking","Drawing","Crafting",
    "Digital Creator","Sculpting","Woodworking","Acting","Playing Music","Date Nights",
    "Dancing","Singing/Karaoke"
  ],
  "Home Related":[
    "Alone Time","Being Home","Traveling Local","Holidays","Family Time","Sleeping/Napping"
  ],
  "Beliefs":[
    "Religion","Culture","Science","Bible","God/Jesus/Holy Spirit","Evangelism",
    "Preaching/Teaching","Church","Church Family","Caring for Others","Prayer",
    "Praying for Others","Miracles, Signs, Wonders","Worship/Praise"
  ],
  "Travel":[ "Traveling","Flying","Cruises" ],
  "Other":[ "Beer","Liquor","Alcohol","Smoking","Vaping" ]
};

// build category checkboxes
const categoriesDiv = document.getElementById('categories');
Object.entries(categories).forEach(([cat, items])=>{
  const container = document.createElement('div');
  container.className = 'category';
  container.innerHTML = `<h2>${cat}</h2><div class="item-list"></div>`;
  const list = container.querySelector('.item-list');
  items.forEach(it=>{
    const safe = it.replace(/"/g,'&quot;');
    list.insertAdjacentHTML('beforeend',
      `<label><input type="checkbox" name="item" value="${safe}"> ${safe}</label><br>`
    );
  });
  categoriesDiv.appendChild(container);
});

// selection -> rating form
document.getElementById('submitSelection').addEventListener('click', ()=>{
  const selected = [...document.querySelectorAll('input[name="item"]:checked')].map(i=>i.value);
  if(selected.length !== 8){
    alert('Please select exactly 8 items.');
    return;
  }

  const ratingForm = document.getElementById('ratingForm');
  ratingForm.innerHTML = '';
  selected.forEach(item=>{
    const id = `rating-${item}`;
    const options = Array.from({length:20},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
    ratingForm.insertAdjacentHTML('beforeend',
      `<div class="rating-item">
         <label>${item} — Rate 1–20:
           <select name="${id}" aria-label="Rate ${item}">${options}</select>
         </label>
       </div>`
    );
  });

  document.getElementById('ratingSection').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('narrativeBox').style.display = 'none';
  document.getElementById('tieBreakerMessage').textContent = '';
});

// compute results and apply tie-breaker
document.getElementById('seeResults').addEventListener('click', ()=>{
  const selects = document.querySelectorAll('#ratingForm select');
  if(selects.length === 0) { alert('No items to rate.'); return; }

  const ratings = {};
  selects.forEach(sel=>{
    const item = sel.name.replace(/^rating-/, '');
    ratings[item] = parseInt(sel.value,10);
  });

  // sort descending by rating
  let sorted = Object.entries(ratings).sort((a,b)=> b[1] - a[1]);

  // tie-breaker: if God/Jesus/Holy Spirit ties with any other item, move God DOWN
  let tieBreakerTriggered = false;
  const godKey = "God/Jesus/Holy Spirit";
  const godIndex = sorted.findIndex(([k]) => k === godKey);

  if(godIndex !== -1){
    const godRating = sorted[godIndex][1];
    const tied = sorted.filter(([k,r]) => r === godRating);
    if(tied.length > 1){
      tieBreakerTriggered = true;
      // remove God entry
      const [godEntry] = sorted.splice(godIndex,1);
      // find insertion index after all items that share the godRating
      let insertAfter = sorted.findIndex(([k,r]) => r < godRating);
      if(insertAfter === -1) insertAfter = sorted.length;
      sorted.splice(insertAfter, 0, godEntry);
    }
  }

  // show ranked results
  const resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = '<h2>Your Ranked Results</h2>';
  sorted.forEach(([item, rating], idx)=>{
    resultsDiv.insertAdjacentHTML('beforeend',
      `<p><strong>${idx+1}.</strong> ${item} — Rating: ${rating}</p>`
    );
  });

  // show narrative box (scriptures are static)
  const narrative = document.getElementById('narrativeBox');
  narrative.style.display = 'block';

  // show tie-breaker message only if triggered
  const tieMsg = document.getElementById('tieBreakerMessage');
  tieMsg.textContent = tieBreakerTriggered
    ? 'A tie occurred with God/Jesus/Holy Spirit. God/Jesus/Holy Spirit was moved down because nothing should tie with our love for Them.'
    : '';
});
