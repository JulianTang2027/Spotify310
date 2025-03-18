# Statify


Statify is a project that allows users to view their listening history, top artists, and top tracks.


## Getting Started
### Installation
1. Clone the repository:
   ```sh
   mkdir statify  # Choose any directory you prefer
   cd statify
   git clone https://github.com/JulianTang2027/Spotify310.git
   ```
2. Set up environment variables:
   - You'll need a Spotify Developer Account.
   - Include your **client secret** and **client ID** in the appropriate configuration files (I included it in environmental variables under AWS but if you're running this locally you can include it in your configuration, provided you don't leak your client secret).


## Usage
1. Log in to your Spotify account.
2. Choose which stat you want to view.


## Tech Stack
- Python → Lambda functions built on AWS
- HTML, CSS → Frontend styling and website
- JavaScript → Handles API calls to AWS and animations for the website


## Note
Statify is currently running locally and does not have a purchased domain.
