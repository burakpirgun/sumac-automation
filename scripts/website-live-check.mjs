import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'https://tasteofturkiye.org';
await mkdir('website-validation', { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [width,height] of [[320,780],[390,844],[768,900],[1440,900],[844,390]]) {
    const page = await browser.newPage({ viewport: { width,height } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const [hash,rail,card] of [['#recipes','#recipe-grid','.recipe-card'],['#places','#places-grid','.place-card'],['#pantry','#ingredients','.ingredient']]) {
      const response = await page.goto(base+'/'+hash, { waitUntil:'networkidle' });
      assert.equal(response.status(),200);
      assert.match(response.headers()['x-robots-tag'] ?? '', /noindex/);
      assert.match(await page.locator('meta[name=robots]').getAttribute('content'), /noindex/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const box = await page.locator(rail).boundingBox();
      assert.ok(box && box.height > 0 && box.y + box.height <= height + 2, 'Visible rail must fit viewport');
      await page.locator(rail).hover();
      await page.mouse.wheel(0,300);
      await page.waitForTimeout(350);
      assert.ok(await page.locator(rail).evaluate(e => e.scrollLeft) > 0, 'Section wheel must move rail');
      await page.locator(rail).evaluate(e => e.scrollLeft = 0);
      await page.locator(rail+' '+card).first().click();
      assert.equal(await page.locator('#detail').evaluate(e => e.open),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#detail').evaluate(e => e.open),false);
      results.push({width,height,hash,status:'passed'});
      await page.screenshot({path:'website-validation/'+width+'-'+height+'-'+hash.slice(1)+'.png'});
    }
    await page.goto(base, {waitUntil:'networkidle'});
    await page.mouse.move(width/2,height/2);
    await page.mouse.wheel(0,500);
    await page.waitForTimeout(350);
    assert.ok(await page.evaluate(() => scrollY)>0,'Home wheel must scroll vertically');
    await page.locator('#language').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'tr');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  for (const [hash,filter,rail,card,expected] of [['#recipes','[data-category]','#recipe-grid','.recipe-card',115],['#places','[data-region]','#places-grid','.place-card',81],['#pantry','[data-ingredient-category]','#ingredients','.ingredient',23]]) {
    await page.goto(base+'/'+hash,{waitUntil:'networkidle'});
    assert.equal(await page.locator(rail+' '+card).count(),expected);
    const controls=page.locator(filter);
    // Check one concrete non-All category; selectors may differ in legacy POC.
    if(await controls.count()>1) {
      const choice=controls.nth(1); await choice.click();
      assert.equal(await choice.getAttribute('aria-pressed'),'true');
      assert.ok(await page.locator(rail+' '+card).count()<expected);
    }
  }
  await page.close();
} catch(error) {
  results.push({status:'failed',error:String(error.message)});
  process.exitCode=1;
} finally {
  await writeFile('website-validation/results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
  await browser.close();
}
