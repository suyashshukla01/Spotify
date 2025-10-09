let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentSongIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        let res = await fetch(`songs/${folder}/info.json`);
        let info = await res.json();
        songs = info.songs;

        let songUL = document.querySelector(".songList ul");
        let songsHTML = "";
        songs.forEach((song, index) => {
            songsHTML += `
                <li data-index="${index}">
                    <img class="invert" width="34" src="img/music.svg" alt="Music icon">
                    <div class="info">
                        <div>${decodeURIComponent(song)}</div>
                        <div>Artist Name</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="Play now icon">
                    </div>
                </li>`;
        });
        songUL.innerHTML = songsHTML;

    } catch (err) {
        console.error("Error loading songs:", err);
    }
}

function playSong(track, pause = false) {
    currentSong.src = `songs/${currFolder}/${track}`;
    currentSongIndex = songs.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    let folders = ["playlist01", "playlist02", "playlist03", "playlist04"];
    let cardsHTML = "";

    for (let folder of folders) {
        try {
            let res = await fetch(`songs/${folder}/info.json`);
            let info = await res.json();
            cardsHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" alt="${info.title} cover art">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
        } catch (err) {
            console.error(`Error loading album ${folder}:`, err);
        }
    }
    cardContainer.innerHTML = cardsHTML;
}

async function main() {
    await getSongs("playlist04");
    if (songs.length > 0) {
        playSong(songs[0], true);
    }
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percent * 100 + "%";
        currentSong.currentTime = currentSong.duration * percent;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            playSong(songs[currentSongIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            playSong(songs[currentSongIndex + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });

    document.querySelector(".cardContainer").addEventListener("click", async (event) => {
        const card = event.target.closest(".card");
        if (card) {
            await getSongs(card.dataset.folder);
            if (songs.length > 0) {
                playSong(songs[0]);
            }
        }
    });

    document.querySelector(".songList ul").addEventListener("click", (event) => {
        const li = event.target.closest("li");
        if (li) {
            const index = parseInt(li.dataset.index);
            playSong(songs[index]);
        }
    });
}

main();