(() => {
const root = document.documentElement
const q = new URLSearchParams(location.search)
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduced) { root.classList.add('reduced'); document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager' }) }
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
window.__site = { reduced, $, $$ }
if (q.has('grid')) root.classList.add('show-grid')
addEventListener('keydown', (e) => {
if (e.key !== 'g' && e.key !== 'п') return
if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return
root.classList.toggle('show-grid')
})
const mb = $('#menuBtn'), menu = $('#menu')
mb.addEventListener('click', () => {
const open = menu.hasAttribute('hidden')
menu.toggleAttribute('hidden', !open)
mb.setAttribute('aria-expanded', String(open))
mb.textContent = open ? 'закрыть' : 'меню'
})
$$('a', menu).forEach(a => a.addEventListener('click', () => mb.click()))
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hasAttribute('hidden')) mb.click() })
const screens = $$('.scene, .field, .series')
const hdr = $('#hdr')
const narrow = matchMedia('(max-width: 760px)')
const hdrTone = () => {
const under = screens.find(s => { const r = s.getBoundingClientRect(); return r.top <= 32 && r.bottom > 32 })
const paperUnder = !!under && under.classList.contains('field')
hdr.classList.toggle('hdr--ink', paperUnder)
hdr.classList.toggle('hdr--dark', !paperUnder && !!under && narrow.matches && under.dataset.hdrM === 'ink')
hdr.classList.toggle('hdr--solid', !!under && narrow.matches && under.classList.contains('series'))
}
addEventListener('scroll', hdrTone, { passive: true }); addEventListener('resize', hdrTone); hdrTone()
window.__hdrTone = hdrTone
const snap = { busy: false, off: false }
window.__snap = snap
function magnet(lenis) {
const probe = document.createElement('i')
probe.style.cssText = 'position:absolute;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none'
document.body.append(probe)
const scr = () => Math.max(innerHeight, probe.offsetHeight)
let lockUntil = 0, busy = false, ty = null, t = 0, lastT = 0, hist = []
const map = () => {
const max = document.documentElement.scrollHeight - innerHeight, pts = new Set([0, max]), free = []
screens.forEach(s => {
const top = Math.round(s.getBoundingClientRect().top + scrollY), h = s.offsetHeight
pts.add(Math.min(top, max))
if (h > scr() + 2) { const bot = Math.min(top + h - innerHeight, max); pts.add(bot); free.push([top, bot]) }
})
return { pts: [...pts].sort((x, y) => x - y), free }
}
const y0 = () => (busy ? (lenis.targetScroll ?? lenis.scroll) : lenis.scroll)
const isFree = (dir) => {
const y = lenis.scroll, { free } = map()
return free.some(([a, b]) => (dir > 0 ? y >= a - 2 && y < b - 2 : y > a + 2 && y <= b + 2))
}
let guard = 0
const done = () => { clearTimeout(guard); busy = false; snap.busy = false; lockUntil = performance.now() + 120 }
const page = (dir) => {
if (busy) return
clearTimeout(t)
const y = y0(), { pts } = map()
const target = dir > 0 ? Math.min(...pts.filter(p => p > y + 2)) : Math.max(...pts.filter(p => p < y - 2))
if (!isFinite(target)) return
busy = true; snap.busy = true
guard = setTimeout(done, 1100)
lenis.scrollTo(target, { duration: .8, force: true, easing: (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
onComplete: done })
}
const intercept = (dir) => !snap.off && menu.hasAttribute('hidden') && !isFree(dir)
const avg = (n) => { const a = hist.slice(-n); return a.reduce((s, x) => s + x, 0) / a.length }
addEventListener('wheel', (e) => {
if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
const dir = Math.sign(e.deltaY); if (!dir || !intercept(dir)) return
e.preventDefault(); e.stopImmediatePropagation()
const now = performance.now(), d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 40 : 1)
if (now - lastT > 200) hist = []
lastT = now; hist.push(d); if (hist.length > 24) hist.shift()
if (busy || now < lockUntil) return
if (hist.length > 1 && !(avg(3) >= avg(12) && avg(3) >= 6)) return
hist = [d]
page(dir)
}, { passive: false, capture: true })
addEventListener('keydown', (e) => {
const k = e.key, dir = (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) ? 1
: (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) ? -1 : 0
if (!dir || e.target.closest('input, textarea, [contenteditable], dialog[open]') || !intercept(dir)) return
e.preventDefault(); if (!busy) page(dir)
})
addEventListener('touchstart', (e) => { ty = e.touches.length === 1 ? e.touches[0].clientY : null }, { passive: true })
addEventListener('touchmove', (e) => {
if (ty == null || !e.cancelable) return
const dir = Math.sign(ty - e.touches[0].clientY)
if (dir ? intercept(dir) : intercept(1) && intercept(-1)) e.preventDefault()
}, { passive: false })
addEventListener('touchcancel', () => { ty = null }, { passive: true })
addEventListener('touchend', (e) => {
if (ty == null) return
const dy = ty - e.changedTouches[0].clientY, dir = Math.sign(dy); ty = null
if (Math.abs(dy) > 24 && intercept(dir) && !busy) page(dir)
}, { passive: true })
lenis.on('scroll', () => { if (busy) return; clearTimeout(t); t = setTimeout(() => {
if (busy || performance.now() < lockUntil || !menu.hasAttribute('hidden')) return
const y = lenis.scroll, { pts, free } = map()
if (free.some(([a, b]) => y > a + 1 && y < b - 1) || pts.some(p => Math.abs(p - y) < 2)) return
const near = pts.reduce((m, p) => Math.abs(p - y) < Math.abs(m - y) ? p : m, pts[0])
busy = true; guard = setTimeout(done, 700)
lenis.scrollTo(near, { duration: .42, force: true, onComplete: done })
}, 120) })
addEventListener('visibilitychange', () => { if (document.hidden) done() })
}
function boot() {
if (reduced || !window.gsap || !window.ScrollTrigger) return
gsap.registerPlugin(ScrollTrigger)
if (!window.Lenis) return
const lenis = new Lenis({ lerp: .12, wheelMultiplier: .9 })
window.__lenis = lenis
lenis.on('scroll', ScrollTrigger.update)
lenis.on('scroll', hdrTone)
gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
const el = $(a.getAttribute('href')); if (!el) return
e.preventDefault(); snap.busy = true; lenis.scrollTo(el, { duration: 1.6, onComplete: () => { snap.busy = false } })
}))
magnet(lenis)
}
if (document.readyState === 'complete') boot()
else addEventListener('load', boot)
})()
