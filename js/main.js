let products = [];
let cart = [];
let currentFilter = "all";

// جلب المنتجات من ملف JSON
async function loadProducts() {
  document.getElementById("loader").style.display = "block";
  try {
    const response = await fetch("data/products.json");
    const data = await response.json();
    products = data.products || data;
    displayProducts();
  } catch (error) {
    console.error("خطأ في جلب المنتجات:", error);
  }
  document.getElementById("loader").style.display = "none";
}

// عرض المنتجات
function displayProducts(productsToShow = products) {
  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";

  if (!productsToShow || productsToShow.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-products">
        لم نجد منتجات بهذا الاسم !
      </div>
    `;
    return;
  }

  productsToShow.forEach((product, i) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.style.animationDelay = `${i * 0.15}s`;

    const discountBadge = product.discount
      ? `<div class="discount-badge">خصم ${product.discount}%</div>`
      : "";

    const finalPrice = product.discount
      ? product.price - (product.price * product.discount) / 100
      : product.price;

    productCard.innerHTML = `
      <div class="product-image" style="cursor:pointer" onclick="goToDetails(${
        product.id
      })">
        ${discountBadge}
        <img src="img/products/${
          product.images && product.images.length ? product.images[0] : ""
        }" 
            alt="${product.name}" 
            style="width:100%;height:120px;object-fit:cover;border-radius:12px;" 
            loading="lazy" />
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">
          ${
            product.discount
              ? `<span style="text-decoration: line-through; color: #7f8c8d; font-size: 1rem;">${product.price}</span> `
              : ""
          }
          ${finalPrice} ر.س
        </div>
        <button class="add-to-cart" onclick="addToCart(${product.id})">
          إضافة للسلة
        </button>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });
}

// دالة الانتقال إلى صفحة التفاصيل
function goToDetails(id) {
  const product = products.find((p) => p.id === id);
  if (product) {
    localStorage.clear();
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = `product.html?id=${id}`;
  } else {
    console.error("لم يتم العثور على المنتج!");
  }
}

// تصفية المنتجات
function filterProducts(category) {
  currentFilter = category;
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  displayProducts(filteredProducts);

  // تحديث حالة التبويبات
  document.querySelectorAll(".category-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
}

// البحث عن المنتجات
function searchProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
  );
  displayProducts(filteredProducts);

  // الانتقال إلى قسم المنتجات بعد البحث
  const productsSection = document.getElementById("productsGrid");
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// إضافة منتج للسلة
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const finalPrice = product.discount
      ? product.price - (product.price * product.discount) / 100
      : product.price;
    cart.push({
      ...product,
      quantity: 1,
      finalPrice: finalPrice,
    });
  }

  updateCartDisplay();
  updateCartCount();
}

// تحديث عدد المنتجات في السلة
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems === 0) {
    cartCount.style.display = "none";
  } else {
    cartCount.style.display = "block";
    cartCount.textContent = totalItems;
  }
}

// تحديث عرض السلة
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItems.innerHTML = `
                    <div class="empty-cart">
                        <p>السلة فارغة</p>
                        <p>أضف منتجات للمتابعة</p>
                    </div>
                `;
    cartTotal.style.display = "none";
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    const itemTotal = item.finalPrice * item.quantity;
    total += itemTotal;

    cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.finalPrice} ر.س</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">حذف</button>
                `;

    cartItems.appendChild(cartItem);
  });

  document.getElementById("totalAmount").textContent = total.toFixed(2);
  cartTotal.style.display = "block";
}

// تغيير كمية المنتج
function changeQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartDisplay();
      updateCartCount();
    }
  }
}

// حذف منتج من السلة
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartDisplay();
  updateCartCount();
}

// فتح/إغلاق السلة
function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("overlay");

  if (cartSidebar.classList.contains("open")) {
    closeCart();
  } else {
    cartSidebar.classList.add("open");
    overlay.classList.add("show");
    updateCartDisplay();
  }
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// إتمام الشراء
function checkout() {
  if (cart.length === 0) {
    alert("السلة فارغة!");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0
  );
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  alert(
    `تم تأكيد طلبك!\nعدد المنتجات: ${itemsCount}\nالمجموع: ${total.toFixed(
      2
    )} ر.س\nسيتم التواصل معك قريباً لتأكيد التسليم.`
  );

  // إفراغ السلة
  cart = [];
  updateCartDisplay();
  updateCartCount();
  closeCart();
}

// البحث عند الضغط على Enter
document
  .getElementById("searchInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchProducts();
    }
  });

// تحميل المنتجات عند بدء التشغيل
document.addEventListener("DOMContentLoaded", function () {
  displayProducts();
  loadProducts();
});

function checkHeaderTop() {
  const header = document.querySelector("header");
  // إذا كان الهيدر في أعلى الصفحة (scrollY == 0)
  if (window.scrollY === 0) {
    header.classList.add("top");
  } else {
    header.classList.remove("top");
  }
}

// تحقق عند تحميل الصفحة وعند التمرير
window.addEventListener("scroll", checkHeaderTop);
document.addEventListener("DOMContentLoaded", checkHeaderTop);

