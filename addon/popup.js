document.addEventListener("DOMContentLoaded", function () {
    const showInputBtn = document.getElementById("showInputBtn");
    const inputContainer = document.getElementById("inputContainer");
    const autocompleteInput = document.getElementById("autocompleteInput");
    const autocompleteOptions = document.getElementById("autocompleteOptions");
  
    showInputBtn.addEventListener("click", function () {
      inputContainer.style.display = "block";
    });
  
    autocompleteInput.addEventListener("input", function () {
      // Implement your autocomplete logic here
      const inputValue = autocompleteInput.value;
      // Example: Display autocomplete options
      displayAutocompleteOptions(["Option 1", "Option 2", "Option 3"]);
    });
  
    function displayAutocompleteOptions(options) {
      autocompleteOptions.innerHTML = "";
      options.forEach((option) => {
        const optionElement = document.createElement("div");
        optionElement.textContent = option;
        optionElement.addEventListener("click", function () {
          autocompleteInput.value = option;
          autocompleteOptions.innerHTML = "";
        });
        autocompleteOptions.appendChild(optionElement);
      });
    }
  });