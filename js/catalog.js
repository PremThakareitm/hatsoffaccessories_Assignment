// Catalog functionality
class Catalog {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    // Initialize event listeners
    this.initFilterEvents();
    this.initSortEvents();
    this.initPriceFilter();
    this.initCategoryFilter();
    this.initViewModeSwitch();
  }

  initFilterEvents() {
    // Price filter
    const priceRange = document.querySelector('.price-range');
    if (priceRange) {
      priceRange.addEventListener('change', (e) => {
        const [min, max] = e.target.value.split(',');
        this.filterByPrice(min, max);
      });
    }

    // Category filter
    const categoryLinks = document.querySelectorAll('.product-categories a');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        this.filterByCategory(category);
      });
    });
  }

  initSortEvents() {
    const sortSelect = document.querySelector('.ecommerce-ordering select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        this.sortProducts(sortBy);
      });
    }
  }

  initPriceFilter() {
    const priceInputs = document.querySelectorAll('.price-filter input');
    priceInputs.forEach(input => {
      input.addEventListener('change', () => {
        const min = document.querySelector('#price_min').value;
        const max = document.querySelector('#price_max').value;
        this.filterByPrice(min, max);
      });
    });
  }

  initCategoryFilter() {
    const categoryCheckboxes = document.querySelectorAll('.widget_categories input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selectedCategories = Array.from(categoryCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.filterByCategories(selectedCategories);
      });
    });
  }

  initViewModeSwitch() {
    const gridView = document.getElementById('grid');
    const listView = document.getElementById('list');
    const productsContainer = document.querySelector('.shop-catalogue');

    if (gridView && listView) {
      gridView.addEventListener('click', (e) => {
        e.preventDefault();
        productsContainer.classList.remove('list-view');
        productsContainer.classList.add('grid-view');
        gridView.classList.add('grid-active');
        listView.classList.remove('list-active');
      });

      listView.addEventListener('click', (e) => {
        e.preventDefault();
        productsContainer.classList.remove('grid-view');
        productsContainer.classList.add('list-view');
        listView.classList.add('list-active');
        gridView.classList.remove('grid-active');
      });
    }
  }

  filterByPrice(min, max) {
    this.filteredProducts = this.products.filter(product => {
      const price = parseFloat(product.price);
      return price >= min && price <= max;
    });
    this.updateProductDisplay();
  }

  filterByCategory(category) {
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === category
      );
    }
    this.updateProductDisplay();
  }

  filterByCategories(categories) {
    if (categories.length === 0) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        categories.includes(product.category)
      );
    }
    this.updateProductDisplay();
  }

  sortProducts(sortBy) {
    switch (sortBy) {
      case 'price-low-to-high':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-to-low':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'by-popularity':
        this.filteredProducts.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'date':
        this.filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting (by name)
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.updateProductDisplay();
  }

  updateProductDisplay() {
    const productsContainer = document.querySelector('.items-grid');
    if (!productsContainer) return;

    productsContainer.innerHTML = this.filteredProducts.map(product => `
      <div class="col-md-4 col-xs-6 product product-grid">
        <div class="product-item" data-id="${product.id}">
          <div class="product-img">
            <a href="shop-single.html?id=${product.id}">
              <img src="${product.image}" alt="${product.name}">
            </a>
            ${product.onSale ? '<div class="product-label"><span class="sale">sale</span></div>' : ''}
            <div class="product-actions">
              <a href="#" class="product-add-to-compare" data-toggle="tooltip" data-placement="bottom" title="Add to compare">
                <i class="fa fa-exchange"></i>
              </a>
              <a href="#" class="product-add-to-wishlist" data-toggle="tooltip" data-placement="bottom" title="Add to wishlist">
                <i class="fa fa-heart"></i>
              </a>
              <a href="#" class="add_to_cart_button" data-toggle="tooltip" data-placement="bottom" title="Add to cart">
                <i class="fa fa-shopping-cart"></i>
              </a>
            </div>
          </div>
          <div class="product-details">
            <h3 class="product-title">
              <a href="shop-single.html?id=${product.id}">${product.name}</a>
            </h3>
            <span class="category">
              <a href="#">${product.category}</a>
            </span>
          </div>
          <span class="price">
            ${product.oldPrice ? `<del><span>₹${product.oldPrice.toFixed(2)}</span></del>` : ''}
            <ins>
              <span class="amount">₹${product.price.toFixed(2)}</span>
            </ins>
          </span>
        </div>
      </div>
    `).join('');

    // Update product count
    const resultCount = document.querySelector('.result-count');
    if (resultCount) {
      resultCount.textContent = `Showing: ${this.filteredProducts.length} of ${this.products.length} results`;
    }
  }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.catalog = new Catalog();
}); 