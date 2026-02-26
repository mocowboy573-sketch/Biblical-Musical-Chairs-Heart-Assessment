// script.js
// Values & Priorities Assessment — behavior script
// Requires the HTML structure where each checkbox has data-field="<FieldName>"
// and rating inputs use id starting with "rate_<FieldName>"

(() => {
  'use strict';

  const MAX_SELECT = 8;
  const container = document.getElementById('categories');
  const selectedCountEl = document.getElementById('selectedCount');
  const generateBtn = document.getElementById('generateBtn');
  const resetBtn = document.getElementById('resetBtn');
  const topContainer = document.getElementById('topContainer');
  const reflectionBlock = document.getElementById('reflectionBlock');
  const reflectionText = document.getElementById('reflectionText');

  // gather checkboxes inside the categories container
  const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"][data-field]'));

  // helper: find rating input for a given field name
  function ratingInputFor(field) {
    // prefer exact id match first
    const exact = document.getElementById('rate_' + field);
    if (exact) return exact;
    // fallback: any element whose id starts with rate_<field>
    return document.querySelector('[id^="rate_' + field + '"]');
  }

  // update selected count display
  function updateSelectedCount() {
    const count = checkboxes.filter(cb => cb.checked).length;
    selectedCountEl.textContent = String(count);
    // optionally disable generate button unless exactly MAX_SELECT
    // generateBtn.disabled = (count !== MAX_SELECT);
  }

  // prettify field names for display
  function prettify(field) {
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

  // map field -> category label (used in results)
  function categoryOfField(field) {
    const mapping = {
      'Religion':'BELIEFS','Culture':'BELIEFS','Science':'BELIEFS','Bible':'BELIEFS','GodJesusHolySpirit':'BELIEFS',
      'Evangelism':'BELIEFS','PreachingTeaching':'BELIEFS','Church':'BELIEFS','ChurchFamily':'BELIEFS','CaringforOthers':'BELIEFS',
      'Prayer':'BELIEFS','PrayingforOthers':'BELIEFS','MiraclesSignsWonders':'BELIEFS','WorshipPraise':'BELIEFS',

      'Cars':'COLLECTIONS','Collecting':'COLLECTIONS','Art':'COLLECTIONS','Antiques':'COLLECTIONS',

      'Walking':'EXERCISE','Running':'EXERCISE','LiftingWeights':'EXERCISE','Crossfit':'EXERCISE','GymTime':'EXERCISE','Yoga':'EXERCISE',

      'AloneTime':'HOME RELATED','BeingHome':'HOME RELATED','TravelingLocal':'HOME RELATED','Holidays':'HOME RELATED','FamilyTime':'HOME RELATED','SleepingNapping':'HOME RELATED',

      'Puzzles':'INDOOR ACTIVITIES','Reading':'INDOOR ACTIVITIES','Writing':'INDOOR ACTIVITIES','Journaling':'INDOOR ACTIVITIES','Movies':'INDOOR ACTIVITIES','ProducingMusic':'INDOOR ACTIVITIES',
      'WatchingTV':'INDOOR ACTIVITIES','VideoGames':'INDOOR ACTIVITIES','BoardCardGames':'INDOOR ACTIVITIES','Sewing':'INDOOR ACTIVITIES','Eating':'INDOOR ACTIVITIES','CookingBaking':'INDOOR ACTIVITIES',
      'Drawing':'INDOOR ACTIVITIES','Crafting':'INDOOR ACTIVITIES','DigitalCreator':'INDOOR ACTIVITIES','Sculpting':'INDOOR ACTIVITIES','Woodworking':'INDOOR ACTIVITIES','Acting':'INDOOR ACTIVITIES',
      'PlayingMusic':'INDOOR ACTIVITIES','DateNights':'INDOOR ACTIVITIES','Dancing':'INDOOR ACTIVITIES','SingingKaraoke':'INDOOR ACTIVITIES',

      'WorkJob':'OCCUPATION','Volunteering':'OCCUPATION','Leading':'OCCUPATION','Following':'OCCUPATION','Supervising':'OCCUPATION','Mentoring':'OCCUPATION',

      'Beer':'OTHER','Liquor':'OTHER','Alcohol':'OTHER','Smoking':'OTHER','Vaping':'OTHER',

      'Gardening':'OUTDOOR ACTIVITIES','Lawncare':'OUTDOOR ACTIVITIES','Driving':'OUTDOOR ACTIVITIES','Racing':'OUTDOOR ACTIVITIES','Cornhole':'OUTDOOR ACTIVITIES','Horseshoes':'OUTDOOR ACTIVITIES',
      'ScubaDiving':'OUTDOOR ACTIVITIES','Shopping':'OUTDOOR ACTIVITIES','BikeRiding':'OUTDOOR ACTIVITIES','Surfing':'OUTDOOR ACTIVITIES','Hunting':'OUTDOOR ACTIVITIES','BeachLife':'OUTDOOR ACTIVITIES',
      'Tanning':'OUTDOOR ACTIVITIES','Birdwatching':'OUTDOOR ACTIVITIES','Paintball':'OUTDOOR ACTIVITIES','Archery':'OUTDOOR ACTIVITIES','Photography':'OUTDOOR ACTIVITIES','OffRoading':'OUTDOOR ACTIVITIES',
      'Mudding':'OUTDOOR ACTIVITIES','Camping':'OUTDOOR ACTIVITIES','Fishing':'OUTDOOR ACTIVITIES','Hiking':'OUTDOOR ACTIVITIES',

      'Friends':'PEOPLE','Family':'PEOPLE','Partner':'PEOPLE','Children':'PEOPLE','Pets':'PEOPLE','Romance':'PEOPLE',

      'Football':'SPORTS','Baseball':'SPORTS','Soccer':'SPORTS','Basketball':'SPORTS','Golf':'SPORTS','Tennis':'SPORTS','Pickleball':'SPORTS','MartialArts':'SPORTS',
      'Bowling':'SPORTS','Skateboarding':'SPORTS','Swimming':'SPORTS','OtherSport':'SPORTS','Gymnastics':'SPORTS','Volleyball':'SPORTS',

      'Trucks':'TRANSPORTATION','Motorcycles':'TRANSPORTATION','Dirtbikes':'TRANSPORTATION','4Wheelers':'TRANSPORTATION','Trains':'TRANSPORTATION','Planes':'TRANSPORTATION',
      'Traveling':'TRAVEL','Flying':'TRAVEL','Cruises':'TRAVEL'
    };
    return mapping[field] || 'GENERAL';
  }

  // scripture map (concise)
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

  function scriptureFor(field) {
    if (scriptureMap[field]) return scriptureMap[field];
    if (/Prayer|Praying/i.test(field)) return scriptureMap['Prayer'];
    if (/Church|Worship|Praise|Evangelism|Preaching/i.test(field)) return scriptureMap['Church'];
    if (/Family|Children|Partner|Friends/i.test(field)) return scriptureMap['FamilyTime'];
    if (/Work|Job|Mentor|Supervis/i.test(field)) return scriptureMap['WorkJob'];
    if (/Garden|Camping|Fishing|Hiking|Beach/i.test(field)) return scriptureMap['Gardening'];
    if (/Music|Singing|PlayingMusic|ProducingMusic/i.test(field)) return scriptureMap['Music'];
    return 'Psalm 37:4 — "Delight yourself in the Lord, and he will give you the desires of your heart."';
  }

  // reflection generator
  function reflectionFor(field, score) {
    const name = prettify(field);
    const base = `You rated ${name} ${score}/20.`;
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

  // enforce selection limit and toggle rating inputs
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const field = cb.dataset.field;
      const rateEl = ratingInputFor(field);

      if (cb.checked) {
        const currently = checkboxes.filter(c => c.checked).length;
        if (currently > MAX_SELECT) {
          // revert and inform
          cb.checked = false;
          // small, clear feedback
          window.alert(`You may select exactly ${MAX_SELECT} items.`);
          return;
        }
        if (rateEl) {
          rateEl.disabled = false;
          // ensure a sensible default if empty
          if (!rateEl.value) rateEl.value = 10;
        }
      } else {
        if (rateEl) {
          rateEl.disabled = true;
          rateEl.value = 10;
        }
      }
      updateSelectedCount();
    });
  });

  // Reset behavior
  resetBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => {
      cb.checked = false;
      const rateEl = ratingInputFor(cb.dataset.field);
      if (rateEl) {
        rateEl.disabled = true;
        rateEl.value = 10;
      }
    });
    updateSelectedCount();
    topContainer.innerHTML = '';
    reflectionBlock.style.display = 'none';
  });

  // Generate results
  generateBtn.addEventListener('click', () => {
    const selected = checkboxes
      .filter(cb => cb.checked)
      .map(cb => {
        const field = cb.dataset.field;
        const rateEl = ratingInputFor(field);
        const raw = rateEl ? Number(rateEl.value) : NaN;
        const score = Number.isFinite(raw) ? Math.max(1, Math.min(20, Math.round(raw))) : 10;
        return { field, score };
      });

    if (selected.length !== MAX_SELECT) {
      window.alert(`Please select exactly ${MAX_SELECT} items before generating results. Currently selected: ${selected.length}.`);
      return;
    }

    // sort by score descending; tie-breaker: GodJesusHolySpirit prioritized
    selected.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.field === 'GodJesusHolySpirit' && b.field !== 'GodJesusHolySpirit') return -1;
      if (b.field === 'GodJesusHolySpirit' && a.field !== 'GodJesusHolySpirit') return 1;
      return a.field.localeCompare(b.field);
    });

    // render results
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

    // overall reflection: top three summary
    const topThree = selected.slice(0, 3).map(s => `${prettify(s.field)} (${s.score}/20)`);
    reflectionText.innerHTML = `Your top priorities are: <strong>${escapeHtml(topThree.join(', '))}</strong>. Pray and ask God to clarify how these priorities should shape your time, relationships, and decisions this week. Consider one concrete step for each top priority.`;
    reflectionBlock.style.display = 'block';
    reflectionBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // small utility to escape HTML when injecting text
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // initialize: disable all rating inputs until checked
  (function initRatings() {
    checkboxes.forEach(cb => {
      const rateEl = ratingInputFor(cb.dataset.field);
      if (rateEl) {
        rateEl.disabled = true;
        if (!rateEl.value) rateEl.value = 10;
      }
    });
    updateSelectedCount();
  })();

})();
