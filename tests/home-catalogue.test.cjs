const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const rules = require('../assets/catalogue-rules.js');
const home = require('../assets/home-catalogue.js');
const html = fs.readFileSync('index.html','utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source = fs.readFileSync('assets/shop-home.js','utf8');
const css = fs.readFileSync('assets/shop-home.css','utf8');
const product = overrides => ({
  id:'001',name:'Rice pack',div:'Retail',cat:'Rice & grains',
  categories:{Retail:'Rice & grains'},divisions:['Retail'],stock:7,price:187,
  img:'img/app/rice-grains.jpg',pack:'1 pack',...overrides,
});
const freshState = () => ({
  div:'All',cat:'All',q:'',sort:'rec',max:Infinity,inStock:false,
  brands:new Set(),cart:{},age:false,
});

test('shortcut destinations use actual division/category pairs, including tier cross-listing', () => {
  const products = [
    product({id:'a',divisions:['Retail','Wholesale'],categories:{Retail:'Kitchen',Wholesale:'Bulk staples'}}),
    product({id:'b',div:'Pharmacy',cat:'Kitchen',divisions:['Pharmacy'],categories:{Pharmacy:'Kitchen'}}),
    product({id:'c',name:'Beer medicines flour bale',cat:'Unusual category',categories:{Retail:'Unusual category'}}),
  ];
  const tiles = home.shortcuts(products);
  assert.ok(tiles.some(t => t.div === 'Wholesale' && t.cat === 'All'));
  assert.ok(tiles.some(t => t.div === 'Retail' && t.cat === 'All'));
  assert.ok(tiles.every(t => t.cat === 'All' && !t.image));
  assert.ok(tiles.length <= 5);
  for (const tile of tiles) {
    assert.equal(tile.count,home.members(products,tile.div,tile.cat).length);
    assert.ok(tile.count > 0);
  }
  assert.deepEqual(home.members(products,'Retail','Kitchen').map(p => p.id),['a']);
  assert.deepEqual(home.members(products,'Pharmacy','Kitchen').map(p => p.id),['b']);
  assert.ok(!tiles.some(t => t.div === 'Liquor'));
  assert.deepEqual(home.shortcuts([]),[]);
});

test('two category-labelled collections contain available photographed items, never implied staff picks', () => {
  const products = [
    product({id:'plain',img:''}),
    product({id:'photo'}),
    product({id:'oos',stock:0}),
    product({id:'rx',rx:true,div:'Pharmacy',divisions:['Pharmacy']}),
    product({id:'age',age:true,div:'Wholesale',divisions:['Wholesale']}),
    product({id:'care',div:'Pharmacy',divisions:['Pharmacy'],cat:'Devices'}),
    product({id:'bulk',div:'Retail',divisions:['Retail','Wholesale'],categories:{Retail:'Beverages',Wholesale:'Bulk staples'}}),
    product({id:'only-bulk',div:'Wholesale',divisions:['Wholesale']}),
  ];
  const collections = home.collections(products);
  assert.deepEqual(collections.map(c => c.div),['Retail','Retail']);
  assert.deepEqual(collections.map(c => c.label),['Rice & grains','Beverages']);
  const items = collections.flatMap(c => c.products);
  assert.equal(new Set(items.map(p => p.id)).size,items.length);
  assert.ok(items.every(p => products.includes(p) && !p.rx && !p.age && p.stock > 0 && p.img));
  assert.equal(collections[0].products[0].id,'photo');
  for (const collection of collections) {
    assert.ok(collection.products.length <= 4);
    assert.ok(collection.products.every(p => rules.inDivision(p,collection.div)));
    assert.ok(collection.products.every(p => rules.inCategory(p,collection.div,collection.cat)));
    assert.doesNotMatch(collection.label+' '+collection.copy,/picks|best.?sellers|curated|recommended/i);
  }
  assert.deepEqual(home.collections([]),[]);
  assert.deepEqual(home.collections([product({rx:true})]),[]);
});

test('homepage visibility covers every browsing filter and PDP; reset preserves basket and age', () => {
  assert.equal(home.isHome(freshState()),true);
  for (const changes of [{q:'milk'},{div:'Pharmacy'},{cat:'Kitchen'},{sort:'lo'},
    {max:200},{inStock:true},{brands:new Set(['Actual brand'])},{browsing:true}]) {
    assert.equal(home.isHome({...freshState(),...changes}),false);
  }
  assert.equal(home.isHome(freshState(),'001'),false);
  const state = {...freshState(),q:'stale',max:20,inStock:true,brands:new Set(['stale']),sort:'hi',age:true,cart:{'001':3}};
  home.resetFilters(state);
  assert.equal(home.isHome(state),true);
  assert.equal(state.age,true);
  assert.deepEqual(state.cart,{'001':3});
});

function navigation() {
  const nodes = {};
  const $ = selector => nodes[selector] ||= {
    value:'stale',focused:false,scrolled:false,
    focus() {this.focused=true;}, scrollIntoView(options) {this.scrolled=options;},
  };
  const state = {...freshState(),q:'stale',max:15,sort:'hi',inStock:true,brands:new Set(['old'])};
  let browsed = 0, rendered = 0, modal = '';
  const window = {XanaProductDetail:{browse(){browsed++;}},XanaHome:{
    resetFilters(){home.resetFilters(state);$('#search').value='';$('#sortSel').value='rec';},
    rememberAgeFocus(){},
  }};
  const context = vm.createContext({
    $,state,window,adOff:()=>true,resetVisible(){},
    renderAll(){rendered++;},openModal(selector){modal=selector;},
  });
  vm.runInContext(inline.slice(inline.indexOf('function goShop(div,cat){'),inline.indexOf('/* Pharmacy and Retail row')),context);
  return {nodes,$,state,window,context,go:context.goShop,
    get browsed(){return browsed;},get rendered(){return rendered;},get modal(){return modal;}};
}
test('actual goShop leaves PDP, resets stale filters, selects exact pair and focuses results', () => {
  const app = navigation();
  app.go('Wholesale','Bulk staples');
  assert.equal(app.browsed,1);
  assert.equal(app.state.div,'Wholesale');
  assert.equal(app.state.cat,'Bulk staples');
  assert.equal(app.state.browsing,true);
  assert.equal(app.state.q,'');
  assert.equal(app.state.max,Infinity);
  assert.equal(app.state.brands.size,0);
  assert.equal(app.$('#search').value,'');
  assert.equal(app.$('#sortSel').value,'rec');
  assert.equal(app.$('#catTitle').focused,true);
  assert.equal(app.$('#main').scrolled.behavior,'auto');
  assert.equal(app.rendered,1);
});
test('actual storefront filtered() follows cross-listed and repeated category metadata', () => {
  const products = [
    product({id:'retail',divisions:['Retail','Wholesale'],categories:{Retail:'Kitchen',Wholesale:'Bulk staples'}}),
    product({id:'rx',div:'Pharmacy',divisions:['Pharmacy'],categories:{Pharmacy:'Kitchen'}}),
  ];
  const state = {...freshState(),div:'Wholesale',cat:'Bulk staples'};
  const context = vm.createContext({
    PRODUCTS:products,state,inDivision:rules.inDivision,inCategory:rules.inCategory,unitPrice:rules.unitPrice,
  });
  vm.runInContext(inline.slice(inline.indexOf('function filtered(){'),inline.indexOf('function disc(p)')),context);
  assert.deepEqual(Array.from(context.filtered(),p=>p.id),['retail']);
  state.div='Retail';state.cat='Kitchen';
  assert.deepEqual(Array.from(context.filtered(),p=>p.id),['retail']);
  state.div='Pharmacy';
  assert.deepEqual(Array.from(context.filtered(),p=>p.id),['rx']);
});
test('liquor navigation waits for age confirmation, then resets filters and focuses exact category', () => {
  const app = navigation();
  app.go('Liquor','Beer & cider');
  assert.equal(app.state.div,'All');
  assert.equal(app.state.q,'stale');
  assert.equal(app.window._pendingDiv,'Liquor');
  assert.equal(app.window._pendingCat,'Beer & cider');
  assert.equal(app.modal,'#ageModal');
  assert.equal(app.$('#ageNo').focused,true);
  app.context.closeAll = () => {
    app.window._pendingDiv = null; app.window._pendingCat = null; app.window._pendingScroll = false;
  };
  app.context.add = () => assert.fail('browse must not add a product');
  vm.runInContext(inline.slice(inline.indexOf("$('#ageYes').onclick="),inline.indexOf("$('#ageNo').onclick=")),app.context);
  app.$('#ageYes').onclick();
  assert.equal(app.state.age,true);
  assert.equal(app.state.div,'Liquor');
  assert.equal(app.state.cat,'Beer & cider');
  assert.equal(app.state.q,'');
  assert.equal(app.$('#catTitle').focused,true);
});

function adapter(status = 'loading', products = []) {
  const nodes = new Map(), listeners = {};
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector,{
      innerHTML:'',children:[],hidden:false,attrs:{},dataset:{},
      classes:new Set(),setAttribute(k,v){this.attrs[k]=v;},
      classList:{toggle(){},contains(){return false;}},
      querySelector(){return node(selector+' child');},
      querySelectorAll(){return [];},appendChild(child){this.children.push(child);},
    });
    return nodes.get(selector);
  };
  const body = node('body');
  body.classList.toggle = (key,on) => on ? body.classes.add(key) : body.classes.delete(key);
  const calls = [];
  const window = {XanaHomeCatalogue:home,location:{href:'https://shop.example/'}};
  const context = vm.createContext({
    window,URL,PRODUCTS:products,catalogueStatus:status,state:freshState(),
    document:{body,querySelector:node,createElement:()=>node('section-'+nodes.size),addEventListener:(key,fn)=>listeners[key]=fn},
    escapeHtml:value=>String(value).replaceAll('<','&lt;'),
    productImageMarkup:()=>'<img alt="">',createProductCard:p=>({id:p.id}),
    goShop:(...args)=>calls.push(args),openClinic:()=>calls.push('clinic'),
    loadCatalogue:()=>calls.push('retry'),
  });
  vm.runInContext(source,context);
  return {node,context,window,calls,body,listeners,render:window.XanaHome.render};
}
test('homepage adapter renders skeletons, retryable error, composed empty state and live shelves', () => {
  const loading = adapter();
  loading.render();
  assert.equal(loading.node('#homeShop').attrs['aria-busy'],'true');
  assert.equal((loading.node('#homeCategories').innerHTML.match(/aria-hidden="true"/g)||[]).length,5);
  const error = adapter('error');
  error.render();
  assert.match(error.node('#homeCollections').innerHTML,/could not check the live catalogue/);
  error.node('#homeCollections child').onclick();
  assert.deepEqual(error.calls,['retry']);
  const empty = adapter('ready');
  empty.render();
  assert.match(empty.node('#homeCollections').innerHTML,/No catalogue products/);
  const ready = adapter('ready',[product()]);
  ready.render();
  assert.equal(ready.node('#homeCollections').children.length,1);
  ready.node('#homeBrowse').onclick();
  ready.node('#homeClinic').onclick();
  assert.deepEqual(ready.calls,[['All','All'],'clinic']);
});
test('home navigation clears department and filters and restores heading focus', () => {
  const app = adapter('ready',[product()]);
  app.context.state.browsing=true; app.context.state.div='Retail'; app.context.state.q='milk';
  app.context.state.cat='Household'; app.context.state.max=100;
  let browsed=false,rendered=false,focused=false,scrolled=false;
  app.window.XanaProductDetail={browse(){browsed=true;}};
  app.window.scrollTo=()=>{scrolled=true;};
  app.context.resetVisible=()=>{};
  app.context.renderAll=()=>{rendered=true;};
  app.context.adOff=()=>true;
  app.node('#homeTitle').focus=()=>{focused=true;};
  app.window.XanaHome.home();
  assert.equal(app.context.state.div,'All');
  assert.equal(app.context.state.cat,'All');
  assert.equal(app.context.state.q,'');
  assert.equal(app.context.state.max,Infinity);
  assert.equal(app.context.state.browsing,false);
  assert.ok(browsed && rendered && focused && scrolled);
});
test('adapter hides on search/filter/PDP and reuses unchanged DOM on routine rerender', () => {
  const app = adapter('ready',[product()]);
  app.render();
  const count = app.node('#homeCollections').children.length;
  app.render();
  assert.equal(app.node('#homeCollections').children.length,count);
  app.context.state.q='milk';
  app.render();
  assert.equal(app.node('#homeShop').hidden,true);
  assert.ok(app.body.classes.has('shop-browsing'));
  app.context.state.q='';
  app.window.location.href='https://shop.example/?product=001';
  app.render();
  assert.equal(app.node('#homeShop').hidden,true);
  app.window.location.href='https://shop.example/';
  app.render();
  assert.equal(app.node('#homeShop').hidden,false);
});
test('category age dialog traps keyboard focus and Escape restores the originating shortcut', () => {
  const app = adapter('ready',[product()]);
  let focused = '';
  const sourceButton = {focus(){focused='shortcut';}};
  app.context.document.activeElement=sourceButton;
  app.window.XanaHome.rememberAgeFocus();
  app.window._pendingDiv='Liquor';
  app.node('#ageModal').classList.contains=()=>true;
  app.node('#ageNo').focus=()=>{focused='no';};
  app.node('#ageYes').focus=()=>{focused='yes';};
  let prevented=0;
  const key = (key,shiftKey=false) => app.listeners.keydown({key,shiftKey,preventDefault(){prevented++;}});
  app.context.document.activeElement=app.node('#ageNo');
  key('Tab',true);
  assert.equal(focused,'yes');
  app.context.document.activeElement=app.node('#ageYes');
  key('Tab');
  assert.equal(focused,'no');
  app.context.closeAll=()=>{app.window._pendingDiv=null;};
  key('Escape');
  assert.equal(focused,'shortcut');
  assert.equal(prevented,3);
  assert.equal(app.window._pendingDiv,null);
});
test('shared card/PDP integration, browsing suppression, keyboard and reduced motion remain wired', () => {
  assert.match(inline,/g\.appendChild\(createProductCard/);
  assert.match(source,/grid\.appendChild\(createProductCard/);
  assert.match(inline,/b\.onclick=\(\)=>add\(id2\(p\),1\)/);
  assert.match(inline,/b\.onclick=openRx/);
  assert.match(inline,/act\.innerHTML=`<button class="addbtn" disabled/);
  assert.match(fs.readFileSync('assets/product-detail.js','utf8'),/scope\.XanaHome\?\.render\(\)/);
  assert.match(css,/body\.shop-browsing :is\([^)]*\.offers[^)]*\.bulk/);
  assert.match(css,/body\.product-view :is\(\.home-shop/);
  assert.doesNotMatch(css,/animation:|transition:|translateY/);
  assert.match(source,/event\.key === 'Tab'/);
  assert.match(source,/event\.key === 'Escape'/);
  assert.doesNotMatch(html,/within 30 minutes|about 45 minutes/);
  assert.doesNotThrow(()=>new vm.Script(inline));
  assert.doesNotThrow(()=>new vm.Script(source));
});
test('ambiguous or conflicting records are omitted only from home; catalogue membership is unchanged', () => {
  const products = [
    product({id:'dose',name:'Amoxicillin 500mg'}),
    product({id:'form',name:'Unknown tablets'}),
    product({id:'beer',name:'Tusker Lager'}),
    product({id:'cross',divisions:['Retail','Pharmacy']}),
    product({id:'unknown',cat:'Unverified',categories:{Retail:'Unverified'}}),
    product({id:'missing',img:''}),
    product({id:'unpriced',price:0}),
    product({id:'unavailable',stock:0}),
  ];
  const before = JSON.stringify(products);
  assert.deepEqual(home.collections(products),[]);
  assert.equal(home.members(products,'Retail').length,products.length);
  assert.equal(JSON.stringify(products),before);
  const plenty = Array.from({length:15},(_,i)=>product({
    id:String(i),cat:['Beverages','Snacks','Foodstuffs'][i%3],
    categories:{Retail:['Beverages','Snacks','Foodstuffs'][i%3]},
  }));
  const shelves = home.collections(plenty,20);
  assert.equal(shelves.length,2);
  assert.ok(shelves.every(s=>s.products.length===4));
});
test('Browse all remains browsing with All/All and no filters, including after a PDP return', () => {
  const nav = navigation();
  nav.go('All','All');
  assert.equal(home.isHome(nav.state),false);
  const app = adapter('ready',[product()]);
  app.context.state.browsing=true;
  app.render();
  assert.equal(app.node('#homeShop').hidden,true);
  app.window.location.href='https://shop.example/?product=001';
  app.render();
  app.window.location.href='https://shop.example/';
  app.render();
  assert.equal(app.node('#homeShop').hidden,true);
});
test('full catalogue is suppressed on home; floating strip and retired retail handlers are removed', () => {
  assert.match(css,/body:not\(\.shop-browsing\):not\(\.product-view\) #main\{display:none\}/);
  assert.match(inline,/\$\('#grid'\)\.innerHTML=''; \$\('#moreWrap'\)\.hidden=true; return;/);
  assert.doesNotMatch(html,/offerbar|offerBar|obBarTxt|obBarCta|renderOfferBar|rtShop|rtDeals/);
  assert.match(html,/<nav class="bottom" id="bottomNav"/);
  assert.match(html,/class="offer-ui" hidden inert/);
  assert.match(html,/\.tab\.pharmacy-tab\{font-size:16px;font-weight:750;color:var\(--green\)\}/);
  assert.match(html,/<script src="\/assets\/product-detail\.js\?v=[^"]+"><\/script>/);
  assert.doesNotMatch(source,/productImageMarkup|fresh-produce\.jpg/);
});
