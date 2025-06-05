// Single Product functionality
class Product {
  constructor() {
    this.init();
  }

  init() {
    this.initQuantityButtons();
    this.initAddToCart();
    this.initColorSwatches();
    this.initSizeOptions();
    this.initProductGallery();
    this.initPrices();
  }

  initQuantityButtons() {
    const quantityInput = document.querySelector('.quantity input[type="number"]');
    const plusBtn = document.querySelector('.quantity .plus');
    const minusBtn = document.querySelector('.quantity .minus');

    if (quantityInput && plusBtn && minusBtn) {
      plusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        this.updatePrice();
      });

      minusBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
          this.updatePrice();
        }
      });

      quantityInput.addEventListener('change', () => {
        if (parseInt(quantityInput.value) < 1) {
          quantityInput.value = 1;
        }
        this.updatePrice();
      });
    }
  }

  initAddToCart() {
    const addToCartBtn = document.querySelector('.add_to_cart_button');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const productContainer = document.querySelector('.product-description-wrap');
        if (!productContainer) return;

        const priceElement = productContainer.querySelector('.amount');
        const imageElement = document.querySelector('#gallery-main .gallery-cell:first-child img');
        const quantityInput = document.querySelector('.quantity input[type="number"]');

        if (!priceElement || !imageElement || !quantityInput) return;

        const product = {
          id: productContainer.dataset.id || Date.now().toString(),
          name: productContainer.querySelector('.product-title')?.textContent.trim() || 'Unnamed Product',
          price: parseFloat(priceElement.textContent.replace(/[₹,]/g, '')),
          image: imageElement.src,
          quantity: parseInt(quantityInput.value),
          options: this.getSelectedOptions()
        };

        if (window.cart) {
          window.cart.addItem(product);
        }
      });
    }
  }

  getSelectedOptions() {
    const options = {};

    const selectedColor = document.querySelector('.color-swatches a.selected');
    if (selectedColor) {
      options.color = selectedColor.getAttribute('data-color');
    }

    const selectedSize = document.querySelector('.size-options a.selected');
    if (selectedSize) {
      options.size = selectedSize.textContent;
    }

    return options;
  }

  initColorSwatches() {
    const colorSwatches = document.querySelectorAll('.color-swatches a');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        colorSwatches.forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      });
    });
  }

  initSizeOptions() {
    const sizeOptions = document.querySelectorAll('.size-options a');
    sizeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        sizeOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
  }

  initProductGallery() {
    const mainGallery = document.getElementById('gallery-main');
    const thumbsGallery = document.querySelector('.gallery-thumbs');

    if (mainGallery && thumbsGallery) {
      const thumbs = thumbsGallery.querySelectorAll('.gallery-cell');
      thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
          thumbs.forEach(t => t.classList.remove('is-selected'));
          thumb.classList.add('is-selected');

          const mainImages = mainGallery.querySelectorAll('.gallery-cell');
          mainImages.forEach(img => img.style.display = 'none');
          if (mainImages[index]) {
            mainImages[index].style.display = 'block';
          }
        });
      });

      const lightboxLinks = mainGallery.querySelectorAll('.lightbox-img');
      lightboxLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof jQuery !== 'undefined' && jQuery.fn.magnificPopup) {
            jQuery(link).magnificPopup({
              type: 'image',
              gallery: { enabled: true }
            }).magnificPopup('open');
          }
        });
      });
    }
  }

  initPrices() {
    const priceElements = document.querySelectorAll('.amount');
    priceElements.forEach(element => {
      // If data-base-price is not set, set it from the current price
      if (!element.hasAttribute('data-base-price')) {
        const currentPrice = element.textContent.trim();
        // Use cart's parsePrice if available, otherwise do basic parsing
        const basePrice = window.cart ? 
          window.cart.parsePrice(currentPrice) : 
          parseFloat(currentPrice.replace(/[₹,\s]/g, ''));
        
        element.setAttribute('data-base-price', basePrice.toString());
        
        // Format the display price using cart's formatter if available
        if (window.cart) {
          element.textContent = window.cart.formatPrice(basePrice);
        }
      }
    });
  }

  updatePrice() {
    const quantityInput = document.querySelector('.quantity input[type="number"]');
    const priceElement = document.querySelector('.amount');

    if (!quantityInput || !priceElement) return;

    const quantity = parseInt(quantityInput.value);
    const basePrice = parseFloat(priceElement.getAttribute('data-base-price') || '0');

    if (isNaN(basePrice)) {
      console.error('Invalid base price:', priceElement.getAttribute('data-base-price'));
      return;
    }

    const totalPrice = basePrice * quantity;
    
    // Use cart's price formatter if available
    if (window.cart) {
      priceElement.textContent = window.cart.formatPrice(totalPrice);
    } else {
      // Fallback to basic formatting
      priceElement.textContent = `₹${totalPrice.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  }
}

// Initialize product when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.product = new Product();
});
