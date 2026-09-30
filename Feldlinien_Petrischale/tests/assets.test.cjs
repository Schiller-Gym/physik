const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.join(__dirname,'..');const context=vm.createContext({});
for(const f of ['electrodes.js','electrode-assets.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const catalog=vm.runInContext('ELECTRODE_LAYOUTS',context),images=vm.runInContext('ELECTRODE_IMAGES',context);
assert.equal(Object.keys(images).length,catalog.length);
for(const layout of catalog){assert(images[layout.file].startsWith('data:image/svg+xml;base64,'));assert.deepEqual(Buffer.from(images[layout.file].split(',')[1],'base64'),fs.readFileSync(path.join(root,layout.file)));}
console.log('PASS: all embedded electrode assets exactly match source SVGs.');
