function getWithPagination_({endpoint, callback, stub}) {
  const ret = [];
  let page = 1;
  let json;

  do {
    const request = endpoint.createRequest('get', {
      stub
    }, {
      query: {
        page,
      }
    });
    const response = request.fetch();
    json = response.json;
    if (!response.ok) {
      console.log(json);
      throw new Error("http code " + response.statusCode + ". See the log for more details.");
    }

    // process the json to augment the json
    const append = callback.call(null, json);

    // append to end of ret
    Array.prototype.push.apply( ret, append );

    sinceId = (json[stub].slice(-1).pop() || {id:null}).id;

    page = json.meta.current_page + 1;

  } while (page <= json.meta.total_count);

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
