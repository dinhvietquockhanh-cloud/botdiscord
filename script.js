const TYPE_CHART = {
    fire: { water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2, fire: 0.5, fairy: 0.5 },
    water: { fire: 2, grass: 0.5, ground: 2, rock: 2, dragon: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
    grass: { fire: 0.5, water: 2, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, steel: 0.5, grass: 0.5 },
    electric: { water: 2, grass: 0.5, ground: 0, flying: 2, dragon: 0.5, electric: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
    fighting: { normal: 2, ice: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5, fighting: 1 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5, ground: 1 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0, fire: 0.5, water: 0.5, grass: 0.5, electric: 0.5 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5, normal: 0.5, grass: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, dragon: 0.5, poison: 0 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    normal: { ghost: 0, rock: 0.5, steel: 0.5 }
};

const GEN_RANGES = { "1": [1, 151], "2": [152, 251], "3": [252, 386], "4": [387, 493], "5": [494, 649], "6": [650, 721], "7": [722, 802] };
let allPokemon = [];

// Hàm lấy link GIF 3D từ Showdown
function getShowdownGif(name) {
    return `https://play.pokemonshowdown.com/sprites/ani/${name.toLowerCase().replace(/ /g, '')}.gif`;
}

async function init() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=802');
        const data = await res.json();
        const promises = data.results.map(p => fetch(p.url).then(r => r.json()));
        allPokemon = await Promise.all(promises);
        render(allPokemon);
        document.getElementById('loading').style.display = 'none';
    } catch (e) { document.getElementById('loading').innerText = "Lỗi nạp dữ liệu!"; }
}

function render(list) {
    const pokedex = document.getElementById('pokedex');
    pokedex.innerHTML = list.map(p => `
        <div class="card" onclick="openModal(${p.id})">
            <img src="${getShowdownGif(p.name)}" 
                 onerror="this.src='${p.sprites.other['official-artwork'].front_default}'" 
                 alt="${p.name}" style="height:100px; object-fit:contain">
            <p style="opacity:0.5; font-weight:bold; margin:0">#${p.id}</p>
            <h3 style="text-transform:capitalize">${p.name}</h3>
            <div class="types">${p.types.map(t => `<span class="type-badge ${t.type.name}">${t.type.name}</span>`).join('')}</div>
        </div>
    `).join('');
}

function getTier(p) {
    const bst = p.stats.reduce((acc, s) => acc + s.base_stat, 0);
    if (bst > 590 || p.base_experience > 250) return "UBER";
    if (bst > 520) return "OU";
    return "UU";
}

async function getItemSprite(itemName) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/item/${itemName.toLowerCase().replace(/ /g, '-')}`);
        const data = await res.json();
        return data.sprites.default;
    } catch (e) { return null; }
}

function calcWeakness(pTypes) {
    let res = {}; Object.keys(TYPE_CHART).forEach(t => res[t] = 1);
    pTypes.forEach(pt => {
        Object.keys(TYPE_CHART).forEach(at => {
            if (TYPE_CHART[at][pt] !== undefined) res[at] *= TYPE_CHART[at][pt];
        });
    });
    return res;
}

function renderTypeDefenses(weaknesses) {
    const types = Object.keys(TYPE_CHART);
    return `
        <div class="defense-grid">
            ${types.map(t => {
                const m = weaknesses[t];
                let mClass = (m === 4) ? "m-4" : (m === 2) ? "m-2" : (m === 0.5) ? "m-05" : (m === 0.25) ? "m-025" : (m === 0) ? "m-0" : "";
                return `
                    <div class="defense-item">
                        <span class="type-badge ${t}" style="margin:0; width:40px; padding:3px 0; font-size:0.6rem">${t.substring(0,3)}</span>
                        <span class="defense-multiplier ${mClass}">${m === 1 ? '-' : m + 'x'}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function getEvolutionChain(pokemonId) {
    try {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesRes.json();
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        let chain = [];
        let curr = evoData.chain;
        while (curr) {
            const name = curr.species.name;
            const id = curr.species.url.split('/').filter(Boolean).pop();
            chain.push({
                name: name, id: id,
                gif: getShowdownGif(name),
                fallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                level: curr.evolution_details[0]?.min_level || null
            });
            curr = curr.evolves_to[0];
        }
        return chain;
    } catch (e) { return []; }
}

async function openModal(id) {
    const p = allPokemon.find(x => x.id === id) || await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json());
    renderModalContent(p);
}

async function changeForm(url) {
    const res = await fetch(url);
    const data = await res.json();
    renderModalContent(data);
}

async function renderModalContent(p) {
    const weaknesses = calcWeakness(p.types.map(t => t.type.name));
    const tier = getTier(p);
    const evoChain = await getEvolutionChain(p.id > 10000 ? p.species.url.split('/').filter(Boolean).pop() : p.id);
    const heightM = p.height / 10;
    const weightKg = p.weight / 10;

    let megaButtons = '';
    try {
        const baseId = p.id > 10000 ? p.species.url.split('/').filter(Boolean).pop() : p.id;
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${baseId}`);
        const speciesData = await speciesRes.json();
        if (speciesData.varieties.length > 1) {
            megaButtons = `<div style="display:flex; gap:10px; margin-bottom:20px; justify-content:center; flex-wrap:wrap">`;
            speciesData.varieties.forEach(v => {
                megaButtons += `<button class="form-btn ${p.name === v.pokemon.name ? 'active' : ''}" onclick="changeForm('${v.pokemon.url}')">${v.pokemon.name.replace(/-/g, ' ')}</button>`;
            });
            megaButtons += `</div>`;
        }
    } catch (e) {}

    const item1 = "leftovers", item2 = p.stats[5].base_stat > 100 ? "choice-scarf" : "life-orb";
    const [img1, img2] = await Promise.all([getItemSprite(item1), getItemSprite(item2)]);

    document.getElementById('modal-body').innerHTML = `
        ${megaButtons}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
            <span class="tier ${tier.toLowerCase()}">${tier}</span>
            <h2 style="text-transform:capitalize; margin:0">#${p.id > 10000 ? 'FORM' : p.id} ${p.name.replace(/-/g, ' ')}</h2>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:30px">
            <div style="text-align:center">
                <img src="${getShowdownGif(p.name)}" 
                     onerror="this.src='${p.sprites.other['official-artwork'].front_default || p.sprites.front_default}'" 
                     style="width:100%; max-width:200px; height:200px; object-fit:contain">
                <div style="display:flex; justify-content:center; gap:10px; margin-top:10px">
                    ${p.types.map(t => `<span class="type-badge ${t.type.name}" style="padding:8px 15px">${t.type.name}</span>`).join('')}
                </div>
                <h3 style="text-align:left; border-left:4px solid #3b82f6; padding-left:10px; margin-top:25px">Type Defenses</h3>
                ${renderTypeDefenses(weaknesses)}
                <h3 style="text-align:left; border-left:4px solid #10b981; padding-left:10px; margin-top:25px">Evolution Line</h3>
                <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-top:15px; background:rgba(255,255,255,0.03); padding:20px; border-radius:15px">
                    ${evoChain.map((evo, index) => `
                        <div style="text-align:center; cursor:pointer" onclick="openModal(${evo.id})">
                            <img src="${evo.gif}" onerror="this.src='${evo.fallback}'" style="width:50px; height:50px; object-fit:contain">
                            <div style="font-size:0.7rem; text-transform:capitalize; font-weight:bold; margin-top:5px">${evo.name}</div>
                            ${evo.level ? `<div style="font-size:0.6rem; color:var(--accent)">Lv.${evo.level}</div>` : ''}
                        </div>
                        ${index < evoChain.length - 1 ? '<span style="opacity:0.3; font-size:1.2rem; margin-bottom:20px">➔</span>' : ''}
                    `).join('')}
                </div>
            </div>
            <div>
                <h3 style="border-left:4px solid var(--primary); padding-left:10px">Physical Traits</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px">
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; text-align:center; border:1px solid var(--border)">
                        <div style="font-size:0.6rem; color:var(--accent); font-weight:bold">HEIGHT</div><div>${heightM} m</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:12px; text-align:center; border:1px solid var(--border)">
                        <div style="font-size:0.6rem; color:var(--accent); font-weight:bold">WEIGHT</div><div>${weightKg} kg</div>
                    </div>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:20px">
                    <p style="margin:0 0 10px 0"><strong>Abilities:</strong></p>
                    ${p.abilities.map(a => `<div style="text-transform:capitalize; font-size:0.9rem; margin-bottom:5px">⚡ ${a.ability.name.replace('-', ' ')} ${a.is_hidden ? '<span style="color:var(--accent)">[H]</span>' : ''}</div>`).join('')}
                </div>
                <div style="display:flex; gap:10px; margin-bottom:20px">
                    <div class="item-container" style="flex:1; margin:0"><img src="${img1}" class="item-icon"><span>${item1}</span></div>
                    <div class="item-container" style="flex:1; margin:0"><img src="${img2}" class="item-icon"><span>${item2}</span></div>
                </div>
                <h3 style="border-left:4px solid var(--accent); padding-left:10px">Base Stats</h3>
                ${p.stats.map((s, i) => `
                    <div style="margin-bottom:12px">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold">
                            <span>${s.stat.name.toUpperCase()}</span><span>${s.base_stat}</span>
                        </div>
                        <div class="stat-bar-container"><div class="stat-bar" id="bar-${i}" data-width="${(s.base_stat/255)*100}%"></div></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.getElementById('modal-overlay').style.display = 'flex';
    setTimeout(() => { p.stats.forEach((_, i) => { const b = document.getElementById(`bar-${i}`); if(b) b.style.width = b.dataset.width; }); }, 100);
}

function handleFilters() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const gen = document.getElementById('gen-filter').value;
    let filtered = allPokemon;
    if (gen !== 'all') { const [start, end] = GEN_RANGES[gen]; filtered = filtered.filter(p => p.id >= start && p.id <= end); }
    if (query) { filtered = filtered.filter(p => p.name.includes(query) || p.id.toString() === query || p.types.some(t => t.type.name === query) || getTier(p).toLowerCase() === query); }
    render(filtered);
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
document.getElementById('search').addEventListener('input', handleFilters);
document.getElementById('gen-filter').addEventListener('change', handleFilters);
init();