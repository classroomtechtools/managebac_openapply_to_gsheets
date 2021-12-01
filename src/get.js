function collections_() {
  return {
    getWithPagination: getWithPagination_
  }
}

function getWithPagination_(
  { endpoint, callback = null, stub },
  additionalQuery = {}
) {
  if (callback == null)
    throw new Error("no callback defined");

  let page = 1;

  /**
   * Let's use a trick: We can get the first one and see how many pages we'll
   * need, then just build that many pages
   */

  const firstRequest = endpoint.createRequest(
    "get",
    { stub },
    {
      query: { page },
    }
  );
  if (additionalQuery) firstRequest.addQuery(additionalQuery);

  const firstResponse = firstRequest.fetch();
  const firstJson = firstResponse.json;
  if (!firstResponse.ok) {
    throw new Error(
      "Status " + firstResponse.statusCode + ": " + firstJson.error
    );
  }

  const ret = callback(firstJson);

  // openapply and managebac have different keys for this
  const howMany = firstJson.meta.total_pages || firstJson.meta.pages;
  const batch = initBatch_(new Date(), {rateLimit: 50});
  for (page = 2; page <= howMany; page++) {
    const request = endpoint.createRequest(
      "get",
      { stub },
      {
        query: { page },
      }, {
        page
      }
    );
    request.addQuery(additionalQuery);
    batch.add({ request });
  }

  for (const response of batch) {
    if (!response.ok) {
      Logger.log(response.text);
      throw new Error(response.statusCode + " http code returned");
    }
    const {url} = response.request.getParams();
    Logger.log(url);
    const json = response.json;
    const append = callback(json);
    Array.prototype.push.apply(ret, append);
  }

  return ret;
}

function getWithCursor_({ endpoint, callback, stub }, additionalQuery) {
  const ret = [];
  let sinceId = 0;
  let json;

  do {
    const request = endpoint.createRequest(
      "get",
      {
        stub,
      },
      {
        query: {
          since_id: sinceId,
        },
      }
    );
    if (additionalQuery) request.addQuery(additionalQuery);

    let response = request.fetch();
    let iterations = 1;
    while (!response.ok) {
      // cursor endpoint with oa seems just a touch finicky, this seems to work
      // but may just time out after execution complete
      // TODO: better backing off alg
      const sleep = 1000 * 5 * iterations;
      Logger.log(
        `Encountered ${response.statusCode} ... sleeping for ${
          sleep / 1000
        } seconds and trying again`
      );
      Utilities.sleep(sleep);
      response = request.fetch();
      iterations += 1;
    }
    json = response.json;

    const append = callback.call(null, json);
    Array.prototype.push.apply(ret, append);

    sinceId = (json[stub].slice(-1).pop() || { id: null }).id;
  } while (sinceId);

  return ret;
}
