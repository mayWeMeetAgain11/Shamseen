const { JSDOM } = require('jsdom');

function yourNodeJsFunction() {
  const script = `
    <script
      src="https://adcb.gateway.mastercard.com/static/checkout/checkout.min.js"
      data-complete="completeCallback"
      data-error="errorCallback"
      data-cancel="cancelCallback"
      data-beforeRedirect="Checkout.saveFormFields"
      data-afterRedirect="Checkout.restoreFormFields"
    ></script>
  `;

  const dom = new JSDOM(`<!DOCTYPE html><html><head></head><body>${script}</body></html>`);
  const window = dom.window;

  // Access the script element
  const scriptElement = window.document.querySelector('script');

  // Access the script attributes
  const completeCallback = scriptElement.getAttribute('data-complete');
  const errorCallback = scriptElement.getAttribute('data-error');
  const cancelCallback = scriptElement.getAttribute('data-cancel');
  const beforeRedirectCallback = scriptElement.getAttribute('data-beforeRedirect');
  const afterRedirectCallback = scriptElement.getAttribute('data-afterRedirect');

  // Use the script attributes as needed
  console.log('Complete Callback:', completeCallback);
  console.log('Error Callback:', errorCallback);
  console.log('Cancel Callback:', cancelCallback);
  console.log('Before Redirect Callback:', beforeRedirectCallback);
  console.log('After Redirect Callback:', afterRedirectCallback);
}

// Call your Node.js function
yourNodeJsFunction();
