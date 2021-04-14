function getWithPagination_({endpoint, callback, stub}, additionalQuery={}) {
  let page = 1;
  
  /**
   * Let's use a trick: We can get the first one and see how many pages we'll
   * need, then just build that many pages
   */

  const firstRequest = endpoint.createRequest('get', {stub}, {
    query: {page}
  });
  if (additionalQuery) firstRequest.addQuery(additionalQuery);

  const firstResponse = firstRequest.fetch();
  const firstJson = firstResponse.json;
  if (!firstResponse.ok) {
    throw new Error('Status ' + firstResponse.statusCode + ": " + firstJson.error);
  }

  const ret = callback(firstJson);

  const howMany = firstJson.meta.total_pages;
  const batch = initBatch_();
  for (page=2; page <= howMany; page++) {
    const request = endpoint.createRequest('get', {stub}, {
      query: {page}
    });
    request.addQuery(additionalQuery);
    batch.add({request});
  }

  for (const response of batch) {
    if (!response.ok) throw new Error(response.statusCode + ' http code returned');
    const json = response.json;
    const append = callback(json);
    Array.prototype.push.apply( ret, append );
  }

  return ret;
}

function getWithCursor_({endpoint, callback, stub}, additionalQuery) { 
  const ret = [];
  let sinceId = 0;
  let json;
  
  do {
    const request = endpoint.createRequest('get', {
      stub
    }, {
      query: {
        since_id: sinceId,
      }
    });
    if (additionalQuery) 
      request.addQuery(additionalQuery);
      
    const response = request.fetch();
    json = response.json;
    if (!response.ok) {
      console.log(json);
      throw new Error("http code " + response.statusCode + ". See the log for more details.");
    }

    const append = callback.call(null, json);
    Array.prototype.push.apply( ret, append );

    sinceId = (json[stub].slice(-1).pop() || {id:null}).id;

  } while (sinceId);

  return ret;  
}
