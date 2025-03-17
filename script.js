const headertext = document.querySelector('.header_text');
headertext.classList.add('visible');

const API_BASE_URL = "https://ac1ofznmkj.execute-api.us-east-2.amazonaws.com/prod";


// DOM elements
const loginBtn = document.getElementById("login-btn");
const profileBtn = document.getElementById("profile-btn");
const tracksBtn = document.getElementById("tracks-btn");
const analysisBtn = document.getElementById("analysis-btn");
const clearBtn = document.getElementById("clear-btn");
const authStatus = document.getElementById("auth-status");
const actionButtons = document.getElementById("action-buttons");
const consoleOutput = document.getElementById("console-output");

// Add event listeners
loginBtn.addEventListener("click", handleLogin);
profileBtn.addEventListener("click", () => fetchData("profile"));
tracksBtn.addEventListener("click", () => fetchData("tracks"));
analysisBtn.addEventListener("click", () => fetchData("analysis"));
clearBtn.addEventListener("click", clearConsole);

// Calls lambda function from my AWS, which authorizes
function handleLogin() {
    authStatus.textContent = "Connecting to Spotify...";
    window.location.href = `${API_BASE_URL}/auth`;
}

// Extract query params from URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        error: params.get("error")
    };
}

// Currently gets mock data, I haven't implemented the fetch-data api yet
function fetchData(dataType) {
    const token = localStorage.getItem("spotify_access_token");
    
    if (!token) {
        writeToConsole("Error: Not logged in. Please login with Spotify first.");
        return;
    }
    
    writeToConsole(`Fetching your ${dataType} data...`);
    
    setTimeout(() => {
        const data = getMockData(dataType);
        displayData(dataType, data);
    }, 500);
    
    /*
    // API endpoints for different data types will uncomment out once added
    const endpoints = {
        profile: `${API_BASE_URL}/user-profile`,
        tracks: `${API_BASE_URL}/top-tracks`,
        analysis: `${API_BASE_URL}/analyze-music`
    };
    
    fetch(endpoints[dataType], {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayData(dataType, data);
    })
    .catch(error => {
        writeToConsole(`Error fetching ${dataType}: ${error.message}`);
    });
    */
}

// Function to display formatted data in the console
function displayData(dataType, data) {
    switch (dataType) {
        case "profile":
            displayProfile(data);
            break;
        case "tracks":
            displayTracks(data);
            break;
        case "analysis":
            displayAnalysis(data);
            break;
    }
}

// Function to display profile data
function displayProfile(data) {
    const profile = data.profile;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Spotify Profile Data</h3>`;
    output += `<table class="data-table">`;
    output += `<tr><th>Display Name</th><td>${profile.display_name}</td></tr>`;
    output += `<tr><th>Followers</th><td>${profile.followers.total}</td></tr>`;
    output += `<tr><th>Email</th><td>${profile.email || 'Not available'}</td></tr>`;
    output += `<tr><th>Country</th><td>${profile.country || 'Not available'}</td></tr>`;
    output += `</table>`;
    output += `</div>`;
    
    writeToConsole(output);
}

// Function to display top tracks
function displayTracks(data) {
    const tracks = data.topTracks.items;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Your Top Tracks</h3>`;
    output += `<table class="data-table">`;
    output += `<tr><th>#</th><th>Track</th><th>Artist</th><th>Album</th></tr>`;
    
    tracks.slice(0, 10).forEach((track, index) => {
        output += `<tr>`;
        output += `<td>${index + 1}</td>`;
        output += `<td>${track.name}</td>`;
        output += `<td>${track.artists.map(a => a.name).join(', ')}</td>`;
        output += `<td>${track.album.name}</td>`;
        output += `</tr>`;
    });
    
    output += `</table>`;
    output += `</div>`;
    
    writeToConsole(output);
}

// Function to display music analysis
function displayAnalysis(data) {
    const analysis = data.analysis;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Your Music Analysis</h3>`;
    
    output += `<h4>Top Genres</h4>`;
    output += `<table class="data-table">`;
    output += `<tr><th>Genre</th><th>Percentage</th></tr>`;
    
    Object.entries(analysis.genres)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([genre, percentage]) => {
            output += `<tr><td>${genre}</td><td>${percentage}%</td></tr>`;
        });
    
    output += `</table>`;
    
    // Audio features
    output += `<h4>Audio Features</h4>`;
    output += `<table class="data-table">`;
    output += `<tr><th>Feature</th><th>Score</th></tr>`;
    output += `<tr><td>Energy</td><td>${analysis.audioFeatures.energy}%</td></tr>`;
    output += `<tr><td>Danceability</td><td>${analysis.audioFeatures.danceability}%</td></tr>`;
    output += `<tr><td>Positivity (Valence)</td><td>${analysis.audioFeatures.valence}%</td></tr>`;
    output += `</table>`;
    
    output += `</div>`;
    
    writeToConsole(output);
}

// Function to write to the console
function writeToConsole(message) {
    // If it's just text, wrap it in a div
    if (!message.startsWith('<')) {
        message = `<div class="console-entry"><div class="timestamp">${new Date().toLocaleTimeString()}</div>${message}</div>`;
    }
    
    // Prepend the new message at the top
    consoleOutput.innerHTML = message + consoleOutput.innerHTML;
}

// Function to clear the console
function clearConsole() {
    consoleOutput.innerHTML = '<p>Console cleared.</p>';
}

// Function to get mock data (for testing without API as I haven't implemented it yet)
function getMockData(dataType) {
    const mockData = {
        profile: {
            profile: {
                display_name: "Spotify User",
                followers: { total: 42 },
                email: "user@example.com",
                country: "US",
                images: [{ url: "https://via.placeholder.com/100" }]
            }
        },
        tracks: {
            topTracks: {
                items: [
                    {
                        name: "Track 1",
                        artists: [{ name: "Artist 1" }],
                        album: { name: "Album 1", images: [{ url: "" }] }
                    },
                    {
                        name: "Track 2",
                        artists: [{ name: "Artist 2" }],
                        album: { name: "Album 2", images: [{ url: "" }] }
                    },
                    {
                        name: "Track 3",
                        artists: [{ name: "Artist 3" }],
                        album: { name: "Album 3", images: [{ url: "" }] }
                    },
                    {
                        name: "Track 4",
                        artists: [{ name: "Artist 4" }],
                        album: { name: "Album 4", images: [{ url: "" }] }
                    },
                    {
                        name: "Track 5",
                        artists: [{ name: "Artist 5" }],
                        album: { name: "Album 5", images: [{ url: "" }] }
                    }
                ]
            }
        },
        analysis: {
            analysis: {
                genres: {
                    "pop": 35,
                    "rock": 25,
                    "indie": 20,
                    "hip hop": 10,
                    "electronic": 10
                },
                audioFeatures: {
                    danceability: 72,
                    energy: 65,
                    valence: 58
                }
            }
        }
    };
    
    return mockData[dataType];
}

// Check for tokens on page load
window.onload = function() {
    const params = getQueryParams();
    
    if (params.error) {
        // Handle authentication error
        authStatus.textContent = `Error: ${params.error}`;
        writeToConsole(`Authentication error: ${params.error}`);
        return;
    }
    
    if (params.access_token) {
        // Save tokens to localStorage
        localStorage.setItem("spotify_access_token", params.access_token);
        if (params.refresh_token) {
            localStorage.setItem("spotify_refresh_token", params.refresh_token);
        }
        
        // Update UI to show logged in state
        authStatus.textContent = "Logged in successfully!";
        actionButtons.style.display = "flex";
        
        // Write success message to console
        writeToConsole("Successfully logged in with Spotify! Click the buttons above to fetch your data.");
        
        // Remove tokens from URL for security
        window.history.replaceState({}, document.title, "/");
    } else {
        // Check if we have a token in localStorage (means already logged in)
        const savedToken = localStorage.getItem("spotify_access_token");
        if (savedToken) {
            authStatus.textContent = "Already logged in!";
            actionButtons.style.display = "flex";
            writeToConsole("You're already logged in! Click the buttons above to fetch your data.");
        }
    }
};