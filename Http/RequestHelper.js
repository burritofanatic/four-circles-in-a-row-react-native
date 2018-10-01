(function () {
  'use strict';
}());

export default async function httpRequest(url, method, body) {
  try {
    let response = await fetch(url, {
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (response.ok) {
      let responseJson = await response.json();
      return responseJson
    } else {
      // If the response is not OK, return the error message.
      let message = response._bodyText;
      return message
    }
  } catch (error) {
    return error;
  }
}
