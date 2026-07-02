// Nexus Link Content Script - Extremely robust AliExpress & E-commerce Product Data Miner
console.log("[Nexus Link] Content script initialized and ready to assist scraping.");

// Helper function to extract clear numbers from a text price
function parsePrice(text) {
  if (!text) return "";
  let clean = text.replace(/[^\d.,]/g, '').trim();
  // Standardize decimal pointers
  if (clean.includes(',') && !clean.includes('.')) {
    clean = clean.replace(',', '.');
  } else if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/,/g, '');
  }
  return clean;
}

// Extract any product card links found on listing pages
function getListedProductUrls() {
  const itemsMap = new Map(); // url -> { img, title, price }
  const links = document.querySelectorAll('a');
  links.forEach(a => {
    let href = a.href || a.getAttribute('href') || '';
    if (href) {
      if (href.startsWith('//')) {
        href = 'https:' + href;
      }
      const match = href.match(/aliexpress\.[a-z]+\/item\/(\d+)\.html/i) || href.match(/\/item\/(\d+)\.html/);
      if (match) {
        let host = window.location.hostname || "fr.aliexpress.com";
        try {
          const urlObj = new URL(href, window.location.origin);
          host = urlObj.hostname;
        } catch (e) {}
        
        const cleanUrl = `https://${host}/item/${match[1]}.html`;
        
        let imgUrl = null;
        const imgInside = a.querySelector('img');
        if (imgInside) {
          imgUrl = imgInside.src || imgInside.getAttribute('data-src') || imgInside.getAttribute('lazy-src');
        }
        
        if (!imgUrl) {
          let parent = a.parentElement;
          for (let i = 0; i < 4 && parent; i++) {
            const siblingImg = parent.querySelector('img');
            if (siblingImg) {
              imgUrl = siblingImg.src || siblingImg.getAttribute('data-src') || siblingImg.getAttribute('lazy-src');
              if (imgUrl) break;
            }
            parent = parent.parentElement;
          }
        }
        
        if (imgUrl) {
          if (imgUrl.startsWith('//')) {
            imgUrl = 'https:' + imgUrl;
          }
          if (imgUrl.trim().startsWith('data:') || imgUrl.includes('placeholder') || imgUrl.includes('.svg') || imgUrl.includes('logo')) {
            imgUrl = null;
          } else {
            if (imgUrl.includes('.jpg_')) {
              imgUrl = imgUrl.split('.jpg_')[0] + '.jpg_480x480.jpg'; // Higher resolution
            } else if (imgUrl.includes('.png_')) {
              imgUrl = imgUrl.split('.png_')[0] + '.png_480x480.png';
            }
          }
        }

        // Extract Title and Price in active browser session
        let title = "";
        let price = "";

        // Check attributes first
        if (a.title) title = a.title.trim();
        if (!title && a.querySelector('img') && a.querySelector('img').alt) {
          title = a.querySelector('img').alt.trim();
        }

        let parent = a.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          if (!title) {
            const titleEl = parent.querySelector('[class*="title" i], [class*="name" i], [class*="subject" i], h1, h2, h3, h4');
            if (titleEl && titleEl.textContent && titleEl.textContent.trim().length > 10) {
              const text = titleEl.textContent.trim();
              if (!text.toLowerCase().includes('ajouter au panier') && !text.toLowerCase().includes('site:')) {
                title = text;
              }
            }
          }
          
          if (!price) {
            const priceEl = parent.querySelector('[class*="price" i], [class*="money" i], [class*="amount" i]');
            if (priceEl && priceEl.textContent) {
              const cleanedText = priceEl.textContent.trim().replace(/\s+/g, ' ');
              if (cleanedText && (cleanedText.match(/\d+[\.,]\d{2}/) || cleanedText.match(/\d+/))) {
                price = cleanedText;
              }
            }
          }
          parent = parent.parentElement;
        }

        if (!title && a.textContent && a.textContent.trim().length > 15 && a.textContent.trim().length < 150) {
          title = a.textContent.trim();
        }

        if (title) {
          title = title.replace(/\s+/g, ' ').trim();
          if (title.length > 200) title = title.substring(0, 200) + '...';
        }

        if (price) {
          price = price.replace(/\s+/g, ' ').trim();
        }

        if (!itemsMap.has(cleanUrl)) {
          itemsMap.set(cleanUrl, {
            img: imgUrl || "",
            title: title || "",
            price: price || ""
          });
        } else {
          const existing = itemsMap.get(cleanUrl);
          if (!existing.img && imgUrl) existing.img = imgUrl;
          if (!existing.title && title) existing.title = title;
          if (!existing.price && price) existing.price = price;
        }
      }
    }
  });

  const results = [];
  itemsMap.forEach((meta, url) => {
    results.push({ 
      url, 
      img: meta.img || null,
      title: meta.title || null,
      price: meta.price || null
    });
  });
  return results;
}

// Main Scraper Function
function scrapeProductData() {
  const isSingleProductPage = /\/item\/\d+\.html/.test(window.location.href);

  if (!isSingleProductPage) {
    const products = getListedProductUrls();
    if (products.length > 1) {
      return {
        type: "BULK",
        products: products,
        urls: products.map(p => p.url),
        count: products.length
      };
    }
  }

  const result = {
    type: "SINGLE",
    url: window.location.href.split('?')[0],
    title: "",
    price: "",
    images: [],
    sellerName: "Vendeur AliExpress",
    sellerUrl: "",
    variants: []
  };

  try {
    // 1. Core Metadata & JSON-LD fallback for maximum resilience
    const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of jsonLdElements) {
      try {
        const data = JSON.parse(script.textContent);
        if (data && (data["@type"] === "Product" || data["type"] === "Product")) {
          result.title = data.name || result.title;
          if (data.offers) {
            const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            result.price = offer.price || result.price;
          }
          if (data.image) {
            const imgs = Array.isArray(data.image) ? data.image : [data.image];
            result.images = [...result.images, ...imgs];
          }
          if (data.brand) {
            result.sellerName = data.brand.name || result.sellerName;
          }
        }
      } catch (err) {
        // Skip malformed JS
      }
    }

    // 2. DOM Titles Extraction
    if (!result.title) {
      const titleSelectors = [
        '.product-title', 
        '.pdp-multi-accent-header', 
        'h1[class*="title"]', 
        'h1', 
        '.title-g-content',
        'meta[property="og:title"]'
      ];
      for (const selector of titleSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          result.title = el.getAttribute('content') || el.textContent.trim();
          if (result.title) break;
        }
      }
    }

    // 3. Robust Price Extraction
    if (!result.price) {
      const priceSelectors = [
        '[class*="product-price-current"]', 
        '[class*="price-current"]', 
        '.pdp-price', 
        '.product-price', 
        '.price-g-content',
        '[class*="current-price"]',
        '.price',
        'meta[property="og:price:amount"]'
      ];
      for (const selector of priceSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const rawText = el.getAttribute('content') || el.textContent;
          const parsed = parsePrice(rawText);
          if (parsed) {
            result.price = parsed;
            break;
          }
        }
      }
    }

    // 4. Robust Image Extraction
    const imageCandidates = new Set();
    
    // Add og:image
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg && ogImg.getAttribute('content')) {
      imageCandidates.add(ogImg.getAttribute('content'));
    }

    // Capture gallery and main item image selectors
    const imgSelectors = [
      '.image-view-magnifier img',
      '.images-view-item img',
      '.slider-img img',
      '#magnifier-container img',
      '.pdp-info-left img',
      '.product-image img',
      '.pdp-main-image img',
      'img[src*="item/detail"]',
      'img[src*="kf/"]'
    ];
    
    for (const selector of imgSelectors) {
      document.querySelectorAll(selector).forEach(el => {
        let src = el.src || el.getAttribute('data-src') || el.getAttribute('lazy-src');
        if (src) {
          // Normalize protocol relative URLs
          if (src.startsWith('//')) src = 'https:' + src;
          // Filter out mini-thumbnails or low res 50x50 images
          if (!src.includes('_50x50') && !src.includes('_80x80')) {
            // Clean crop suffix for ultra high quality original image
            const cleanUrl = src.split('.jpg_')[0] + '.jpg';
            if (cleanUrl.startsWith('http')) {
              imageCandidates.add(cleanUrl);
            }
          }
        }
      });
    }
    result.images = Array.from(imageCandidates).slice(0, 8); // Top 8 high-res images

    // 5. Seller Extraction
    const storeLink = document.querySelector('.store-name a, a[href*="/store/"], .seller-name a');
    if (storeLink) {
      result.sellerName = storeLink.textContent.trim() || result.sellerName;
      let href = storeLink.getAttribute('href');
      if (href) {
        if (href.startsWith('//')) href = 'https:' + href;
        result.sellerUrl = href;
      }
    } else {
      const storeNameEl = document.querySelector('.store-header .store-name, .store-name');
      if (storeNameEl) {
        result.sellerName = storeNameEl.textContent.trim();
      }
    }

    // 6. Dynamic Variant Attributes & Dropshipping Options Extraction
    // We look for color/size options dynamically in the DOM
    const variantGroups = document.querySelectorAll('.sku-property, [class*="sku-wrap"], [class*="sku-property-"]');
    const parsedVariants = [];

    if (variantGroups.length > 0) {
      variantGroups.forEach(group => {
        const titleEl = group.querySelector('.sku-title, [class*="sku-title"], .sku-property-title');
        let groupTitle = titleEl ? titleEl.textContent.trim() : "Option";
        // Clean title (e.g. "Color: White" -> "Color")
        if (groupTitle.includes(':')) {
          groupTitle = groupTitle.split(':')[0].trim();
        }

        const optionElements = group.querySelectorAll('.sku-property-val, .sku-property-image, [class*="sku-value"], [class*="sku-item"]');
        const options = [];

        optionElements.forEach(opt => {
          let value = opt.textContent.trim() || opt.getAttribute('title') || "";
          
          // Try to extract dynamic variant image
          const variantImg = opt.querySelector('img');
          let imgUrl = "";
          if (variantImg) {
            let src = variantImg.src || variantImg.getAttribute('data-src');
            if (src) {
              if (src.startsWith('//')) src = 'https:' + src;
              imgUrl = src.split('.jpg_')[0] + '.jpg';
            }
            if (!value && variantImg.alt) {
              value = variantImg.alt;
            }
          }

          if (value) {
            options.push({
              value: value,
              image: imgUrl || null,
              available: !opt.classList.contains('disabled')
            });
          }
        });

        if (options.length > 0) {
          parsedVariants.push({
            name: groupTitle,
            options: options
          });
        }
      });
    }

    // Fallback static variant generators if none found on screen
    if (parsedVariants.length === 0) {
      // Look for dropdown elements or standard sizes
      const sizes = [];
      document.querySelectorAll('.size-item, [class*="size-btn"], .size-info').forEach(el => {
        const text = el.textContent.trim();
        if (text) sizes.push({ value: text, available: true });
      });
      if (sizes.length > 0) {
        parsedVariants.push({ name: "Taille / Size", options: sizes });
      }

      const colors = [];
      document.querySelectorAll('.color-item, [class*="color-btn"], .color-info').forEach(el => {
        const text = el.textContent.trim();
        if (text) colors.push({ value: text, available: true });
      });
      if (colors.length > 0) {
        parsedVariants.push({ name: "Couleur / Color", options: colors });
      }
    }

    result.variants = parsedVariants;

  } catch (error) {
    console.error("[Nexus Link Scraper] Encountered error during page parsing:", error);
  }

  return result;
}

// Listen for messages from inside Chrome Extension Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_PRODUCT") {
    const data = scrapeProductData();
    sendResponse(data);
  }
  return true;
});
