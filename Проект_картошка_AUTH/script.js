/* ============================================
   KUZPOTATO — Premium Script
   ============================================ */

// Mobile block: redirect mobile devices to a friendly 'site unavailable' page
;(function(){
    try {
        var isMobileUA = /Mobi|Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(navigator.userAgent || '');
        var smallScreen = (typeof window !== 'undefined' && window.innerWidth && window.innerWidth <= 800);
        if(isMobileUA || smallScreen){
            // Avoid redirect loop if already on the unavailable page
            if(!/mobile-unavailable\.html$/.test(window.location.pathname)){
                window.location.replace('mobile-unavailable.html');
            }
        }
    } catch(e) { /* ignore */ }
})();


document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const products = [
        { 
            id: 1, 
            name: 'Сибирский Премиум', 
            category: 'premium', 
            price: 120, 
            unit: 'кг', 
            desc: 'Элитный сорт с полей Кузбасса. Идеален для запекания и пюре.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ (например, "images/potato-premium.jpg")
            img: 'images/potato-premium.jpg', 
            chars: { 'Сорт': 'Гала', 'Вес': '1 кг', 'Происхождение': 'Кемерово', 'Хранение': '3-5°C' } 
        },
        { 
            id: 2, 
            name: 'Фермерский Отбор', 
            category: 'farm', 
            price: 85, 
            unit: 'кг', 
            desc: 'Крупные клубни, ручная переборка. Для жарки и супов.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ
            img: 'images/potato-farm.jpg', 
            chars: { 'Сорт': 'Ред Скарлет', 'Вес': '1 кг', 'Происхождение': 'Кемерово', 'Хранение': '3-5°C' } 
        },
        { 
            id: 3, 
            name: 'Ранний Кузбасский', 
            category: 'early', 
            price: 150, 
            unit: 'кг', 
            desc: 'Молодой картофель, первый урожай. Нежный вкус.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ
            img: 'images/potato-early.jpg', 
            chars: { 'Сорт': 'Жуковский', 'Вес': '1 кг', 'Происхождение': 'Кемерово', 'Сезон': 'Июнь-Июль' } 
        },
        { 
            id: 4, 
            name: 'Универсальный Стандарт', 
            category: 'universal', 
            price: 65, 
            unit: 'кг', 
            desc: 'Надёжный сорт для повседневных блюд. Хорошо хранится.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ
            img: 'images/potato-universal.jpg', 
            chars: { 'Сорт': 'Невский', 'Вес': '1 кг', 'Происхождение': 'Кемерово', 'Хранение': 'до 8 мес' } 
        },
        { 
            id: 5, 
            name: 'Премиум Розовый', 
            category: 'premium', 
            price: 135, 
            unit: 'кг', 
            desc: 'Розовая кожура, жёлтая мякоть. Деликатесный вкус.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ
            img: 'images/potato-premium-pink.jpg', 
            chars: { 'Сорт': 'Розара', 'Вес': '1 кг', 'Происхождение': 'Кемерово', 'Хранение': '3-5°C' } 
        },
        { 
            id: 6, 
            name: 'Фермерский Мешок', 
            category: 'farm', 
            price: 750, 
            unit: '10 кг', 
            desc: 'Эконом-упаковка для семьи. 10 кг отборного картофеля.', 
            // ★ ВСТАВЬТЕ ПУТЬ К КАРТИНКЕ
            img: 'images/potato-bag.jpg', 
            chars: { 'Сорт': 'Гала', 'Вес': '10 кг', 'Происхождение': 'Кемерово', 'Хранение': '3-5°C' } 
        },
    ];

    // --- CART (localStorage) ---
    const CART_KEY = 'kuzpotato_cart';

    function getCart() {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
    }

    function addToCart(productId, qty = 1) {
        const cart = getCart();
        const existing = cart.find(item => item.productId === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ productId, qty });
        }
        saveCart(cart);
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.productId !== productId);
        saveCart(cart);
        renderCart();
    }

    function updateCartQty(productId, delta) {
        const cart = getCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            item.qty = Math.max(1, item.qty + delta);
            saveCart(cart);
            renderCart();
        }
    }

    function updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        const cart = getCart();
        const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
        badge.textContent = totalItems;
    }

    // --- RENDER PRODUCT CARDS ---
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        // ★ Изменено: теперь используется <img> с путём из product.img
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}" class="product-card__image">
            <div class="product-card__body">
                <span class="product-card__category">${getCategoryLabel(product.category)}</span>
                <h3>${product.name}</h3>
                <p class="product-card__desc">${product.desc}</p>
                <div class="product-card__footer">
                    <span class="product-card__price">${product.price} ₽ <span>/ ${product.unit}</span></span>
                    <button class="btn--add" data-id="${product.id}">В корзину</button>
                </div>
            </div>
            <a href="product.html?id=${product.id}" class="product-card__overlay-link" style="position:absolute;inset:0;z-index:1;"></a>
        `;
        // Prevent add to cart button from triggering the link
        const addBtn = card.querySelector('.btn--add');
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product.id, 1);
            // Visual feedback
            addBtn.textContent = 'Добавлено!';
            addBtn.style.background = '#2D5016';
            setTimeout(() => {
                addBtn.textContent = 'В корзину';
                addBtn.style.background = '';
            }, 1200);
        });
        return card;
    }

    function getCategoryLabel(cat) {
        const map = { premium: 'Премиум', farm: 'Фермерский', early: 'Ранний', universal: 'Универсальный' };
        return map[cat] || cat;
    }

    // --- PAGE SPECIFIC RENDERING ---
    const path = window.location.pathname;

    // Index page popular products
    const popularGrid = document.getElementById('popularProducts');
    if (popularGrid) {
        const popular = products.filter(p => [1,2,3].includes(p.id));
        popular.forEach(p => popularGrid.appendChild(createProductCard(p)));
    }

    // Catalog page
    const catalogGrid = document.getElementById('catalogGrid');
    if (catalogGrid) {
        function renderCatalog(filter = 'all') {
            catalogGrid.innerHTML = '';
            const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
            filtered.forEach(p => catalogGrid.appendChild(createProductCard(p)));
        }
        renderCatalog();

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
                btn.classList.add('filter-btn--active');
                renderCatalog(btn.dataset.filter);
            });
        });
    }

    // Product detail page
    const productDetail = document.getElementById('productDetail');
    if (productDetail) {
        const params = new URLSearchParams(window.location.search);
        const productId = parseInt(params.get('id'));
        const product = products.find(p => p.id === productId);
        if (product) {
            let qty = 1;
            // ★ Изменено: картинка в детальной странице тоже берётся из product.img
            productDetail.innerHTML = `
                <img src="${product.img}" alt="${product.name}" class="product-page__image">
                <div class="product-page__info">
                    <span class="product-page__category">${getCategoryLabel(product.category)}</span>
                    <h1>${product.name}</h1>
                    <p class="product-page__price">${product.price} ₽ <span>/ ${product.unit}</span></p>
                    <p class="product-page__desc">${product.desc}</p>
                    <div class="product-page__chars">
                        ${Object.entries(product.chars).map(([key, val]) => `<div class="product-page__char"><strong>${key}</strong> ${val}</div>`).join('')}
                    </div>
                    <div class="product-page__actions">
                        <div class="qty-input">
                            <button id="qtyMinus">−</button>
                            <input type="number" id="qtyValue" value="1" min="1" readonly>
                            <button id="qtyPlus">+</button>
                        </div>
                        <button class="btn btn--gold btn--lg" id="addToCartBtn">Добавить в корзину — ${product.price * qty} ₽</button>
                    </div>
                </div>
            `;
            const qtyInput = document.getElementById('qtyValue');
            const addBtn = document.getElementById('addToCartBtn');
            document.getElementById('qtyMinus').addEventListener('click', () => {
                qty = Math.max(1, qty - 1);
                qtyInput.value = qty;
                addBtn.textContent = `Добавить в корзину — ${product.price * qty} ₽`;
            });
            document.getElementById('qtyPlus').addEventListener('click', () => {
                qty++;
                qtyInput.value = qty;
                addBtn.textContent = `Добавить в корзину — ${product.price * qty} ₽`;
            });
            addBtn.addEventListener('click', () => {
                addToCart(product.id, qty);
                addBtn.textContent = 'Добавлено!';
                addBtn.style.background = '#2D5016';
                setTimeout(() => {
                    addBtn.textContent = `Добавить в корзину — ${product.price * qty} ₽`;
                    addBtn.style.background = '';
                }, 1500);
            });
        } else {
            productDetail.innerHTML = '<p>Товар не найден.</p>';
        }
    }

    // Cart page
    const cartContainer = document.getElementById('cartContainer');
    if (cartContainer) {
        renderCart();
    }
    function renderCart() {
        if (!cartContainer) return;
        const cart = getCart();
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="cart-empty">
                    <h3>Корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <a href="catalog.html" class="btn btn--gold">Перейти в каталог</a>
                </div>`;
            return;
        }
        let itemsHtml = '<div class="cart__items">';
        let total = 0;
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;
            const subtotal = product.price * item.qty;
            total += subtotal;
            // ★ Изменено: картинка в корзине берётся из product.img
            itemsHtml += `
                <div class="cart-item">
                    <img src="${product.img}" alt="${product.name}" class="cart-item__image">
                    <div class="cart-item__name">${product.name}</div>
                    <div class="cart-item__qty">
                        <div class="qty-input">
                            <button data-action="minus" data-id="${product.id}">−</button>
                            <input type="number" value="${item.qty}" readonly>
                            <button data-action="plus" data-id="${product.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item__price">${subtotal} ₽</div>
                    <button class="cart-item__remove" data-id="${product.id}">✕</button>
                </div>`;
        });
        itemsHtml += '</div>';
        itemsHtml += `
            <div class="cart__summary">
                <h3>Итого</h3>
                <div class="cart__total">${total} ₽</div>
                <a href="checkout.html" class="btn btn--gold btn--lg">Оформить заказ</a>
            </div>`;
        cartContainer.innerHTML = itemsHtml;

        // Event listeners for qty and remove
        cartContainer.querySelectorAll('[data-action="minus"]').forEach(btn => {
            btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), -1));
        });
        cartContainer.querySelectorAll('[data-action="plus"]').forEach(btn => {
            btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), 1));
        });
        cartContainer.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)));
        });
    }

    // Checkout page
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        // Render order summary
        const checkoutItems = document.getElementById('checkoutItems');
        const cart = getCart();
        if (cart.length === 0) {
            checkoutItems.innerHTML = '<p>Корзина пуста. <a href="catalog.html">Добавьте товары</a></p>';
        } else {
            let summaryHtml = '';
            let total = 0;
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;
                const subtotal = product.price * item.qty;
                total += subtotal;
                summaryHtml += `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>${product.name} x${item.qty}</span><span>${subtotal} ₽</span></div>`;
            });
            summaryHtml += `<hr style="margin:16px 0;border-color:var(--border)"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.2rem;"><span>Итого</span><span>${total} ₽</span></div>`;
            checkoutItems.innerHTML = summaryHtml;
        }

        // Form submit
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.querySelector('.checkout__form-wrap').querySelector('.checkout__form').style.display = 'none';
            document.getElementById('checkoutSuccess').style.display = 'block';
            localStorage.removeItem(CART_KEY);
            updateCartBadge();
        });
    }

    // Contact form
    const contactsForm = document.getElementById('contactsForm');
    if (contactsForm) {
        contactsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactsForm.style.display = 'none';
            document.getElementById('contactsSuccess').style.display = 'block';
        });
    }

    // --- BURGER MENU ---
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav--open');
            burger.classList.toggle('active');
        });
        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav--open');
                burger.classList.remove('active');
            });
        });
    }

    // --- SCROLL FADE-IN ANIMATIONS ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    fadeElements.forEach(el => observer.observe(el));

    // --- Admin Console Button for specific account ---
    try{
        const userStr = localStorage.getItem('user');
        if(userStr){
            const user = JSON.parse(userStr);
            if(user && user.email === 'fortter'){
                const headerActions = document.querySelector('.header__actions');
                if(headerActions && !document.getElementById('adminConsoleBtn')){
                    const btn = document.createElement('button');
                    btn.id = 'adminConsoleBtn';
                    btn.className = 'btn btn--outline-dark btn--console';
                    btn.textContent = 'Консоль';
                    btn.title = 'Консоль администратора (пусто)';
                    btn.addEventListener('click', ()=>{
                        alert('Консоль пока пустая');
                    });
                    headerActions.insertBefore(btn, headerActions.firstChild);
                }
            }
        }
    }catch(e){/* ignore parse errors */}

    // Initial cart badge update
    updateCartBadge();
});