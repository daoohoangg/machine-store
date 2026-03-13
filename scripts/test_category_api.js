
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
const url = `https://publicapi.abaha.vn/product/index?token=${token}`;

async function testCategory() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 2,
        page: 1,
        category_id: 388184
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data.data.products.map(p => ({id: p.id, name: p.name, category_id: p.category_id})), null, 2));
  } catch (e) {
    console.error(e.message);
  }
}

testCategory();
