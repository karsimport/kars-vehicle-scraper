chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    try {
      const data = extractVehicleData();
      sendResponse({ data: data });
    } catch (error) {
      console.error('Error extracting data:', error);
      sendResponse({ error: error.message });
    }
  }
  return true;
});

function extractVehicleData() {
  const url = window.location.href;
  const vehicleId = new URLSearchParams(window.location.search).get('id') || 'unknown';
  
  const titleEl = document.querySelector('h1.sc-ellipsis');
  const subtitleEl = document.querySelector('.sc-ellipsis.sc-font-bold');
  const priceEl = document.querySelector('[data-testid="prime-price"]');
  
  const brand = titleEl ? titleEl.textContent.trim().split(' ')[0] : 'Unknown';
  const fullTitle = titleEl ? titleEl.textContent.trim() : '';
  const version = subtitleEl ? subtitleEl.textContent.trim() : '';
  
  const priceText = priceEl ? priceEl.textContent.trim() : '0';
  const priceMatch = priceText.match(/([\d.]+)/); 
  const price = priceMatch ? parseInt(priceMatch[1].replace(/\./g, '')) : 0;
  const currency = priceText.includes('€') ? 'EUR' : 'EUR';
  
  const dataItems = {};
  document.querySelectorAll('[data-testid]').forEach(el => {
    const testId = el.getAttribute('data-testid');
    if (testId && testId.endsWith('-v')) {
      const key = testId.replace('-v', '');
      dataItems[key] = el.textContent.trim();
    }
  });
  
  const mileageText = dataItems['mileage'] || '0 km';
  const mileage = parseInt(mileageText.replace(/[^\d]/g, '')) || 0;
  
  const powerText = dataItems['power'] || '0 kW (0 CV)';
  const powerMatch = powerText.match(/(\d+)\s*kW.*?(\d+)\s*CV/);
  const power = powerMatch ? parseInt(powerMatch[1]) : 0;
  const powerHP = powerMatch ? parseInt(powerMatch[2]) : 0;
  
  const firstRegText = dataItems['first-registration'] || '';
  const regMatch = firstRegText.match(/(\d{2})\/(\d{4})/);
  const year = regMatch ? `${regMatch[2]}-${regMatch[1]}` : '';
  
  const fuel = dataItems['fuel'] || '';
  const transmission = dataItems['transmission'] || '';
  const color = dataItems['color'] || '';
  const previousOwners = dataItems['previous-owner'] || '0';
  
  const bodyText = document.body.innerText;
  const vatDeductible = bodyText.includes('IVA deducible') || bodyText.includes('MwSt. ausweisbar');
  const accidentFree = bodyText.includes('Sin accidente') || bodyText.includes('Unfallfrei') || bodyText.includes('Keine Vorschäden');
  
  const sellerEl = document.querySelector('.sc-ellipsis.sc-font-bold.MuiTypography-root');
  let sellerName = sellerEl ? sellerEl.textContent.trim() : '';
  let sellerType = 'empresa';
  if (!sellerName.match(/GmbH|AG|KG|S\.L\.|S\.A\.|Ltd/i)) {
    sellerType = 'particular';
  }
  
  const locationEl = document.querySelector('[data-testid="seller-address"]');
  const sellerLocation = locationEl ? locationEl.textContent.trim() : '';
  
  const equipment = [];
  const featureEls = document.querySelectorAll('[data-testid^="feature-"]');
  const standardFeatures = ['ABS', 'ESP', 'Airbag', 'ISOFIX', 'Freno', 'Inmovilizador', 'Control de tracción'];
  
  featureEls.forEach(el => {
    const feature = el.textContent.trim();
    const isStandard = standardFeatures.some(std => feature.includes(std));
    if (!isStandard && feature.length > 0) {
      equipment.push(feature);
    }
  });
  
  const equipmentLimit = 46;
  const priorityKeywords = ['Sport', 'AMG', 'S-Line', 'Chrono', 'PDLS', 'BOSE', 'Burmester', '21"', '20"', 'Carbono', 'Cuero', 'Xenon', 'LED', 'Matrix'];
  
  equipment.sort((a, b) => {
    const aPriority = priorityKeywords.some(kw => a.includes(kw));
    const bPriority = priorityKeywords.some(kw => b.includes(kw));
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return 0;
  });
  
  const finalEquipment = equipment.slice(0, equipmentLimit);
  
  const images = [];
  const imgElements = document.querySelectorAll('img[src*="ebayimg.com"], img[src*="autoscout24.net"]');
  const seenUrls = new Set();
  
  imgElements.forEach(img => {
    let src = img.src;
    src = src.replace(/\/s-l\d+/, '/s-l1600');
    src = src.replace(/\/(\d+)x(\d+)/, '/1600x1200');
    
    if (!seenUrls.has(src) && !src.includes('placeholder')) {
      seenUrls.add(src);
      images.push(src);
    }
  });
  
  const model = fullTitle.replace(brand, '').trim().split(' ')[0] || '';
  
  return {
    url: url,
    portal: 'mobile.de',
    vehicleId: vehicleId,
    brand: brand,
    model: model,
    version: version,
    price: price,
    currency: currency,
    year: year,
    mileage: mileage,
    power: power,
    powerHP: powerHP,
    fuel: fuel,
    transmission: transmission,
    color: color,
    previousOwners: previousOwners,
    vatDeductible: vatDeductible,
    accidentFree: accidentFree,
    sellerType: sellerType,
    sellerName: sellerName,
    sellerLocation: sellerLocation,
    equipment: finalEquipment,
    images: images
  };
}
