const products = [
    {
        id: 1,
        name: "Naruto Uzumaki Costume",
        price: "$39.99",
        category: "Anime",
        description: "Authentic Naruto Uzumaki costume for cosplay events."
    },
    {
        id: 2,
        name: "Sailor Moon Costume",
        price: "$44.99",
        category: "Anime",
        description: "Classic Sailor Moon outfit, perfect for fans of the series."
    },
    {
        id: 3,
        name: "Spider-Man Suit",
        price: "$49.99",
        category: "Marvel",
        description: "Swing into action with this Spider-Man cosplay suit."
    },
    {
        id: 4,
        name: "Iron Man Armor",
        price: "$99.99",
        category: "Marvel",
        description: "High-quality Iron Man armor replica for true Marvel fans."
    },
    {
        id: 5,
        name: "Geralt of Rivia Costume",
        price: "$69.99",
        category: "Game",
        description: "The Witcher Geralt costume, detailed and rugged."
    },
    {
        id: 6,
        name: "Zelda Princess Dress",
        price: "$59.99",
        category: "Game",
        description: "Beautiful Princess Zelda dress for fantasy lovers."
    }
];

let cart = [];
let currentCategory = "All";

function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    let filtered = products;
    if (currentCategory !== "All") {
        filtered = products.filter(p => p.category === currentCategory);
    }
    filtered.forEach(product => {
        productList.innerHTML += `
            <div class="product" onclick="showProductDetails(event, ${product.id})">
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <p>Price: ${product.price}</p>
                <button onclick="addToCart(event, ${product.id})">Add to Cart</button>
            </div>
        `;
    });
}

window.onload = displayProducts;

window.filterCategory = function(category) {
    currentCategory = category;
    displayProducts();
}

window.addToCart = function(event, id) {
    event.stopPropagation();
    const item = cart.find(p => p.id === id);
    if (item) {
        item.quantity += 1;
    } else {
        const product = products.find(p => p.id === id);
        cart.push({...product, quantity: 1});
    }
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

document.getElementById('cart-btn').onclick = function() {
    document.getElementById('cart-modal').style.display = 'block';
    displayCart();
};
document.getElementById('close-cart').onclick = function() {
    document.getElementById('cart-modal').style.display = 'none';
};

function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const price = Number(item.price.replace('$',''));
        total += price * item.quantity;
        cartItems.innerHTML += `
            <li>
                ${item.name} x${item.quantity} - $${(price * item.quantity).toFixed(2)}
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </li>
        `;
    });
    document.getElementById('cart-total').textContent = 'Total: $' + total.toFixed(2);
}

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    displayCart();
    updateCartCount();
}

window.showProductDetails = function(event, id) {
    if (event.target.tagName === "BUTTON") return;
    const product = products.find(p => p.id === id);
    document.getElementById('details-name').textContent = product.name;
    document.getElementById('details-category').textContent = "Category: " + product.category;
    document.getElementById('details-description').textContent = product.description;
    document.getElementById('details-price').textContent = "Price: " + product.price;
    document.getElementById('details-modal').style.display = 'block';
}
document.getElementById('close-details').onclick = function() {
    document.getElementById('details-modal').style.display = 'none';
};