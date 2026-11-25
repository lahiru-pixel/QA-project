// Use with a Playwright Page connected to the isolated fixture server.
// Example: const run = require('./browser-checks.cjs'); const evidence = await run(page);
module.exports = async function runBlackBox(page) {
  const origin = 'http://127.0.0.1:5178';
  const results = [];
  const startedAt = new Date().toISOString();
  const browser = await page.evaluate(() => ({ userAgent: navigator.userAgent, language: navigator.language }));
  async function field(id, description, route, selector, value, valid) {
    try {
      await page.goto(origin + route);
      const input = page.locator(selector).first();
      await input.waitFor({state:'visible'});
      await input.fill(value);
      const actual = await input.evaluate(el => ({
        value: el.value, valid: el.checkValidity(), valueMissing: el.validity.valueMissing,
        typeMismatch: el.validity.typeMismatch, type: el.type, required: el.required,
        minLength: el.getAttribute('minlength'), maxLength: el.getAttribute('maxlength'),
        min: el.getAttribute('min'), max: el.getAttribute('max')
      }));
      results.push({id,description,input:value,steps:'Open '+route+'; fill '+selector+'; read browser constraint validity',expected:{valid},actual,status:actual.valid===valid?'Pass':'Fail'});
    } catch(error) {
      results.push({id,description,input:value,expected:{valid},actual:{executionError:String(error.message)},status:'Not Run'});
    }
  }
  await field('EP-EMAIL-01','Empty required registration email','/register','input[type=email]','',false);
  await field('EP-EMAIL-02','Malformed registration email','/register','input[type=email]','qa-invalid',false);
  await field('EP-EMAIL-03','Syntactically valid registration email','/register','input[type=email]','qa@example.test',true);
  await field('EP-EMAIL-04','Single-label domain accepted by native email input','/register','input[type=email]','qa@local',true);
  await field('EP-TITLE-01','Nonempty course title','/admin/courses','input[type=text]','QA Course',true);
  await field('EP-TITLE-02','Empty required course title','/admin/courses','input[type=text]','',false);
  await field('EP-TITLE-03','Whitespace course title characterization','/admin/courses','input[type=text]','   ',true);
  await field('EP-URL-01','Empty required video URL','/admin/videos','input[type=url]','',false);
  await field('EP-URL-02','Malformed video URL','/admin/videos','input[type=url]','not-a-url',false);
  await field('EP-URL-03','Generic HTTPS URL characterization','/admin/videos','input[type=url]','https://example.test/lesson',true);
  await field('EP-URL-04','YouTube-shaped absolute URL','/admin/videos','input[type=url]','https://youtu.be/abcdefghijk',true);
  await field('BVA-TITLE-01','Minimum minus one: zero characters','/admin/courses','input[type=text]','',false);
  await field('BVA-TITLE-02','Minimum: one character','/admin/courses','input[type=text]','A',true);
  await field('BVA-TITLE-03','Minimum plus one: two characters','/admin/courses','input[type=text]','AB',true);
  for (const [id,url,iframe] of [
    ['BVA-VIDEO-01','https://youtu.be/abcdefghij',false],
    ['BVA-VIDEO-02','https://youtu.be/abcdefghijk',true],
    ['BVA-VIDEO-03','https://youtu.be/abcdefghijkl',false],
    ['EP-URL-05','https://example.test/watch?v=abcdefghijk',true]
  ]) {
    try {
      await page.goto(origin+'/videos/qa-video/watch?videoUrl='+encodeURIComponent(url));
      await page.getByRole('heading',{name:'QA fixture lesson'}).waitFor({state:'visible'});
      const frame=page.locator('iframe');
      const count=await frame.count();
      const actual={iframePresent:count===1,src:count?await frame.getAttribute('src'):null,invalidMessage:await page.getByText('Invalid YouTube URL',{exact:true}).count()===1};
      const pass=actual.iframePresent===iframe && actual.invalidMessage===!iframe &&
        (!iframe || actual.src==='https://www.youtube.com/embed/abcdefghijk?rel=0&modestbranding=1&fs=0');
      results.push({id,description:'Actual WatchPage URL rendering',input:url,steps:'Open watch fixture with URL supplied by local API stub; inspect iframe element or invalid-URL message',expected:{iframePresent:iframe,invalidMessage:!iframe},actual,status:pass?'Pass':'Fail'});
    } catch(error) {results.push({id,input:url,expected:{iframePresent:iframe},actual:{executionError:error.message},status:'Not Run'});}
  }
  for(const [id,email,submitted] of [['EP-SUBMIT-01','qa-invalid',false],['EP-SUBMIT-02','qa@example.test',true]]) {
    try {
      await page.goto(origin+'/register');
      await page.locator('input[type=text]').fill('QA Synthetic');
      await page.locator('input[type=email]').fill(email);
      await page.locator('input[type=password]').fill('synthetic-fixture-only');
      await page.getByRole('button',{name:'Create Account',exact:true}).click();
      const notice=page.getByText('QA registration stub reached; no account created',{exact:true});
      if(submitted) await notice.waitFor({state:'visible'});
      const actual={stubResponseVisible:await notice.count()===1,emailValid:await page.locator('input[type=email]').evaluate(el=>el.checkValidity())};
      results.push({id,description:'Browser form submit gate',input:email,steps:'Fill actual Register form with synthetic values; click Create Account; inspect native email validity and visible stub response',expected:{stubResponseVisible:submitted},actual,status:actual.stubResponseVisible===submitted?'Pass':'Fail'});
    } catch(error) {results.push({id,input:email,expected:{stubResponseVisible:submitted},actual:{executionError:error.message},status:'Not Run'});}
  }
  return {startedAt,finishedAt:new Date().toISOString(),browser,scope:'Real React components in local Vite wrapper; AuthContext/API/Supabase dependencies stubbed; CSP blocks remote frames; no real signup or persistence',networkProtection:'Server CSP denies remote frames/connections; SDK and API modules replaced by local stubs',results};
};
