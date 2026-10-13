const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 assert(process.env.TACTURA_SAMPLE_DIR, 'Set TACTURA_SAMPLE_DIR to the browser-depth assets directory');
 const base=process.env.DEMO_URL || 'http://127.0.0.1:3100';
 const out=process.env.DEMO_QA_OUTPUT || '/tmp/tactura-demo';
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1360,height:1100}});
  const errors=[], posts=[], requests=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')console.log('console',m.text().slice(0,220));});
  page.on('request',r=>{requests.push(r.url());if(r.method()!=='GET')posts.push(r.url());});
  await page.addInitScript(()=>{
   window.demoQA={results:[],gaps:[],workerCount:0};
   const NativeWorker=window.Worker;
   window.Worker=class extends NativeWorker {
    constructor(...args){super(...args);window.demoQA.workerCount++;this.addEventListener('message',({data})=>{
     if(data.type==='result')window.demoQA.results.push({rows:data.rows,cols:data.cols,vertices:data.positions.length/3,timings:data.timings,finite:data.positions.every(Number.isFinite)});
    });}
   };
   let last=performance.now();setInterval(()=>{const now=performance.now();window.demoQA.gaps.push(now-last);last=now;},16);
  });
  await page.goto(base+'/');
  await page.getByRole('link',{name:'Try your own photo'}).click();
  assert(!requests.some(url=>url.includes('/demo-assets/')), 'No model or worker download before conversion');
  const input=page.locator('#demo-photo'),button=page.getByRole('button',{name:'Create my relief'});
  await input.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('no')});
  await page.getByRole('alert').filter({hasText:'JPEG or PNG'}).waitFor();assert(await button.isDisabled());
  await input.setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(5*1024*1024+1)});
  assert(await button.isDisabled());
  await input.setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('not png')});await button.click();
  await page.getByRole('alert').filter({hasText:'valid JPEG or PNG'}).waitFor();
  const root=process.env.TACTURA_SAMPLE_DIR.replace(/\/$/,'')+'/';
  for(const name of ['hero.png','cats.jpg','tiger.jpg']) {
   await input.setInputFiles(root+name);
   await page.evaluate(()=>window.demoQA.gaps=[]);
   await button.click();
   await page.locator('.demo-status').filter({hasText:'Ready ·'}).waitFor({timeout:180000});
   await page.locator('.demo-viewer canvas').waitFor({timeout:30000});
   await page.waitForTimeout(1200);
   const result=await page.evaluate(()=>({...window.demoQA.results.at(-1),maxGapMs:Math.max(...window.demoQA.gaps)}));
   assert(Math.max(result.rows,result.cols)<=1000);if(name==='hero.png'){assert.equal(result.rows,1000);assert.equal(result.cols,1000);}assert(result.finite);console.log(name,JSON.stringify(result));
   if(name==='hero.png') {
    await page.screenshot({path:out+'/demo-desktop.png',fullPage:true});
    const before=await page.locator('.demo-viewer').screenshot();
    const count=await page.evaluate(()=>window.demoQA.workerCount);
    await page.locator('#demo-depth').fill('5');await page.locator('#demo-depth').press('ArrowRight');
    await page.waitForTimeout(250);assert.equal(await page.locator('output').textContent(),'6%');
    const after=await page.locator('.demo-viewer').screenshot();assert(!before.equals(after),'Depth changes render');
    assert.equal(await page.evaluate(()=>window.demoQA.workerCount),count,'Slider does not rerun model');
    await page.getByRole('button',{name:'Rotate left'}).click();await page.getByRole('button',{name:'Reset view'}).click();
   }
  }
  await input.setInputFiles(root+'hero.png');await button.click();await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.locator('.demo-status').filter({hasText:'cancelled'}).waitFor();assert(await button.isEnabled());
  await input.setInputFiles(root+'cats.jpg');await button.click();await page.locator('.demo-status').filter({hasText:'Ready ·'}).waitFor({timeout:180000});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(700);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:out+'/demo-mobile.png',fullPage:true});
  assert.equal(await page.locator('input[type=range]').count(),1);
  assert.equal(posts.length,0,'No photo upload or POST request');assert.deepEqual(errors,[]);
  const remote=requests.filter(url=>!url.startsWith(base)&&!url.startsWith('blob:'));
  const summary=await page.evaluate(()=>window.demoQA.results);
  fs.writeFileSync(out+'/qa-result.json',JSON.stringify({results:summary,remote,posts,errors},null,2));
  const unsupported = await page.evaluate(async () => {
    const bootstrap = URL.createObjectURL(new Blob([`Object.defineProperty(self.navigator, 'gpu', {value: undefined}); await import('${location.origin}/demo-assets/convert.worker.mjs'); self.postMessage({type:'ready'});`], {type:'text/javascript'}));
    const worker = new Worker(bootstrap, {type:'module'});
    try {
      return await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Unsupported worker timed out')),20000);
        worker.onmessage=({data})=>{
          if(data.type==='ready') worker.postMessage({file:new Blob([Uint8Array.from([137,80,78,71,13,10,26,10])],{type:'image/png'})});
          if(data.type==='error'){clearTimeout(timer);resolve(data.message);}
        };
        worker.onerror=e=>{clearTimeout(timer);reject(new Error(e.message));};
      });
    }finally{worker.terminate();URL.revokeObjectURL(bootstrap);}
  });
  assert(unsupported.includes('WebGPU with FP16'));
  await page.locator('.demo-viewer canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.getByRole('alert').filter({hasText:'graphics connection was lost'}).waitFor();
  console.log('PASS uploads, validation, rendering, slider, repeat conversion, cancel, mobile layout, privacy requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
