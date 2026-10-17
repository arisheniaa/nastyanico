(() => {
const { reduced, $, $$ } = window.__site
const body = $('#aboutBody')
const splitWords = (el) => {
[...el.childNodes].forEach(n => {
if (n.nodeType === 1) { splitWords(n); return }
if (n.nodeType !== 3) return
const frag = document.createDocumentFragment()
n.textContent.split(/(\s+)/).forEach(part => {
if (!part) return
if (/^\s+$/.test(part) && !/ /.test(part)) { frag.append(document.createTextNode(' ')); return }
const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s)
})
n.replaceWith(frag)
})
}
const canDirect = () => !reduced && window.gsap && window.ScrollTrigger
function direct() {
if (!canDirect()) return
splitWords(body)
const name = $('#name')
name.setAttribute('aria-label', name.textContent)
const chars = [...name.textContent].map(ch => {
const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true')
s.style.display = 'inline-block'; if (ch === ' ' || ch === ' ') s.style.width = '.28em'
return s
})
name.textContent = ''; name.append(...chars)
gsap.from(chars, { opacity: 0, filter: 'blur(14px)', yPercent: 18, duration: 1.6, ease: 'power3.out', stagger: .055, delay: .15 })
gsap.from('.cover__sub, .hdr', { opacity: 0, duration: 1.2, delay: .9, ease: 'power2.out' })
$$('.scene').forEach(sc => {
gsap.to($('.scene__text', sc), { y: -64, opacity: 0, ease: 'none',
scrollTrigger: { trigger: sc, start: '25% top', end: 'bottom top', scrub: true } })
})
$$('.scene:not(.scene--c)').forEach(sc => {
gsap.from($$('.scene__h, .note, .more', sc), { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .09,
scrollTrigger: { trigger: sc, start: 'top 55%', toggleActions: 'play none none reverse' } })
})
gsap.to('#aboutBody .w', { opacity: 1, ease: 'none', stagger: .1,
scrollTrigger: { trigger: '#about', start: 'top 85%', end: 'top top', scrub: .6 } })
gsap.from('.about__h', { y: 48, opacity: 0, duration: 1.3, ease: 'power3.out',
scrollTrigger: { trigger: '.about__h', start: 'top 85%' } })
gsap.from('.contact__h', { yPercent: 30, opacity: 0, duration: 1.4, ease: 'power3.out',
scrollTrigger: { trigger: '.contact__h', start: 'top 88%' } })
}
if (document.readyState === 'complete') direct()
else addEventListener('load', direct)
})()
