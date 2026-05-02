import { LitElement as l, nothing as c, html as o } from "lit";
const p = class p extends l {
  constructor() {
    super(...arguments), this.onResize = () => {
      const t = this.querySelector("[data-expanding-products-native]");
      if (!(t != null && t.dataset.ready))
        return;
      const e = Number(t.dataset.activeIndex || 0);
      this.applyLayout(t, e);
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), window.addEventListener("resize", this.onResize);
  }
  disconnectedCallback() {
    var t;
    window.removeEventListener("resize", this.onResize), (t = this.observer) == null || t.disconnect(), this.poller && window.clearInterval(this.poller), super.disconnectedCallback();
  }
  updated(t) {
    super.updated(t), this.watchProducts();
  }
  get item() {
    var t, e;
    return ((e = (t = this.config) == null ? void 0 : t.cospecail) == null ? void 0 : e[0]) || this.config;
  }
  localize(t) {
    return t ? typeof t == "string" ? t : t.ar || t.en || "" : "";
  }
  getSourceValue(t) {
    return Array.isArray(t) ? JSON.stringify(t) : String(t || "");
  }
  watchProducts() {
    var e;
    const t = this.querySelector("[data-expanding-products-native]");
    !t || t.dataset.ready === "true" || ((e = this.observer) == null || e.disconnect(), this.observer = new MutationObserver(() => this.initNativeExpandingProducts()), this.observer.observe(t, { childList: !0, subtree: !0 }), this.initNativeExpandingProducts(), this.poller || (this.poller = window.setInterval(() => {
      this.initNativeExpandingProducts() && (window.clearInterval(this.poller), this.poller = void 0);
    }, 500)));
  }
  initNativeExpandingProducts() {
    const t = this.querySelector("[data-expanding-products-native]");
    if (!t || t.dataset.ready === "true")
      return !1;
    const e = Array.from(t.querySelectorAll(".s-product-card-entry"));
    return e.length ? (t.classList.add("is-ready"), e.forEach((i, a) => {
      const n = () => this.applyLayout(t, a);
      i.addEventListener("mouseenter", n), i.addEventListener("focusin", n), i.addEventListener("click", (s) => {
        const r = s.target, u = r == null ? void 0 : r.closest("button, a, salla-add-product-button");
        u && !u.classList.contains("s-product-card-entry") || n();
      });
    }), this.applyLayout(t, 0), t.dataset.ready = "true", !0) : !1;
  }
  applyLayout(t, e = 0) {
    const i = Array.from(t.querySelectorAll(".s-product-card-entry")), a = window.innerWidth >= 768, n = i.map((s, r) => r === e ? "5fr" : "1fr").join(" ");
    a ? (t.style.gridTemplateColumns = n, t.style.gridTemplateRows = "1fr") : (t.style.gridTemplateRows = n, t.style.gridTemplateColumns = "1fr"), i.forEach((s, r) => {
      s.classList.toggle("is-active", r === e);
    }), t.dataset.activeIndex = String(e);
  }
  render() {
    const t = this.item, e = this.getSourceValue(t == null ? void 0 : t.category_id), i = (t == null ? void 0 : t.limit) || 6, a = this.localize(t == null ? void 0 : t.title), n = this.localize(t == null ? void 0 : t.subtitle);
    return !t || !e ? c : o`
      ${g()}
      <section class="expanding-products-section">
        <div class="container">
          <div class="expanding-products-section__head">
            <div>
              ${a ? o`<h2 class="expanding-products-section__title">${a}</h2>` : c}
              ${n ? o`<p class="expanding-products-section__subtitle">${n}</p>` : c}
            </div>

            <a href="/products" class="expanding-products-section__all">عرض الكل</a>
          </div>

          <div class="expanding-products-native" data-expanding-products-native>
            <salla-products-list
              source="categories"
              source-value=${e}
              limit=${String(i)}
            ></salla-products-list>
          </div>
        </div>
      </section>
    `;
  }
};
p.properties = {
  config: { type: Object }
};
let d = p;
function g() {
  return o`
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
typeof d < "u" && d.registerSallaComponent("salla-expanding-products");
export {
  d as default
};
