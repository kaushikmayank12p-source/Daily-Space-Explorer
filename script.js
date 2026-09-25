const API_KEY = window.NASA_API_KEY || "";

const BASE_URL = "https://api.nasa.gov/planetary/apod";

// DOM Elements
const datePicker = document.getElementById("date-picker");
const todayBtn = document.getElementById("today-btn");
const randomBtn = document.getElementById("random-btn");
const loader = document.getElementById("loader");
const apodContent = document.getElementById("apod-content");
const errorMsg = document.getElementById("error-msg");
const errorText = errorMsg.querySelector("p");

const mediaWrapper = document.getElementById("media-wrapper");
const apodTitle = document.getElementById("apod-title");
const apodDate = document.getElementById("apod-date");
const apodExplanation = document.getElementById("apod-explanation");
const apodCopyright = document.getElementById("apod-copyright");
const hdLink = document.getElementById("hd-link");

// Set today's date as max allowed date in picker
const todayString = new Date().toISOString().split("T")[0];
datePicker.max = todayString;
datePicker.value = todayString;

// Fetch APOD Data
async function fetchAPOD(date = "") {
  showLoader(true);
  errorMsg.classList.add("hidden");
  apodContent.classList.add("hidden");

  if (!API_KEY || API_KEY === "PASTE_YOUR_NASA_API_KEY_HERE") {
    errorText.textContent = "Set your NASA API key in config.js before running the app.";
    errorMsg.classList.remove("hidden");
    showLoader(false);
    return;
  }

  let url = `${BASE_URL}?api_key=${API_KEY}`;
  if (date) {
    url += `&date=${date}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error("Houston, error fetching data:", error);
    errorText.textContent = window.location.protocol === "file:"
      ? "⚠️ Open this page through a local web server so NASA data can load."
      : `⚠️ Could not load NASA data: ${error.message}`;
    errorMsg.classList.remove("hidden");
  } finally {
    showLoader(false);
  }
}

// Render data onto the screen
function displayData(data) {
  apodTitle.textContent = `${data.title} 🪐`;
  apodDate.textContent = `📅 ${data.date}`;
  apodExplanation.textContent = data.explanation;

  if (data.copyright) {
    apodCopyright.textContent = `©️ ${data.copyright.trim()}`;
    apodCopyright.classList.remove("hidden");
  } else {
    apodCopyright.classList.add("hidden");
  }

  // Clear previous media
  mediaWrapper.innerHTML = "";

  // NASA APOD can sometimes be a video (e.g. YouTube)
  if (data.media_type === "image") {
    const img = document.createElement("img");
    img.src = data.url;
    img.alt = data.title;
    mediaWrapper.appendChild(img);

    hdLink.href = data.hdurl || data.url;
    hdLink.classList.remove("hidden");
  } else if (data.media_type === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = data.url;
    iframe.allowFullscreen = true;
    mediaWrapper.appendChild(iframe);

    hdLink.classList.add("hidden");
  }

  apodContent.classList.remove("hidden");
}

function showLoader(isLoading) {
  if (isLoading) {
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
  }
}

// Generate random date between APOD launch (June 16, 1995) and today
function getRandomDate() {
  const start = new Date("1995-06-16").getTime();
  const end = new Date().getTime();
  const randomTime = new Date(start + Math.random() * (end - start));
  return randomTime.toISOString().split("T")[0];
}

// Event Listeners
todayBtn.addEventListener("click", () => {
  datePicker.value = todayString;
  fetchAPOD(todayString);
});

datePicker.addEventListener("change", (e) => {
  if (e.target.value) {
    fetchAPOD(e.target.value);
  }
});

randomBtn.addEventListener("click", () => {
  const randomDate = getRandomDate();
  datePicker.value = randomDate;
  fetchAPOD(randomDate);
});

// Load Today's APOD when the website is opened
fetchAPOD();
