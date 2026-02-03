let vehicleData = null;

document.getElementById('extractBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const extractBtn = document.getElementById('extractBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  status.textContent = 'Extractant dades...';
  extractBtn.disabled = true;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('mobile.de')) {
    status.textContent = 'Error: Aquesta pàgina no és de mobile.de';
    extractBtn.disabled = false;
    return;
  }
  
  chrome.tabs.sendMessage(tab.id, { action: 'extract' }, (response) => {
    if (chrome.runtime.lastError) {
      status.textContent = 'Error: ' + chrome.runtime.lastError.message;
      extractBtn.disabled = false;
      return;
    }
    
    if (response && response.data) {
      vehicleData = response.data;
      displayPreview(vehicleData);
      status.textContent = 'Extracció completada!';
      downloadBtn.disabled = false;
    } else {
      status.textContent = 'Error: No s\'han pogut extreure les dades';
      extractBtn.disabled = false;
    }
  });
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  if (!vehicleData) return;
  
  const status = document.getElementById('status');
  const progress = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  
  status.textContent = 'Generant fitxers...';
  progress.style.display = 'block';
  
  const txtContent = generateTXT(vehicleData);
  const vehicleName = `${vehicleData.brand}_${vehicleData.model}_${vehicleData.vehicleId}`.replace(/[^a-zA-Z0-9_]/g, '_');
  
  const txtBlob = new Blob([txtContent], { type: 'text/plain' });
  const txtUrl = URL.createObjectURL(txtBlob);
  
  await chrome.downloads.download({
    url: txtUrl,
    filename: `${vehicleName}/vehicle_data.txt`,
    saveAs: false
  });
  
  const totalImages = vehicleData.images.length;
  for (let i = 0; i < totalImages; i++) {
    const imgUrl = vehicleData.images[i];
    const photoNumber = String(i + 1).padStart(2, '0');
    
    try {
      await chrome.downloads.download({
        url: imgUrl,
        filename: `${vehicleName}/foto_${photoNumber}.jpg`,
        saveAs: false
      });
      
      progressFill.style.width = `${((i + 1) / totalImages) * 100}%`;
      status.textContent = `Descarregant foto ${i + 1} de ${totalImages}...`;
    } catch (error) {
      console.error('Error descarregant imatge:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  progress.style.display = 'none';
  status.textContent = `✓ Descarregat: ${totalImages} fotos + dades`;
});

function displayPreview(data) {
  const preview = document.getElementById('preview');
  preview.style.display = 'block';
  preview.innerHTML = `
    <strong>${data.brand} ${data.model}</strong><br>
    Any: ${data.year} | KM: ${data.mileage.toLocaleString()}<br>
    Preu: ${data.price.toLocaleString()} ${data.currency}<br>
    Fotos: ${data.images.length} | Equipament: ${data.equipment.length} opcions
  `;
}

function generateTXT(data) {
  let txt = '=== KARS VEHICLE DATA ===\n\n';
  txt += `URL: ${data.url}\n`;
  txt += `Portal: ${data.portal}\n`;
  txt += `ID Vehicle: ${data.vehicleId}\n\n`;
  txt += `Marca (cliBrand): ${data.brand}\n`;
  txt += `Model: ${data.model}\n`;
  txt += `Versió: ${data.version}\n\n`;
  txt += `Preu: ${data.price} ${data.currency}\n`;
  txt += `Any/Mes Matriculació: ${data.year}\n`;
  txt += `Quilometratge: ${data.mileage} km\n`;
  txt += `Potència: ${data.power} kW (${data.powerHP} CV)\n`;
  txt += `Combustible: ${data.fuel}\n`;
  txt += `Transmissió: ${data.transmission}\n`;
  txt += `Color: ${data.color}\n`;
  txt += `Propietaris anteriors: ${data.previousOwners}\n\n`;
  
  txt += `ALERTES:\n`;
  txt += `IVA Deducible (vatDeductible): ${data.vatDeductible ? 'SÍ' : 'NO'}\n`;
  txt += `Sense accidents (accidentFree): ${data.accidentFree ? 'SÍ' : 'NO'}\n`;
  txt += `Tipus venedor (sellerType): ${data.sellerType}\n\n`;
  
  txt += `EQUIPAMENT (cliOptions):\n`;
  data.equipment.forEach((item, index) => {
    txt += `${index + 1}. ${item}\n`;
  });
  txt += `\n`;
  
  txt += `VENEDOR:\n`;
  txt += `Nom: ${data.sellerName}\n`;
  txt += `Localització: ${data.sellerLocation}\n\n`;
  
  txt += `IMATGES (${data.images.length} fotos):\n`;
  data.images.forEach((url, index) => {
    txt += `${index + 1}. ${url}\n`;
  });
  
  return txt;
}
