const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
function declaration(name) {
  const match = html.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}`));
  assert.ok(match, `${name} exists`);
  return match[0];
}
const clinic = vm.runInNewContext('(' + html.match(/\{id:'clinic-visit'[\s\S]*?\}/)[0] + ')');

test('clinic offer and informational dialog use confirmed copy without price or booking claims', () => {
  assert.equal(clinic.text, 'Care close to home');
  assert.equal(clinic.sub, 'GP consultations, lab tests and vaccinations.');
  assert.equal(clinic.locations, 'Ruaka · Kilimani · Kitengela Road');
  assert.equal(clinic.hours, '8am–8pm');
  assert.equal(clinic.cta, 'View clinic details');
  assert.equal(clinic.action, 'clinic-details');
  assert.equal(clinic.tone, 'clinic');
  assert.doesNotMatch(JSON.stringify(clinic), /800|daily|Book a visit/i);
  const dialog = html.match(/<div class="modal" id="clinicDetailsModal"[\s\S]*?(?=<div class="modal" id="locModal")/)[0];
  for (const text of [clinic.text, clinic.sub, clinic.locations, clinic.hours]) {
    assert.ok(dialog.includes(text));
  }
  assert.match(dialog, /Appointment booking is unavailable online\./);
  assert.match(dialog, /role="dialog" aria-modal="true"/);
  assert.match(dialog, /data-close/);
  assert.doesNotMatch(dialog, /<input|<select|<form|KSh|tel:|Visit booked|SMS confirmation/);
});

test('banner and mirrored mobile CTA dispatch only to the details dialog; legacy clinic action stays intact', () => {
  const calls = [];
  const context = vm.createContext({
    openClinicDetails: () => calls.push('details'),
    openClinic: () => calls.push('legacy'),
    openRx: () => calls.push('rx'),
    promoAdd: sku => calls.push(sku),
  });
  vm.runInContext(declaration('adAct'), context);
  context.adAct(clinic);
  context.adAct({ action: 'clinic' });
  assert.deepEqual(calls, ['details', 'legacy']);
  assert.match(declaration('renderAdCarousel'), /b\.onclick=\(\)=>adAct\(ads\[\+b\.dataset\.offerCta\]\)/);
  assert.match(declaration('renderOfferBar'), /textContent=a\.sku\?'Add':a\.cta/);
  assert.match(declaration('renderOfferBar'), /\.onclick=\(\)=>adAct\(a\)/);
  const opened = [];
  const close = { focus: () => opened.push('focus') };
  const trigger = {};
  const detailsContext = vm.createContext({
    document: { activeElement: trigger },
    clinicDetailsTrigger: null,
    closeAll: () => opened.push('close'),
    openModal: selector => opened.push(selector),
    $: () => close,
  });
  vm.runInContext(declaration('openClinicDetails') + '\nopenClinicDetails()', detailsContext);
  assert.deepEqual(opened, ['close', '#clinicDetailsModal', 'focus']);
  assert.equal(detailsContext.clinicDetailsTrigger, trigger);
});

function carouselHarness(ads) {
  const nodes = {};
  const calls = [];
  const makeNode = () => ({
    classList: { add() {}, remove() {} },
    style: { setProperty() {} },
    dataset: {},
    setAttribute() {},
    querySelectorAll: () => [],
    addEventListener() {},
  });
  const context = vm.createContext({
    PROMOS: { ads }, adIndex: 0, adHover: false, adTimer: null,
    $: selector => nodes[selector] || (nodes[selector] = makeNode()),
    document: { body: makeNode(), querySelectorAll: () => [] },
    prod: () => null,
    adAt: i => ads[(i + ads.length) % ads.length],
    renderOfferBar() {},
    adDelay: () => 3000,
    adPaused: () => false,
    clearTimeout() {},
    setTimeout: callback => { calls.push(callback); return calls.length; },
  });
  vm.runInContext(declaration('adGoTo') + '\n' + declaration('adTick') + '\n' + declaration('renderAdCarousel'), context);
  context.renderAdCarousel();
  return { context, nodes, calls };
}

test('single offer hides navigation and progress but keeps handlers safe and does not rotate', () => {
  const { context, nodes, calls } = carouselHarness([clinic]);
  const carousel = nodes['#offerCarousel'];
  assert.match(carousel.innerHTML, /class="offer-ui" hidden/);
  assert.match(carousel.innerHTML, /id="offerProg" hidden/);
  assert.match(carousel.innerHTML, /offer-clinic/);
  assert.match(carousel.innerHTML, /#i-clinic/);
  assert.doesNotMatch(carousel.innerHTML, /KSh|offer-price/);
  nodes['#offerNext'].onclick();
  nodes['#offerPrev'].onclick();
  carousel.onkeydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(context.adIndex, 0);
  assert.equal(calls.length, 0);
});

test('multiple offers retain navigation, keyboard handling and timed rotation', () => {
  const { context, nodes, calls } = carouselHarness([
    clinic,
    { text: 'Prescription support', sub: 'Ask about prescriptions.', cta: 'Upload', action: 'rx', tone: 'green' },
  ]);
  const carousel = nodes['#offerCarousel'];
  assert.match(carousel.innerHTML, /class="offer-ui">/);
  assert.match(carousel.innerHTML, /id="offerProg"><i>/);
  assert.equal(calls.length, 1);
  calls[0]();
  assert.equal(context.adIndex, 1);
  nodes['#offerNext'].onclick();
  assert.equal(context.adIndex, 0);
  nodes['#offerPrev'].onclick();
  assert.equal(context.adIndex, 1);
  carousel.onkeydown({ key: 'ArrowLeft', preventDefault() {} });
  assert.equal(context.adIndex, 0);
  assert.equal(nodes['#offerView'].style.transform, 'translateX(0%)');
});
