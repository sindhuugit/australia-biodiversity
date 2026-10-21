
/* ==========================================
   AUSTRALIA'S BIODIVERSITY — COMPLETE SCRIPT
========================================== */


/* ==========================================
   SECTION 1 — PROTECTED LAND MAP
========================================== */

vegaEmbed(
  "#protected_land_map",
  "js/protected_land_map.json",
  { actions: false }
).catch(error => {
  console.error("Protected land map error:", error);
});


/* ==========================================
   SECTION 3 — THREATENED SPECIES TRENDS
========================================== */

const tsxChart = document.getElementById("tsx_trend_chart");
const tsxControls = document.getElementById("tsx_controls");

if (tsxChart && tsxControls) {
  let tsxResult = null;
  let tsxSpecPromise = null;
  let tsxCurrentGroup = "All Species";
  let tsxLastWidth = 0;
  let tsxResizeTimeout = null;
  let tsxRenderId = 0;

  async function renderTsxTrend() {
    const renderId = ++tsxRenderId;

    try {
      if (!tsxSpecPromise) {
        tsxSpecPromise = fetch("js/tsx_trend_interactive.json")
          .then(response => {
            if (!response.ok) {
              throw new Error(
                "TSX JSON could not be loaded: HTTP " + response.status
              );
            }
            return response.json();
          })
          .catch(error => {
            tsxSpecPromise = null;
            throw error;
          });
      }

      const sourceSpec = await tsxSpecPromise;
      if (renderId !== tsxRenderId) return;

      const computed = getComputedStyle(tsxChart);

      const availableWidth =
        tsxChart.clientWidth -
        (parseFloat(computed.paddingLeft) || 0) -
        (parseFloat(computed.paddingRight) || 0);

      // Size the plot within its available space.
      const plotWidth = Math.max(
        320,
        Math.floor(availableWidth - 135)
      );

      tsxLastWidth = tsxChart.clientWidth;

      // Preserve the selected group when resizing.
      if (tsxResult && tsxResult.view) {
        try {
          tsxCurrentGroup =
            tsxResult.view.signal("selectedGroup");
        } catch (error) {
          console.warn("Cannot read TSX selection:", error);
        }

        tsxResult.view.finalize();
        tsxResult = null;
      }

      const spec = JSON.parse(JSON.stringify(sourceSpec));
      spec.width = plotWidth;

      const groupParameter = (spec.params || []).find(
        p => p.name === "selectedGroup"
      );

      if (groupParameter) {
        groupParameter.value = tsxCurrentGroup;
      }

      tsxChart.replaceChildren();
      tsxControls.replaceChildren();

      tsxResult = await vegaEmbed(tsxChart, spec, {
        actions: false,
        renderer: "svg",
        bind: "#tsx_controls"
      });

    } catch (error) {
      console.error("Threatened species trends error:", error);
      tsxChart.textContent =
        "Threatened species chart could not load. Check the browser console.";
    }
  }

  function scheduleTsxResize() {
    clearTimeout(tsxResizeTimeout);

    tsxResizeTimeout = setTimeout(() => {
      if (Math.abs(tsxChart.clientWidth - tsxLastWidth) > 12) {
        renderTsxTrend();
      }
    }, 220);
  }

  renderTsxTrend();

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleTsxResize).observe(tsxChart);
  } else {
    window.addEventListener("resize", scheduleTsxResize);
  }
}


/* ==========================================
   SECTION 4 — SPECIES EXPLORER
========================================== */

// Activate Lucide icons.
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
      "Reptiles & Amphibians (76.9%) and Plants (72.5%) have the highest proportions of Endangered or Critically Endangered species in the monitoring dataset, suggesting that these groups face particularly severe extinction risks. In contrast, Mammals have the largest proportion classified as Vulnerable (40.2%). This highlights how the severity of threats differs across species groups, rather than affecting all wildlife equally."
  },

  birds: {
    title: "Where Are Australia's Threatened Birds Being Monitored?",
    description:
      "This map shows the geographic distribution of threatened bird monitoring across Australia. Each circle represents a monitoring region, with larger circles indicating more distinct monitored bird species recorded in that location.",
    file: "js/bird_monitoring_map.json",
    finding:
      "Threatened bird monitoring is spread across numerous Australian regions, but the number of distinct bird species represented varies between locations. Larger circles identify regions with a greater variety of monitored threatened birds, rather than larger bird populations."
  },

  
  mammals: {
    title: "How Do Threat Levels Differ Across Mammal Families?",

    description:
      "Explore how threatened mammals represented in the monitoring dataset " +
      "are classified across different mammal families. Each heatmap square " +
      "shows how many distinct monitored entries have a particular threat status. " +
      "Darker purple means a larger count. Use the dropdown to view all families " +
      "and hover for counts, percentages and examples.",

    file: "js/mammal_family_threat_heatmap.json",

    finding:
      "Muridae has the most distinct monitored entries (20), including 13 " +
      "classified as Vulnerable. Dasyuridae has 18 monitored entries, " +
      "including 8 Endangered and 1 Critically Endangered. These figures " +
      "describe the monitoring dataset, not every mammal species in Australia. " +
      "The source includes some subspecies."
  },

  
  plants: {
    title: "How Do Australian and Global Plant Threat Assessments Compare?",

    description:
      "This butterfly chart compares how 34 monitored plant entries are " +
      "classified under Australia's EPBC system and the global IUCN system. " +
      "Sage-green bars on the left show EPBC counts, while terracotta bars " +
      "on the right show IUCN counts. Both sides use the same 34 entries. " +
      "Hover over a bar to see its exact count and percentage.",

    file: "js/plant_epbc_iucn_butterfly.json",

    finding:
      "Only 34 of the 178 distinct monitored plant entries have both " +
      "EPBC and IUCN classifications recorded in this extract. " +
      "Of those 34, 25 (73.5%) have matching classifications and " +
      "9 (26.5%) differ. The butterfly chart compares totals in each " +
      "category, not which individual plant entries agree. " +
      "Some monitored entries are subspecies."
  },


  
  reptiles: {
    title: "Do Reptiles and Amphibians Face Different Levels of Extinction Risk?",

    description:
      "This connected dot plot compares the percentage of monitored " +
      "reptile and amphibian species in each conservation category. " +
      "Teal dots represent reptiles and blue dots represent amphibians. " +
      "The connecting lines show the percentage-point differences " +
      "between the groups. Hover over a dot for exact counts and percentages.",

    file: "js/reptiles_amphibians_connected_dot.json",

    finding:
      "Among the 24 monitored reptile species, 21 (87.5%) are classified " +
      "as Endangered or Critically Endangered, compared with 19 of " +
      "the 28 monitored amphibian species (67.9%). This is a " +
      "19.6 percentage-point difference. The figures describe the " +
      "species represented in this monitoring dataset, not all " +
      "Australian reptiles or amphibians."
  },

};


/* ==========================================
   BIRD MONITORING — GEOGRAPHIC FILTER
========================================== */

let birdSpecPromise;

async function getBirdMapWithGeographicStates() {
  if (birdSpecPromise) return birdSpecPromise;

  birdSpecPromise = (async function() {
    if (typeof turf === "undefined") {
      throw new Error("Turf.js has not loaded.");
    }

    const responses = await Promise.all([
      fetch("js/bird_monitoring_map.json"),
      fetch("data/bird_monitoring_regions.csv"),
      fetch(
        "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson"
      )
    ]);

    if (responses.some(response => !response.ok)) {
      throw new Error(
        "Could not load Birds map, CSV or state boundaries."
      );
    }

    const [spec, csvText, geography] = await Promise.all([
      responses[0].json(),
      responses[1].text(),
      responses[2].json()
    ]);

    const rows = vega.read(csvText, { type: "csv" });

    const points = rows.map(row => {
      const longitude = Number(row.longitude);
      const latitude = Number(row.latitude);

      const location = turf.point([longitude, latitude]);

      const polygon = geography.features.find(feature =>
        turf.booleanPointInPolygon(location, feature)
      );

      return {
        ...row,
        longitude,
        latitude,
        species_count: Number(row.species_count),
        monitoring_records: Number(row.monitoring_records),
        mapped_state: polygon
          ? polygon.properties.STATE_NAME
          : "Outside state boundaries"
      };
    });

    // Use geographically checked states.
    spec.layer[1].data = { values: points };

    spec.layer[1].transform = [{
      filter:
        "chosenState === 'All states' || datum.mapped_state === chosenState"
    }];

    spec.layer[1].encoding.tooltip = [
      {
        field: "mapped_state",
        type: "nominal",
        title: "Centroid location"
      },
      {
        field: "state",
        type: "nominal",
        title: "Recorded state (original data)"
      },
      {
        field: "region",
        type: "nominal",
        title: "Monitoring region"
      },
      {
        field: "species_count",
        type: "quantitative",
        title: "Monitored bird species",
        format: ",d"
      },
      {
        field: "monitoring_records",
        type: "quantitative",
        title: "Monitoring records",
        format: ",d"
      }
    ];

    return spec;

  })().catch(error => {
    birdSpecPromise = null;
    throw error;
  });

  return birdSpecPromise;
}


/* ==========================================
   SPECIES EXPLORER — DYNAMIC CHARTS
========================================== */

const speciesButtons =
  document.querySelectorAll(".species-btn");

const speciesTitle =
  document.getElementById("species-chart-title");

const speciesDescription =
  document.getElementById("species-chart-description");

const speciesFinding =
  document.getElementById("species-chart-finding");

const speciesInstruction =
  document.getElementById("species-chart-instruction");

const speciesControls =
  document.getElementById("species_controls");

const speciesChartContainer =
  document.getElementById("species_chart");

let selectionVersion = 0;

async function showSpeciesChart(species) {
  const version = ++selectionVersion;

  speciesButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.species === species
    );
  });

  if (speciesInstruction) {
    speciesInstruction.hidden = species !== "birds";
  }

  if (speciesControls) {
    speciesControls.replaceChildren();
  }

  const chart = speciesCharts[species];

  if (!chart) {
    speciesChartContainer.replaceChildren();
    return;
  }

  speciesTitle.textContent = chart.title;
  speciesDescription.textContent = chart.description;

  speciesFinding.innerHTML =
    "<strong>Key Finding:</strong> " + chart.finding;

  speciesChartContainer.replaceChildren();

  try {
    const chartSpec = species === "birds"
      ? await getBirdMapWithGeographicStates()
      : chart.file;

    if (version !== selectionVersion) return;

    const options = { actions: false };

    if (
      ["birds", "mammals", "plants", "reptiles"].includes(species) &&
      speciesControls
    ) {
      options.bind = "#species_controls";
    }

    await vegaEmbed(
      "#species_chart",
      chartSpec,
      options
    );

  } catch (error) {
    if (version !== selectionVersion) return;

    console.error("Species chart failed:", error);

    speciesChartContainer.textContent =
      "Chart could not load. Check the browser console.";
  }
}

speciesButtons.forEach(button => {
  button.addEventListener("click", () => {
    showSpeciesChart(button.dataset.species);
  });
});

if (speciesChartContainer) {
  showSpeciesChart("all");
}


/* ==========================================
   SECTION 2 — CONSERVATION NETWORK
========================================== */

function embedConservationChart(selector, file) {
  const target = document.querySelector(selector);

  if (!target) return;

  vegaEmbed(selector, file, {
    actions: false,
    renderer: "canvas"
  })
    .then(() => {
      console.log("Conservation chart loaded:", file);
    })
    .catch(error => {
      console.error("Conservation chart error:", file, error);

      target.textContent =
        "Chart could not load: " + error.message;

      target.style.color = "#B54A3A";
      target.style.padding = "20px";
    });
}

embedConservationChart(
  "#conservation_growth_chart",
  "js/protected_land_trend.json"
);

embedConservationChart(
  "#governance_waffle_chart",
  "js/protected_governance_waffle.json"
);


/* ==========================================
   SECTION 5 — GREAT BARRIER REEF
========================================== */

// Charts 1 and 2.
function loadReefVisualisation(
  selector,
  specFile,
  controlsSelector
) {
  const element = document.querySelector(selector);
  if (!element) return;

  const options = {
    actions: false,
    renderer: "svg"
  };

  if (
    controlsSelector &&
    document.querySelector(controlsSelector)
  ) {
    options.bind = controlsSelector;
  }

  vegaEmbed(selector, specFile, options)
    .catch(error => {
      console.error("Reef chart failed:", specFile, error);
      element.textContent = "Chart could not load.";
    });
}

loadReefVisualisation(
  "#reef_activity_chart",
  "js/reef_cots_annual_control.json",
  "#reef_activity_controls"
);

loadReefVisualisation(
  "#reef_before_after_chart",
  "js/reef_john_brewer_before_after.json"
);


/* ==========================================
   REEF CHOROPLETH — GEOGRAPHIC BOUNDARIES
========================================== */

const REEF_BIOREGIONS_API =
  "https://services7.arcgis.com/VR04g7C6WRYLS9jd/ArcGIS/rest/services/GBRMPA_Data/FeatureServer/11/query";

function rewindReefRing(ring, outer) {
  const signedArea = ring.slice(0, -1).reduce(
    (sum, point, i) => {
      const next = ring[i + 1];

      return sum +
        point[0] * next[1] -
        next[0] * point[1];
    },
    0
  );

  const clockwise = signedArea < 0;

  return clockwise === outer
    ? ring
    : ring.slice().reverse();
}

function prepareReefGeometry(geometry) {
  if (!geometry || !geometry.coordinates) {
    return geometry;
  }

  const result = JSON.parse(JSON.stringify(geometry));

  if (result.type === "Polygon") {
    result.coordinates = result.coordinates.map(
      (ring, i) => rewindReefRing(ring, i === 0)
    );
  } else if (result.type === "MultiPolygon") {
    result.coordinates = result.coordinates.map(
      polygon => polygon.map(
        (ring, i) => rewindReefRing(ring, i === 0)
      )
    );
  }

  return result;
}

async function fetchReefBioregions() {
  const all = [];
  const pageSize = 600;

  for (let offset = 0; offset < 30000; offset += pageSize) {
    const params = new URLSearchParams({
      where: "1=1",
      outFields: "FID,BIOREGION,DESCRIP,LOC_NAME,LABEL",
      outSR: "4326",
      returnGeometry: "true",
      geometryPrecision: "4",
      maxAllowableOffset: "0.002",
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
      f: "geojson"
    });

    const response = await fetch(
      REEF_BIOREGIONS_API + "?" + params.toString()
    );

    if (!response.ok) {
      throw new Error(
        "Reef boundary request failed: HTTP " +
        response.status
      );
    }

    const body = await response.json();

    if (body.error) {
      throw new Error(body.error.message || "Boundary error");
    }

    if (!Array.isArray(body.features)) {
      throw new Error("Boundary service returned invalid GeoJSON");
    }

    all.push(...body.features);

    if (body.features.length < pageSize) break;
  }

  if (all.length === 0 || all.length >= 30000) {
    throw new Error("Complete reef polygons could not be retrieved");
  }

  return all
    .filter(feature =>
      feature &&
      feature.geometry &&
      ["Polygon", "MultiPolygon"].includes(feature.geometry.type) &&
      feature.properties &&
      feature.properties.BIOREGION != null
    )
    .map(feature => {
      const properties = feature.properties;

      const regionName =
        properties.DESCRIP?.trim() ||
        properties.LOC_NAME?.trim() ||
        "Marine reef bioregion " + properties.BIOREGION;

      return {
        ...feature,
        geometry: prepareReefGeometry(feature.geometry),
        properties: {
          ...properties,
          region_key: String(properties.BIOREGION),
          region_name: regionName
        }
      };
    });
}


/* ==========================================
   LOAD REEF CHOROPLETH AND MATCH AIMS DATA
========================================== */

async function loadCoralBioregionChoropleth() {
  const target = document.getElementById(
    "reef_coral_choropleth_chart"
  );

  const status = document.getElementById(
    "reef_choropleth_status"
  );

  if (!target) return;

  function report(message, state) {
    if (status) {
      status.textContent = message;
      status.dataset.status = state;
    }
  }

  try {
    if (typeof turf === "undefined") {
      throw new Error("Turf.js has not loaded.");
    }

    const [specResponse, sitesResponse, features] =
      await Promise.all([
        fetch("js/reef_coral_bioregion_choropleth.json"),
        fetch("data/reef_coral_latest_sites_by_period.csv"),
        fetchReefBioregions()
      ]);

    if (!specResponse.ok || !sitesResponse.ok) {
      throw new Error("Map JSON or AIMS CSV could not be loaded");
    }

    const spec = await specResponse.json();
    const sitesText = await sitesResponse.text();
    const sites = vega.read(sitesText, { type: "csv" });

    const polygons = features.map(feature => ({
      feature,
      bounds: turf.bbox(feature)
    }));

    const statsByPeriodAndRegion = new Map();
    const matchedSiteIds = new Set();

    // Match each monitoring point to a marine bioregion.
    for (const site of sites) {
      const lon = Number(site.longitude);
      const lat = Number(site.latitude);
      const cover = Number(site.coral_pct);

      if (
        !Number.isFinite(lon) ||
        !Number.isFinite(lat) ||
        !Number.isFinite(cover) ||
        cover < 0 ||
        cover > 100
      ) continue;

      const location = turf.point([lon, lat]);

      let matched = null;

      for (const poly of polygons) {
        const [left, bottom, right, top] = poly.bounds;

        if (
          lon < left ||
          lon > right ||
          lat < bottom ||
          lat > top
        ) continue;

        if (
          turf.booleanPointInPolygon(location, poly.feature)
        ) {
          matched = poly.feature;
          break;
        }
      }

      if (!matched) continue;

      const regionKey = matched.properties.region_key;
      const key = regionKey + "|" + site.period;
      const year = Number(site.report_year);

      if (!statsByPeriodAndRegion.has(key)) {
        statsByPeriodAndRegion.set(key, {
          join_key: key,
          sum: 0,
          reef_count: 0,
          earliest_year: year,
          latest_year: year
        });
      }

      const row = statsByPeriodAndRegion.get(key);

      row.sum += cover;
      row.reef_count += 1;
      row.earliest_year = Math.min(row.earliest_year, year);
      row.latest_year = Math.max(row.latest_year, year);

      matchedSiteIds.add(
        site.period + "|" + site.reef_id
      );
    }

    if (statsByPeriodAndRegion.size === 0) {
      throw new Error(
        "No AIMS reef observations matched the marine bioregions"
      );
    }

    function bandForCover(value) {
      if (value < 10) return "0–<10%";
      if (value < 20) return "10–<20%";
      if (value < 30) return "20–<30%";
      if (value < 40) return "30–<40%";
      if (value < 50) return "40–<50%";
      return "50%+";
    }

    const regionStats = [
      ...statsByPeriodAndRegion.values()
    ].map(row => {
      const mean = row.sum / row.reef_count;

      return {
        join_key: row.join_key,
        reef_count: row.reef_count,
        mean_coral_cover_pct: Number(mean.toFixed(2)),
        cover_band: bandForCover(mean),
        earliest_year: row.earliest_year,
        latest_year: row.latest_year
      };
    });

    const mapFeatures = features.map(feature => ({
      region_key: feature.properties.region_key,
      region_name: feature.properties.region_name,
      geometry: feature.geometry
    }));

    // Insert the calculated geography and data.
    spec.layer[1].data = {
      values: mapFeatures
    };

    spec.layer[2].data = {
      values: mapFeatures
    };

    spec.layer[2].transform[1].from.data = {
      values: regionStats
    };

    // Reduce borders around small polygons.
    spec.layer[1].mark.strokeWidth = 0.12;
    spec.layer[2].mark.strokeWidth = 0.2;
    spec.layer[2].mark.opacity = 1;


    /* ======================================
       REEF REGIONAL ZOOM
    ====================================== */

    const reefZoomPresets = {
      all: {
        center: [147.75, -18.1],
        scale: 3020
      },
      north: {
        center: [145.1, -13.8],
        scale: 7200
      },
      central: {
        center: [147.0, -18.2],
        scale: 7200
      },
      south: {
        center: [150.8, -22.0],
        scale: 7200
      }
    };

    const zoomSelector =
      document.getElementById("reef_region_view");

    const vegaControls =
      document.getElementById(
        "reef_coral_choropleth_controls"
      );

    let reefEmbedResult = null;

    async function drawReefZoom() {
      const mode = zoomSelector
        ? zoomSelector.value
        : "all";

      const projection =
        reefZoomPresets[mode] || reefZoomPresets.all;

      let period = "2016–2025";
      let showSites = false;

      // Preserve the existing interactive selections.
      if (reefEmbedResult && reefEmbedResult.view) {
        period = reefEmbedResult.view.signal(
          "selectedPeriod"
        );

        showSites = reefEmbedResult.view.signal(
          "showSurveySites"
        );

        reefEmbedResult.view.finalize();
      }

      const zoomedSpec = {
        ...spec,
        projection: {
          ...spec.projection,
          ...projection
        },
        params: spec.params.map(parameter => {
          if (parameter.name === "selectedPeriod") {
            return { ...parameter, value: period };
          }

          if (parameter.name === "showSurveySites") {
            return { ...parameter, value: showSites };
          }

          return parameter;
        })
      };

      if (vegaControls) {
        vegaControls.replaceChildren();
      }

      if (zoomSelector) {
        zoomSelector.disabled = true;
      }

      try {
        reefEmbedResult = await vegaEmbed(
          "#reef_coral_choropleth_chart",
          zoomedSpec,
          {
            actions: false,
            renderer: "svg",
            bind: "#reef_coral_choropleth_controls"
          }
        );
      } finally {
        if (zoomSelector) {
          zoomSelector.disabled = false;
        }
      }
    }

    if (zoomSelector) {
      zoomSelector.addEventListener("change", () => {
        drawReefZoom().catch(error => {
          console.error("Reef zoom failed:", error);

          report(
            "Unable to change map view: " + error.message,
            "error"
          );
        });
      });
    }

    await drawReefZoom();

    report(
      "Official reef marine bioregions · " +
      features.length.toLocaleString() +
      " polygons · " +
      matchedSiteIds.size.toLocaleString() +
      " matched reef-period observations.",
      "ready"
    );

    console.log(
      "Reef choropleth loaded:",
      features.length,
      "polygons,",
      regionStats.length,
      "regional summaries"
    );

  } catch (error) {
    console.error("Reef choropleth failed:", error);

    report(
      "Map could not load: " +
      error.message +
      ". Check internet access and browser Console.",
      "error"
    );

    target.textContent = "";
  }
}

loadCoralBioregionChoropleth();
