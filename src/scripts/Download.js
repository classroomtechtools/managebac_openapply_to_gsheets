function downloadMBv2_(endpoint) {
  const createParentRequest = (id, sIdx) => {
    const req = endpoint.createRequest('get', {
      stub: 'parents/' + id
    }, {}, {
      sIdx
    });
    req.clearQuery(); // remove count
    return req;
  };

  const callback = ({students}) => {
    const batch = Endpoints.batch();
    students.forEach( (student, sIdx) => {
      student.parent_ids.forEach(parent_id => {
        const request = createParentRequest(parent_id, sIdx);
        batch.add({request});
      });
    });
    batch.fetchAll().forEach( response => {
      const student = students[response.request.sIdx];
      if (!student) return;
      if (!student.parents) student.parents = [];
      student.parents.push(response.json);
    });

    return students;
  };

  const students = getWithPagination_({
    endpoint,
    callback,
    stub: 'students'
  });

  return students;
}

function downloadOAv3_(endpoint) {
  // define callback
  const callback = json => {
    const {students} = json;
    const initial = Object.create(null);

    // create parents lookup so we can ref by ids
    // some work with || is here to future-proof for corner cases
    const parents = (
      ( json || {linked: {parents: []}} ).linked || {parents: []}
    ).parents.reduce(
      function (acc, parent) {
        const {id} = parent;
        acc[id] = parent;
        return acc;
      }, initial
    );

    // augment
    (students || []).forEach(student => {
      student.parents = [];
      (student.parent_ids || []).forEach(parent_id => {
        student.parents.push(parents[parent_id] || {});
      });
    });

    return students;
  }

  const students = getWithCursor_({
    endpoint,
    callback,
    stub: 'students'
  });

  return students;
}
