function auths_() {
  return {
    initWithClientIdSecret: initWithClientIdSecret_,
  };
}

function initCachedModule_(base = {}, options = {}) {
  const store =
    STORE.store ||
    new bmCrusher.CrusherPluginCacheService().init({
      store: CacheService.getUserCache(),
    });
  const module = Endpoints.module();
  return new module(base, options, {
    store,
  });
}

function initModule_(base = {}, options = {}) {
  const module = Endpoints.module();
  return new module(base, options);
}

function initBatch_(lastExecutionDate, { rateLimit = 50 } = {}) {
  const batch = new Endpoints.batch(rateLimit, lastExecutionDate, false);
  batch.setVerbosity(3);
  return batch;
}

function initWithClientIdSecret_({
  clientId,
  clientSecret,
  domain,
  subdomain,
  count = 100,
}) {
  const version = "api/v3";
  const module = Endpoints.module();
  const base = `https://${subdomain}.${domain}/`;
  const oauth = new module({
    baseUrl: base + "${stub}",
  });

  // tell me what's happening!
  oauth.setVerbosity(3);

  const oauthEndpoint = oauth.createRequest(
    "POST",
    {
      stub: "oauth/token",
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Utilities.base64Encode(clientId + ":" + clientSecret),
      },
      payload: {
        grant_type: "client_credentials",
      },
    }
  );
  const resp = oauthEndpoint.fetch();
  if (!resp.ok) throw new Error(resp.text);

  json = resp.json;

  const token = json.access_token;

  return initWithBearerToken_({ token, subdomain, count, domain, version });
}

function initWithBearerToken_({
  token,
  subdomain,
  count = 100,
  domain,
  version,
}) {
  const base = `https://${subdomain}.${domain}/${version}/`;
  const endpoint = initModule_(
    {
      baseUrl: base + "${stub}",
    },
    {
      stickyHeaders: {
        Authorization: `Bearer ${token}`,
      },
      stickyQuery: {
        count,
      },
    }
  );
  endpoint.setVerbosity(3);
  return endpoint;
}

function initWithAuthToken_({
  token,
  subdomain,
  count = 100,
  domain,
  version,
}) {
  const base = `https://${subdomain}.${domain}/${version}/`;
  const endpoint = initModule_(
    {
      baseUrl: base + "${stub}",
    },
    {
      stickyHeaders: {
        "auth-token": token,
      },
      stickyQuery: {
        per_page: count,
      },
    }
  );
  endpoint.setVerbosity(3);
  return endpoint;
}
