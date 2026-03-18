const http = require('http');

http.get('http://localhost:3000', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    // A quick way to find the main structures
    const lines = data.split('\n');
    const structureLines = lines.filter(l => 
      l.includes('class="home-main"') || 
      l.includes('class="page-wrapper') || 
      l.includes('class="container') ||
      l.includes('class="full-width-section"') ||
      l.includes('class="home-top"') ||
      l.includes('class="hero-banner"') ||
      l.includes('class="top-selling-row"') ||
      l.includes('class="home-feature-banner"')
    );
    
    console.log("HTML Structure Lines containing our target classes:");
    console.log(structureLines.join('\n').trim());
    
    // Check if the style tags contain our mobile!important rules
    if(data.includes('padding-top: 55px; /* Prevent header overlap */')) {
        console.log("INCLUDES: home-main padding-top: 55px -> OVERLAP FIX IS PRESENT");
    } else {
        console.log("MISSING: home-main padding-top: 55px -> NOT PRESENT IN SSR");
    }
    
    if(data.includes('margin-bottom: 0px !important') && data.includes('top-selling-row')) {
        console.log("INCLUDES: top-selling-row margin-bottom: 0px !important -> GAP FIX IS PRESENT");
    } else {
        console.log("MISSING: top-selling-row gap fix -> NOT PRESENT IN SSR");
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
