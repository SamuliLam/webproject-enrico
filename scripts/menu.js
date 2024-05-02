import { updateCartDisplay } from "./main.js";

const mergedData = [];
const shoppingCart = [];
if (sessionStorage.getItem("shoppingCart") !== null) {
    shoppingCart.push(...JSON.parse(sessionStorage.getItem("shoppingCart")));
} else {
    sessionStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
}

window.onload = async function () {

    try {
        const response = await fetch("http://10.120.32.55/app/api/v1/products");
        const data = await response.json();

        if (response.ok) {
            const categories = [...new Set(data.map(product => product.category))];

            data.forEach(product => {
                const existingProduct = mergedData.find(item => item.id === product.id);
                if (existingProduct) {
                    product.allergens.forEach(allergen => {
                        if (!existingProduct.allergens.find(existingAllergen => existingAllergen.id === allergen.id)) {
                            existingProduct.allergens.push(allergen);
                        }
                    });
                } else {
                    mergedData.push(product);
                }
            });

            categories.forEach(category => {
                const headerRow = document.createElement("div");
                headerRow.classList.add("menu-row", "menu-header");
                const headerNames = ["Name", "Description", "Price (€)", "Allergens", "Buy"];
                headerNames.forEach(name => {
                    const headerCell = document.createElement("div");
                    headerCell.classList.add("menu-cell");
                    headerCell.textContent = name;
                    headerRow.appendChild(headerCell);
                });

                const categoryList = getCategoryList(category);
                if (categoryList) {
                    categoryList.appendChild(headerRow);
                }

                mergedData.filter(product => product.category.toLowerCase() === category.toLowerCase())
                    .forEach(product => {
                        const menuItem = document.createElement("div");
                        menuItem.classList.add("menu-row", "menu-item");

                        const cells = ["name", "description", "price", "allergens"];
                        cells.forEach(key => {
                            const cell = document.createElement("div");
                            cell.classList.add("menu-cell");
                            if (key === "allergens") {
                                const allergenCell = document.createElement("div");
                                allergenCell.classList.add("menu-cell");
                                allergenCell.textContent = product.allergens.map(allergen => allergen.name).join(", ");
                                menuItem.appendChild(allergenCell);
                            } else {
                                cell.textContent = product[key];
                                menuItem.appendChild(cell);
                            }
                        });

                        const orderButtonCell = document.createElement("div");
                        orderButtonCell.classList.add("menu-cell");
                        const orderButton = document.createElement("button");
                        orderButton.classList.add("cart-button");
                        orderButton.innerHTML = "&#x1F6D2;";
                        orderButton.addEventListener("click", function () {
                            const shoppingCart = JSON.parse(sessionStorage.getItem("shoppingCart")) || [];

                            if (!shoppingCart.some(item => item.id === product.id)) {
                                product.quantity = 1;
                                shoppingCart.push(product);
                            } else {
                                shoppingCart.find(item => item.id === product.id).quantity++;
                            }

                            sessionStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
                            updateCartDisplay();
                        });
                        orderButtonCell.appendChild(orderButton);
                        menuItem.appendChild(orderButtonCell);
                        if (categoryList) {
                            categoryList.appendChild(menuItem);
                        }
                    });
            });
        } else {
            console.error("Failed to fetch products:", data.error);
        }
    } catch (error) {
        console.error("Error fetching products:", error.message);
    }
};

function getCategoryList(category) {
    const lowercaseCategory = category.toLowerCase();
    switch (lowercaseCategory) {
        case "pizza":
            return document.getElementById("pizza-list");
        case "salad":
            return document.getElementById("salad-list");
        case "appetizer":
            return document.getElementById("appetizer-list");
        case "kebab":
            return document.getElementById("kebab-list");
        default:
            return null;
    }
}
