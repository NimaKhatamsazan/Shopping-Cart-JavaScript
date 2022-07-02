const productDOM = document.querySelector(".product-container");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartDOM = document.querySelector(".cart");
const cartOverLay = document.querySelector(".cart-overlay");
const cartIcon = document.querySelector(".cart-anchor");
const closeCart = document.querySelector(".close-cart");
const clearCartProducts = document.querySelector(".button-clear-products");

let cart = [];

class Product {
  async getProduct() {
    try {
      const result = await fetch("products.json");
      const data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.field;
        const { id } = item.sys;
        const image = item.field.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
class View {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `
      <div class="product-info">
    <img
    src=${item.image}
    alt=${item.title}
    class="image-container"
  />
  <h2 class="product-title">${item.title}</h2>
  <h3 class="product-price">$${item.price}</h3>
  <button class="btn-product" data-id=${item.id}>Add to Cart</button>
  </div> 
  `;
    });
    productDOM.innerHTML = result;
  }
  getButton() {
    const button = [...document.querySelectorAll(".btn-product")];
    button.forEach((item) => {
      let id = item.dataset.id;
      item.addEventListener("click", (event) => {
        let cartItem = { ...Storage.getProductStorage(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  setCartValues() {
    let totalPrice = 0;
    let totalItems = 0;
    cart.map((item) => {
      totalPrice = totalPrice + item.price * item.amount;
      totalItems = totalItems + item.amount;
    });
    cartTotal.innerText = totalPrice;
    cartItems.innerText = totalItems;
    console.log(cartItems, cartTotal);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-items");
    div.innerHTML = `
    <h3>Name: ${item.title}</h3>
    <div><i class="fa fa-plus" style="font-size:16px" data-id=${item.id}></i>
    </div>
<h4 class="cart-amount">Amount:${item.amount}</h4>
<i class="fa fa-minus" style="font-size:16px" data-id=${item.id}></i>

<h3 class="cart-price">Price: $${item.price}</h3>
<a href="#", class="remove-card-item" data-id=${item.id}>Remove</a>
<div class="border-bottom"></div>
    
    `;
    cartContent.appendChild(div);

    console.log(cartContent);
  }
  showCart() {
    cartOverLay.classList.add("transParentBcg");
    cartDOM.classList.add("ShowCart");
  }

  initialApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartIcon.addEventListener("click", this.showCart);
    closeCart.addEventListener("click", this.hideCart);
  }
  populate(cart) {
    cart.forEach((item) => {
      return this.addCartItem(item);
    });
  }
  hideCart() {
    cartOverLay.classList.remove("transParentBcg");
    cartDOM.classList.remove("ShowCart");
  }
  cardProcess() {
    clearCartProducts.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-card-item")) {
        let removeItem = event.target;

        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement);
        this.removeProduct(id);
      }
      if (event.target.classList.contains("fa-plus")) {
        let addAmount = event.target;

        let id = addAmount.dataset.id;
        let product = cart.find((item) => {
          return item.id === id;
        });
        product.amount = product.amount + 1;
        if (product.amount < 100) {
          Storage.saveCart(cart);

          this.setCartValues(cart);
          // addAmount.nextElementSibling.innerText = product.amount;
          addAmount.nextElementSibling.innerText = `Amount:${product.amount}`;
        } else {
          cartContent.removeChild(addAmount.parentElement);
          this.removeProduct(id);
        }
      }
      if (event.target.classList.contains("fa-minus")) {
        let decreaseAmount = event.target;

        let id = decreaseAmount.dataset.id;
        let product = cart.find((item) => {
          return item.id === id;
        });

        product.amount = product.amount - 1;
        if (product.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decreaseAmount.previousElementSibling.innerText = `Amount:${product.amount}`;
        } else {
          cartContent.removeChild(decreaseAmount.parentElement);
          this.removeProduct(id);
        }
      }
    });
  }
  clearCart() {
    let cartItem = cart.map((item) => {
      return item.id;
    });
    cartItem.forEach((item) => {
      return this.removeProduct(item);
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeProduct(id) {
    cart = cart.filter((item) => {
      return item.id !== id;
    });
    this.setCartValues(cart);
    Storage.saveCart(cart);
  }
}

class Storage {
  static saveProduct(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProductStorage(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((s) => {
      return s.id === id;
    });
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const view = new View();
  const product = new Product();
  view.initialApp();
  product
    .getProduct()
    .then((data) => {
      view.displayProducts(data);
      Storage.saveProduct(data);
    })
    .then(() => {
      view.getButton();
      view.cardProcess();
    });
});
