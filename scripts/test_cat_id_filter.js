
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
const url = `https://publicapi.abaha.vn/product/index?token=${token}`;

async function test_filter(cid) {
  console.log(`Testing filter with cat_id: ${cid}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 10,
        page: 1,
        cat_id: cid
      })
    });
    const data = await res.json();
    const products = data.data.products || [];
    console.log(`Found ${products.length} products`);
    const matchCount = products.filter(p => p.cat_id == cid).length;
    console.log(`Matches cat_id ${cid}: ${matchCount}/${products.length}`);
    
    if (matchCount < products.length) {
        console.log("Not perfectly filtered. First product cat_id:", products[0].cat_id);
    }
  } catch (e) { console.error(e); }
}

test_filter(388187);
