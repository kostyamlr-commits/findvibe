import crypto from 'crypto'

const APP_KEY = process.env.ALIEXPRESS_APP_KEY || '515336'
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET || 'KZgmteUFRQXrhcRXwdEqcIwGLDfkSoT3'
const TRACKING_ID = 'default'
const API_URL = 'https://api-sg.aliexpress.com/sync'

function getTimestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const sh = new Date(utc + 8 * 3600000)
  const p = n => String(n).padStart(2,'0')
  return `${sh.getFullYear()}-${p(sh.getMonth()+1)}-${p(sh.getDate())} ${p(sh.getHours())}:${p(sh.getMinutes())}:${p(sh.getSeconds())}`
}

function sign(params) {
  const s = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHash('md5').update(APP_SECRET+s+APP_SECRET).digest('hex').toUpperCase()
}

// Ordered array (not object) so numeric index is meaningful for batched
// fetching from day one - e.g. /api/fetch-products?start=0&end=5
export const CATEGORY_LIST = [
  { id: 'lighting',       keywords: ['sunset projector lamp aesthetic','nordic pendant light minimalist'] },
  { id: 'wall-decor',     keywords: ['minimalist metal wall art','3d wall panel aesthetic'] },
  { id: 'textiles',       keywords: ['boho cushion cover aesthetic','nordic area rug minimalist'] },
  { id: 'table-dining',   keywords: ['ceramic aesthetic mug minimalist','minimalist dinnerware set','ceramic dinner plate set'] },
  { id: 'organization',   keywords: ['acrylic makeup organizer aesthetic','modular storage cube minimalist','desk organizer box'] },
  { id: 'bedroom',        keywords: ['silk pillowcase aesthetic','aesthetic bedside lamp minimalist','bedside table lamp'] },
  { id: 'bathroom',       keywords: ['ceramic bath set minimalist','aesthetic shower curtain nordic','bathroom accessories set'] },
  { id: 'mirrors',        keywords: ['irregular shape mirror aesthetic','vanity led mirror minimalist'] },
  { id: 'plants-nature',  keywords: ['artificial plant decor aesthetic','ceramic flower vase minimalist'] },
  { id: 'aroma',          keywords: ['ultrasonic aroma diffuser aesthetic','scented candle minimalist'] },
  { id: 'furniture',      keywords: ['velvet ottoman aesthetic','minimalist side table nordic'] },
  { id: 'clocks',         keywords: ['minimalist wall clock aesthetic','magnetic levitation clock'] },
  { id: 'entryway',       keywords: ['aesthetic key holder minimalist','shoe storage bench nordic'] },
  { id: 'home-office',    keywords: ['desk mat aesthetic minimalist','ergonomic monitor stand aesthetic'] },
  { id: 'spa',            keywords: ['soft bathrobe aesthetic','bath pillow minimalist','spa gift set relaxation'] },
  { id: 'kids-decor',     keywords: ['nordic nursery decor aesthetic','cute night light minimalist','kids room decor'] },
  { id: 'atmosphere',     keywords: ['led neon sign room aesthetic','string lights minimalist'] },
  { id: 'modern-kitchen', keywords: ['nordic tea set aesthetic','magnetic knife holder minimalist','kitchen storage organizer'] },
  { id: 'smart-storage',  keywords: ['vacuum storage bag aesthetic','under bed storage minimalist','closet organizer storage'] },
  { id: 'luxury-accents', keywords: ['gold finish decor aesthetic','marble style coaster minimalist','gold home decor accent'] },
]

export const CATEGORIES = Object.fromEntries(CATEGORY_LIST.map(c => [c.id, c.keywords]))

export const CAT_LABELS = {
  'lighting':'Lighting','wall-decor':'Wall Decor','textiles':'Textiles','table-dining':'Table & Dining',
  'organization':'Organization','bedroom':'Bedroom','bathroom':'Bathroom','mirrors':'Mirrors',
  'plants-nature':'Plants & Nature','aroma':'Aroma & Atmosphere','furniture':'Furniture','clocks':'Clocks',
  'entryway':'Entryway','home-office':'Home Office','spa':'Spa','kids-decor':'Kids Decor',
  'atmosphere':'Atmosphere','modern-kitchen':'Modern Kitchen','smart-storage':'Smart Storage',
  'luxury-accents':'Luxury Accents',
}

// Exclude words per Kostya spec - these kill the "aesthetic" feel
const EXCLUDE_WORDS = ['cheap','plastic','toy','wholesale','bulk', '10pcs','set of']

function hasExcludedWord(title) {
  const lower = title.toLowerCase()
  return EXCLUDE_WORDS.some(w => lower.includes(w))
}

function isBulkListing(title) {
  const lower = title.toLowerCase()
  if (/\d+\s*(pcs|pzs|units|pieces?)\b/.test(lower)) return true
  if (/(\d)\1{4,}/.test(title)) return true
  return false
}

function titleSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const w of setA) if (setB.has(w)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}
function isDuplicate(title, existingTitles, threshold = 0.78) {
  for (const existing of existingTitles) if (titleSimilarity(title, existing) >= threshold) return true
  return false
}

function cleanTitle(title) {
  return title.replace(/\*\*/g, '').replace(/\(\d+\s*characters?\)/gi, '')
    .replace(/\$[a-zA-Z]/, m => m[1]) // fix AliExpress's own "$peaker"-style mangled titles
    .trim()
}

// Image quality heuristic: AliExpress doesn't expose a "has text overlay" flag,
// but a useable proxy is requiring the main image URL to look like a real
// product photo (not a tiny/placeholder asset) - reject obviously broken/empty urls.
function hasUsableImage(p) {
  const img = p.product_main_image_url
  if (!img || typeof img !== 'string') return false
  if (!img.startsWith('http')) return false
  return true
}

export function filterProducts(rawProducts, existingTitles = []) {
  const seenInBatch = []
  const clean = []
  let acceptedCount = 0
  const MAX_PER_QUERY = 15

  const sorted = [...rawProducts].sort((a, b) => (parseInt(b.lastest_volume)||0) - (parseInt(a.lastest_volume)||0))

  for (const p of sorted) {
    const rawTitle = p.product_title || ''
    if (/\$[a-zA-Z]/.test(rawTitle)) continue
    const title = cleanTitle(rawTitle)
    if (!title) continue

    const rate = parseFloat(p.evaluate_rate) || 0
    const vol = parseInt(p.lastest_volume) || 0

    if (vol <= 0) continue
    if (rate > 0 && rate < 85) continue
    if (title.length < 15 || title.length > 150) continue
    if (hasExcludedWord(title)) continue
    if (isBulkListing(title)) continue
    if (!hasUsableImage(p)) continue
    if (isDuplicate(title, existingTitles)) continue
    if (isDuplicate(title, seenInBatch)) continue
    if (acceptedCount >= MAX_PER_QUERY) continue

    seenInBatch.push(title)
    clean.push(p)
    acceptedCount++
  }
  return clean
}

async function rawQuery(keywords, page) {
  const params = {
    app_key: APP_KEY, method: 'aliexpress.affiliate.product.query', sign_method: 'md5',
    timestamp: getTimestamp(), v: '2.0', keywords, page_no: String(page), page_size: '50',
    sort: 'LAST_VOLUME_DESC', tracking_id: TRACKING_ID, target_currency: 'USD', target_language: 'EN',
  }
  params.sign = sign(params)
  const r = await fetch(API_URL, {
    method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'},
    body: new URLSearchParams(params).toString(),
  })
  const data = JSON.parse(await r.text())
  const resp = data?.aliexpress_affiliate_product_query_response?.resp_result
  if (!resp || resp.resp_code !== 200) return []
  return resp?.result?.products?.product || []
}

export async function queryAPI(keywords, cat, page=1, existingTitles=[]) {
  let rawProducts = await rawQuery(keywords, page)
  let clean = filterProducts(rawProducts, existingTitles)

  if (clean.length < 10) {
    const page2Raw = await rawQuery(keywords, 2)
    const page2Clean = filterProducts(page2Raw, [...existingTitles, ...clean.map(p => p.product_title)])
    clean = [...clean, ...page2Clean]
  }

  return clean.map(p => ({
    id: String(p.product_id),
    title: cleanTitle(p.product_title),
    title_en: cleanTitle(p.product_title),
    rating: Math.round((parseFloat(p.evaluate_rate)||0)/20*10)/10,
    orders: parseInt(p.lastest_volume)||0,
    price: parseFloat(p.target_sale_price || p.sale_price || 0) || null,
    image: p.product_main_image_url,
    video_url: p.product_video_url || null,
    affiliate_url: p.promotion_link || p.product_detail_url,
    category: p.second_level_category_name || '',
  }))
}
