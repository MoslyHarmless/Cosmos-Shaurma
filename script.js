document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let cart = [];
    let currentProduct = null;
    let currentQty = 1;

    // DOM Elements
    const searchInput = document.getElementById('menu-search');
    const chips = document.querySelectorAll('.chip');
    const menuItems = document.querySelectorAll('.menu-item');

    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.getElementById('cart-count');
    const cartDialog = document.getElementById('cart-dialog');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    const checkoutDialog = document.getElementById('checkout-dialog');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const checkoutForm = document.getElementById('checkout-form');

    const successDialog = document.getElementById('success-dialog');
    const closeSuccessBtn = document.getElementById('close-success');

    const productDialog = document.getElementById('product-dialog');
    const closeProductBtn = document.getElementById('close-product');
    const productTitle = document.getElementById('product-title');
    const productImage = document.getElementById('product-image');
    const productPriceDisplay = document.getElementById('product-price-display');
    const productQtyDisplay = document.getElementById('product-qty');
    const addonsSection = document.getElementById('product-addons-section');
    const addonsCheckboxes = document.querySelectorAll('input[name="addon"]');
    const productTotalPriceDisplay = document.getElementById('product-total-price');

    // Filter Logic
    function filterMenu() {
        const query = searchInput.value.toLowerCase().trim();
        const activeChip = document.querySelector('.chip.active').dataset.filter;

        menuItems.forEach(item => {
            const name = item.dataset.name.toLowerCase();
            const category = item.dataset.category;
            const matchesSearch = name.includes(query);
            const matchesCategory = activeChip === 'all' || category === activeChip;

            if (matchesSearch && matchesCategory) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    searchInput.addEventListener('input', filterMenu);

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-selected', 'false');
            });
            chip.classList.add('active');
            chip.setAttribute('aria-selected', 'true');
            filterMenu();
        });
    });

    // Apply the default category on first render.
    filterMenu();

    // Product Customization Logic
    document.querySelectorAll('.btn-add').forEach(btn => {
        const article = btn.closest('.menu-item');
        if (article.dataset.category !== 'shawarma') {
            btn.textContent = 'Додати';
            btn.setAttribute('aria-label', `Додати ${article.dataset.name}`);
        }
        btn.addEventListener('click', (e) => {
            const article = e.target.closest('.menu-item');
            const name = article.dataset.name;
            const price = parseInt(article.dataset.price);
            const category = article.dataset.category;

            if (category !== 'shawarma') {
                addToCart(name, price, [], 1);
                return;
            }
            openProductDialog(name, price, category);
        });
    });

    function openProductDialog(name, price, category) {
        currentProduct = { name, basePrice: price, category };
        currentQty = 1;
        productTitle.textContent = name;
        productImage.src = category === 'pizza' ? 'assets/pizza.webp' : 'assets/food-platter.webp';
        productImage.alt = `${name} — фото страви КОСМОС`;
        productPriceDisplay.textContent = price;
        productQtyDisplay.textContent = currentQty;

        addonsCheckboxes.forEach(cb => cb.checked = false);

        // Добавки з меню призначені лише для шаурми.
        addonsSection.style.display = category === 'shawarma' ? 'block' : 'none';

        updateProductTotal();
        productDialog.showModal();
    }

    function updateProductTotal() {
        let addonsTotal = 0;
        addonsCheckboxes.forEach(cb => {
            if (cb.checked) addonsTotal += parseInt(cb.dataset.price);
        });
        const total = (currentProduct.basePrice + addonsTotal) * currentQty;
        productTotalPriceDisplay.textContent = total;
    }

    addonsCheckboxes.forEach(cb => cb.addEventListener('change', updateProductTotal));

    document.getElementById('product-qty-minus').addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            productQtyDisplay.textContent = currentQty;
            updateProductTotal();
        }
    });

    document.getElementById('product-qty-plus').addEventListener('click', () => {
        currentQty++;
        productQtyDisplay.textContent = currentQty;
        updateProductTotal();
    });

    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        const selectedAddons = [];
        addonsCheckboxes.forEach(cb => {
            if (cb.checked) {
                selectedAddons.push({ name: cb.value, price: parseInt(cb.dataset.price) });
            }
        });

        addToCart(currentProduct.name, currentProduct.basePrice, selectedAddons, currentQty);
        productDialog.close();
    });

    // Cart Logic
    function addToCart(name, basePrice, addons = [], qty = 1) {
        let cartItemId = name;
        let unitPrice = basePrice;

        if (addons.length > 0) {
            const addonNames = addons.map(a => a.name).join(', ');
            cartItemId = `${name} · ${addonNames}`;
            unitPrice += addons.reduce((sum, a) => sum + a.price, 0);
        }

        const existing = cart.find(i => i.id === cartItemId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ id: cartItemId, name, basePrice, price: unitPrice, qty, addons });
        }
        updateCartUI();

        // Visual feedback
        cartBtn.style.transform = 'scale(1.1)';
        cartBtn.style.borderColor = 'var(--accent-magenta)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
            cartBtn.style.borderColor = 'var(--border)';
        }, 200);
    }

    window.updateQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            updateCartUI();
        }
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = totalPrice;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Твій кошик порожній. Пора це виправити!</p>';
            checkoutBtn.disabled = true;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => {
                const escapedId = item.id.replace(/'/g, "\\'");
                return `
                    <div class="cart-item">
                        <div>
                            <div class="cart-item-title">${item.id}</div>
                            <div class="cart-item-price">${item.price} ₴</div>
                        </div>
                        <div class="qty-controls">
                            <button type="button" class="qty-btn" aria-label="Зменшити кількість" onclick="updateQty('${escapedId}', -1)">-</button>
                            <span class="qty-value">${item.qty}</span>
                            <button type="button" class="qty-btn" aria-label="Збільшити кількість" onclick="updateQty('${escapedId}', 1)">+</button>
                        </div>
                    </div>
                `;
            }).join('');
            checkoutBtn.disabled = false;
        }
    }

    // Modal Dialog Handlers
    function setupDialog(dialog, openBtn, closeBtn) {
        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                dialog.showModal();
                if (openBtn === cartBtn) cartBtn.setAttribute('aria-expanded', 'true');
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                dialog.close();
                if (openBtn === cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
            });
        }
        dialog.addEventListener('close', () => {
            if (openBtn === cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
        });
        // Close on outside click
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
                dialog.close();
                if (openBtn === cartBtn) cartBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    setupDialog(cartDialog, cartBtn, closeCartBtn);
    setupDialog(checkoutDialog, null, closeCheckoutBtn);
    setupDialog(successDialog, null, closeSuccessBtn);
    setupDialog(productDialog, null, closeProductBtn);

    // Flow triggers
    checkoutBtn.addEventListener('click', () => {
        cartDialog.close();
        checkoutDialog.showModal();
    });

    closeSuccessBtn.addEventListener('click', () => {
        successDialog.close();
    });

    // Form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Native HTML5 validation runs before this
        checkoutDialog.close();
        cart = [];
        updateCartUI();
        checkoutForm.reset();
        successDialog.showModal();
    });
});