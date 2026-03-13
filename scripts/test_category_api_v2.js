
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
const url = `https://publicapi.abaha.vn/product/index?token=${token}`;

async function test(cid) {
  console.log(`Testing with category_id: ${cid}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 5,
        page: 1,
        category_id: cid
      })
    });
    const data = await res.json();
    const products = data.data.products || [];
    console.log(`Found ${products.length} products`);
    products.forEach(p => {
        console.log(`- ${p.id}: ${p.name} (CatID: ${p.category_id})`);
    });
    
    console.log(`\nTesting with categories: [${cid}]`);
    const res2 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 5,
        page: 1,
        categories: [cid]
      })
    });
    const data2 = await res2.json();
    const products2 = data2.data.products || [];
    console.log(`Found ${products2.length} products`);
    products2.forEach(p => {
        console.log(`- ${p.id}: ${p.name} (CatID: ${p.category_id})`);
    });

  } catch (e) {
    console.error(e.message);
  }
}

test(388184);
