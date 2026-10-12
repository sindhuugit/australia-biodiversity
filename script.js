
vegaEmbed(
    "#protected_land_map",
    "js/protected_land_map.json",
    { actions: false }
)
.then(function(result) {
    console.log("Map loaded successfully!");
})
.catch(function(error) {
    console.error("Error loading map:", error);
});



// VISUALISATION 2: THREATENED SPECIES TRENDS

vegaEmbed(
  "#tsx_trend_chart",
  "js/tsx_trend_interactive.json",
  {
    actions: false,
    bind: "#tsx_controls"
  }
)
.then(function(result) {
  console.log("TSX chart loaded successfully!");
})
.catch(function(error) {
  console.error("Error loading TSX chart:", error);
});


// VISUALISATION 3: SPECIES EXPLORER


// Turn Lucide placeholders into actual icons.
if (typeof lucide !== "undefined") {
  lucide.createIcons();
}

const speciesCharts = {
  
    all: {
    title: "How Severe Are the Threats Facing Different Species Groups?",

    description:
        "This chart compares threatened birds, mammals, plants, reptiles and amphibians by their recorded level of extinction risk. Each coloured section shows the percentage of monitored species in a particular threat category. Hover over the bars to see the exact percentages and number of species.",

    file: "js/species_status_diverging.json",

    finding:
        "Reptiles & Amphibians (76.9%) and Plants (72.5%) have the highest proportions of Endangered or Critically Endangered species in the monitoring dataset, suggesting that these groups face particularly severe extinction risks. In contrast, Mammals have the largest proportion classified as Vulnerable (40.2%). This highlights how the severity of threats differs across species groups, rather than affecting all wildlife equally.",

    source:
        "Source: Australian Threatened Species Index 2025. Percentages are based on distinct species represented in the monitoring dataset."
    }, 

    
    birds: {
    title: "Where Are Australia's Threatened Birds Being Monitored?",

    description:
        "This map shows the geographic distribution of threatened bird monitoring across Australia. Each circle represents a monitoring region, with larger circles indicating more distinct bird taxa recorded in that location. Select a state to explore regional differences and hover over the circles for details.",

    file: "js/bird_monitoring_map.json",

    finding:
        "Threatened bird monitoring is spread across numerous Australian regions, but the number of distinct bird taxa represented varies between locations. Larger circles identify regions with a greater variety of monitored threatened birds, rather than larger bird populations.",

    source:
        "Source: Australian Threatened Species Index 2025, bird monitoring records. Locations represent monitoring-region centroids. Map boundaries: rowanhogan/australian-states (GitHub)."
    },


    
    mammals: {
    title: "Which Mammal Families Are Most Represented Among Australia’s Threatened Species?",

    description:
        "This treemap shows how monitored threatened mammal species are distributed across families. Larger rectangles represent families or species with greater representation in the monitoring dataset. Click a family to explore its individual species.",

    file: "js/mammal_family_treemap.json",

    finding:
        "Dasyuridae and Muridae are the two largest mammal families represented in the monitoring dataset. The chart also shows that threat severity differs across families, with some containing a larger share of Endangered and Critically Endangered species than others.",

    source:
        "Source: Australian Threatened Species Index 2025, mammal monitoring records. Family and species sizes are based on distinct monitored species in the dataset."
}




};

// Get the icon buttons and chart elements.
const speciesButtons = document.querySelectorAll(".species-btn");

const speciesTitle = document.getElementById("species-chart-title");
const speciesDescription = document.getElementById("species-chart-description");
const speciesFinding = document.getElementById("species-chart-finding");
const speciesSource = document.getElementById("species-chart-source");

// Show the selected category.
function showSpeciesChart(species) {

  // Highlight the active button.
  speciesButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.species === species
    );
  });

  const chart = speciesCharts[species];

  // Other four charts will be added later.
  if (!chart) {
    const selectedButton = document.querySelector(
      `.species-btn[data-species="${species}"]`
    );

    speciesTitle.textContent =
      selectedButton.textContent.trim();

    speciesDescription.textContent =
      "This group's visualisation will be added next.";

    speciesFinding.textContent = "";
    speciesSource.textContent = "";

    document.getElementById("species_chart").replaceChildren();
    return;
  }

  speciesTitle.textContent = chart.title;
  speciesDescription.textContent = chart.description;
  speciesFinding.innerHTML = "<strong>Key Finding:</strong> " + chart.finding;
  speciesSource.textContent = chart.source;

  console.log("Loading species chart:", chart.file);
  
  vegaEmbed(
  "#species_chart",
  chart.file,
  { actions: false }
)
.then(function(result) {
  console.log("Species chart loaded successfully!");
})
.catch(function(error) {
  console.error("Species chart failed to load:", error);
  });
}

// Listen for clicks.
speciesButtons.forEach(button => {
  button.addEventListener("click", () => {
    showSpeciesChart(button.dataset.species);
  });
});

// Start with All Species.
showSpeciesChart("all");
