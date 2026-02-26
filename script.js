/* Biblical Musical Chairs Heart Assessment — script.js
   - Builds categories and items
   - Enforces exactly 8 selections
   - Allows rating each selected item 1–20 (duplicates allowed)
   - Tie-breaker: if God/Jesus/Holy Spirit ties with any item, God is moved DOWN
   - Narrative box shows NKJV scriptures and tie message only if triggered
   - Includes PDF download of results + narrative + Psalm 139:23 + Creator line
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

// Build category checkboxes
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

// Selection -> rating form
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

// Compute results + tie-breaker
document.getElementById('seeResults').addEventListener('click', ()=>{
  const selects = document.querySelectorAll('#ratingForm select');
  if(selects.length === 0) { alert('No items to rate.'); return; }

  const ratings = {};
  selects.forEach(sel=>{
    const item = sel.name.replace(/^rating-/, '');
    ratings[item] = parseInt(sel.value,10);
  });

  let sorted = Object.entries(ratings).sort((a,b)=> b[1] - a[1]);

  // Tie-breaker: God moves DOWN
  let tieBreakerTriggered = false;
  const godKey = "God/Jesus/Holy Spirit";
  const godIndex = sorted.findIndex(([k]) => k === godKey);

  if(godIndex !== -1){
    const godRating = sorted[godIndex][1];
    const tied = sorted.filter(([k,r]) => r === godRating);
    if(tied.length > 1){
      tieBreakerTriggered = true;

      const [godEntry] = sorted.splice(godIndex,1);

      let insertAfter = sorted.findIndex(([k,r]) => r < godRating);
      if(insertAfter === -1) insertAfter = sorted.length;

      sorted.splice(insertAfter, 0, godEntry);
    }
  }

  // Display ranked results
  const resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = '<h2>Your Ranked Results</h2>';
  sorted.forEach(([item, rating], idx)=>{
    resultsDiv.insertAdjacentHTML('beforeend',
      `<p><strong>${idx+1}.</strong> ${item} — Rating: ${rating}</p>`
    );
  });

  // Show narrative box
  const narrative = document.getElementById('narrativeBox');
  narrative.style.display = 'block';

  // Tie-breaker message (NKJV)
  const tieMsg = document.getElementById('tieBreakerMessage');
  tieMsg.textContent = tieBreakerTriggered
    ? `Matthew 22:37 (NKJV), "Jesus said to him, 'You shall love the LORD your God with all your heart, with all your soul, and with all your mind.'" The reason God/Jesus/Holy Spirit was bumped down when a tie occurred is because we should love God, Jesus, and Holy Spirit more than we love anything or anyone else.`
    : '';

  // Enable PDF download
  document.getElementById('downloadResults').onclick = () =>
    downloadPDF(sorted, tieBreakerTriggered);
});

// PDF download function
function downloadPDF(sortedArray, tieTriggered) {

  let html = `
    <html>
    <head>
      <title>Biblical Musical Chairs Heart Assessment Results</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        h2 { margin-top: 24px; }
        .scripture { margin-top: 12px; }
        .tie { margin-top: 20px; font-weight: bold; color: #444; }
        .creator { text-align:center; font-weight:bold; margin-bottom:20px; }
        .subtitle { text-align:center; font-style:italic; margin-bottom:10px; }
      </style>
    </head>
    <body>

      <h1>Biblical Musical Chairs Heart Assessment</h1>

      <p class="subtitle"><strong>Psalm 139:23 (NKJV)</strong> — "Search me, O God, and know my heart; try me, and know my anxieties."</p>

      <p class="creator">Created by Reverend Jesse L. Williams</p>

      <h2>Your Ranked Results</h2>
  `;

  sortedArray.forEach(([item, rating], idx) => {
    html += `<p><strong>${idx+1}.</strong> ${item} — Rating: ${rating}</p>`;
  });

  html += `
      <h2>Scriptures (NKJV)</h2>

      <p class="scripture"><strong>Matthew 6:19</strong> — "Do not lay up for yourselves treasures on earth, where moth and rust destroy and where thieves break in and steal;"</p>
      <p class="scripture"><strong>Luke 14:26</strong> — "If anyone comes to Me and does not hate his father and mother, wife and children, brothers and sisters, yes, and his own life also, he cannot be My disciple."</p>
      <p class="scripture"><strong>Matthew 6:20</strong> — "but lay up for yourselves treasures in heaven, where neither moth nor rust destroys and where thieves do not break in and steal."</p>
  `;

  if (tieTriggered) {
    html += `
      <p class="tie">
        <strong>Matthew 22:37 (NKJV)</strong> — "Jesus said to him, 'You shall love the LORD your God with all your heart, with all your soul, and with all your mind.'"<br><br>
        The reason God/Jesus/Holy Spirit was bumped down when a tie occurred is because we should love God, Jesus, and Holy Spirit more than we love anything or anyone else.
      </p>
    `;
  }

  html += `
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}
