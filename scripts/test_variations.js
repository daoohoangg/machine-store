
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
const url = `https://publicapi.abaha.vn/product/index?token=${token}`;

async function test_body_variations(cid) {
  const variations = [
    { cat_id: cid },
    { category_id: cid },
    { categories: [cid] },
    { category_ids: [cid] },
    { category_ids: String(cid) }
  ];
  
  for (const v of variations) {
    console.log(`Testing with body: ${JSON.stringify(v)}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 5, page: 1, ...v })
    });
    const data = await res.json();
    const products = data.data.products || [];
    const matches = products.filter(p => p.cat_id == cid).length;
    console.log(`-> Results: ${products.length}, Matches: ${matches}/${products.length}`);
    if (products.length > 0) console.log(`   First product cat_id: ${products[0].cat_id}`);
  }
}

test_body_variations(388187);
