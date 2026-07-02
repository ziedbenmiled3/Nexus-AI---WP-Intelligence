// Nexus Chrome Extension Popup Logic
document.addEventListener("DOMContentLoaded", async () => {
  const activeState = document.getElementById("activeState");
  const fallbackState = document.getElementById("fallbackState");
  const productTitleEl = document.getElementById("productTitle");
  const productPriceEl = document.getElementById("productPrice");
  const productThumbEl = document.getElementById("productThumb");
  const sellerNameEl = document.getElementById("sellerName");
  const variantSection = document.getElementById("variantsSection");
  const variantTagsEl = document.getElementById("variantTags");
  const importBtn = document.getElementById("importBtn");
  const statusBadge = document.getElementById("statusBadge");

  let productData = null;

  // Retrieve active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    showFallback();
    return;
  }

  const isAliExpress = tab.url.includes("aliexpress.com") || 
                        tab.url.includes("aliexpress.fr") || 
                        tab.url.includes("aliexpress.es") || 
                        tab.url.includes("aliexpress.ru") || 
                        tab.url.includes("aliexpress.us") ||
                        tab.url.includes("aliexpress.it");

  if (!isAliExpress) {
    showFallback();
    return;
  }

  // Active state
  activeState.style.display = "block";
  fallbackState.style.display = "none";

  // Request scraping from content script
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" });
    if (response) {
      productData = response;
      if (response.type === "BULK") {
        renderBulkInfo(response);
      } else {
        renderProductInfo(response);
      }
    } else {
      productTitleEl.textContent = "Impossible d'extraire les données.";
      importBtn.disabled = true;
    }
  } catch (err) {
    console.error("[Nexus Ext] Error communicating with content script, attempting retry:", err);
    // Direct scraping fallback if content script is starting or needs a script execution
    try {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }, async () => {
        const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" });
        if (retryResponse) {
          productData = retryResponse;
          if (retryResponse.type === "BULK") {
            renderBulkInfo(retryResponse);
          } else {
            renderProductInfo(retryResponse);
          }
        } else {
          productTitleEl.textContent = "Pont de script inactif. Rechargez la page AliExpress.";
          importBtn.disabled = true;
        }
      });
    } catch (scriptErr) {
      productTitleEl.textContent = "Veuillez recharger la page AliExpress pour activer l'extension.";
      importBtn.disabled = true;
    }
  }

  function showFallback() {
    activeState.style.display = "none";
    fallbackState.style.display = "flex";
    statusBadge.innerHTML = `<span style="color:#f43f5e">Inactif</span>`;
    statusBadge.style.borderColor = "rgba(244, 63, 94, 0.2)";
    statusBadge.style.background = "rgba(244, 63, 94, 0.1)";
  }

  function renderProductInfo(data) {
    productTitleEl.textContent = data.title || "Fiche AliExpress";
    productPriceEl.textContent = data.price ? `${data.price} €` : "Prix non lu";
    
    if (data.images && data.images.length > 0) {
      productThumbEl.src = data.images[0];
    }
    
    if (data.sellerName) {
      sellerNameEl.textContent = data.sellerName;
    }

    // Render variant tags if available
    if (data.variants && data.variants.length > 0) {
      variantSection.style.display = "block";
      variantTagsEl.innerHTML = "";
      
      data.variants.forEach(v => {
        const optionCount = v.options ? v.options.length : 0;
        const tag = document.createElement("span");
        tag.className = "variant-tag";
        tag.textContent = `${v.name} (${optionCount})`;
        variantTagsEl.appendChild(tag);
      });
    }
  }

  function updateBulkBtnTextAndStatus() {
    const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
    const count = checkedBoxes.length;
    
    if (count === 0) {
      importBtn.innerHTML = `<span>⚠️ Aucun article sélectionné</span>`;
      importBtn.disabled = true;
      importBtn.style.opacity = "0.5";
      importBtn.style.cursor = "not-allowed";
    } else {
      importBtn.innerHTML = `<span>📝 Transmettre ${count} article${count > 1 ? 's' : ''} à Nexus AI</span>`;
      importBtn.disabled = false;
      importBtn.style.opacity = "1";
      importBtn.style.cursor = "pointer";
    }
  }

  function renderBulkInfo(data) {
    // Hide single-product specific rows
    document.querySelector(".product-meta").style.display = "none";
    if (variantSection) variantSection.style.display = "none";

    // Create a beautiful bulk-specific section inside the product-card
    let bulkSection = document.getElementById("bulkSection");
    if (!bulkSection) {
      bulkSection = document.createElement("div");
      bulkSection.id = "bulkSection";
      bulkSection.style.padding = "4px 0";
      bulkSection.style.textAlign = "center";
      document.querySelector(".product-card").appendChild(bulkSection);
    }
    
    bulkSection.style.display = "block";
    
    const productsList = data.products || data.urls.map(url => ({ url: url, img: null, title: null, price: null }));
    
    // Create clean listing of elements with images and checkboxes
    const urlRowsHtml = productsList.map((p, idx) => {
      const match = p.url.match(/\/item\/(\d+)\.html/);
      const itemId = match ? match[1] : `ID : ${idx + 1}`;
      
      const displayTitle = (p.title && p.title.trim()) ? p.title.replace(/"/g, '&quot;') : `Article #${itemId}`;
      const priceBadge = (p.price && p.price.trim()) ? `<span style="color: #10b981; font-weight: 800; margin-left: 5px;">(${p.price.trim()})</span>` : '';
      
      return `
        <label style="display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 10px; background: #070a13; border: 1px solid #1e293b; transition: all 0.2s; cursor: pointer; margin-bottom: 6px; text-align: left; box-sizing: border-box; width: 100%;">
          <input type="checkbox" class="product-checkbox" data-url="${p.url}" data-img="${p.img || ''}" data-title="${p.title || ''}" data-price="${p.price || ''}" checked style="accent-color: #3b82f6; width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; margin: 0;">
          <img src="${p.img || 'icons/icon128.png'}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1px solid #334155; background: #0c0f1d; flex-shrink: 0;" onerror="this.src='icons/icon128.png'">
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 10px; font-weight: 800; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayTitle} ${priceBadge}</div>
            <div style="font-size: 7.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; opacity: 0.8;">${p.url.split('?')[0]}</div>
          </div>
        </label>
      `;
    }).join('');

    bulkSection.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 6px;">📝</div>
      <h3 style="font-size: 10.5px; font-weight: 800; color: #f1f5f9; text-transform: uppercase; margin: 0 0 2px 0; letter-spacing: 0.05em;">ANALYSE DU CATALOGUE ACTIF</h3>
      <p style="font-size: 10px; color: #6366f1; font-weight: 900; margin: 0 0 10px 0; letter-spacing: 0.02em;">${productsList.length} ARTICLES TROUVÉS SUR LA PAGE</p>
      
      <!-- Selection Utility Toolbar -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding: 0 2px;">
        <span style="font-size: 8px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Sélection des Produits</span>
        <button id="toggleAllBtn" type="button" style="background: none; border: none; color: #38bdf8; font-size: 8px; font-weight: 800; cursor: pointer; padding: 0; text-transform: uppercase; letter-spacing: 0.05em; outline: none;">Tout désélectionner</button>
      </div>

      <div id="bulkUrlsContainer" style="font-size: 8px; line-height: 1.5; text-align: left; background: #04060a; padding: 8px; border-radius: 12px; max-height: 180px; overflow-y: auto; border: 1px solid #1e293b; box-sizing: border-box;">
        ${urlRowsHtml}
      </div>
    `;

    // Listen to selection checkboxes changing
    const checkboxes = bulkSection.querySelectorAll(".product-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        updateBulkBtnTextAndStatus();
        
        // Update toggle all button text based on state
        const checkedCount = bulkSection.querySelectorAll(".product-checkbox:checked").length;
        const toggleAllBtn = document.getElementById("toggleAllBtn");
        if (toggleAllBtn) {
          if (checkedCount === 0) {
            toggleAllBtn.textContent = "Tout sélectionner";
          } else {
            toggleAllBtn.textContent = "Tout désélectionner";
          }
        }
      });
    });

    // Handle Toggle All Button
    const toggleAllBtn = document.getElementById("toggleAllBtn");
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const checkedCount = bulkSection.querySelectorAll(".product-checkbox:checked").length;
        const setChecked = checkedCount === 0; // Check all if none are checked

        checkboxes.forEach(cb => {
          cb.checked = setChecked;
        });

        toggleAllBtn.textContent = setChecked ? "Tout désélectionner" : "Tout sélectionner";
        updateBulkBtnTextAndStatus();
      });
    }

    // Set initial button text and enabled status
    updateBulkBtnTextAndStatus();
  }

  // Trigger import
  importBtn.addEventListener("click", async () => {
    if (!productData) return;

    importBtn.innerHTML = "⚡ Alignement Nexus...";
    importBtn.disabled = true;

    // Scan for existing app tabs
    const allTabs = await chrome.tabs.query({});
    let targetTab = null;

    // Search for Nexus app in any active browser tabs (matches all GCP regional run.app subdomains, local host, and titles)
    for (const t of allTabs) {
      if (t.url && (t.url.includes("run.app") || t.url.includes("nexuswp") || t.url.includes("nexus-wp") || t.title.includes("Nexus WP AI") || t.url.includes("localhost:3000"))) {
        targetTab = t;
        break;
      }
    }

    let payload;
    if (productData.type === "BULK") {
      const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
      const urlsToSubmit = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-url"));
      const itemsToSubmit = Array.from(checkedBoxes).map(cb => ({
        url: cb.getAttribute("data-url"),
        img: cb.getAttribute("data-img") || "",
        title: cb.getAttribute("data-title") || "",
        price: cb.getAttribute("data-price") || ""
      }));
      
      if (urlsToSubmit.length === 0) {
        alert("Veuillez sélectionner au moins un article !");
        importBtn.innerHTML = "Aucun lien sélectionné";
        importBtn.disabled = false;
        return;
      }

      payload = {
        from: "NEXUS_EXTENSION",
        type: "IMPORT_BULK_PRODUCTS",
        urls: urlsToSubmit,
        items: itemsToSubmit
      };
    } else {
      payload = {
        from: "NEXUS_EXTENSION",
        type: "IMPORT_PRODUCT",
        url: productData.url,
        price: productData.price,
        title: productData.title,
        images: productData.images,
        short_description: `Fiche de produit capturée en direct via l'extension Nexus Link depuis la boutique ${productData.sellerName}.`,
        description: `<h3>Produit Haut de Gamme Unifié</h3><p>Importé en direct depuis AliExpress via le canal sécurisé Nexus. Fournisseur officiel certifié : ${productData.sellerName}.</p><p>Une fiche produit complète, optimisée pour le SEO WooCommerce, rédigée par l'intelligence artificielle Nexus.</p>`,
        seller_name: productData.sellerName,
        seller_url: productData.sellerUrl || productData.url,
        variants: productData.variants
      };
    }

    if (targetTab) {
      // Direct postMessage channel using chrome tab scripting to guarantee execution
      chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: (data) => {
          window.postMessage(data, "*");
        },
        args: [payload]
      }, () => {
        // Switch tab active
        chrome.tabs.update(targetTab.id, { active: true });
        // Close self popup
        window.close();
      });
    } else {
      // Fallback: Open new tab mapping query parameters
      let baseUrl = window.location.origin.includes("localhost") ? "http://localhost:3000/" : "https://nexuswp.pro/";
      
      // Dynamically auto-detect active environment host (e.g. any run.app regional domain, nexuswp, nexus-wp, etc.) to map session states perfectly
      const existingAppTab = allTabs.find(t => t.url && (t.url.includes("run.app") || t.url.includes("nexuswp") || t.url.includes("nexus-wp") || t.url.includes("localhost:3000")));
      if (existingAppTab) {
        try {
          baseUrl = new URL(existingAppTab.url).origin + "/";
        } catch (e) {
          console.error("[Popup Fallback] Failed to extract origin from tab url:", e);
        }
      } else if (window.location.origin.includes("localhost")) {
        baseUrl = "http://localhost:3000/";
      }

      const queryParams = new URLSearchParams();
      if (productData.type === "BULK") {
        const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
        const urlsToSubmit = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-url"));
        const imgsToSubmit = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-img") || "");
        const titlesToSubmit = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-title") || "");
        const pricesToSubmit = Array.from(checkedBoxes).map(cb => cb.getAttribute("data-price") || "");
        queryParams.append("bulk_urls", urlsToSubmit.join(","));
        queryParams.append("bulk_images", imgsToSubmit.join(","));
        queryParams.append("bulk_titles", titlesToSubmit.join("||"));
        queryParams.append("bulk_prices", pricesToSubmit.join("||"));
      } else {
        queryParams.append("import_url", productData.url);
        queryParams.append("import_price", productData.price || "");
        queryParams.append("import_title", productData.title || "");
        if (productData.images && productData.images.length > 0) {
          queryParams.append("import_images", JSON.stringify(productData.images));
        }
        if (productData.variants) {
          queryParams.append("variants", JSON.stringify(productData.variants));
        }
        if (productData.sellerName) {
          queryParams.append("seller_name", productData.sellerName);
        }
      }
      
      const targetUrl = `${baseUrl}?${queryParams.toString()}`;
      chrome.tabs.create({ url: targetUrl });
      window.close();
    }
  });
});
