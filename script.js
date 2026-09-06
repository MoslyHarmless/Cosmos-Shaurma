document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let cart = [];
    let currentProduct = null;
    let currentQty = 1;

    // DOM Elements
    const searchInput = document.getElementById('menu-search');
    const chips = document.querySelectorAll('.chip');
    const menuItems = document.querySelectorAll('.menu-item');

    const menuImageMap = [
        ['Куряча Маленька', 'shawarma-chicken-small.webp'],
        ['Куряча Середня', 'shawarma-chicken-medium.webp'],
        ['Куряча Велика', 'shawarma-chicken-large.webp'],
        ['Куряча Гавайська', 'shawarma-hawaiian.webp'],
        ['Свинина Маленька', 'shawarma-pork-small.webp'],
        ['Свинина Середня', 'shawarma-pork-medium.webp'],
        ['Свинина Велика', 'shawarma-pork-large.webp'],
        ['Французький хот-дог', 'hotdog-french.webp'],
        ['Хот-дог «2000-х»', 'hotdog-2000s.webp'],
        ['З однією сосискою', 'hotdog-one-sausage.webp'],
        ['З двома сосисками', 'hotdog-two-sausages.webp'],
        ['Баварський (лаваш, 1 сосиска)', 'hotdog-bavarian-one.webp'],
        ['Баварський (лаваш, 2 сосиски)', 'hotdog-bavarian-two.webp'],
        ['Хот-дог (сирний у лаваші)', 'hotdog-cheese-lavash.webp'],
        ['Шаур-дог', 'shawar-dog.webp'],
        ['Картопля фрі', 'fries.webp'],
        ['Нагетси', 'nuggets.webp'],
        ['Піца', 'pizza.webp'],
        ['Сосиска в тісті', 'pastry-sausage.webp'],
        ['Біляш', 'pastry-belyash.webp'],
        ['Булочка (капуста/картопля)', 'pastry-cabbage-potato.webp'],
        ['Тертий пиріг', 'pastry-grated-pie.webp'],
        ['Булочка з повидлом', 'pastry-jam-bun.webp'],
        ['Гарячий шоколад', 'hot-chocolate.webp'],
        ['Bumble кава', 'drink-bumble.webp'],
        ['Голуба лагуна', 'drink-blue-lagoon.webp'],
        ['Мохіто', 'drink-mojito.webp'],
        ['Лимонад полуниця', 'drink-strawberry-lemonade.webp'],
        ['Лимонад манго-маракуя', 'drink-mango-passion.webp']
    ];

    menuItems.forEach(item => {
        const match = menuImageMap.find(([label]) => item.dataset.name.includes(label));
        if (!match) return;
        const image = document.createElement('img');
        image.className = 'menu-card-image';
        image.src = `assets/${match[1]}`;
        image.alt = `${item.dataset.name} — фото страви КОСМОС`;
        image.loading = 'lazy';
        item.prepend(image);
    });

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
    let addonsCheckboxes = [];
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
        btn.addEventListener('click', (e) => {
            const article = e.target.closest('.menu-item');
            const name = article.dataset.name;
            const price = parseInt(article.dataset.price);
            const category = article.dataset.category;

            openProductDialog(name, price, category);
        });
    });

    const itemDescriptions = {
        'Куряча Маленька': 'Ніжне куряче м\'ясо, свіжа капуста, морква по-корейськи, солений огірок, фірмовий білий та червоний соус у хрусткому лаваші.',
        'Куряча Середня': 'Класична порція з ніжним курячим м\'ясом, капустою, морквою, огірочком та фірмовими соусами.',
        'Куряча Велика': 'Щедра порція для справжнього голоду. Більше м\'яса, більше свіжих овочів, більше соусу.',
        'Куряча Гавайська': 'Екзотичне поєднання ніжного курячого м\'яса, солодкого ананаса, сиру та соусів.',
        'Свинина Маленька': 'Соковита свинина з гриля, овочі, та фірмовий соус у хрусткому лаваші.',
        'Свинина Середня': 'Класична шаурма зі свининою, капустою, морквою та нашим кращим соусом.',
        'Свинина Велика': 'Велика порція соковитої свинини, щедро приправлена овочами та соусом.',
        'Французький хот-дог': 'Класична баварська сосиска в хрусткій французькій булочці з гірчицею та кетчупом.',
        'Хот-дог «2000-х»': 'Смак дитинства: сосиска, морква по-корейськи, капуста та багато соусу.',
        'З однією сосискою': 'Гаряча сосиска у свіжій булочці з кетчупом, гірчицею та хрусткою цибулею.',
        'З двома сосисками': 'Дві соковиті сосиски у свіжій булочці з кетчупом, гірчицею та соусом.',
        'Баварський (лаваш, 1 сосиска)': 'Баварська сосиска, свіжий лаваш, сирний соус та хрусткі овочі.',
        'Баварський (лаваш, 2 сосиски)': 'Дві баварські сосиски у лаваші з сирним соусом та свіжими овочами.',
        'Хот-дог (сирний у лаваші)': 'Сосиска, розплавлений сир та соуси, загорнуті у рум’яний лаваш.',
        'Шаур-дог': 'Гібрид шаурми та хот-дога: соковите м’ясо, сосиска, овочі та фірмовий соус.',
        'Картопля фрі (170 г)': 'Золотиста картопелька фрі, хрустка зовні та ніжна всередині.',
        'Нагетси (6 шт)': 'Шість ніжних курячих нагетсів у хрусткій паніровці з соусом на вибір.',
        'Піца': 'Гаряча піца з тягучим сиром, томатним соусом та ситною начинкою.',
        'Сосиска в тісті': 'Запечена сосиска у м’якому золотистому тісті.',
        'Біляш': 'Соковита м’ясна начинка у рум’яному дріжджовому тісті.',
        'Булочка (капуста/картопля)': 'М’яка домашня булочка з начинкою на вибір: капуста або картопля.',
        'Тертий пиріг (100 г)': 'Розсипчасте пісочне тісто та солодка начинка у форматі 100 г.',
        'Булочка з повидлом': 'Ніжна здобна булочка з ароматним фруктовим повидлом.',
        'Гарячий шоколад (з маршмелоу)': 'Густий, насичений гарячий шоколад з ніжними маршмелоу.',
        'Bumble кава': 'Холодна кава з апельсиновим соком — яскравий заряд бадьорості.',
        'Голуба лагуна (0,5 л)': 'Освіжаючий блакитний напій з цитрусовою кислинкою, 0,5 л.',
        'Мохіто (0,5 л)': 'Легкий м’ятно-лаймовий напій з льодом, 0,5 л.',
        'Лимонад полуниця (0,5 л)': 'Солодкий полуничний лимонад з яскравим ягідним смаком, 0,5 л.',
        'Лимонад манго-маракуя (0,5 л)': 'Тропічний лимонад з манго та маракуєю, 0,5 л.'
    };

    const categoryDescriptions = {
        'shawarma': 'Соковите м\'ясо, свіжі овочі та наш фірмовий соус, загорнуті у свіжий лаваш.',
        'hotdogs': 'Гаряча сосиска в ідеальній булочці з фірмовими соусами.',
        'fastfood': 'Гарячий, хрусткий снек — ідеальний до улюбленого напою.',
        'pizza': 'Свіжа, ароматна випічка — як вдома.',
        'drinks': 'Освіжаючий напій, що ідеально втамовує спрагу.'
    };

    const categoryAddons = {
        'shawarma': [
            { name: 'Сир', price: 25 },
            { name: 'Гриби', price: 25 },
            { name: 'Ананас', price: 25 },
            { name: 'Кукурудза', price: 25 },
            { name: 'Картопля фрі', price: 25 }
        ],
        'hotdogs': [
            { name: 'Сир', price: 20 },
            { name: 'Халапеньйо', price: 15 },
            { name: 'Бекон', price: 20 }
        ],
        'fastfood': [
            { name: 'Сирний соус', price: 15 },
            { name: 'Кетчуп', price: 15 }
        ]
    };

    const productDescriptionEl = document.getElementById('product-description');
    const addonsListContainer = document.getElementById('addons-list-container');

    function openProductDialog(name, price, category) {
        currentProduct = { name, basePrice: price, category };
        currentQty = 1;
        productTitle.textContent = name;

        // Find exact image or fallback
        const match = menuImageMap.find(([label]) => name.includes(label));
        productImage.src = match ? `assets/${match[1]}` : (category === 'pizza' ? 'assets/pizza.webp' : 'assets/food-platter.webp');
        productImage.alt = `${name} — фото страви КОСМОС`;

        productPriceDisplay.textContent = price;
        productQtyDisplay.textContent = currentQty;

        // Description
        const exactDesc = Object.entries(itemDescriptions).find(([key]) => name.includes(key));
        productDescriptionEl.textContent = exactDesc ? exactDesc[1] : (categoryDescriptions[category] || '');

        // Generate Addons
        addonsListContainer.innerHTML = '';
        const addons = categoryAddons[category];
        if (addons && addons.length > 0) {
            addonsSection.style.display = 'block';
            addons.forEach((addon, idx) => {
                const label = document.createElement('label');
                label.className = 'addon-label';
                label.innerHTML = `
                    <span class="addon-label-inner">
                        <input type="checkbox" name="addon" value="${addon.name}" data-price="${addon.price}">
                        ${addon.name}
                    </span>
                    <span class="addon-price">+${addon.price} ₴</span>
                `;
                addonsListContainer.appendChild(label);
            });
            // Re-select checkboxes
            addonsCheckboxes = document.querySelectorAll('input[name="addon"]');
            addonsCheckboxes.forEach(cb => cb.addEventListener('change', updateProductTotal));
        } else {
            addonsSection.style.display = 'none';
            addonsCheckboxes = [];
        }

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