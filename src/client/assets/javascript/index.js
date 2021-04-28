// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined
};

const footiePlayers = [
  {
    name: "Messi",
    url:
      "https://e0.365dm.com/20/09/768x432/skysports-lionel-messi-barcelona_5113303.jpg?20200929233110"
  },
  {
    name: "Cristiano",
    url:
      "https://e0.365dm.com/20/07/1600x900/skysports-cristiano-ronaldo_5050722.jpg?20200726215349"
  },
  {
    name: "Dybala",
    url:
      "https://e0.365dm.com/20/01/1600x900/skysports-paulo-dybala-juventus_4901489.jpg?20200125084648"
  },
  {
    name: "Mbape",
    url:
      "https://i.pinimg.com/736x/7b/f7/3e/7bf73eccb3fae3a2bb3db10c2986fe13.jpg"
  },
  {
    name: "Kante",
    url:
      "https://icdn.psgtalk.com/wp-content/uploads/2021/03/ngolo-kante-wolverhampton-wanderers-v-chelsea-premier-league-2020.jpg"
  }
];

const stadiums = [
  {
    name: "Santiago Benabeu",
    capacity: "81044",
    Location: "Madrid",
    url:
      "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/madrid/estadio-bernabeu-vista-aerea-c-turismo-madrid.jpg_1014274486.jpg"
  },
  {
    name: "Camp Nou",
    capacity: "99354",
    Location: "Barcelona",
    url: "https://cdn.getyourguide.com/img/tour/5cd031d5654c4.jpeg/68.jpg"
  },
  {
    name: "Le Parc des Princes",
    capacity: "47929",
    Location: "Paris",
    url:
      "https://en.parisinfo.com/var/otcp/sites/images/node_43/node_51/node_77884/node_79219/visite-du-parc-des-princes-experience-paris-saint-germain-vue-a%C3%A9rienne-%7C-630x405-%7C-%C2%A9-otcp-dr/16052576-1-fre-FR/Visite-du-Parc-des-Princes-Experience-Paris-Saint-Germain-Vue-a%C3%A9rienne-%7C-630x405-%7C-%C2%A9-OTCP-DR.jpg"
  },
  {
    name: "Allianz Arena",
    capacity: "75200",
    Location: "Munich",
    url:
      "https://www.fifaultimateteam.it/en/wp-content/uploads/2019/07/allianz-2.jpg"
  },
  {
    name: "Emirates Stadium",
    capacity: "60260",
    Location: "London",
    url:
      "https://www.arsenal.com/sites/default/files/styles/desktop_16x9/public/images/gun__1357737628_emirates_stadium2.jpg?itok=Bl47Prbp"
  },
  {
    name: "Stamford Bridge",
    capacity: "41837",
    Location: "London",
    url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Stamford_Bridge_Clear_Skies.JPG/1200px-Stamford_Bridge_Clear_Skies.JPG"
  }
];

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then(tracks => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then(racers => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function(event) {
      const { target } = event;

      // Race track form field
      if (target.matches(".card.track")) {
        console.log("card");
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches(".card.podracer")) {
        console.log("car");
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise(resolve => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI
  const { player_id, track_id } = store;

  try {
    const race = await createRace(player_id, track_id);
    //const data = await race.json();
    store.race_id = parseInt(race.ID) - 1;
    renderAt("#race", renderRaceStartView(race.Track, race.Cars));

    const waitCountDown = await runCountdown();
    const raceStart = await startRace(store.race_id);
    const runTheRace = await runRace(store.race_id);
    //console.log(race);
  } catch (e) {
    console.log(e);
  }
}

function runRace(raceID) {
  return new Promise(resolve => {
    const myInterval = setInterval(async () => {
      try {
        const res = await getRace(raceID);
        //const data = await response.json();
        if (res.status === "in-progress") {
          renderAt("#leaderBoard", raceProgress(res.positions));
          return;
        }
        clearInterval(myInterval); // clear the interval
        renderAt("#race", resultsView(res.positions)); // to render the results view
        resolve(res); // resolve the promise
      } catch (e) {
        console.log(e);
      }
    }, 500);
  });
  // remember to add error handling for the Promise
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise(resolve => {
      const myInterval = setInterval(() => {
        document.getElementById("big-numbers").innerHTML = --timer;
        if (timer === 0) {
          clearInterval(myInterval);
          return resolve();
        }

        //return;
      }, 1000);
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSelectPodRacer(target) {
  console.log("selected a pod", target.id);

  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
  console.log("selected a track", target.id);

  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
  store.track_id = parseInt(target.id);
}

function handleAccelerate() {
  //console.log("accelerate button clicked");
  accelerate(store.race_id).then(() => console.log("accelerated"));
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling, url } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3> ${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p> Acceleration: ${acceleration}</p>
      <p>Handling: ${handling}</p>
      <img src="${url}" width="200" height="300">
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name, capacity, location, url } = track;

  return `
		<li id="${id}" class="card track">
      <h3>${name}</h3>
      <h3>Capacity: ${capacity}</h3>
      <h3>Location: ${location}</h3>
      <img src="${url}" width="200" height="300">
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  console.log(track);
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  positions.map((e, index) => (e.driver_name = footiePlayers[index].name));
  let userPlayer = positions.find(e => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map(p => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER
    }
  };
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

async function getTracks() {
  try {
    //http://localhost:8000/api/cars
    const response = await fetch(`${SERVER}/api/tracks`);
    const data = await response.json();
    data.map((e, index) => {
      //console.log(e);
      e.name = stadiums[index].name;
      e.capacity = stadiums[index].capacity;
      e.location = stadiums[index].Location;
      e.url = stadiums[index].url;
    });
    //console.log(data);
    return data; // return the data to use it later
  } catch (error) {
    console.log(`Problem with getRacers request::`, error.message);
    console.error(error);
  }
}

async function getRacers() {
  try {
    //http://localhost:8000/api/cars
    const response = await fetch(`${SERVER}/api/cars`);
    const data = await response.json();
    data.map((e, index) => {
      e.url = footiePlayers[index].url;
      e.driver_name = footiePlayers[index].name;
    });
    return data;
  } catch (error) {
    console.log(`Problem with getRacers request::`, error.message);
    console.error(error);
  }
}

async function createRace(player_id, track_id) {
  try {
    const body = { player_id, track_id };
    const response = await fetch(`${SERVER}/api/races`, {
      method: "POST",
      ...defaultFetchOpts(),
      dataType: "jsonp",
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Problem with createRace request::", err);
    console.error(error);
  }
}

async function getRace(id) {
  // GET request to `${SERVER}/api/races/${id}`

  try {
    const response = await fetch(`${SERVER}/api/races/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(`Problem with getRace request::`, error.message);
    console.error(error);
  }
}

async function startRace(id) {
  try {
    const response = await fetch(`${SERVER}/api/races/${id}/start`, {
      method: "POST",
      ...defaultFetchOpts()
    });
    console.log(`the id is ${id}`);
    //const data = await response.json();
    //return data;
  } catch (error) {
    console.log(`Problem with startRace request::`, error.message);
    console.error(error);
    return error;
  }
}

async function accelerate(id) {
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body or datatype needed for this request

  try {
    const response = await fetch(`${SERVER}/api/races/${id}/accelerate`, {
      method: "POST"
      //...defaultFetchOpts()
    });
  } catch (e) {
    console.log("Problem with accelerate request::", err);
  }
}
