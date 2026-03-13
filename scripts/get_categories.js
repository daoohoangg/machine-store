
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';

async function getCategories() {
  const url = `https://publicapi.abaha.vn/category/index?token=${token}`;
  const res = await fetch(url);
  const data = await res.json();
  const cat = data.data.categories.find(c => c.id === 393349);
  console.log('Category 393349:', cat ? cat.name : 'Not found');
  const parent = data.data.categories.find(c => c.id === 388184);
  console.log('Category 388184:', parent ? parent.name : 'Not found');
}

getCategories();
