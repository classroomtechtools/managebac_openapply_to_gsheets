function output_(json) {
  Logger.log(JSON.stringify(json, null, 2));
}

function oa_requestBuilder_(
  auth,
  stub,
  http,
  { payload = {}, query = {} } = {},
  mixin
) {
  const { clientId, clientSecret, subdomain } = auth;
  const domain = "openapply.com";
  const count = 1;
  const version = "api/v3";
  const endpoint = initWithClientIdSecret_({
    clientId,
    clientSecret,
    subdomain,
    count,
    domain,
    version,
  });
  return endpoint.createRequest(
    http,
    {
      stub,
    },
    {
      payload,
      query,
    },
    mixin
  );
}

function mb_requestBuilder_(
  auth,
  stub,
  http,
  { payload = {}, query = {} } = {}
) {
  const { token, domain, subdomain, version, count } = auth;
  const endpoint = initWithAuthToken_({
    token,
    domain,
    subdomain,
    count,
    version,
  });
  return endpoint.createRequest(
    http,
    {
      stub,
    },
    {
      payload,
      query,
    }
  );
}

function view_get_(auth, stub, query = {}) {
  const request = oa_requestBuilder_(auth, stub, "get", { query });
  const json = request.fetch().json;
  return json;
}

function parents_id_endpoint_(auth, id) {
  return view_get_(auth, `parents/${id}`);
}

function parents_endpoint_(auth) {
  return view_get_(auth, `parents`);
}

function students_id_endpoint_(auth, id, query = {}) {
  return view_get_(auth, `students/${id}`, query);
}

function students_endpoint_(auth, query = {}) {
  return view_get_(auth, `students`, query);
}

function views_() {
  return {
    students_endpoint: students_endpoint_,
    students_id_endpoint: students_id_endpoint_,
    parents_endpoint: parents_endpoint_,
    parents_id_endpoint: parents_id_endpoint_,
    oa_requestBuilder: oa_requestBuilder_,
    mb_requestBuilder: mb_requestBuilder_,
  };
}
