
use wasm_bindgen::prelude::*;
use web_sys;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
#[wasm_bindgen]
pub fn get_inventory_items() -> String {    // Access the 'window' object and retrieve a variable
let window = web_sys::window().expect("No global `window` object found");

    // Replace 'your_variable_name' with the actual variable name you want to access
    let variable_value = window
        .get("this.g_ActiveInventory.rgItemElements")
        .expect("Failed to retrieve the variable from the 'window' object")
        .as_string()
        .expect("Variable is not a string");
    log(&format!("Value of 'your_variable_name': {}", variable_value));

    return variable_value
}

#[wasm_bindgen(start)]
fn init() {

    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let body = document.body().expect("document should have a body");

    // Manufacture the element we're gonna append
    let val = document.create_element("p").expect("Couldnt create element");
    val.set_inner_html("Hello from Rust!");
    println!("Hello, world!");
}



// find a way to retrieve all the items in the current steam offer trade window

// make it so a button and an input box render on screen. 

// when an item is input in the input box and you click the button, it adds the item listed in the input to the trade offer.

// find a way to remove the item

// find a way to add/remove in bulk



// https://steamcommunity.com/id/programmingsockz/inventory/json/440/2/?trading=1