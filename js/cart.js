// Cart functionality
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.total = 0;
    this.init();
  }

  init() {
    this.initRemoveButtons();
    this.initQuantityButtons();
    this.initAddToCartButtons();
    this.initCheckoutButton();
    this.updateCartDisplay();
    this.setupToastNotification();
  }

  setupToastNotification() {
    // Create toast element if it doesn't exist
    if (!document.querySelector('.toast-notification')) {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span class="toast-message"></span>
      `;
      document.body.appendChild(toast);
    }
  }

  showToast(message, type = 'success') {
    const toast = document.querySelector('.toast-notification');
    const toastMessage = toast.querySelector('.toast-message');
    
    toast.className = `toast-notification ${type}`;
    toastMessage.textContent = message;
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  updateCartIcon() {
    const cartIcon = document.querySelector('.nav-cart-icon');
    if (cartIcon) {
      cartIcon.classList.add('items-added');
      setTimeout(() => cartIcon.classList.remove('items-added'), 500);
    }
  }

  formatPrice(price) {
    // Ensure price is a number and handle any NaN cases
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      console.error('Invalid price value:', price);
      return '₹0.00';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice).replace('INR', '₹');
  }

  parsePrice(priceString) {
    // First, clean up the string by removing currency symbol and spaces
    const cleanPrice = priceString.replace(/[₹\s]/g, '');
    
    // Handle Indian number format (e.g., "6,999.00" or "1,23,456.00")
    const numberStr = cleanPrice.replace(/,/g, '');
    
    // Parse as float and ensure it's a valid number
    const price = parseFloat(numberStr);
    
    if (isNaN(price)) {
      console.error('Failed to parse price:', { original: priceString, cleaned: cleanPrice, parsed: price });
      return 0;
    }
    
    // Log successful parsing
    console.log('Parsing price:', { 
      original: priceString, 
      cleaned: cleanPrice, 
      numberStr: numberStr,
      parsed: price 
    });
    
    return price;
  }

  addItem(item) {
    console.log('Adding item to cart:', item);
    const existingItem = this.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      this.items.push({ ...item, quantity: item.quantity || 1 });
    }
    this.saveCart();
    this.updateCartDisplay();
  }

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(itemId, quantity) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
      this.updateCartDisplay();
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    console.log('Cart saved:', this.items);
  }

  calculateTotal() {
    return this.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      console.log('Item total:', { item: item.name, price: item.price, quantity: item.quantity, total: itemTotal });
      return total + itemTotal;
    }, 0);
  }

  updateCartDisplay() {
    const cartCount = document.querySelector('.nav-cart-icon');
    if (cartCount) {
      cartCount.textContent = this.items.reduce((total, item) => total + item.quantity, 0);
    }

    const cartItems = document.querySelector('.nav-cart-items');
    if (cartItems) {
      cartItems.innerHTML = this.items.map(item => `
        <div class="nav-cart-item clearfix" data-id="${item.id}">
          <div class="nav-cart-img">
            <a href="#">
              <img src="${item.image}" alt="${item.name}">
            </a>
          </div>
          <div class="nav-cart-title">
            <a href="#">${item.name}</a>
            <div class="nav-cart-price">
              <span>${item.quantity} x</span>
              <span>${this.formatPrice(item.price)}</span>
            </div>
          </div>
          <div class="nav-cart-remove">
            <a href="#" class="remove" data-id="${item.id}"><i class="ui-close"></i></a>
          </div>
        </div>
      `).join('');
    }

    const cartTotal = document.querySelector('.total-price');
    if (cartTotal) {
      const total = this.calculateTotal();
      console.log('Cart total:', total);
      cartTotal.textContent = this.formatPrice(total);
    }

    const cartTable = document.querySelector('.shop_table.cart tbody');
    if (cartTable) {
      cartTable.innerHTML = this.items.map(item => `
        <tr class="cart_item" data-id="${item.id}">
          <td class="product-thumbnail">
            <a href="#">
              <img src="${item.image}" alt="${item.name}">
            </a>
          </td>
          <td class="product-name">
            <a href="#">${item.name}</a>
            ${item.options ? `
              <ul>
                ${Object.entries(item.options).map(([key, value]) => `
                  <li>${key}: ${value}</li>
                `).join('')}
              </ul>
            ` : ''}
          </td>
          <td class="product-price">
            <span class="amount">${this.formatPrice(item.price)}</span>
          </td>
          <td class="product-quantity">
            <div class="quantity buttons_added">
              <input type="number" step="1" min="1" value="${item.quantity}" title="Qty" 
                     class="input-text qty text" data-id="${item.id}">
              <div class="quantity-adjust">
                <a href="#" class="plus" data-id="${item.id}">
                  <i class="fa fa-angle-up"></i>
                </a>
                <a href="#" class="minus" data-id="${item.id}">
                  <i class="fa fa-angle-down"></i>
                </a>
              </div>
            </div>
          </td>
          <td class="product-subtotal">
            <span class="amount">${this.formatPrice(item.price * item.quantity)}</span>
          </td>
          <td class="product-remove">
            <a href="#" class="remove" title="Remove this item" data-id="${item.id}">
              <i class="ui-close"></i>
            </a>
          </td>
        </tr>
      `).join('');

      const cartTotalAmount = document.querySelector('.cart_totals .order-total .amount');
      if (cartTotalAmount) {
        cartTotalAmount.textContent = this.formatPrice(this.calculateTotal());
      }
    }
  }

  getProductPrice(container) {
    // First try to get price from data attribute
    const priceElement = container.querySelector('.amount[data-base-price]');
    if (priceElement && priceElement.dataset.basePrice) {
      return parseFloat(priceElement.dataset.basePrice);
    }

    // Then try to get from regular price display
    const regularPrice = container.querySelector('.amount');
    if (regularPrice) {
      return this.parsePrice(regularPrice.textContent);
    }

    // Finally try to get from special price displays
    const specialPrice = container.querySelector('.special-price .amount, .price .amount');
    if (specialPrice) {
      return this.parsePrice(specialPrice.textContent);
    }

    return null;
  }

  initRemoveButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.remove')) {
        e.preventDefault();
        const button = e.target.closest('.remove');
        const itemId = button.dataset.id;
        this.removeItem(itemId);
      }
    });
  }

  initQuantityButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.plus, .minus')) {
        e.preventDefault();
        const button = e.target.closest('.plus, .minus');
        const itemId = button.dataset.id;
        const input = button.closest('.quantity').querySelector('.qty');
        const currentQty = parseInt(input.value);
        
        if (button.classList.contains('plus')) {
          this.updateQuantity(itemId, currentQty + 1);
        } else {
          this.updateQuantity(itemId, currentQty - 1);
        }
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('.qty')) {
        const input = e.target;
        const itemId = input.dataset.id;
        const newQty = parseInt(input.value);
        this.updateQuantity(itemId, newQty);
      }
    });
  }

  initAddToCartButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.add_to_cart_button') || e.target.closest('.add_to_cart_button')) {
        e.preventDefault();
        const button = e.target.matches('.add_to_cart_button') ? e.target : e.target.closest('.add_to_cart_button');
        
        // Try different container selectors
        const productContainer = button.closest('.product-item') || 
                               button.closest('.product') || 
                               button.closest('.product-description-wrap') ||
                               button.closest('.shop_single');
        
        if (!productContainer) {
          console.error('Product container not found');
          return;
        }

        // Get price
        const price = this.getProductPrice(productContainer);
        if (!price || isNaN(price) || price <= 0) {
          console.error('Invalid price:', price);
          return;
        }

        // Get product name
        const nameElement = productContainer.querySelector('.product-title a, .product-name a, .product-title');
        if (!nameElement) {
          console.error('Name element not found');
          return;
        }

        // Get product image
        const imageElement = productContainer.querySelector('img') || 
                           document.querySelector('#gallery-main .gallery-cell:first-child img');
        if (!imageElement) {
          console.error('Image element not found');
          return;
        }

        // Get quantity
        const quantityInput = productContainer.querySelector('.quantity input[type="number"]');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        const item = {
          id: productContainer.dataset.id || Date.now().toString(),
          name: nameElement.textContent.trim(),
          price: price,
          image: imageElement.src,
          quantity: quantity
        };

        console.log('Adding item:', item);
        this.addItem(item);
        
        // Add success notification
        this.showToast('Item added to cart successfully!');
        this.updateCartIcon();
        
        // Update cart display
        this.updateCartDisplay();
      }
    });
  }

  initCheckoutButton() {
    document.addEventListener('click', (e) => {
      const checkoutButton = e.target.closest('.wc-proceed-to-checkout a, .nav-cart-actions a[href*="checkout"]');
      if (checkoutButton) {
        e.preventDefault();
        
        // Check if cart is empty
        if (this.items.length === 0) {
          this.showToast('Your cart is empty. Please add items before checkout.', 'error');
          return;
        }

        // Check if total is valid
        const total = this.calculateTotal();
        if (total <= 0) {
          this.showToast('Invalid cart total. Please try again.', 'error');
          return;
        }

        // Store cart data for checkout
        localStorage.setItem('checkout_data', JSON.stringify({
          items: this.items,
          total: total,
          timestamp: new Date().getTime()
        }));

        // Redirect to checkout page
        window.location.href = 'shop-checkout.html';
      }
    });
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();
});
