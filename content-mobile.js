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

  // Títol i subtítol
  const titleEls = document.querySelectorAll('h1, .MuiTypography-h1');
  let titleEl = null;
  for (let el of titleEls) {
    if (el.textContent.includes('Porsche') || el.textContent.includes('BMW') || el.textContent.includes('Audi') || el.textContent.includes('Mercedes') || el.textContent.includes('Volkswagen')) {
      titleEl = el;
      break;
    }
  }
  
  const fullTitle = titleEl ? titleEl.textContent.trim() : '';
  const brand = fullTitle ? fullTitle.split(' ')[0] : 'Unknown';
  
  // Cerca el subtítol (versió)
  const allHeadings = document.querySelectorAll('h1, h2, h3, .MuiTypography-h1, .MuiTypography-h2');
  let version = '';
  for (let i = 0; i < allHeadings.length; i++) {
    if (allHeadings[i] === titleEl && allHeadings[i + 1]) {
      version = allHeadings[i + 1].textContent.trim();
      break;
    }
  }
  
  if (!version) {
    const versionCandidates = document.querySelectorAll('.sc-font-bold, [class*="subtitle"]');
    for (let el of versionCandidates) {
      const text = el.textContent.trim();
      if (text.length > 10 && text.length < 200 && !text.includes('€')) {
        version = text;
        break;
      }
    }
  }

  // Preu
  let price = 0;
  let currency = 'EUR';
  const priceElements = document.querySelectorAll('[class*="price"], h2, h3, .MuiTypography-h2, .MuiTypography-h3');
  for (let el of priceElements) {
    const text = el.textContent;
    if (text.includes('€')) {
      const priceMatch = text.match(/([\d.]+)\s*€/);
      if (priceMatch) {
        price = parseInt(priceMatch[1].replace(/\./g, ''));
        break;
      }
    }
  }

  // Extreu dades tècniques del text
  const bodyText = document.body.innerText;
  
  // Kilometratge
  let mileage = 0;
  const mileageMatch = bodyText.match(/(\d{1,3}(?:\.\d{3})*)\s*km/i);
  if (mileageMatch) {
    mileage = parseInt(mileageMatch[1].replace(/\./g, ''));
  }

  // Potència
  let power = 0;
  let powerHP = 0;
  const powerMatch = bodyText.match(/(\d+)\s*kW\s*\((\d+)\s*cv\)/i);
  if (powerMatch) {
    power = parseInt(powerMatch[1]);
    powerHP = parseInt(powerMatch[2]);
  }

  // Any i registre
  let year = '';
  const regMatch = bodyText.match(/(\d{2})\/(\d{4})/);
  if (regMatch) {
    year = `${regMatch[2]}-${regMatch[1]}`;
  }

  // Combustible
  let fuel = '';
  if (bodyText.includes('Gasolina')) fuel = 'Gasolina';
  else if (bodyText.includes('Diésel') || bodyText.includes('Diesel')) fuel = 'Diésel';
  else if (bodyText.includes('Eléctrico')) fuel = 'Eléctrico';
  else if (bodyText.includes('Híbrido')) fuel = 'Híbrido';

  // Transmissió
  let transmission = '';
  if (bodyText.includes('Cambio automático') || bodyText.includes('Automático')) {
    transmission = 'Automático';
  } else if (bodyText.includes('Manual')) {
    transmission = 'Manual';
  }

  // Color
  let color = '';
  const colorMatch = bodyText.match(/Color[:\s]+([^\n]+)/i);
  if (colorMatch) {
    color = colorMatch[1].trim();
  }

  // Propietaris anteriors
  let previousOwners = '0';
  const ownersMatch = bodyText.match(/Propietarios anteriores[:\s]+(\d+)/i) || 
                       bodyText.match(/(\d+)\s*propietario/i);
  if (ownersMatch) {
    previousOwners = ownersMatch[1];
  }

  // IVA deduïble
  const vatDeductible = bodyText.includes('IVA deducible') || 
                        bodyText.includes('MwSt. ausweisbar');

  // Sense accidents
  const accidentFree = bodyText.includes('Sin accidente') || 
                       bodyText.includes('Unfallfrei') || 
                       bodyText.includes('Sin accidentes');

  // Venedor
  let sellerName = '';
  let sellerType = 'empresa';
  let sellerLocation = '';
  
  const sellerPatterns = [
    /([A-Z][a-zA-Z\s]+(?:GmbH|AG|KG|S\.L\.|S\.A\.|Ltd))/,
    /DE-\d{5}\s+([^\n]+)/
  ];
  
  for (let pattern of sellerPatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      sellerName = match[1].trim();
      break;
    }
  }

  if (!sellerName.match(/GmbH|AG|KG|S\.L\.|S\.A\.|Ltd/i)) {
    sellerType = 'particular';
  }

  const locationMatch = bodyText.match(/DE-(\d{5})\s+([^\n]+)/);
  if (locationMatch) {
    sellerLocation = `DE-${locationMatch[1]} ${locationMatch[2].trim()}`;
  }

  // Equipament
  const equipment = [];
  const equipmentSection = bodyText.match(/Características([\s\S]+?)(?:Descripción|Acerca|$)/);
  
  if (equipmentSection) {
    const lines = equipmentSection[1].split('\n');
    const standardFeatures = ['ABS', 'ESP', 'Airbag', 'ISOFIX', 'Freno', 'Inmovilizador', 
                             'Control de tracción', 'Dirección asistida', 'Cierre centralizado'];
    
    for (let line of lines) {
      const feature = line.trim();
      if (feature.length > 2 && feature.length < 100) {
        const isStandard = standardFeatures.some(std => feature.includes(std));
        if (!isStandard && !equipment.includes(feature)) {
          equipment.push(feature);
        }
      }
    }
  }

  const priorityKeywords = ['Sport', 'AMG', 'S-Line', 'Chrono', 'PDLS', 'BOSE', 'Burmester', 
                            '21"', '20"', '22"', 'Carbono', 'Cuero', 'Piel', 'Xenon', 'LED', 'Matrix',
                            'Panorámico', 'Navegación', 'Cámara', '360'];
  
  equipment.sort((a, b) => {
    const aPriority = priorityKeywords.some(kw => a.includes(kw));
    const bPriority = priorityKeywords.some(kw => b.includes(kw));
    if (aPriority && !bPriority) return -1;
    if (!aPriority && bPriority) return 1;
    return 0;
  });

  const finalEquipment = equipment.slice(0, 46);

  // Imatges
  const images = [];
  const seenUrls = new Set();
  
  const imgElements = document.querySelectorAll('img[src*="ebayimg"], img[src*="autoscout24"], img[src*="mobile.de"], img[alt]');
  
  imgElements.forEach(img => {
    let src = img.src;
    
    src = src.replace(/\/s-l\d+/, '/s-l1600');
    src = src.replace(/\/(\d+)x(\d+)/, '/1600x1200');
    
    if (!seenUrls.has(src) && 
        !src.includes('placeholder') && 
        !src.includes('logo') &&
        !src.includes('icon') &&
        src.length > 20) {
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
