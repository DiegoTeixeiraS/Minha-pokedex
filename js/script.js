const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');
const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
let searchPokemon = 1;

const typeTranslations = {
    normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico", grass: "Grama", ice: "Gelo",
    fighting: "Lutador", poison: "Veneno", ground: "Terrestre", flying: "Voador", psychic: "Psíquico",
    bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio", steel: "Aço", fairy: "Fada"
};

const fetchPokemon = async (pokemon) => {
    try {
        const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        return APIResponse.status === 200 ? await APIResponse.json() : null;
    } catch (error) {
        console.error("Erro ao buscar o Pokémon:", error);
    }
};

const fetchEvolutionChain = async (speciesUrl) => {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Extrair pré-evoluções e evoluções
        const evolutionStages = [];
        let currentEvolution = evolutionData.chain;

        // Armazenar cada estágio da evolução
        while (currentEvolution) {
            evolutionStages.push(currentEvolution.species.name);
            currentEvolution = currentEvolution.evolves_to[0];
        }

        return evolutionStages;
    } catch (error) {
        console.error("Erro ao buscar a cadeia de evolução:", error);
        return [];
    }
};

function traduzirTipos(tipos) {
    return tipos.map((typeInfo) => typeTranslations[typeInfo.type.name] || typeInfo.type.name).join(", ");
}

function sintetizarVoz(texto, voz, taxa = 1) {
    responsiveVoice.speak(texto, voz, {rate: taxa});
}

const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading...';
    pokemonNumber.innerHTML = '';

    const data = await fetchPokemon(pokemon);
    
    if (data) {
        pokemonImage.style.display = 'block';
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
        pokemonImage.src = data.sprites.versions["generation-v"]["black-white"]["animated"].front_default || 'path/to/fallback-image.png';
        input.value = '';
        searchPokemon = data.id;

        const pokemonTypes = traduzirTipos(data.types);

        // Obter a cadeia de evolução completa
        const evolutionStages = await fetchEvolutionChain(data.species.url);

        // Dividir em pré-evoluções e evoluções
        const currentIndex = evolutionStages.indexOf(data.name);
        const preEvolutions = evolutionStages.slice(0, currentIndex).join(", ");
        const evolutions = evolutionStages.slice(currentIndex + 1).join(", ");

        // Sintetizar voz com nome, tipo e evoluções separadas
        responsiveVoice.speak(`Pokémon:`, 'Brazilian Portuguese Female', {rate: 1.2});
        responsiveVoice.speak(`${data.name}`, 'US English Male', {rate: 0.8});
        responsiveVoice.speak(`Número ${data.id}, Tipo: ${pokemonTypes}`, 'Brazilian Portuguese Female', {rate: 1.2});

        if (preEvolutions) {
            responsiveVoice.speak(`Pré-evoluções:`, 'Brazilian Portuguese Female', {rate: 1.2});
            responsiveVoice.speak(`${preEvolutions}`, 'US English Male', {rate: 0.8});
        }
        
        if (evolutions) {
            responsiveVoice.speak(`Evoluções:`, 'Brazilian Portuguese Female', {rate: 1.2});
            responsiveVoice.speak(`${evolutions}`, 'US English Male', {rate: 0.8});
        } else {
            responsiveVoice.speak(`Este Pokémon não possui evoluções.`, 'Brazilian Portuguese Female', {rate: 1.2});
        }
    } else {
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Não encontrado &#128532;';
        pokemonNumber.innerHTML = '';
        responsiveVoice.speak('Pokémon não encontrado', 'Brazilian Portuguese Female', 1.2);
    }
};

// Função de sugestão de Pokémon
const fetchPokemonSuggestions = async (query) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        const data = await response.json();
        const filteredPokemons = data.results.filter(pokemon => pokemon.name.startsWith(query));
        return filteredPokemons.map(pokemon => pokemon.name);
    } catch (error) {
        console.error("Erro ao buscar sugestões de Pokémon:", error);
        return [];
    }
};

// Atualiza as sugestões enquanto o usuário digita
input.addEventListener('input', async () => {
    const query = input.value.toLowerCase();
    if (query.length >= 1) {
        const suggestions = await fetchPokemonSuggestions(query);
        const dataList = document.getElementById('pokemonSuggestions');
        dataList.innerHTML = ''; // Limpa as sugestões anteriores
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            dataList.appendChild(option);
        });
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }    
});

buttonNext.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});

renderPokemon(searchPokemon);
