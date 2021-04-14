function initBatch_(lastExecutionDate) {
  return new Endpoints.batch(200, lastExecutionDate, false);
}

function initWithClientIdSecret_({clientId, clientSecret, domain, subdomain, count=100}) {
  const version='api/v3';

  const module = Endpoints.module();
  const base = `https://${subdomain}.${domain}/`;
  const oauth = new module({
    baseUrl: base + "${stub}",
  });
  const oauthEndpoint = oauth.createRequest('post', {
    stub: 'oauth/token'
  }, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Utilities.base64Encode(clientId + ':' + clientSecret),
    },
    payload: {
      "grant_type": "client_credentials"
    }
  });
  const resp = oauthEndpoint.fetch();
  json = oauthEndpoint.fetch().json;

  if (!resp.ok) throw new Error(JSON.stringify(json, null, 2));
  const token = json.access_token;

  return initWithBearerToken_({token, subdomain, count, domain, version});
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

