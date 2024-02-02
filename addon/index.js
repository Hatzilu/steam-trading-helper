
const rust = import('./pkg/steam_trading_helper.js');
rust
  .then(m => {
    
    const s =m.get_inventory_items()
    console.log({s});
  })
  .catch(console.error);
console.log('test');