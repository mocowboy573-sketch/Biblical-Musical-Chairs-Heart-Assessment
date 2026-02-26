// script.js — two-step selection then rating flow
// Tie-breaker logic is applied only during the rating step (Generate Results) and is not shown in the UI.

(() => {
  'use strict';

  const MAX_SELECT = 8;

  const categoriesContainer = document.getElementById('categories');
  const checkboxes = Array.from(categoriesContainer.querySelectorAll('input[type="checkbox"][data-field]'));
  const selectedCountEl = document.getElementById('selectedCount');
  const proceedBtn = document.getElementById('proceedBtn');
  const resetBtn = document.getElementById('resetBtn');

  const selectionPhase = document.getElementById('selectionPhase');
  const ratingPhase = document.getElementById('ratingPhase');
  const selectedList = document.getElementById('selectedList');

  const generateBtn = document.getElementById('generateBtn');
  const backBtn = document.getElementById('backBtn');

  const topContainer = document.getElementById('topContainer');
  const reflectionBlock = document.getElementById('reflectionBlock');
  const reflectionText = document.getElementById('reflectionText');

  function ratingInputFor(field) {
    const exact = document.getElementById('rate_' + field);
    if (exact) return exact;
    return document.querySelector('[id^="rate_' + field + '"]');
  }

  function updateSelectedCount() {
    const count = checkboxes.filter(cb => cb.checked).length;
    selectedCountEl.textContent = String(count);
  }

  (function initRatings() {
    checkboxes.forEach(cb => {
      const rate = ratingInputFor(cb.dataset.field);
      if (rate) {
        rate.disabled = true;
        if (!rate.value) rate.value = 10;
      }
    });
    updateSelectedCount();
  })();

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const currently = checkboxes.filter(c => c.checked).length;
      if (currently > MAX_SELECT) {
        cb.checked = false;
        alert(`You may select exactly ${MAX_SELECT} items.`);
        return;
      }
      updateSelectedCount();
    });
  });

  resetBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => {
      cb.checked = false;
      const rate = ratingInputFor(cb.dataset.field);
      if (rate) { rate.disabled = true; rate.value = 10; }
    });
    updateSelectedCount();
    ratingPhase.style.display = 'none';
    selectionPhase.style.display = 'block';
    topContainer.innerHTML = '';
    reflectionBlock.style.display = 'none';
    selectedList.innerHTML = '';
  });

  proceedBtn.addEventListener('click', () => {
    const selected = checkboxes.filter(cb => cb.checked).map(cb => cb.dataset.field);
    if (selected.length !== MAX_SELECT) {
      alert(`Please select exactly ${MAX_SELECT} items before proceeding. Currently selected: ${selected.length}.`);
      return;
    }

    selectedList.innerHTML = '';
    selected.forEach(field => {
      const display = prettify(field);
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <label style="font-weight:600;">${escapeHtml(display)}</label>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
          <input type="number" id="rate_step_${field}" class="step-rate" min="1" max="20" value="10" />
        </div>
      `;
      selectedList.appendChild(row);
    });

    selectionPhase.style.display = 'none';
    ratingPhase.style.display = 'block';
    const firstRate = selectedList.querySelector('.step-rate');
    if (firstRate) firstRate.focus();
    topContainer.innerHTML = '';
    reflectionBlock.style.display = 'none';
  });

  backBtn.addEventListener('click', () => {
    selectedList.innerHTML = '';
    ratingPhase.style.display = 'none';
    selectionPhase.style.display = 'block';
    updateSelectedCount();
  });

  generateBtn.addEventListener('click', () => {
    const stepRates = Array.from(selectedList.querySelectorAll('.step-rate'));
    if (stepRates.length !== MAX_SELECT) {
      alert('Rating list is incomplete. Return to selection and try again.');
      return;
    }

    const selected = stepRates.map(input => {
      const id = input.id.replace(/^rate_step_/, '');
      const raw = Number(input.value);
      const score = Number.isFinite(raw) ? Math.max(1, Math.min(20, Math.round(raw))) : 10;
      return { field: id, score };
    });

    // sort by score desc; tie-breaker applied here only
    selected.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // hidden tie-breaker: prioritize GodJesusHolySpirit if present among tied items
      if (a.field === 'GodJesusHolySpirit' && b.field !== 'GodJesusHolySpirit') return -1;
      if (b.field === 'GodJesusHolySpirit' && a.field !== 'GodJesusHolySpirit') return 1;
      return a.field.localeCompare(b.field);
    });

    topContainer.innerHTML = '';
    selected.forEach((it, idx) => {
      const displayName = prettify(it.field);
      const verse = scriptureFor(it.field);
      const reflect = reflectionFor(it.field, it.score);

      const itemEl = document.createElement('div');
      itemEl.className = 'top-item';
      itemEl.innerHTML = `
        <div class="badge">${idx + 1}</div>
        <div class="meta">
          <h4>${escapeHtml(displayName)} — ${it.score}/20</h4>
          <p style="margin:6px 0 0 0;color:var(--muted);font-size:13px;">Category: ${escapeHtml(categoryOfField(it.field))}</p>
          <div class="scripture">${escapeHtml(verse)}</div>
          <p style="margin:8px 0 0 0;color:#333;font-size:13px;">${escapeHtml(reflect)}</p>
        </div>
      `;
      topContainer.appendChild(itemEl);
    });

    const topThree = selected.slice(0, 3).map(s => `${prettify(s.field)} (${s.score}/20)`);
    reflectionText.innerHTML = `Your top priorities are: <strong>${escapeHtml(topThree.join(', '))}</strong>. Pray and ask God to clarify how these priorities should shape your time, relationships, and decisions this week. Consider one concrete step for each top priority.`;
    reflectionBlock.style.display = 'block';
    reflectionBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function prettify(field){
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b4Wheelers\b/, '4-Wheelers')
      .replace(/\bGodJesusHolySpirit\b/, 'God / Jesus / Holy Spirit')
      .replace(/\bBoardCardGames\b/, 'Board / Card Games')
      .replace(/\bCookingBaking\b/, 'Cooking / Baking')
      .replace(/\bPlayingMusic\b/, 'Playing Music')
      .replace(/\bWorshipPraise\b/, 'Worship / Praise')
      .replace(/\bMiraclesSignsWonders\b/, 'Miracles, Signs, Wonders')
      .replace(/\bTravelingLocal\b/, 'Traveling (local)')
      .replace(/\bDateNights\b/, 'Date Nights')
      .replace(/\bOtherSport\b/, 'Other Sport')
      .trim();
  }

  function categoryOfField(field){
    const mapping = {
      'Religion':'BELIEFS','Culture':'BELIEFS','Science':'BELIEFS','Bible':'BELIEFS','GodJesusHolySpirit':'BELIEFS',
      'Walking':'EXERCISE','Running':'EXERCISE','LiftingWeights':'EXERCISE','Crossfit':'EXERCISE','GymTime':'EXERCISE','Yoga':'EXERCISE',
      'AloneTime':'HOME RELATED','BeingHome':'HOME RELATED','TravelingLocal':'HOME RELATED','Holidays':'HOME RELATED','FamilyTime':'HOME RELATED','SleepingNapping':'HOME RELATED',
      'Puzzles':'INDOOR ACTIVITIES','Reading':'INDOOR ACTIVITIES','Movies':'INDOOR ACTIVITIES','ProducingMusic':'INDOOR ACTIVITIES','VideoGames':'INDOOR ACTIVITIES',
      'WorkJob':'OCCUPATION','Volunteering':'OCCUPATION','Leading':'OCCUPATION','Following':'OCCUPATION','Supervising':'OCCUPATION','Mentoring':'OCCUPATION',
      'Beer':'OTHER','Liquor':'OTHER','Alcohol':'OTHER','Smoking':'OTHER','Vaping':'OTHER',
      'Gardening':'OUTDOOR ACTIVITIES','Camping':'OUTDOOR ACTIVITIES','Fishing':'OUTDOOR ACTIVITIES','Hiking':'OUTDOOR ACTIVITIES','BeachLife':'OUTDOOR ACTIVITIES',
      'Friends':'PEOPLE','Family':'PEOPLE','Partner':'PEOPLE','Children':'PEOPLE','Pets':'PEOPLE','Romance':'PEOPLE',
      'Football':'SPORTS','Baseball':'SPORTS','Soccer':'SPORTS','Basketball':'SPORTS','Golf':'SPORTS','Tennis':'SPORTS','Pickleball':'SPORTS',
      'Cars':'TRANSPORTATION','Trucks':'TRANSPORTATION','Motorcycles':'TRANSPORTATION','Dirtbikes':'TRANSPORTATION','4Wheelers':'TRANSPORTATION','Trains':'TRANSPORTATION','Planes':'TRANSPORTATION',
      'Traveling':'TRAVEL','Flying':'TRAVEL','Cruises':'TRAVEL'
    };
    return mapping[field] || 'GENERAL';
  }

  const scriptureMap = {
    'GodJesusHolySpirit': 'Matthew 22:37 — "Love the Lord your God with all your heart..."',
    'Bible': '2 Timothy 3:16 — "All Scripture is God-breathed..."',
    'Prayer': 'Philippians 4:6 — "Do not be anxious about anything; in every situation, by prayer..."',
    'FamilyTime': 'Ephesians 6:1-4 — "Honor your father and mother..."',
    'CaringforOthers': 'Galatians 6:2 — "Carry each other\'s burdens..."',
    'WorshipPraise': 'Psalm 95:1 — "Come, let us sing for joy to the Lord..."',
    'Evangelism': 'Matthew 28:19 — "Go and make disciples of all nations."',
    'Church': 'Hebrews 10:24-25 — "Let us consider how we may spur one another on..."',
    'WorkJob': 'Colossians 3:23 — "Whatever you do, work at it with all your heart..."',
    'AloneTime': 'Mark 1:35 — "Very early in the morning, while it was still dark, Jesus got up..."',
    'Gardening': 'Genesis 2:15 — "The Lord God took the man and put him in the Garden of Eden to work it and take care of it."',
    'Fishing': 'Matthew 4:19 — "Follow me, and I will make you fishers of men."',
    'Music': 'Psalm 150:1 — "Praise the Lord. Praise God in his sanctuary..."'
  };

  function scriptureFor(field){
    if (scriptureMap[field]) return scriptureMap[field];
    if (/Prayer|Praying/i.test(field)) return scriptureMap['Prayer'];
    if (/Church|Worship|Praise|Evangelism|Preaching/i.test(field)) return scriptureMap['Church'];
    if (/Family|Children|Partner|Friends/i.test(field)) return scriptureMap['FamilyTime'];
    if (/Work|Job|Mentor|Supervis/i.test(field)) return scriptureMap['WorkJob'];
    if (/Garden|Camping|Fishing|Hiking|Beach/i.test(field)) return scriptureMap['Gardening'];
    if (/Music|Singing|PlayingMusic|ProducingMusic/i.test(field)) return scriptureMap['Music'];
    return 'Psalm 37:4 — "Delight yourself in the Lord, and he will give you the desires of your heart."';
  }

  function reflectionFor(field, score){
    const base = `You rated ${prettify(field)} ${score}/20.`;
    if (field === 'GodJesusHolySpirit') {
      return base + ' Consider how prayer, Scripture, and worship shape your daily decisions. What next step will deepen that relationship?';
    }
    if (/Family|Children|Partner|Friends/i.test(field)) {
      return base + ' Who in your circle needs more of your presence this season? Schedule one intentional conversation this week.';
    }
    if (/Work|Job|Career|Supervis/i.test(field)) {
      return base + ' Reflect whether your work aligns with your calling. What small change would increase meaning in your daily tasks?';
    }
    if (/Prayer|Bible|Church|Worship|Evangelism|Preaching/i.test(field)) {
      return base + ' How can you make space this week to practice this more intentionally (time, place, accountability)?';
    }
    if (/Exercise|Walking|Running|Gym|Yoga/i.test(field)) {
      return base + ' A consistent, small habit is more sustainable than a big burst. What 15-minute habit could you start?';
    }
    if (/Alcohol|Beer|Liquor|Smoking|Vaping/i.test(field)) {
      return base + ' Notice how this influences your relationships and spiritual life. What boundary or support would help you align choices with values?';
    }
    if (/Garden|Camping|Fishing|Hiking|Beach/i.test(field)) {
      return base + ' Time outdoors often restores perspective. Plan one short outdoor time this week to reflect and pray.';
    }
    return base + ' Consider one practical step to bring this value into clearer alignment with your faith and daily life.';
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

})();
