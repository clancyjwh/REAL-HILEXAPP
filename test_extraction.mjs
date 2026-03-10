const data = {
  news_summary: {
    rundown: "EUR/USD extends losses below 1.1500"
  }
};

let newsText = null;

// This is what the code does
if (!newsText && data.news_summary) {
  if (typeof data.news_summary === 'string') {
    newsText = data.news_summary;
    console.log('Path 1: Set as string');
  } else if (data.news_summary.rundown) {
    newsText = data.news_summary.rundown;
    console.log('Path 2: Extracted rundown');
  }
}

console.log('newsText:', newsText);
console.log('typeof newsText:', typeof newsText);
console.log('Check passes?', newsText && typeof newsText === 'string');
