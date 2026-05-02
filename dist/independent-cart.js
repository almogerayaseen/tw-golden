import { LitElement as h, css as u, nothing as g, html as i } from "lit";
const c = "tw-golden-independent-cart", o = class o extends h {
  constructor() {
    super(...arguments), this.items = [], this.isOpen = !1, this.handleExternalAdd = (t) => {
      this.addItem(t.detail), this.isOpen = !0;
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.items = this.readItems(), window.addEventListener("tw-cart:add", this.handleExternalAdd);
  }
  disconnectedCallback() {
    window.removeEventListener("tw-cart:add", this.handleExternalAdd), super.disconnectedCallback();
  }
  get currency() {
    var t;
    return ((t = this.config) == null ? void 0 : t.currency) || "ر.س";
  }
  get totalQuantity() {
    return this.items.reduce((t, e) => t + e.quantity, 0);
  }
  get totalPrice() {
    return this.items.reduce((t, e) => t + e.price * e.quantity, 0);
  }
  readItems() {
    try {
      const t = localStorage.getItem(c);
      return t ? JSON.parse(t) : [];
    } catch {
      return [];
    }
  }
  saveItems(t) {
    this.items = t, localStorage.setItem(c, JSON.stringify(t));
  }
  addItem(t) {
    if (!(t != null && t.id) && !(t != null && t.name))
      return;
    const e = String(t.id || t.name), n = Math.max(1, Number(t.quantity || 1)), a = {
      id: e,
      name: t.name || "منتج",
      price: Math.max(0, Number(t.price || 0)),
      quantity: n,
      image: t.image
    }, p = this.items.find((r) => r.id === e) ? this.items.map(
      (r) => r.id === e ? { ...r, quantity: r.quantity + n } : r
    ) : [...this.items, a];
    this.saveItems(p), this.dispatchEvent(
      new CustomEvent("cart-updated", {
        detail: { items: this.items, total: this.totalPrice },
        bubbles: !0,
        composed: !0
      })
    );
  }
  addDemoItem() {
    var t;
    this.addItem(
      ((t = this.config) == null ? void 0 : t.demoProduct) || {
        id: "demo-product",
        name: "منتج تجريبي",
        price: 99,
        quantity: 1
      }
    );
  }
  updateQuantity(t, e) {
    const n = this.items.map(
      (a) => a.id === t ? { ...a, quantity: Math.max(0, a.quantity + e) } : a
    ).filter((a) => a.quantity > 0);
    this.saveItems(n);
  }
  removeItem(t) {
    this.saveItems(this.items.filter((e) => e.id !== t));
  }
  clearCart() {
    this.saveItems([]);
  }
  checkout() {
    var t;
    this.dispatchEvent(
      new CustomEvent("cart-checkout", {
        detail: { items: this.items, total: this.totalPrice },
        bubbles: !0,
        composed: !0
      })
    ), (t = this.config) != null && t.checkoutUrl && (window.location.href = this.config.checkoutUrl);
  }
  formatPrice(t) {
    return `${t.toFixed(2)} ${this.currency}`;
  }
  render() {
    var t;
    return i`
      <button class="trigger" type="button" aria-label="فتح السلة" @click=${() => this.isOpen = !0}>
        ${d()}
        ${this.totalQuantity ? i`<span class="count">${this.totalQuantity}</span>` : g}
      </button>

      <div
        class="backdrop"
        data-open=${String(this.isOpen)}
        @click=${() => this.isOpen = !1}
      ></div>

      <aside class="panel" data-open=${String(this.isOpen)} aria-label="سلة المشتريات">
        <header class="header">
          <h2 class="title">${((t = this.config) == null ? void 0 : t.title) || "سلة المشتريات"}</h2>
          <button class="close" type="button" aria-label="إغلاق السلة" @click=${() => this.isOpen = !1}>
            ${b()}
          </button>
        </header>

        <main class="content">
          ${this.items.length ? this.renderItems() : this.renderEmpty()}
        </main>

        <footer class="footer">
          <div class="total">
            <span>الإجمالي</span>
            <span>${this.formatPrice(this.totalPrice)}</span>
          </div>
          <div class="actions">
            <button
              class="checkout"
              type="button"
              ?disabled=${!this.items.length}
              @click=${this.checkout}
            >
              إتمام الطلب
            </button>
            <button class="icon-button" type="button" aria-label="تفريغ السلة" @click=${this.clearCart}>
              ${l()}
            </button>
          </div>
        </footer>
      </aside>
    `;
  }
  renderEmpty() {
    var t;
    return i`
      <div class="empty">
        <div>${((t = this.config) == null ? void 0 : t.emptyText) || "السلة فارغة حاليًا"}</div>
        <button class="demo-button" type="button" @click=${this.addDemoItem}>إضافة منتج تجريبي</button>
      </div>
    `;
  }
  renderItems() {
    return i`
      <ul class="list">
        ${this.items.map(
      (t) => i`
            <li class="item">
              ${t.image ? i`<img class="image" src=${t.image} alt=${t.name} />` : i`<div class="placeholder" aria-hidden="true">${d()}</div>`}
              <div class="details">
                <div class="name-row">
                  <h3 class="name">${t.name}</h3>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label=${`حذف ${t.name}`}
                    @click=${() => this.removeItem(t.id)}
                  >
                    ${l()}
                  </button>
                </div>
                <div class="controls">
                  <div class="qty" aria-label=${`كمية ${t.name}`}>
                    <button type="button" aria-label="تقليل الكمية" @click=${() => this.updateQuantity(t.id, -1)}>
                      -
                    </button>
                    <span>${t.quantity}</span>
                    <button type="button" aria-label="زيادة الكمية" @click=${() => this.updateQuantity(t.id, 1)}>
                      +
                    </button>
                  </div>
                  <span class="price">${this.formatPrice(t.price * t.quantity)}</span>
                </div>
              </div>
            </li>
          `
    )}
      </ul>
    `;
  }
};
o.properties = {
  config: { type: Object },
  items: { state: !0 },
  isOpen: { state: !0 }
}, o.styles = u`
    :host {
      --cart-primary: #161616;
      --cart-accent: #d7a83f;
      --cart-surface: #ffffff;
      --cart-muted: #6f6f6f;
      --cart-border: #e7e1d6;
      --cart-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
      box-sizing: border-box;
      direction: rtl;
      font-family: inherit;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    .trigger {
      position: fixed;
      z-index: 9998;
      inset-block-end: 24px;
      inset-inline-start: 24px;
      width: 58px;
      height: 58px;
      border: 0;
      border-radius: 50%;
      color: #fff;
      background: var(--cart-primary);
      box-shadow: var(--cart-shadow);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition:
        transform 160ms ease,
        background 160ms ease;
    }

    .trigger:hover {
      transform: translateY(-2px);
      background: #000;
    }

    .trigger svg {
      width: 25px;
      height: 25px;
    }

    .count {
      position: absolute;
      inset-block-start: -4px;
      inset-inline-end: -4px;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: #161616;
      background: var(--cart-accent);
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
    }

    .backdrop {
      position: fixed;
      z-index: 9998;
      inset: 0;
      background: rgba(0, 0, 0, 0.34);
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }

    .backdrop[data-open='true'] {
      opacity: 1;
      pointer-events: auto;
    }

    .panel {
      position: fixed;
      z-index: 9999;
      inset-block: 0;
      inset-inline-end: 0;
      width: min(420px, 100vw);
      display: grid;
      grid-template-rows: auto 1fr auto;
      color: var(--cart-primary);
      background: var(--cart-surface);
      box-shadow: var(--cart-shadow);
      transform: translateX(105%);
      transition: transform 220ms ease;
    }

    :host([dir='ltr']) .panel {
      transform: translateX(-105%);
    }

    .panel[data-open='true'] {
      transform: translateX(0);
    }

    .header,
    .footer {
      padding: 18px;
      border-color: var(--cart-border);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--cart-border);
    }

    .title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
    }

    .close,
    .icon-button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--cart-border);
      border-radius: 8px;
      color: var(--cart-primary);
      background: #fff;
      cursor: pointer;
      display: grid;
      place-items: center;
    }

    .close svg,
    .icon-button svg {
      width: 18px;
      height: 18px;
    }

    .content {
      min-height: 0;
      overflow: auto;
      padding: 14px 18px;
    }

    .empty {
      min-height: 100%;
      display: grid;
      place-items: center;
      gap: 14px;
      align-content: center;
      color: var(--cart-muted);
      text-align: center;
      line-height: 1.7;
    }

    .demo-button {
      border: 0;
      border-radius: 8px;
      padding: 11px 16px;
      color: #fff;
      background: var(--cart-primary);
      cursor: pointer;
      font-weight: 700;
    }

    .list {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .item {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--cart-border);
      border-radius: 8px;
      background: #fffdf9;
    }

    .image {
      width: 72px;
      height: 72px;
      border-radius: 8px;
      background: #f3efe7;
      object-fit: cover;
    }

    .placeholder {
      width: 72px;
      height: 72px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      color: var(--cart-accent);
      background: #f3efe7;
    }

    .placeholder svg {
      width: 28px;
      height: 28px;
    }

    .details {
      min-width: 0;
      display: grid;
      gap: 10px;
    }

    .name-row,
    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .name {
      margin: 0;
      overflow-wrap: anywhere;
      font-size: 15px;
      font-weight: 700;
      line-height: 1.5;
    }

    .price {
      color: var(--cart-muted);
      font-size: 13px;
      white-space: nowrap;
    }

    .qty {
      display: inline-flex;
      align-items: center;
      height: 34px;
      border: 1px solid var(--cart-border);
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
    }

    .qty button {
      width: 34px;
      height: 34px;
      border: 0;
      color: var(--cart-primary);
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .qty span {
      min-width: 34px;
      text-align: center;
      font-weight: 700;
    }

    .footer {
      display: grid;
      gap: 14px;
      border-top: 1px solid var(--cart-border);
      background: #fff;
    }

    .total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 800;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    .checkout {
      min-height: 46px;
      border: 0;
      border-radius: 8px;
      color: #161616;
      background: var(--cart-accent);
      cursor: pointer;
      font-size: 15px;
      font-weight: 800;
    }

    .checkout:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    @media (max-width: 520px) {
      .trigger {
        inset-block-end: 18px;
        inset-inline-start: 18px;
      }

      .panel {
        width: 100vw;
      }
    }
  `;
let s = o;
function d() {
  return i`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.98a2 2 0 0 0 1.95-1.57l1.35-6.43H5.12"></path>
    </svg>
  `;
}
function b() {
  return i`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `;
}
function l() {
  return i`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18"></path>
      <path d="M8 6V4h8v2"></path>
      <path d="M19 6 18 20H6L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    </svg>
  `;
}
typeof s < "u" && s.registerSallaComponent("salla-independent-cart");
export {
  s as default
};
