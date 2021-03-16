function getWithPagination_({endpoint, callback, stub}) {
  const ret = [];
  let page = 1;
  let json;

  /**
   * Let's use a trick: We can get the first one and see how many pages we'll
   * need, then just build that many pages
   */

  const firstRequest = endpoint.createRequest('get', {stub}, {
    query: {page}
  });

  const firstResponse = firstRequest.fetch();
  const firstJson = firstResponse.json;
  if (!firstResponse.ok) {
    throw new Error('Status ' + firstResponse.statusCode);
  }
  const howMany = firstJson.meta.total_pages;
  const batch = initBatch_();
  let count = 0;
  for (page=2; page <= howMany; page++) {
    const request = endpoint.createRequest('get', {stub}, {
      query: {page}
    });
    batch.add({request});
    count += 1;
  }

  for (const response of batch) {
    if (!response.ok) throw new Error(response.statusCode + ' http code returned');
    const json = response.json;
    const append = callback.call(null, json);
    Array.prototype.push.apply( ret, append );
  }

  return ret;
}

function getWithCursor_({endpoint, callback, stub}) {
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
