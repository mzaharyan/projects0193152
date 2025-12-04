class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('greenhome_cart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartCount();
        this.setupCartEvents();
    }
    
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.save();
        this.updateCartCount();
        this.showAddToCartAnimation();
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
        this.updateCartCount();
        this.renderCart();
    }
    
    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (quantity < 1) {
                this.removeItem(id);
            } else {
                item.quantity = quantity;
                this.save();
                this.updateCartCount();
                this.renderCart();
            }
        }
    }
    
    clear() {
        this.items = [];
        this.save();
        this.updateCartCount();
        this.renderCart();
    }
    
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (parseInt(item.price) * item.quantity), 0);
    }
    
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    save() {
        localStorage.setItem('greenhome_cart', JSON.stringify(this.items));
    }
    
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.classList.toggle('show', totalItems > 0);
        }
    }
    
    showAddToCartAnimation() {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.classList.add('pulse');
            setTimeout(() => {
                cartBtn.classList.remove('pulse');
            }, 300);
        }
    }
    
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotalPrice = document.getElementById('cartTotalPrice');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty" id="cartEmpty"><i class="fas fa-shopping-basket"></i><p>Корзина пуста</p></div>';
        } else {
            let html = '';
            this.items.forEach(item => {
                const total = parseInt(item.price) * item.quantity;
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image || 'images/sofa-green.jpg'}" alt="${item.name}" onerror="this.src='images/sofa-green.jpg'">
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">${parseInt(item.price).toLocaleString()} ₽ × ${item.quantity} = ${total.toLocaleString()} ₽</div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                                <button class="remove-item" data-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            cartItems.innerHTML = html;
            
            // Обработчики событий
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id || e.target.closest('button').dataset.id;
                    const item = this.items.find(item => item.id === id);
                    if (item) {
                        this.updateQuantity(id, item.quantity - 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id || e.target.closest('button').dataset.id;
                    const item = this.items.find(item => item.id === id);
                    if (item) {
                        this.updateQuantity(id, item.quantity + 1);
                    }
                });
            });
            
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = e.target.dataset.id;
                    const quantity = parseInt(e.target.value) || 1;
                    this.updateQuantity(id, quantity);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.closest('button').dataset.id;
                    this.removeItem(id);
                });
            });
        }
        
        // Обновляем общую сумму
        if (cartTotalPrice) {
            cartTotalPrice.textContent = this.getTotalPrice().toLocaleString() + ' ₽';
        }
    }
    
    setupCartEvents() {
        const self = this; // Сохраняем контекст
        
        // Открытие/закрытие корзины
        const cartBtn = document.getElementById('cartBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        const closeCart = document.getElementById('closeCart');
        
        if (cartBtn && cartSidebar) {
            cartBtn.addEventListener('click', () => {
                self.renderCart();
                cartSidebar.classList.add('active');
                cartOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Кнопка оформления заказа - ОСНОВНОЕ ИСПРАВЛЕНИЕ
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (self.items.length === 0) {
                    alert('Корзина пуста!');
                    return;
                }
                
                // Закрываем корзину
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
                
                // Проверяем, на какой странице мы находимся
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    // Если на главной, прокручиваем к форме
                    const formSection = document.getElementById('contactFormSection');
                    if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Заполняем форму данными из корзины
                        setTimeout(() => {
                            const messageTextarea = document.getElementById('message');
                            if (messageTextarea) {
                                let orderDetails = 'Заказ из корзины:\n\n';
                                self.items.forEach(item => {
                                    const itemTotal = item.quantity * parseInt(item.price);
                                    orderDetails += `• ${item.name}: ${item.quantity} шт. × ${parseInt(item.price).toLocaleString()} ₽ = ${itemTotal.toLocaleString()} ₽\n`;
                                });
                                orderDetails += `\n Итого: ${self.getTotalPrice().toLocaleString()} ₽`;
                                
                                messageTextarea.value = orderDetails;
                                messageTextarea.focus();
                            }
                        }, 300);
                    }
                } else {
                    // Если не на главной, переходим на главную к форме
                    window.location.href = 'index.html#contactFormSection';
                    
                    // Сохраняем данные корзины для автозаполнения после перехода
                    localStorage.setItem('auto_fill_cart', 'true');
                }
            });
        }
        
        // Добавление товаров в корзину
        document.addEventListener('click', (e) => {
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                const product = {
                    id: addToCartBtn.dataset.id,
                    name: addToCartBtn.dataset.name,
                    price: addToCartBtn.dataset.price,
                    image: addToCartBtn.dataset.image
                };
                
                self.addItem(product);
                self.renderCart();
                
                // Анимация кнопки
                const originalHTML = addToCartBtn.innerHTML;
                addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
                addToCartBtn.style.background = 'var(--primary)';
                addToCartBtn.style.color = 'white';
                addToCartBtn.style.borderColor = 'var(--primary)';
                
                setTimeout(() => {
                    addToCartBtn.innerHTML = originalHTML;
                    addToCartBtn.style.background = '';
                    addToCartBtn.style.color = '';
                    addToCartBtn.style.borderColor = '';
                }, 1500);
            }
        });
    }
}

// ===== СЛАЙДЕР =====
class Slider {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.interval = null;
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        this.showSlide(this.currentSlide);
        this.startAutoSlide();
        this.setupControls();
    }
    
    showSlide(index) {
        if (this.slides.length === 0) return;
        
        if (index >= this.slides.length) this.currentSlide = 0;
        else if (index < 0) this.currentSlide = this.slides.length - 1;
        else this.currentSlide = index;
        
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.add('active');
        }
        
        this.updateDots();
    }
    
    updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentSlide);
        });
    }
    
    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }
    
    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }
    
    startAutoSlide() {
        if (this.slides.length > 1) {
            this.stopAutoSlide();
            this.interval = setInterval(() => this.nextSlide(), 5000);
        }
    }
    
    stopAutoSlide() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    setupControls() {
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.stopAutoSlide();
                this.startAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.stopAutoSlide();
                this.startAutoSlide();
            });
        }
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.showSlide(i);
                this.stopAutoSlide();
                this.startAutoSlide();
            });
        });
        
        const slider = document.querySelector('.slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.stopAutoSlide());
            slider.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
}

// ===== ОСНОВНОЙ КОД =====
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация корзины
    const cart = new Cart();
    
    // Инициализация слайдера
    const slider = new Slider();
    
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
        function toggleMobileMenu() {
            mobileMenu.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }
        
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        if (closeMobileMenu) closeMobileMenu.addEventListener('click', toggleMobileMenu);
        if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
        
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', toggleMobileMenu);
        });
    }
    
    // ===== ВЫПАДАЮЩЕЕ МЕНЮ =====
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            dropdown.addEventListener('mouseenter', () => {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
            });
            
            dropdown.addEventListener('mouseleave', () => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(10px)';
            });
        }
    });
    
    // ===== КНОПКА "СВЯЗАТЬСЯ" =====
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const footerContacts = document.getElementById('footer-contacts');
            if (footerContacts) {
                footerContacts.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // ===== ФОРМА =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                
                if (value.startsWith('7') || value.startsWith('8')) {
                    value = '+7' + value.substring(1);
                } else if (!value.startsWith('+7') && value.length > 0) {
                    value = '+7' + value;
                }
                
                if (value.length > 2) {
                    let formatted = '+7';
                    let numbers = value.substring(2);
                    
                    if (numbers.length > 0) {
                        formatted += ' (' + numbers.substring(0, Math.min(3, numbers.length));
                    }
                    if (numbers.length > 3) {
                        formatted += ') ' + numbers.substring(3, Math.min(6, numbers.length));
                    }
                    if (numbers.length > 6) {
                        formatted += '-' + numbers.substring(6, Math.min(8, numbers.length));
                    }
                    if (numbers.length > 8) {
                        formatted += '-' + numbers.substring(8, Math.min(10, numbers.length));
                    }
                    
                    this.value = formatted;
                } else {
                    this.value = value;
                }
            });
            
            phoneInput.addEventListener('keydown', function(e) {
                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                if (allowedKeys.includes(e.key) || (e.key >= '0' && e.key <= '9') || e.key === '+') {
                    return;
                }
                e.preventDefault();
            });
        }
        
        // Валидация формы
        function validateForm() {
            let isValid = true;
            
            document.querySelectorAll('.error').forEach(error => {
                error.textContent = '';
            });
            
            const name = document.getElementById('name');
            if (name && !name.value.trim()) {
                document.getElementById('nameError').textContent = 'Введите имя';
                isValid = false;
            }
            
            if (phoneInput && phoneInput.value) {
                const phoneRegex = /^\+7\s?[\(]?\d{3}[\)]?\s?\d{3}[-]?\d{2}[-]?\d{2}$/;
                if (!phoneRegex.test(phoneInput.value)) {
                    document.getElementById('phoneError').textContent = 'Введите корректный номер';
                    isValid = false;
                }
            }
            
            const consent = document.getElementById('consent');
            if (consent && !consent.checked) {
                document.getElementById('consentError').textContent = 'Необходимо согласие';
                isValid = false;
            }
            
            return isValid;
        }
        
        // Отправка формы
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            setTimeout(() => {
                const formMessage = document.getElementById('formMessage');
                if (formMessage) {
                    formMessage.textContent = 'Спасибо! Ваша заявка отправлена. Мы скоро свяжемся с вами.';
                    formMessage.className = 'form-message success';
                    
                    // Очищаем корзину после успешного заказа
                    cart.clear();
                    
                    this.reset();
                    
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 500);
        });
    }
    
    // ===== ПЛАВНАЯ ПРОКРУТКА =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href.startsWith('#')) return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== КНОПКИ "ЗАКАЗАТЬ" НА СТРАНИЦЕ ТОВАРОВ =====
    document.querySelectorAll('.order-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'index.html#contactFormSection';
        });
    });
});

// Простая анимация при скролле
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
});
// ===== УПРАВЛЕНИЕ ФОНОВЫМ ВИДЕО =====
function initBackgroundVideo() {
    const video = document.getElementById('heroVideo');
    
    if (video) {
        // Автоматическое воспроизведение с поддержкой для мобильных устройств
        video.muted = true;
        video.playsInline = true;
        
        // Обработчик для воспроизведения видео на мобильных
        document.addEventListener('touchstart', function firstTouch() {
            if (video.paused) {
                video.play();
            }
            document.removeEventListener('touchstart', firstTouch);
        });
        
        // Пауза видео при скролле (опционально, для производительности)
        window.addEventListener('scroll', function() {
            if (window.scrollY > window.innerHeight * 0.5) {
                video.pause();
            } else if (video.paused) {
                video.play();
            }
        });
        
        // Перезапуск видео при видимости страницы
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && window.scrollY < window.innerHeight * 0.5) {
                video.play();
            }
        });
    }
}

// Вызовите функцию в DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // ... существующий код ...
    
    // Инициализация фонового видео
    initBackgroundVideo();
        // Автозаполнение формы после перехода с других страниц
    window.addEventListener('load', function() {
        if (localStorage.getItem('auto_fill_cart') === 'true' && window.location.hash === '#contactFormSection') {
            setTimeout(() => {
                const messageTextarea = document.getElementById('message');
                if (messageTextarea && cart && cart.items.length > 0) {
                    let orderDetails = 'Заказ из корзины:\n\n';
                    cart.items.forEach(item => {
                        const itemTotal = item.quantity * parseInt(item.price);
                        orderDetails += `• ${item.name}: ${item.quantity} шт. × ${parseInt(item.price).toLocaleString()} ₽ = ${itemTotal.toLocaleString()} ₽\n`;
                    });
                    orderDetails += `\n Итого: ${cart.getTotalPrice().toLocaleString()} ₽`;
                    
                    messageTextarea.value = orderDetails;
                    messageTextarea.focus();
                    
                    // Убираем флаг автозаполнения
                    localStorage.removeItem('auto_fill_cart');
                }
            }, 500);
        }
    });
    // ===== УПРАВЛЕНИЕ ВИДЕО О КОМПАНИИ =====
    function initAboutVideo() {
        const videoContainer = document.querySelector('.video-container');
        const video = document.querySelector('.about-video video');
        const playBtn = document.querySelector('.play-btn');
        const videoOverlay = document.querySelector('.video-overlay');
        
        if (!video || !playBtn) return;
        
        // Клик по оверлею или кнопке воспроизведения
        function playVideo() {
            video.play();
            videoContainer.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        function pauseVideo() {
            video.pause();
            videoContainer.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // Обработчики событий
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (video.paused) {
                playVideo();
            } else {
                pauseVideo();
            }
        });
        
        videoOverlay.addEventListener('click', playVideo);
        
        // При клике на само видео
        video.addEventListener('click', function() {
            if (video.paused) {
                playVideo();
            } else {
                pauseVideo();
            }
        });
        
        // Когда видео заканчивается
        video.addEventListener('ended', function() {
            videoContainer.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
        
        // При паузе
        video.addEventListener('pause', function() {
            videoContainer.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
        
        // При воспроизведении
        video.addEventListener('play', function() {
            videoContainer.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
    }
    
    // Инициализация при загрузке страницы
    if (window.location.pathname.includes('about.html')) {
        document.addEventListener('DOMContentLoaded', initAboutVideo);
    }
});