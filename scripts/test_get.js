
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';

async function test_get(cid) {
  const url = `https://publicapi.abaha.vn/product/index?token=${token}&cat_id=${cid}&limit=5`;
  console.log(`Testing GET: ${url}`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    const products = data.data.products || [];
    console.log(`Found ${products.length} products`);
    const matches = products.filter(p => p.cat_id == cid).length;
    console.log(`Matches: ${matches}/${products.length}`);
  } catch (e) { console.error(e); }
}

test_get(388187);
