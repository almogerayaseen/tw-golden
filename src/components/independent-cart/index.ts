import { css, html, LitElement, nothing } from 'lit';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type AddToCartEvent = CustomEvent<Partial<CartItem>>;

const STORAGE_KEY = 'tw-golden-independent-cart';

export default class IndependentCart extends LitElement {
  static properties = {
    config: { type: Object },
    items: { state: true },
    isOpen: { state: true },
  };

  config?: {
    title?: string;
    currency?: string;
    checkoutUrl?: string;
    emptyText?: string;
    demoProduct?: CartItem;
  };

  items: CartItem[] = [];
  isOpen = false;

  static styles = css`
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

  connectedCallback() {
    super.connectedCallback();
    this.items = this.readItems();
    window.addEventListener('tw-cart:add', this.handleExternalAdd as EventListener);
  }

  disconnectedCallback() {
    window.removeEventListener('tw-cart:add', this.handleExternalAdd as EventListener);
    super.disconnectedCallback();
  }

  private handleExternalAdd = (event: AddToCartEvent) => {
    this.addItem(event.detail);
    this.isOpen = true;
  };

  private get currency() {
    return this.config?.currency || 'ر.س';
  }

  private get totalQuantity() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  private get totalPrice() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  private readItems(): CartItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveItems(items: CartItem[]) {
    this.items = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private addItem(item?: Partial<CartItem>) {
    if (!item?.id && !item?.name) {
      return;
    }

    const id = String(item.id || item.name);
    const quantity = Math.max(1, Number(item.quantity || 1));
    const nextItem: CartItem = {
      id,
      name: item.name || 'منتج',
      price: Math.max(0, Number(item.price || 0)),
      quantity,
      image: item.image,
    };

    const existing = this.items.find((cartItem) => cartItem.id === id);
    const next = existing
      ? this.items.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem,
        )
      : [...this.items, nextItem];

    this.saveItems(next);
    this.dispatchEvent(
      new CustomEvent('cart-updated', {
        detail: { items: this.items, total: this.totalPrice },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private addDemoItem() {
    this.addItem(
      this.config?.demoProduct || {
        id: 'demo-product',
        name: 'منتج تجريبي',
        price: 99,
        quantity: 1,
      },
    );
  }

  private updateQuantity(id: string, change: number) {
    const next = this.items
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item,
      )
      .filter((item) => item.quantity > 0);

    this.saveItems(next);
  }

  private removeItem(id: string) {
    this.saveItems(this.items.filter((item) => item.id !== id));
  }

  private clearCart() {
    this.saveItems([]);
  }

  private checkout() {
    this.dispatchEvent(
      new CustomEvent('cart-checkout', {
        detail: { items: this.items, total: this.totalPrice },
        bubbles: true,
        composed: true,
      }),
    );

    if (this.config?.checkoutUrl) {
      window.location.href = this.config.checkoutUrl;
    }
  }

  private formatPrice(value: number) {
    return `${value.toFixed(2)} ${this.currency}`;
  }

  render() {
    return html`
      <button class="trigger" type="button" aria-label="فتح السلة" @click=${() => (this.isOpen = true)}>
        ${cartIcon()}
        ${this.totalQuantity ? html`<span class="count">${this.totalQuantity}</span>` : nothing}
      </button>

      <div
        class="backdrop"
        data-open=${String(this.isOpen)}
        @click=${() => (this.isOpen = false)}
      ></div>

      <aside class="panel" data-open=${String(this.isOpen)} aria-label="سلة المشتريات">
        <header class="header">
          <h2 class="title">${this.config?.title || 'سلة المشتريات'}</h2>
          <button class="close" type="button" aria-label="إغلاق السلة" @click=${() => (this.isOpen = false)}>
            ${closeIcon()}
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
              ${trashIcon()}
            </button>
          </div>
        </footer>
      </aside>
    `;
  }

  private renderEmpty() {
    return html`
      <div class="empty">
        <div>${this.config?.emptyText || 'السلة فارغة حاليًا'}</div>
        <button class="demo-button" type="button" @click=${this.addDemoItem}>إضافة منتج تجريبي</button>
      </div>
    `;
  }

  private renderItems() {
    return html`
      <ul class="list">
        ${this.items.map(
          (item) => html`
            <li class="item">
              ${item.image
                ? html`<img class="image" src=${item.image} alt=${item.name} />`
                : html`<div class="placeholder" aria-hidden="true">${cartIcon()}</div>`}
              <div class="details">
                <div class="name-row">
                  <h3 class="name">${item.name}</h3>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label=${`حذف ${item.name}`}
                    @click=${() => this.removeItem(item.id)}
                  >
                    ${trashIcon()}
                  </button>
                </div>
                <div class="controls">
                  <div class="qty" aria-label=${`كمية ${item.name}`}>
                    <button type="button" aria-label="تقليل الكمية" @click=${() => this.updateQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>${item.quantity}</span>
                    <button type="button" aria-label="زيادة الكمية" @click=${() => this.updateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                  <span class="price">${this.formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          `,
        )}
      </ul>
    `;
  }
}

function cartIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h8.98a2 2 0 0 0 1.95-1.57l1.35-6.43H5.12"></path>
    </svg>
  `;
}

function closeIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `;
}

function trashIcon() {
  return html`
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18"></path>
      <path d="M8 6V4h8v2"></path>
      <path d="M19 6 18 20H6L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    </svg>
  `;
}
