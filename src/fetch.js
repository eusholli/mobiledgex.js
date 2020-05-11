// ------------------------------------------------------ //
// Simple JavaScript API wrapper
// https://stanko.github.io/simple-javascript-api-wrapper
// ------------------------------------------------------ //

// API wrapper function
const fetchResource = (path, userOptions = {}) => {
  // Define default options
  const defaultOptions = { /*mode: "no-cors" */ };
  // Define default headers
  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Charsets': 'utf-8'
  };

  const options = {
    // Merge options
    ...defaultOptions,
    ...userOptions,
    // Merge headers
    headers: {
      ...defaultHeaders,
      ...userOptions.headers,
    },
  };

  // Detect is we are uploading a file
  // const isFile = options.body instanceof File;

  // Stringify JSON data
  // If body is not a file
  if (options.body && typeof options.body === 'object'/* && !isFile */) {
    options.body = JSON.stringify(options.body);
  }

  // Variable which will be used for storing response
  let response = null;

  return fetch(path, options)
    .then(responseObject => {
      // Saving response for later use in lower scopes
      return responseObject.json();

    }).catch(error => {
      throw error;
    });
};

module.exports = { fetchResource: fetchResource };
