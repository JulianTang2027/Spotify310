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
const logoutBtn = document.getElementById("logout-btn")

// Event listeners
loginBtn.addEventListener("click", handleLogin);
profileBtn.addEventListener("click", () => fetchData("user-profile"));
tracksBtn.addEventListener("click", () => fetchData("top-tracks"));
analysisBtn.addEventListener("click", () => analyze());
clearBtn.addEventListener("click", clearConsole);
logoutBtn.addEventListener("click", logout);

// Logout function, removes access and refresh tokens
function logout() {
    // Clear tokens from localStorage
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    
    // Update UI to show logged out state
    authStatus.textContent = "Logged out";
    actionButtons.style.display = "none";
    
    // Write to console to show that the user has logged out
    writeToConsole("Logged out successfully. Please login again to access your Spotify data.");
}

function analyze() {
    const token = localStorage.getItem("spotify_access_token");
    
    if (!token) {
        writeToConsole("Error: Not logged in. Please login with Spotify first.");
        return;
    }
    writeToConsole("Analyzing your music taste...");
    
    // Call the analyzer lambda function, using the access token
    const url = `${API_BASE_URL}/analyzer?access_token=${token}`;
    
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Call display analysis helper function to write to console
        displayAnalysis({"analysis": data});
    })
    .catch(error => {
        writeToConsole(`Error analyzing music: ${error.message}`);
        console.error(error);
    });
}

// Calls lambda function from my AWS, spotify_auth in order to authorize
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

// Fetchdata helper function
function fetchData(dataType) {
    const token = localStorage.getItem("spotify_access_token");
    
    if (!token) {
        writeToConsole("Error: Not logged in. Please login with Spotify first.");
        return;
    }
    
    writeToConsole(`Fetching your ${dataType} data...`);
    
    // Calls lambda function from my AWS, spotifyfetch-data in order to get user data 
    const url = `${API_BASE_URL}/fetch-data?access_token=${token}&type=${dataType}`;
    
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Process and display the data
        switch(dataType) {
            case "user-profile":
                displayProfile({"profile": data});
                break;
            case "top-tracks":
                displayTracks({"topTracks": data});
                break;
            default:
                writeToConsole(`Received data for ${dataType}, but don't know how to display it.`);
                console.log(data); // General debugging statement, realistically should never enter this
        }
    })
    .catch(error => {
        writeToConsole(`Error fetching ${dataType}: ${error.message}`);
        console.error(error);
    });
}

// Process raw Spotify data into the format needed for analysis display
function processAnalysisData(data) {
    // If data already has the right structure, just return it
    if (data.genres && data.audioFeatures) {
        return data;
    }
    
    // For other formats, just pass through the data as is
    // The Lambda should handle most of the processing
    return data;
}

// Function to display profile data
function displayProfile(data) {
    const profile = data.profile;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Spotify Profile Data</h3>`;
    output += `<table class="data-table">`;
    output += `<tr><th>Display Name</th><td>${profile.display_name}</td></tr>`;
    output += `<tr><th>Followers</th><td>${profile.followers?.total || 0}</td></tr>`;
    output += `<tr><th>Email</th><td>${profile.email || 'Not available'}</td></tr>`;
    output += `<tr><th>Country</th><td>${profile.country || 'Not available'}</td></tr>`;
    output += `</table>`;
    output += `</div>`;
    
    writeToConsole(output);
}

// Helper function to display top tracks
function displayTracks(data) {
    const tracks = data.topTracks.items;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Your Top Tracks</h3>`;
    output += `<table class="data-table">`;
    output += `<tr><th>#</th><th>Track</th><th>Artist</th><th>Album</th></tr>`;
    
    if (tracks && tracks.length > 0) {
        tracks.slice(0, 10).forEach((track, index) => {
            output += `<tr>`;
            output += `<td>${index + 1}</td>`;
            output += `<td>${track.name}</td>`;
            output += `<td>${track.artists.map(a => a.name).join(', ')}</td>`;
            output += `<td>${track.album.name}</td>`;
            output += `</tr>`;
        });
    } else {
        output += `<tr><td colspan="4">No tracks found</td></tr>`;
    }
    
    output += `</table>`;
    output += `</div>`;
    
    writeToConsole(output);
}

// Helper function to display music analysis
function displayAnalysis(data) {
    const analysis = data.analysis;
    let output = `<div class="console-entry">`;
    output += `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    output += `<h3>Your Music Analysis</h3>`;
    
    // Genres section
    output += `<h4>Top Genres</h4>`;
    output += `<table class="data-table">`;
    output += `<tr><th>Genre</th><th>Percentage</th></tr>`;
    
    if (analysis.genres && Object.keys(analysis.genres).length > 0) {
        Object.entries(analysis.genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([genre, percentage]) => {
                output += `<tr><td>${genre}</td><td>${percentage}%</td></tr>`;
            });
    } else {
        output += `<tr><td colspan="2">No genre data available</td></tr>`;
    }
    
    output += `</table>`;
    
    // Top Artists section
    if (analysis.topArtists && analysis.topArtists.length > 0) {
        output += `<h4>Your Top Artists</h4>`;
        output += `<table class="data-table">`;
        output += `<tr><th>#</th><th>Artist</th><th>Popularity</th></tr>`;
        
        analysis.topArtists.forEach((artist, index) => {
            output += `<tr>`;
            output += `<td>${index + 1}</td>`;
            output += `<td>${artist.name}</td>`;
            output += `<td>${artist.popularity}/100</td>`;
            output += `</tr>`;
        });
        
        output += `</table>`;
    }
    
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

// Check for tokens on page load
window.onload = function() {
    const params = getQueryParams();
    
    if (params.error) {
        // If authentication error, write to console
        authStatus.textContent = `Error: ${params.error}`;
        writeToConsole(`Authentication error: ${params.error}`);
        return;
    }
    
    if (params.access_token) {
        // Otherwise, we save the tokens in local storage. 
        localStorage.setItem("spotify_access_token", params.access_token);
        if (params.refresh_token) {
            localStorage.setItem("spotify_refresh_token", params.refresh_token);
        }
        
        // Updates text to show that login was successful
        authStatus.textContent = "Logged in successfully!";
        actionButtons.style.display = "flex";
        
        writeToConsole("Successfully logged in with Spotify! Click the buttons above to fetch your data.");
        
        // Remove tokens from URL, for safety reasons 
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