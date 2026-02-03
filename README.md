# KARS Vehicle Scraper

**Chrome Extension para extraer datos de vehículos de mobile.de para KARS**

## Descripció / Descripción

Aquesta extensió de Chrome extreu automàticament dades de vehicles de mobile.de i les descarrega en format TXT juntament amb totes les fotos del vehicle.

Esta extensión de Chrome extrae automáticamente datos de vehículos de mobile.de y los descarga en formato TXT junto con todas las fotos del vehículo.

## Característiques / Características

- ✅ Extracció automàtica de totes les dades del vehicle
- ✅ Descàrrega de fotos en alta resolució
- ✅ Detecció d'IVA deduïble
- ✅ Detecció de vehicle sense accidents
- ✅ Identificació del tipus de venedor (empresa/particular)
- ✅ Filtre d'equipament opcional (prioritza S-Line, AMG, Sport, etc.)
- ✅ Format compatible amb KARS

## Instal·lació / Instalación

### Pas 1: Descarregar l'extensió

1. Ves a la pàgina principal del repositori: [kars-vehicle-scraper](https://github.com/karsimport/kars-vehicle-scraper)
2. Fes clic al botó verd **Code** (dalt a la dreta)
3. Selecciona **Download ZIP**
4. Descomprimeix el fitxer ZIP a una carpeta del teu ordinador (per exemple: `C:\Extensions\kars-vehicle-scraper`)

### Pas 2: Instal·lar a Chrome

1. Obre Google Chrome
2. Escriu a la barra d'adreces: `chrome://extensions`
3. Activa el **Mode de desenvolupador** (Developer mode) a dalt a la dreta
4. Fes clic a **Cargar extensión sin empaquetar** (Load unpacked)
5. Selecciona la carpeta on has descomprimit l'extensió
6. L'extensió apareixerà a la llista amb el nom **KARS Scraper**

### Pas 3: Utilitzar l'extensió

1. Navega a mobile.de i obre la pàgina de detall d'un vehicle
2. Fes clic a la icona de l'extensió KARS Scraper (a la barra d'eines)
3. Fes clic al botó **Extreure Vehicle**
4. Espera uns segons mentre s'extreuen les dades
5. Fes clic a **Descarregar .TXT + Fotos**
6. Les fotos i el fitxer de dades es descarregaran a la carpeta `Descàrregues/MARCA_MODEL_ID/`

## Camps extrets / Campos extraídos

- URL del vehicle
- Marca (cliBrand)
- Model
- Versió
- Preu
- Any i mes de matriculació
- Quilometratge
- Potència (kW i CV)
- Combustible
- Transmissió
- Color
- Propietaris anteriors
- **Alertes KARS:**
  - IVA deduïble (vatDeductible)
  - Sense accidents (accidentFree)
  - Tipus de venedor (sellerType)
- Equipament opcional (cliOptions) - màxim 46 línies, prioritzat
- Nom i ubicació del venedor
- Imatges (URLs i fitxers descarregats)

## Compatibilitat

- ✅ Google Chrome (versió 88+)
- ✅ Microsoft Edge (Chromium)
- ✅ Brave Browser
- ⚠️ Només funciona a mobile.de (de moment)

## Solució de problemes

**L'extensió no apareix després d'instal·lar-la:**
- Assegura't que has seleccionat la carpeta correcta (ha de contenir `manifest.json`)
- Comprova que el mode de desenvolupador està activat

**No s'extreuen les dades:**
- Assegura't que estàs a una pàgina de detall de mobile.de (no a la llista de resultats)
- Refresca la pàgina i torna a intentar-ho

**Les fotos no es descarreguen:**
- Comprova que Chrome té permís per descarregar múltiples fitxers
- Pot ser que algunes imatges estiguin bloquejades per CORS

## Futur / Roadmap

- [ ] Suport per a autoscout24.de
- [ ] Integració directa amb KARS V11 (auto-omplir formularis)
- [ ] Traducció automàtica d'equipament a català/espanyol
- [ ] Exportació a format CSV/Excel

## Autors

Desenvolupat per KARS Import Team

## Llicència / Licencia

Ús intern de KARS Import
