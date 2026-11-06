/* =====================================
   BOTTLEBLOOM - MAIN APPLICATION
===================================== */

const $ = id => document.getElementById(id);

function getData(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

let garden = getData("bb_garden", []);
let reminders = getData("bb_reminders", []);
let wateringDates = getData("bb_watering", []);
let bottleCount = getData("bb_bottles", 0);
let currentLeafImage = null;


/* =====================================
   WELCOME AND USER
===================================== */

function startApp() {
    const name = $("userName").value.trim();

    if (!name) {
        alert("Please enter your name first!");
        return;
    }

    localStorage.setItem("bb_name", name);
    openMainApp();
}

function openMainApp() {
    const name = localStorage.getItem("bb_name");

    if (!name) return;

    $("welcomeScreen").classList.add("hidden");
    $("mainApp").classList.remove("hidden");

    $("welcomeMessage").textContent = "Welcome, " + name + "!";
    $("profileInitial").textContent = name.charAt(0).toUpperCase();

    updateHome();
    renderGarden();
    renderReminders();
    updateEco();
    checkDueReminders();
}


/* =====================================
   NAVIGATION
===================================== */

function showPage(pageId, button) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    $(pageId).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(nav => {
        nav.classList.remove("selected");
    });

    if (button) {
        button.classList.add("selected");
    } else {
        const matching = [...document.querySelectorAll(".nav-item")]
            .find(nav => nav.getAttribute("onclick")?.includes("'" + pageId + "'"));

        if (matching) matching.classList.add("selected");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (pageId === "garden") renderGarden();
    if (pageId === "reminders") renderReminders();
}


/* =====================================
   DAILY PLANT AND DAILY TIP
===================================== */

const dailyPlants = [
    {
        name: "Sunflower",
        emoji: "🌻",
        description: "Sunflowers are known for their bright flowers and ability to follow the sun during early growth."
    },
    {
        name: "Aloe Vera",
        emoji: "🌵",
        description: "Aloe vera is a succulent plant that stores water in its thick leaves."
    },
    {
        name: "Peace Lily",
        emoji: "🌸",
        description: "Peace lilies are tropical plants with elegant white flowers and attractive green leaves."
    },
    {
        name: "Snake Plant",
        emoji: "🌿",
        description: "Snake plants have upright leaves and are known for tolerating relatively low light."
    },
    {
        name: "Rose",
        emoji: "🌹",
        description: "Roses are flowering plants available in many colours and varieties."
    },
    {
        name: "Mint",
        emoji: "🍃",
        description: "Mint is an aromatic herb commonly grown in pots and kitchen gardens."
    },
    {
        name: "Money Plant",
        emoji: "🪴",
        description: "Money plants are popular climbing and trailing houseplants."
    }
];

const tips = [
    "Check the soil before watering. The surface alone doesn't always tell you whether the roots need water.",
    "Make sure your pots have drainage holes to prevent excess water from collecting.",
    "Remove dead leaves regularly to keep your garden tidy.",
    "Different plants need different amounts of sunlight. Check each plant's requirements.",
    "Clean dusty leaves gently with a soft, damp cloth.",
    "Avoid overwatering. Too much water can damage plant roots.",
    "Use suitable compost to improve soil structure and support plant growth.",
    "Inspect the underside of leaves occasionally for pests."
];

function getDayNumber() {
    const date = new Date();
    return Math.floor(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
    );
}

function updateDailyContent() {
    const day = getDayNumber();

    const plant = dailyPlants[day % dailyPlants.length];
    const tip = tips[day % tips.length];

    $("dailyName").textContent = plant.name;
    $("dailyEmoji").textContent = plant.emoji;
    $("dailyDescription").textContent = plant.description;
    $("dailyTip").textContent = tip;
}


/* =====================================
   WATERING STREAK
===================================== */

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function logWatering() {
    const today = localDateKey();

    if (wateringDates.includes(today)) {
        alert("You've already logged today's watering! 🌱");
        return;
    }

    wateringDates.push(today);
    saveData("bb_watering", wateringDates);

    updateHome();

    alert("Watering successfully logged! Keep growing! 🌿");
}

function calculateStreak() {
    const dates = [...new Set(wateringDates)].sort().reverse();

    if (!dates.length) return 0;

    const today = localDateKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterday = localDateKey(yesterdayDate);

    if (dates[0] !== today && dates[0] !== yesterday) {
        return 0;
    }

    let streak = 0;
    let expected = new Date(dates[0] + "T12:00:00");

    for (const date of dates) {
        if (date !== localDateKey(expected)) break;

        streak++;

        expected.setDate(expected.getDate() - 1);
    }

    return streak;
}


/* =====================================
   HOME DASHBOARD
===================================== */

function updateHome() {
    $("streakCount").textContent = calculateStreak();
    $("gardenCount").textContent = garden.length;
    $("waterCount").textContent = wateringDates.length;

    updateDailyContent();
}


/* =====================================
   PLANT DATABASE
===================================== */

const plantDatabase = {
    "aloe vera": {
        description: "Aloe vera is a succulent with thick, fleshy leaves containing a clear gel. It is widely grown as an ornamental plant.",
        light: "Bright indirect light or suitable direct sunlight.",
        water: "Water when the soil has dried out.",
        soil: "Well-draining cactus or succulent mix.",
        care: "Avoid overwatering and use a pot with drainage holes.",
        toxicity: "Toxic to cats and dogs if ingested."
    },

    "snake plant": {
        description: "Snake plant (Dracaena trifasciata) is an evergreen tropical plant with stiff, upright leaves.",
        light: "Low to bright indirect light.",
        water: "Allow the soil to dry between watering.",
        soil: "Well-draining soil.",
        care: "Avoid standing water and protect from excessive cold.",
        toxicity: "Toxic to cats and dogs if ingested."
    },

    "money plant": {
        description: "Money plant, commonly referring to golden pothos (Epipremnum aureum), is a popular climbing and trailing houseplant.",
        light: "Bright indirect light; it can tolerate lower light.",
        water: "Water when the upper soil becomes dry.",
        soil: "Well-draining potting mix.",
        care: "Provide support for climbing stems and trim when needed.",
        toxicity: "Toxic to cats and dogs if ingested."
    },

    "pothos": {
        description: "Pothos is a tropical climbing vine with attractive heart-shaped leaves.",
        light: "Indirect light.",
        water: "Water when the upper soil dries.",
        soil: "Well-draining potting mix.",
        care: "Trim long stems and avoid overwatering.",
        toxicity: "Toxic to cats and dogs if ingested."
    },

    "peace lily": {
        description: "Peace lily (Spathiphyllum) is a tropical flowering plant with glossy green leaves and distinctive white spathes.",
        light: "Medium to bright indirect light.",
        water: "Keep the soil lightly moist without waterlogging.",
        soil: "Rich, well-draining potting mix.",
        care: "Avoid direct harsh sunlight.",
        toxicity: "Toxic to cats and dogs if ingested."
    },

    "sunflower": {
        description: "Sunflower (Helianthus annuus) is an annual flowering plant known for its large flower heads and seeds.",
        light: "Full sunlight.",
        water: "Water regularly, especially during establishment.",
        soil: "Well-draining, fertile soil.",
        care: "Provide sufficient space and support for taller varieties.",
        toxicity: "Generally considered non-toxic to cats and dogs."
    },

    "rose": {
        description: "Roses are flowering shrubs belonging to the genus Rosa. They are grown for their fragrant and colourful flowers.",
        light: "At least six hours of sunlight is generally preferred.",
        water: "Water at the soil level when needed.",
        soil: "Fertile, well-draining soil.",
        care: "Prune appropriately and inspect for common pests.",
        toxicity: "Generally considered non-toxic to cats and dogs, but thorns can cause injury."
    },

    "mint": {
        description: "Mint (Mentha) is a fragrant herb grown for its aromatic leaves and culinary uses.",
        light: "Partial to full sunlight.",
        water: "Keep the soil consistently moist, not waterlogged.",
        soil: "Moist, fertile soil.",
        care: "Grow in a container because mint can spread rapidly.",
        toxicity: "Generally considered non-toxic to cats and dogs in ordinary household exposure."
    },

    "basil": {
        description: "Basil (Ocimum basilicum) is an aromatic culinary herb with soft green leaves.",
        light: "Around six hours of sunlight daily.",
        water: "Water when the upper soil begins to dry.",
        soil: "Fertile, well-draining soil.",
        care: "Pinch growing tips to encourage branching.",
        toxicity: "Generally considered non-toxic to cats and dogs."
    },

    "tomato": {
        description: "Tomato (Solanum lycopersicum) is a fruit-bearing plant widely cultivated in home gardens.",
        light: "Full sunlight.",
        water: "Regular and consistent watering.",
        soil: "Fertile, well-draining soil.",
        care: "Provide support and monitor for pests.",
        toxicity: "Unripe green parts of the plant are toxic to pets."
    }
};


/* =====================================
   EXPLORE - PLANT SEARCH
===================================== */

function quickSearch(name) {
    $("plantSearch").value = name;
    showPage("explore");
    searchPlant();
}

function displayPlant(name, description, light, water, soil, care, source) {
    $("plantResult").innerHTML = `
        <div class="result-box plant-details">
            <h2>🌿 ${escapeHTML(name)}</h2>

            <p>${escapeHTML(description)}</p>

            <h3>☀️ Sunlight requirements</h3>
            <p>${escapeHTML(light)}</p>

            <h3>💧 Water requirements</h3>
            <p>${escapeHTML(water)}</p>

            <h3>🌱 Soil requirements</h3>
            <p>${escapeHTML(soil)}</p>

            <h3>🪴 Plant care</h3>
            <p>${escapeHTML(care)}</p>

            <small>Information source: ${escapeHTML(source)}</small>
        </div>
    `;
}

async function searchPlant() {
    const query = $("plantSearch").value.trim();

    if (!query) {
        alert("Please enter a plant name.");
        return;
    }

    $("plantResult").innerHTML =
        '<div class="empty-state">🌿 Searching for your plant...</div>';

    const known = plantDatabase[query.toLowerCase()];

    if (known) {
        displayPlant(
            query,
            known.description,
            known.light,
            known.water,
            known.soil,
            known.care,
            "BottleBloom plant database"
        );
        return;
    }

    try {
        const response = await fetch(
            "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                action: "query",
                generator: "search",
                gsrsearch: query + " plant",
                gsrlimit: "5",
                prop: "extracts",
                exintro: "1",
                explaintext: "1",
                format: "json",
                origin: "*"
            })
        );

        if (!response.ok) throw new Error("Search unavailable");

        const data = await response.json();

        const pages = Object.values(data.query?.pages || {});

        if (!pages.length) {
            throw new Error("Plant not found");
        }

        // Prefer an exact title match instead of returning unrelated results.
        const exact = pages.find(page =>
            page.title.toLowerCase() === query.toLowerCase()
        );

        const result = exact || pages[0];

        displayPlant(
            result.title,
            result.extract || "No description available.",
            "Check the species-specific sunlight requirements.",
            "Check soil moisture before watering.",
            "Choose suitable, well-draining soil.",
            "Check the plant's specific growing requirements.",
            "Wikipedia"
        );

    } catch (error) {
        $("plantResult").innerHTML = `
            <div class="result-box">
                <h3>Plant information unavailable</h3>
                <p>We couldn't find a reliable description for "${escapeHTML(query)}".</p>
                <p>Try another spelling or a more specific plant name.</p>
            </div>
        `;
    }
}


/* =====================================
   LEAFLENS - IMAGE SCANNER
===================================== */

function previewLeaf(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("Please select an image smaller than 10 MB.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        currentLeafImage = new Image();

        currentLeafImage.onload = function() {
            $("imagePreview").innerHTML =
                `<img src="${e.target.result}" alt="Uploaded leaf photo">`;

            $("scanControls").classList.remove("hidden");
            $("scanResult").innerHTML = "";
        };

        currentLeafImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function analyseLeaf() {
    if (!currentLeafImage) {
        alert("Please upload a leaf image first.");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 150;
    const height = 150;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(currentLeafImage, 0, 0, width, height);

    const pixels = ctx.getImageData(0, 0, width, height).data;

    let green = 0;
    let yellow = 0;
    let brown = 0;
    let total = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        if (pixels[i + 3] < 100) continue;

        // Ignore pixels that are nearly white or very dark.
        if (Math.max(r, g, b) < 30) continue;

        total++;

        if (g > r * 1.08 && g > b * 1.08) {
            green++;
        } else if (r > 120 && g > 100 && b < 110 &&
                   r > g * 0.85) {
            yellow++;
        } else if (r > g * 1.15 && g > b * 1.1) {
            brown++;
        }
    }

    const greenPercent = total ? green / total * 100 : 0;
    const yellowPercent = total ? yellow / total * 100 : 0;
    const brownPercent = total ? brown / total * 100 : 0;

    const symptom = $("leafSymptom").value;

    let title = "";
    let explanation = "";
    let action = [];

    if (symptom === "yellow" || yellowPercent > 30) {
        title = "Possible yellowing detected";

        explanation =
            "Yellow leaves can be associated with overwatering, underwatering, nutrient deficiencies, poor drainage or natural leaf ageing.";

        action = [
            "Check the moisture of the soil.",
            "Check whether the pot has drainage holes.",
            "Inspect the plant for pests.",
            "Check whether the plant is receiving suitable light."
        ];

    } else if (symptom === "brown" || brownPercent > 25) {
        title = "Possible brown leaf damage";

        explanation =
            "Brown edges or patches may be related to inconsistent watering, excessive sunlight, dry air, salt buildup or other environmental stress.";

        action = [
            "Check the soil moisture.",
            "Review the plant's sunlight requirements.",
            "Avoid excessive fertilizer.",
            "Inspect the damaged areas over the next few days."
        ];

    } else if (symptom === "white") {
        title = "Possible powdery growth";

        explanation =
            "White powder-like patches may be associated with powdery mildew, although dust and mineral residue can look similar.";

        action = [
            "Inspect the affected leaves closely.",
            "Improve airflow around the plant.",
            "Avoid wetting the leaves unnecessarily.",
            "Seek a reliable plant disease assessment if the patches spread."
        ];

    } else if (symptom === "spots") {
        title = "Unusual leaf spots";

        explanation =
            "Spots can have several causes, including fungal or bacterial disease, pests and environmental damage.";

        action = [
            "Check whether spots are spreading.",
            "Inspect both sides of the leaves.",
            "Avoid splashing water between plants.",
            "Remove severely affected leaves using clean tools if appropriate."
        ];

    } else if (symptom === "wilting") {
        title = "Possible wilting";

        explanation =
            "Wilting can be associated with insufficient water, damaged roots, excessive heat or other plant stress.";

        action = [
            "Check soil moisture before adding water.",
            "Check the drainage of the pot.",
            "Move the plant away from excessive heat if necessary.",
            "Inspect the roots if wilting continues."
        ];

    } else if (symptom === "holes") {
        title = "Possible pest damage";

        explanation =
            "Holes in leaves may be caused by insects, caterpillars or other physical damage.";

        action = [
            "Inspect the leaves, especially underneath.",
            "Look for visible insects or eggs.",
            "Isolate a severely affected plant.",
            "Use a plant-appropriate pest control method if needed."
        ];

    } else if (symptom === "healthy") {
        title = "No selected symptoms";

        explanation =
            "You reported that the leaf looks healthy. This does not guarantee that the plant is disease-free.";

        action = [
            "Continue suitable watering.",
            "Provide the correct light.",
            "Inspect the plant regularly.",
            "Monitor for changes."
        ];

    } else {
        title = "Initial visual assessment";

        explanation =
            `The image contains approximately ${Math.round(greenPercent)}% green, ${Math.round(yellowPercent)}% yellow and ${Math.round(brownPercent)}% brown classified pixels. These colours alone cannot establish plant health.`;

        action = [
            "Choose a visible symptom from the list for more targeted advice.",
            "Check the soil moisture.",
            "Inspect both sides of the leaf.",
            "Compare new growth with older leaves."
        ];
    }

    $("scanResult").innerHTML = `
        <div class="result-box">
            <h3>🌿 ${title}</h3>

            <p>${explanation}</p>

            <h3>What should you do?</h3>

            <ul>
                ${action.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <p><strong>Assessment:</strong> Preliminary, not a confirmed diagnosis.</p>
        </div>
    `;
}


/* =====================================
   PLANTSAFE - PET AND CHILD SAFETY
===================================== */

const safetyDatabase = {
    "aloe vera": "TOXIC TO PETS",
    "snake plant": "TOXIC TO PETS",
    "peace lily": "TOXIC TO PETS",
    "money plant": "TOXIC TO PETS",
    "pothos": "TOXIC TO PETS",
    "philodendron": "TOXIC TO PETS",
    "dieffenbachia": "TOXIC TO PETS AND HARMFUL IF CHEWED",
    "sago palm": "HIGHLY TOXIC TO PETS",
    "lily": "EXTREMELY DANGEROUS TO CATS",
    "tomato": "GREEN PARTS CAN BE TOXIC TO PETS",
    "oleander": "HIGHLY TOXIC",
    "english ivy": "TOXIC TO PETS",
    "monstera": "TOXIC TO PETS",
    "jade plant": "TOXIC TO PETS",
    "tulip": "TOXIC TO PETS",
    "daffodil": "TOXIC TO PETS",
    "azalea": "TOXIC TO PETS",
    "rose": "GENERALLY NON-TOXIC TO PETS",
    "sunflower": "GENERALLY NON-TOXIC TO PETS",
    "basil": "GENERALLY NON-TOXIC TO PETS",
    "mint": "GENERALLY NON-TOXIC TO PETS",
    "spider plant": "GENERALLY NON-TOXIC TO PETS",
    "calathea": "GENERALLY NON-TOXIC TO PETS",
    "areca palm": "GENERALLY NON-TOXIC TO PETS",
    "parlor palm": "GENERALLY NON-TOXIC TO PETS"
};

function checkSafety() {
    const name = $("safetySearch").value.trim().toLowerCase();

    if (!name) {
        alert("Enter a plant name.");
        return;
    }

    const result = safetyDatabase[name];

    if (!result) {
        $("safetyResult").innerHTML = `
            <div class="result-box">
                <h3>⚠️ Not verified</h3>
                <p>We don't have reliable safety information for this plant in our current database.</p>
                <p>Keep it away from pets and children until its identity and toxicity are verified.</p>
            </div>
        `;
        return;
    }

    const safe = result.includes("GENERALLY NON-TOXIC");

    $("safetyResult").innerHTML = `
        <div class="result-box">
            <h3>${safe ? "🌿" : "⚠️"} ${result}</h3>

            <p><strong>Plant:</strong> ${escapeHTML(name)}</p>

            <p>
                ${safe
                    ? "This plant is generally considered non-toxic to cats and dogs. However, chewing any plant can cause digestive discomfort."
                    : "This plant may pose a toxicity risk. Keep it out of reach and seek veterinary advice if ingestion occurs."
                }
            </p>

            <p>Child-specific safety has not been established by this result. Keep unknown plants away from children.</p>
        </div>
    `;
}


/* =====================================
   MY GARDEN - PLANT PROFILES
===================================== */

function addPlant() {
    const name = $("newPlantName").value.trim();
    const date = $("newPlantDate").value;
    const location = $("newPlantLocation").value.trim();

    if (!name || !date) {
        alert("Enter the plant name and planting date.");
        return;
    }

    if (date > localDateKey()) {
        alert("Planting date cannot be in the future.");
        return;
    }

    garden.push({
        id: Date.now(),
        name,
        date,
        location: location || "Not specified"
    });

    saveData("bb_garden", garden);

    $("newPlantName").value = "";
    $("newPlantDate").value = "";
    $("newPlantLocation").value = "";

    renderGarden();
    updateHome();

    alert("Your plant has been added! 🌱");
}

function renderGarden() {
    const container = $("gardenList");

    if (!garden.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🪴</span>
                <h3>Your garden is waiting!</h3>
                <p>Add your first plant to get started.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = garden.map(plant => `
        <div class="garden-item">
            <div style="font-size:35px">🌱</div>
            <h3>${escapeHTML(plant.name)}</h3>
            <p>📅 Added: ${escapeHTML(plant.date)}</p>
            <p>📍 Location: ${escapeHTML(plant.location)}</p>
            <p>🌿 Growing in your garden</p>
            <button class="delete-btn" onclick="deletePlant(${plant.id})">
                Remove Plant
            </button>
        </div>
    `).join("");
}

function deletePlant(id) {
    if (!confirm("Remove this plant from your garden?")) return;

    garden = garden.filter(plant => plant.id !== id);

    saveData("bb_garden", garden);

    renderGarden();
    updateHome();
}


/* =====================================
   REMINDERS
===================================== */

function addReminder() {
    const plant = $("reminderPlant").value.trim();
    const date = $("reminderDate").value;
    const time = $("reminderTime").value;
    const type = $("reminderType").value;

    if (!plant || !date || !time) {
        alert("Complete all reminder fields.");
        return;
    }

    const reminderDate = new Date(`${date}T${time}`);

    if (reminderDate.getTime() < Date.now() - 60000) {
        alert("Please select a future date and time.");
        return;
    }

    reminders.push({
        id: Date.now(),
        plant,
        date,
        time,
        type,
        notified: false
    });

    saveData("bb_reminders", reminders);

    $("reminderPlant").value = "";
    $("reminderDate").value = "";
    $("reminderTime").value = "";

    renderReminders();

    alert("Reminder saved successfully! ⏰");
}

function renderReminders() {
    const container = $("reminderList");

    if (!reminders.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>⏰</span>
                <h3>No reminders yet</h3>
                <p>Create your first plant-care reminder.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = reminders.map(reminder => `
        <div class="garden-item" style="margin-bottom:12px">
            <h3>⏰ ${escapeHTML(reminder.type)}</h3>
            <p>🌱 ${escapeHTML(reminder.plant)}</p>
            <p>📅 ${escapeHTML(reminder.date)}</p>
            <p>🕒 ${escapeHTML(reminder.time)}</p>
            <button class="delete-btn" onclick="deleteReminder(${reminder.id})">
                Delete Reminder
            </button>
        </div>
    `).join("");
}

function deleteReminder(id) {
    reminders = reminders.filter(item => item.id !== id);

    saveData("bb_reminders", reminders);

    renderReminders();
}

async function enableNotifications() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        alert("Notifications enabled! Keep BottleBloom open for reminders.");
        checkDueReminders();
    } else {
        alert("Notification permission was not granted.");
    }
}

function checkDueReminders() {
    if (!("Notification" in window) ||
        Notification.permission !== "granted") return;

    const now = Date.now();
    let changed = false;

    reminders.forEach(reminder => {
        const reminderTime = new Date(
            `${reminder.date}T${reminder.time}`
        ).getTime();

        if (
            !reminder.notified &&
            reminderTime <= now &&
            reminderTime > now - 60000
        ) {
            new Notification("BottleBloom 🌿", {
                body: `${reminder.type} reminder for ${reminder.plant}!`
            });

            reminder.notified = true;
            changed = true;
        }
    });

    if (changed) {
        saveData("bb_reminders", reminders);
        renderReminders();
    }
}


/* =====================================
   ECO IMPACT
===================================== */

function saveBottles() {
    const value = Number($("bottleInput").value);

    if (!Number.isInteger(value) || value < 0) {
        alert("Enter a valid whole number.");
        return;
    }

    bottleCount = value;

    saveData("bb_bottles", bottleCount);

    updateEco();

    alert("Your recycling record has been updated! ♻️");
}

function updateEco() {
    $("bottleCount").textContent = bottleCount;
    $("ecoPlants").textContent = garden.length;
}


/* =====================================
   PLANT MATCH
===================================== */

function findPlants() {
    const light = $("sunlight").value;
    const experience = $("experience").value;

    const recommendations = {
        low: [
            ["Snake Plant", "🌿", "Tolerates low light."],
            ["ZZ Plant", "🪴", "Tolerates low light and infrequent watering."],
            ["Pothos", "🍃", "Can grow in lower light."]
        ],

        medium: [
            ["Peace Lily", "🌸", "Prefers indirect light."],
            ["Money Plant", "🍃", "Suitable for bright indirect light."],
            ["Spider Plant", "🌱", "Grows well in bright indirect light."]
        ],

        high: [
            ["Sunflower", "🌻", "Needs plenty of sunlight."],
            ["Rose", "🌹", "Generally prefers several hours of sunlight."],
            ["Basil", "🌿", "Grows well with sufficient sunlight."]
        ]
    };

    let results = recommendations[light];

    if (experience === "beginner") {
        results = results.filter(item =>
            ["Snake Plant", "ZZ Plant", "Pothos", "Money Plant", "Sunflower"].includes(item[0])
        );
    }

    $("matchResults").innerHTML = `
        <div class="result-box">
            <h3>🌱 Your plant recommendations</h3>
            ${results.map(item => `
                <p style="margin:15px 0">
                    <strong>${item[1]} ${item[0]}</strong><br>
                    ${item[2]}
                </p>
            `).join("")}
            <p>Always check the individual plant's watering and growing requirements before planting.</p>
        </div>
    `;
}


/* =====================================
   BLOOMBUILDER
===================================== */

function buildGarden() {
    const space = $("gardenSpace").value;
    const light = $("gardenLight").value;
    const style = $("gardenStyle").value;

    let rows = {
        small: "2–3 vertical rows",
        medium: "3–4 vertical rows",
        large: "4–6 vertical rows"
    };

    let plants = {
        low: ["Snake Plant", "ZZ Plant", "Pothos"],
        medium: ["Money Plant", "Peace Lily", "Spider Plant"],
        high: ["Basil", "Mint", "Sunflower"]
    };

    let materials = [
        "Recycled plastic bottles",
        "Growing medium and compost",
        "Water collection tray",
        "Wall or frame support"
    ];

    if (style === "herbs") {
        materials.push("Herb labels");
    }

    if (style === "recycled") {
        materials.push("Cleaned and prepared recycled containers");
    }

    if (style === "decorative") {
        materials.push("Decorative recycled pots");
    }

    $("builderResults").innerHTML = `
        <div class="result-box">
            <h3>🏡 Your vertical garden plan</h3>

            <p><strong>Garden size:</strong> ${rows[space]}</p>

            <p><strong>Lighting:</strong> ${light} sunlight</p>

            <h3>🌿 Suggested plants</h3>

            <ul>
                ${plants[light].map(p => `<li>${p}</li>`).join("")}
            </ul>

            <h3>♻️ Suggested materials</h3>

            <ul>
                ${materials.map(m => `<li>${m}</li>`).join("")}
            </ul>

            <p>Arrange plants according to their mature size, light requirements and watering needs. Make sure your structure can support the total weight.</p>
        </div>
    `;
}


/* =====================================
   SECURITY / HTML TEXT
===================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


/* =====================================
   INITIALISE APP
===================================== */

document.addEventListener("DOMContentLoaded", () => {
    const name = localStorage.getItem("bb_name");

    if (name) {
        openMainApp();
    }

    // Check reminders periodically while the app is open.
    setInterval(checkDueReminders, 30000);

    // Prevent accidentally choosing a future planting date.
    $("newPlantDate").max = localDateKey();
});
