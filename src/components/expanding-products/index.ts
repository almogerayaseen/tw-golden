import { html, LitElement, nothing, type PropertyValues } from 'lit';

type LocalizedValue = string | { ar?: string; en?: string } | undefined;

type ExpandingProductsItem = {
  title?: LocalizedValue;
  subtitle?: LocalizedValue;
  category_id?: string | number | Array<string | number>;
  limit?: number;
};

export default class ExpandingProducts extends LitElement {
  static properties = {
    config: { type: Object },
  };

  config?: {
    cospecail?: ExpandingProductsItem[];
    title?: LocalizedValue;
    subtitle?: LocalizedValue;
    category_id?: string | number | Array<string | number>;
    limit?: number;
  };

  private observer?: MutationObserver;
  private poller?: number;
  private readonly onResize = () => {
    const wrapper = this.querySelector<HTMLElement>('[data-expanding-products-native]');
    if (!wrapper?.dataset.ready) {
      return;
    }

    const activeIndex = Number(wrapper.dataset.activeIndex || 0);
    this.applyLayout(wrapper, activeIndex);
  };

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.onResize);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onResize);
    this.observer?.disconnect();

    if (this.poller) {
      window.clearInterval(this.poller);
    }

    super.disconnectedCallback();
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    this.watchProducts();
  }

  private get item(): ExpandingProductsItem | undefined {
    return this.config?.cospecail?.[0] || this.config;
  }

  private localize(value: LocalizedValue) {
    if (!value) {
      return '';
    }

    return typeof value === 'string' ? value : value.ar || value.en || '';
  }

  private getSourceValue(value: ExpandingProductsItem['category_id']) {
    return Array.isArray(value) ? JSON.stringify(value) : String(value || '');
  }

  private watchProducts() {
    const wrapper = this.querySelector<HTMLElement>('[data-expanding-products-native]');
    if (!wrapper || wrapper.dataset.ready === 'true') {
      return;
    }

    this.observer?.disconnect();
    this.observer = new MutationObserver(() => this.initNativeExpandingProducts());
    this.observer.observe(wrapper, { childList: true, subtree: true });

    this.initNativeExpandingProducts();

    if (!this.poller) {
      this.poller = window.setInterval(() => {
        if (this.initNativeExpandingProducts()) {
          window.clearInterval(this.poller);
          this.poller = undefined;
        }
      }, 500);
    }
  }

  private initNativeExpandingProducts() {
    const wrapper = this.querySelector<HTMLElement>('[data-expanding-products-native]');
    if (!wrapper || wrapper.dataset.ready === 'true') {
      return false;
    }

    const cards = Array.from(wrapper.querySelectorAll<HTMLElement>('.s-product-card-entry'));
    if (!cards.length) {
      return false;
    }

    wrapper.classList.add('is-ready');

    cards.forEach((card, index) => {
      const activate = () => this.applyLayout(wrapper, index);

      card.addEventListener('mouseenter', activate);
      card.addEventListener('focusin', activate);
      card.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;
        const action = target?.closest('button, a, salla-add-product-button');

        if (action && !action.classList.contains('s-product-card-entry')) {
          return;
        }

        activate();
      });
    });

    this.applyLayout(wrapper, 0);
    wrapper.dataset.ready = 'true';
    return true;
  }

  private applyLayout(wrapper: HTMLElement, activeIndex = 0) {
    const cards = Array.from(wrapper.querySelectorAll<HTMLElement>('.s-product-card-entry'));
    const isDesktop = window.innerWidth >= 768;
    const sizes = cards.map((_, index) => (index === activeIndex ? '5fr' : '1fr')).join(' ');

    if (isDesktop) {
      wrapper.style.gridTemplateColumns = sizes;
      wrapper.style.gridTemplateRows = '1fr';
    } else {
      wrapper.style.gridTemplateRows = sizes;
      wrapper.style.gridTemplateColumns = '1fr';
    }

    cards.forEach((card, index) => {
      card.classList.toggle('is-active', index === activeIndex);
    });

    wrapper.dataset.activeIndex = String(activeIndex);
  }

  render() {
    const item = this.item;
    const categoryValue = this.getSourceValue(item?.category_id);
    const limit = item?.limit || 6;
    const title = this.localize(item?.title);
    const subtitle = this.localize(item?.subtitle);

    if (!item || !categoryValue) {
      return nothing;
    }

    return html`
      ${styles()}
      <section class="expanding-products-section">
        <div class="container">
          <div class="expanding-products-section__head">
            <div>
              ${title ? html`<h2 class="expanding-products-section__title">${title}</h2>` : nothing}
              ${subtitle
                ? html`<p class="expanding-products-section__subtitle">${subtitle}</p>`
                : nothing}
            </div>

            <a href="/products" class="expanding-products-section__all">عرض الكل</a>
          </div>

          <div class="expanding-products-native" data-expanding-products-native>
            <salla-products-list
              source="categories"
              source-value=${categoryValue}
              limit=${String(limit)}
            ></salla-products-list>
          </div>
        </div>
      </section>
    `;
  }
}

function styles() {
  return html`
    <style>
      .expanding-products-section {
        padding: 5px 0;
        direction: rtl;
      }

      .expanding-products-section__head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 20px;
        margin: 0 0 32px;
      }

      .expanding-products-section__title {
        margin: 0 0 12px;
        font-size: 44px;
        line-height: 1.1;
        font-weight: 800;
        color: #111827;
      }

      .expanding-products-section__subtitle {
        margin: 0;
        font-size: 16px;
        line-height: 1.9;
        color: #6b7280;
      }

      .expanding-products-section__all {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 18px;
        border-radius: 999px;
        background: #111827;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        transition:
          opacity 0.25s ease,
          transform 0.25s ease;
      }

      .expanding-products-section__all:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .expanding-products-native {
        width: 100%;
      }

      .expanding-products-native.is-ready {
        display: grid;
        gap: 8px;
        width: 100%;
        min-height: 600px;
        height: 600px;
        transition:
          grid-template-columns 0.5s ease,
          grid-template-rows 0.5s ease;
      }

      .expanding-products-native.is-ready salla-products-list,
      .expanding-products-native.is-ready .s-products-list-wrapper,
      .expanding-products-native.is-ready .s-products-list-grid {
        display: contents !important;
      }

      .expanding-products-native .s-product-card-entry {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        min-width: 0;
        min-height: 0;
        cursor: pointer;
        background: #111;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.14);
        transition: transform 0.35s ease;
      }

      .expanding-products-native .s-product-card-image,
      .expanding-products-native .s-product-card-image-full {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .expanding-products-native .s-product-card-image a,
      .expanding-products-native .s-product-card-image-full a {
        display: block;
        width: 100%;
        height: 100%;
      }

      .expanding-products-native .s-product-card-image img,
      .expanding-products-native .s-product-card-image-full img {
        width: 100%;
        height: 100%;
        object-fit: cover !important;
        transform: scale(1.08);
        filter: grayscale(1);
        transition:
          transform 0.35s ease,
          filter 0.35s ease;
      }

      .expanding-products-native .s-product-card-entry::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.88),
          rgba(0, 0, 0, 0.34),
          transparent
        );
        pointer-events: none;
        z-index: 1;
      }

      .expanding-products-native .s-product-card-content {
        position: absolute;
        inset: auto 0 0 0;
        z-index: 2;
        padding: 18px;
        background: transparent !important;
        pointer-events: none;
      }

      .expanding-products-native .s-product-card-content-main,
      .expanding-products-native .s-product-card-content-sub,
      .expanding-products-native .s-product-card-content-footer {
        pointer-events: auto;
      }

      .expanding-products-native .s-product-card-content-title a {
        color: #fff !important;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 800;
      }

      .expanding-products-native .s-product-card-content-subtitle {
        color: rgba(255, 255, 255, 0.82) !important;
        font-size: 14px;
        line-height: 1.8;
        max-width: 320px;
      }

      .expanding-products-native .s-product-card-content-sub {
        margin-top: 10px;
      }

      .expanding-products-native .s-product-card-price,
      .expanding-products-native .s-product-card-sale-price h4,
      .expanding-products-native .s-product-card-starting-price h4,
      .expanding-products-native .s-product-card-starting-price p,
      .expanding-products-native .s-product-card-sale-price span,
      .expanding-products-native .s-product-card-rating {
        color: #fff !important;
      }

      .expanding-products-native .s-product-card-content-footer {
        display: flex;
        gap: 10px;
        margin-top: 18px;
        flex-wrap: wrap;
        opacity: 0;
        transform: translateY(16px);
        transition:
          opacity 0.3s ease,
          transform 0.3s ease;
      }

      .expanding-products-native .s-product-card-content-footer salla-add-product-button,
      .expanding-products-native .s-product-card-content-footer .s-product-card-wishlist-btn {
        pointer-events: auto;
      }

      .expanding-products-native .s-product-card-content-footer .s-button-element,
      .expanding-products-native .s-product-card-content-footer button,
      .expanding-products-native .s-product-card-content-footer .btn {
        border-radius: 999px !important;
      }

      .expanding-products-native
        .s-product-card-entry:not(.is-active)
        .s-product-card-content-main,
      .expanding-products-native
        .s-product-card-entry:not(.is-active)
        .s-product-card-content-sub,
      .expanding-products-native
        .s-product-card-entry:not(.is-active)
        .s-product-card-content-footer {
        opacity: 0;
        transform: translateY(16px);
        transition:
          opacity 0.3s ease,
          transform 0.3s ease;
      }

      .expanding-products-native .s-product-card-entry.is-active .s-product-card-image img,
      .expanding-products-native .s-product-card-entry.is-active .s-product-card-image-full img {
        transform: scale(1);
        filter: grayscale(0);
      }

      .expanding-products-native .s-product-card-entry.is-active .s-product-card-content-main,
      .expanding-products-native .s-product-card-entry.is-active .s-product-card-content-sub,
      .expanding-products-native .s-product-card-entry.is-active .s-product-card-content-footer {
        opacity: 1;
        transform: translateY(0);
      }

      .expanding-products-native .s-product-card-entry .s-product-card-wishlist-btn {
        z-index: 3;
      }

      @media (max-width: 767px) {
        .expanding-products-section__head {
          flex-direction: column;
          align-items: start;
        }

        .expanding-products-section__title {
          font-size: 32px;
        }

        .expanding-products-native.is-ready {
          min-height: 540px;
          height: 540px;
          grid-template-columns: 1fr;
        }

        .expanding-products-native .s-product-card-content-title a {
          font-size: 20px;
        }
      }
    </style>
  `;
}
