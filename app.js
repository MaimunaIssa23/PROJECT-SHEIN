// ------- Data (يمكنك نقله لملف JSON لاحقاً) -------
const PRODUCTS = [
    { id: 1, title: "Men T-Shirt", price: 19.99, category: "men", img: "https://source.unsplash.com/400x500/?tshirt,men" },
    { id: 2, title: "Women Dress", price: 49.99, category: "women", img: "https://source.unsplash.com/400x500/?dress,women" },
    { id: 3, title: "Kids Jacket", price: 29.99, category: "kids", img: "https://source.unsplash.com/400x500/?kids,jacket" },
    { id: 4, title: "Men Hoodie", price: 34.99, category: "men", img: "https://source.unsplash.com/400x500/?hoodie,men" },
    { id: 5, title: "Women Blazer", price: 59.99, category: "women", img: "https://source.unsplash.com/400x500/?blazer,women" },
    { id: 6, title: "Kids Sneakers", price: 24.99, category: "kids", img: "https://source.unsplash.com/400x500/?sneakers,kids" },
  ];
  
  // ------- Helpers -------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  
  function getCart(){
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
  function saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount(){
    const count = getCart().reduce((sum, i) => sum + i.qty, 0);
    const el = $("#cart-count");
    if (el) el.textContent = count;
  }
  
  // ------- Shop Page -------
  function initShopPage(){
    updateCartCount();
  
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get("category");
  
    const grid = $("#products-grid");
    const filterCategory = $("#filter-category");
    const filterSort = $("#filter-sort");
  
    if (categoryFromURL) filterCategory.value = categoryFromURL;
  
    function render(){
      let list = [...PRODUCTS];
  
      // filter
      const cat = filterCategory.value;
      if (cat) list = list.filter(p => p.category === cat);
  
      // sort
      const sortVal = filterSort.value;
      if (sortVal === "price-asc") list.sort((a,b)=>a.price-b.price);
      if (sortVal === "price-desc") list.sort((a,b)=>b.price-a.price);
  
      grid.innerHTML = list.map(p => `
        <div class="product-card">
          <img src="${p.img}" alt="${p.title}">
          <div class="info">
            <h4>${p.title}</h4>
            <p class="price">$${p.price.toFixed(2)}</p>
            <div class="actions">
              <a class="btn" href="product.html?id=${p.id}">View</a>
              <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  
    filterCategory.addEventListener('change', render);
    filterSort.addEventListener('change', render);
  
    render();
  }
  
  // ------- Product Page -------
  function initProductPage(){
    updateCartCount();
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const product = PRODUCTS.find(p => p.id === id);
  
    const holder = $("#product-details");
    if(!product){
      holder.innerHTML = "<p>Product not found.</p>";
      return;
    }
  
    holder.innerHTML = `
      <div>
        <img src="${product.img}" alt="${product.title}">
      </div>
      <div class="pd-info">
        <h2>${product.title}</h2>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p>Category: ${product.category}</p>
        <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
  }
  
  // ------- Cart -------
  function addToCart(id){
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1){
      cart[idx].qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    saveCart(cart);
    alert("Added to cart!");
  }
  
  function removeFromCart(id){
    let cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    renderCartPage();
  }
  
  function changeQty(id, delta){
    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){
      return removeFromCart(id);
    }
    saveCart(cart);
    renderCartPage();
  }
  
  function renderCartPage(){
    updateCartCount();
    const container = $("#cart-items");
    const cart = getCart();
    if(cart.length === 0){
      container.innerHTML = "<p>Your cart is empty.</p>";
      $("#cart-total").textContent = "0.00";
      return;
    }
  
    let total = 0;
    container.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      const subtotal = product.price * item.qty;
      total += subtotal;
      return `
        <div class="cart-item">
          <img src="${product.img}" alt="${product.title}"/>
          <div style="flex:1">
            <h4>${product.title}</h4>
            <p>$${product.price.toFixed(2)} x ${item.qty} = $${subtotal.toFixed(2)}</p>
            <div>
              <button onclick="changeQty(${item.id}, -1)">-</button>
              <button onclick="changeQty(${item.id}, 1)">+</button>
              <button onclick="removeFromCart(${item.id})" style="color:#ef4444">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  
    $("#cart-total").textContent = total.toFixed(2);
  }
  
  // on every page load update count
  document.addEventListener("DOMContentLoaded", updateCartCount);
  