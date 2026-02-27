var csvData = [];
let typeFilter;
let sortSelector;
let currentView = [];

class CatalogItem {
    constructor(object) {
      this.title = object.title;
      this.type = object.type;
      this.author = object.author;
      this.genre = object.genre;
      this.description = object.description;
      this.year = Number(object.year);
      this.rating = Number(object.rating);
    }
}


// Reference: https://plnkr.co/edit/DbBfnc6XaMppCvkEoqql?p=preview&preview
function filterControl(items){
    typeFilter.innerHTML = `<option>All</option>`; 
    const types = [...new Set(items.map(item => item.type))].sort();
    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;       
        opt.textContent = t; 
        typeFilter.appendChild(opt);
    })
}


function renderCards(items){
    currentView = items; 
    const fileInput = document.getElementById("csvInput");
    const result = document.getElementById("result");
    const numItems = document.getElementById("numItems");
    const emptyState = document.getElementById("emptyState");
    const cards = document.getElementById("cardDisplay");

    if (!fileInput){
        return;
    }
    cards.innerHTML = "";
    result.textContent = `Loaded ${items.length} items`;
    numItems.textContent = `${items.length} items`;
    if (items.length == 0){
        emptyState.style.display = "block";
    }else{
        emptyState.style.display = "none";
    }

    let html = "";
    items.forEach((obj,index) => {
        html += `
        <div class="col">
            <div class="card h-100 shadow-sm custom-card" data-index="${index}" >
                <div class="card-body">
                    <h5 class="card-title">${obj.title}</h5>
                    <p class="mb-1">by ${obj.author}</p>
                    <p class="mb-1"> ${obj.type} ${obj.year} &nbsp; &#127775 ${obj.rating}</p>
                </div>
            </div>
        </div>
        `;
    });
    cards.innerHTML = html;
}

function onCardClick(e) {
    const card = e.target.closest(".custom-card");
    if (!card) return;
  
    const index = Number(card.dataset.index);
    const item = currentView[index];
    if (!item) return;
  
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalMetaLines").innerHTML = `
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Author:</strong> ${item.author}</p>
      <p><strong>Genre:</strong> ${item.genre}</p>
      <p><strong>Year:</strong> ${item.year}</p>
      <p><strong>Rating:</strong> ${item.rating}</p>
    `;
    document.getElementById("modalDescription").textContent = item.description;
    const modal = new bootstrap.Modal(document.getElementById("itemModal"));
    modal.show();
}


  
function handleFileSelect(event){
    const file = event.target.files[0];
    if (!file){
        return;
    }
    const reader = new FileReader()
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0])
}
  
function handleFileLoad(event){
    const text = event.target.result;
    const rows = text.split("\n");
    const headers = rows[0].split(",");
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(",");
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j].trim();
        }
        data.push(new CatalogItem(obj));
    }
    console.log(data);
    csvData = data;
    filterControl(csvData);
    renderCards(csvData);
}

function applyFilters(data) {
    let filtered = [...data];
    if (typeFilter.value !== "All") {
        filtered = filtered.filter(item => item.type === typeFilter.value);
    }
    return filtered;
}

function applySort(data) {
    let sorted = [...data];
    if (sortSelector.value != "None"){
        switch (sortSelector.value) {
            case "year-desc":
                sorted.sort((a, b) => b.year - a.year);
                break;
            case "year-asc":
                sorted.sort((a, b) => a.year - b.year);
                break;
            case "rating-desc":
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case "rating-asc":
                sorted.sort((a, b) => a.rating - b.rating);
                break;
        }
    }
    return sorted;
}

function filter(){
    let result = applyFilters(csvData);
    result = applySort(result);
    renderCards(result);
}

function init(){
    typeFilter = document.getElementById("typeFilter");
    sortSelector = document.getElementById("sortSelector");

    document.getElementById('csvInput')
        .addEventListener('change', handleFileSelect, false);

    typeFilter.addEventListener("change", filter);
    sortSelector.addEventListener("change", filter);
    document.getElementById("cardDisplay").addEventListener("click", onCardClick);
}

document.addEventListener("DOMContentLoaded", init);

