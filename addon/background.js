import init, { get_inventory_items } from "../../pkg/steam_trading_helper.js";

async function run() {
    console.log('bla');
    await init();
    const s = get_inventory_items();
    console.log({s});
}
console.log('bla2');

run();