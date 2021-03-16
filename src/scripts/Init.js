function initBatch_(lastExecutionDate) {
  return new Endpoints.batch(200, lastExecutionDate);
}

function initWithClientIdSecret_({clientId, secret, subdomain, count=100}) {
  // use Urlfetch
  // get bearer
  return initWithBearerToken_({token, subdomain, count});
}

function initWithBearerToken_({token, subdomain, count=100, domain, version}) {
  const module = Endpoints.module();
  const base = `https://${subdomain}.${domain}/${version}/`;
  return new module({
    baseUrl: base + "${stub}",
  }, {
    stickyHeaders: {
      "Authorization": `Bearer ${token}`
    },
    stickyQuery: {
      count
    }
  });
}

function initWithAuthToken_({token, subdomain, count=100, domain, version}) {
  const module = Endpoints.module();
  const base = `https://${subdomain}.${domain}/${version}/`;
  return new module({
    baseUrl: base + "${stub}",
  }, {
    stickyHeaders: {
      "auth-token": token
    },
    stickyQuery: {
      per_page: count
    }
  });
}


