import('vitest').then(m => {
  console.log('exports', Object.keys(m).sort());
  console.log('describe', typeof m.describe);
  console.log('it', typeof m.it);
  console.log('expect', typeof m.expect);
  console.log('vi', typeof m.vi);
}).catch(err => {
  console.error('error', err);
  process.exit(1);
});
