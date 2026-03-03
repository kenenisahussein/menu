// main.js – Handles data loading, rendering, and interactions

let currentLanguage = "en";
let menuData = null;
let allItems = [];

// DOM elements
const langSelect = document.getElementById("lang-select");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");
const heroBtn = document.getElementById("hero-btn");
const sectionTitle = document.getElementById("section-title");
const filterButtonsDiv = document.getElementById("filter-buttons");
const menuGrid = document.getElementById("menu-grid");
const footer = document.querySelector("footer p");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set up language switcher
  langSelect.addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    updateUILanguage();
    if (menuData) renderMenu(menuData, currentLanguage);
  });

  // Fetch menu data
  fetchMenu();
});

// Fetch menu JSON
function fetchMenu() {
  menuGrid.innerHTML =
    '<div class="loading">' + translations.en.loading + "</div>";
  fetch("/content/menu.json")
    .then((res) => res.json())
    .then((data) => {
      menuData = data;
      allItems = extractAllItems(data); // flatten items with category info
      updateUILanguage();
      renderMenu(data, currentLanguage);
      renderFilterButtons(data);
    })
    .catch((err) => {
      console.error("Error loading menu:", err);
      menuGrid.innerHTML =
        '<div class="loading">Failed to load menu. Please try again later.</div>';
    });
}

// Flatten categories into array of items with category name
function extractAllItems(data) {
  const items = [];
  data.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      items.push({
        ...item,
        categoryName: cat.name, // store category name for filtering
      });
    });
  });
  return items;
}

// Render menu items based on selected language and filter
function renderMenu(data, lang, filterCategory = "All") {
  menuGrid.innerHTML = "";
  const itemsToRender =
    filterCategory === "All"
      ? allItems
      : allItems.filter(
          (item) =>
            item.categoryName[lang] === filterCategory ||
            item.categoryName === filterCategory,
        );

  if (itemsToRender.length === 0) {
    menuGrid.innerHTML =
      '<div class="loading">No items in this category.</div>';
    return;
  }

  itemsToRender.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "menu-item";
    // Add animation delay based on index
    itemDiv.style.animationDelay = `${index * 0.1}s`;

    const name = item.name[lang] || item.name.en;
    const desc = item.description[lang] || item.description.en;
    const price = item.price;
    const image =
      item.image || "https://via.placeholder.com/300x200?text=No+Image";
    const category = item.categoryName[lang] || item.categoryName.en;

    itemDiv.innerHTML = `
            <img src="${image}" alt="${name}" loading="lazy">
            <div class="menu-item-content">
                <h3>${name}</h3>
                <p class="description">${desc}</p>
                <span class="price">$${price.toFixed(2)}</span>
                <span class="category-tag">${category}</span>
            </div>
        `;
    menuGrid.appendChild(itemDiv);
  });
}

// Create filter buttons from categories
function renderFilterButtons(data) {
  const categories = data.categories.map((cat) => cat.name);
  const uniqueCats = ["All", ...new Set(categories)]; // include "All"

  filterButtonsDiv.innerHTML = "";
  uniqueCats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cat[currentLanguage] || cat; // use translated category if available
    btn.dataset.category = cat; // store original category key
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filterCat =
        btn.dataset.category === "All" ? "All" : btn.dataset.category;
      renderMenu(menuData, currentLanguage, filterCat);
    });
    filterButtonsDiv.appendChild(btn);
  });
  // Set "All" as active by default
  filterButtonsDiv.firstChild.classList.add("active");
}

// Update static UI texts based on selected language
function updateUILanguage() {
  const t = translations[currentLanguage];
  heroTitle.textContent = t.heroTitle;
  heroSubtitle.textContent = t.heroSubtitle;
  heroBtn.textContent = t.heroBtn;
  sectionTitle.textContent = t.sectionTitle;
  footer.textContent = t.footer;
  // Update filter button texts if they exist
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.category === "All") {
      btn.textContent = t.filterAll;
    } else {
      // For category names, we need to get the translated version from menuData
      // This is handled inside renderFilterButtons on language change? We'll re-render filters on language change.
    }
  });
  // Re-render filter buttons if menuData is loaded to update category names
  if (menuData) {
    renderFilterButtons(menuData);
    // Re-render menu with current filter (active button)
    const activeBtn = document.querySelector(".filter-btn.active");
    const filterCat = activeBtn ? activeBtn.dataset.category : "All";
    renderMenu(menuData, currentLanguage, filterCat);
  }
}
