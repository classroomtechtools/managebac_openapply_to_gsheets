function downloaders_ () {
  return {
    dl_mb_main: dl_mb_main_,
    dl_mb_term_grades: dl_mb_term_grades_,
    dl_mb_academic_terms: dl_mb_academic_terms_,
    dl_mb_memberships: dl_mb_memberships_,
    dl_mb_classes: dl_mb_classes_,
    dl_mb_behavior: dl_mb_behavior_
  };
}

function dl_mb_term_grades_ ({endpoint, activeOnly=false, protectData=false}) {

  // download academic terms as we need sophisticated callback embedded within
  // TODO: get academic year to help determine grade at time of assessment
  const result = dl_mb_academic_terms_({endpoint});
  const terms = result.map( 
    ({id, starts_on, ends_on}) => ({id, starts_on, ends_on})
  );
  const termIds = terms.map( ({id}) => id );
  termIds.sort();
  const termLookup = result.reduce(
    function (acc, term) {
      acc[term.id] = term;
      return acc;
    }, {}
  );

  const classCallback = ({classes}) => {
    const ret = [];
    for (const {id, start_term_id, end_term_id, name: class_name, subject_group} of classes) {
      ret.push({id, start_term_id, end_term_id, class_name, subject_group});
    }
    return ret;
  };

  // download classes with direct call as below callback suffices
  const classes = getWithPagination_({
    endpoint,
    callback: classCallback,
    stub: 'classes'
  });

  if (!activeOnly) {
    const archivedClasses = getWithPagination_({
      endpoint,
      callback: classCallback,
      stub: 'classes'
    }, {
      archived: 'true'
    });

    // combine them
    Array.prototype.push.apply(classes, archivedClasses);
  }

  /**
   * build all of the requests we need … which is every class, every term that that class has
   * This is actually quite tricky … the start_term_id and end_term_id aren't next to each other sequentially
   * so we have to loop through a sorted term id array until end_term_id is reached. If term isn't valid 
   * for that class we'll have to adjust it
   */

  const batch = initBatch_(new Date());
  for (const klass of classes) {
    const {id: classId, start_term_id, end_term_id} = klass;

    // if no start_term_id, dunno what to do …
    if (!start_term_id) continue;

    // use this to filter out irrelevant terms
    const programme = termLookup[start_term_id].programme;

    /**
     * determine grade offseet by figuring out how many unique
     * academic terms within the same programme there are, minus 1
     */
    const academicTerms = [];
    let idx = termIds.indexOf(start_term_id);
    let thisTermId = start_term_id;
    
    while (thisTermId <= end_term_id) {
      const thisTerm = termLookup[thisTermId];
      if (thisTerm.programme === programme) {
        academicTerms.push(thisTerm.academic_year.id);
      }
      idx += 1;
      thisTermId = termIds[idx] || Number.MAX_SAFE_INTEGER;  // large int to ensure loop completes if at end
    }
    
    /**
     * grade offset is how many unique ids there are
     */
    let gradeOffset = academicTerms.filter(
      (value, index, self) => self.indexOf(value) === index
    ).length - 1;


    /**
     * Build the requests including the gradeoffsets
     */
    thisTermId = start_term_id;
    let ay = termLookup[thisTermId].academic_year.id;
    idx = termIds.indexOf(start_term_id);
    while (thisTermId <= end_term_id) {
      const termInfo = termLookup[thisTermId];
      
      // no need to bother building with this id if not even in the same program        
      if (termInfo.programme === programme) {
        if (ay !== termLookup[thisTermId].academic_year.id) {
          gradeOffset -= 1;
          ay = termLookup[thisTermId].academic_year.id;
        }

        const request = endpoint.createRequest('get', {
          stub: `classes/${classId}/assessments/term/${thisTermId}/term-grades`,
        }, {
          query: {
            include_archived_students: 'true'
          }
        }, {
          class: klass,
          term: termInfo,
          gradeOffset
        });
        batch.add({request});
      }
      idx += 1;
      thisTermId = termIds[idx] || Number.MAX_SAFE_INTEGER;  // large int to ensure loop completes if at end
    }
  }

  const callback = ({students}, classInfo, termInfo, gradeOffset) => {
    return students.map(info => {
      info.class = classInfo;
      info.term = termInfo;
      // Look for any digits inside parentheses
      // FIXME: What if the school adds parentheses into the name ... arg
      const grade = parseInt( (classInfo.class_name.match(/\(.*(\d+)\)/) || [null, 0]) [1] );
      info.grade = grade - gradeOffset;
      if (protectData) {
        protectTermGrade_(info);
      } else {
        info.term_grades.comments = strip_html_(info.term_grades.comments);
      }
      return info;
    });
  };

  const ret = [];
  for (const response of batch) {
    if (!response.ok && response.statusCode === 404) {
      continue;  // couldn't find this academic term … it happens
    }
    const json = response.json;
    if (json.meta.total_pages > 1) {
      Logger.log(`pages ${json.meta.total_pages} for ${json.meta.total_count} items!`);
    }
    Array.prototype.push.apply(ret, callback(json, response.request.class, response.request.term, response.request.gradeOffset));
  }

  return ret;
}
  
function dl_mb_academic_terms_({endpoint}) {
  const callback = ({academic_years}) => {
    const terms = [];

    for (const [programme, programObj] of Object.entries(academic_years)) {
      for (const ay of programObj.academic_years) {
        for (const term of ay.academic_terms) {
          term.programme = programme;

          // copy the object, then delete otherwise we get infinite loop
          term.academic_year = {...ay};  // copy
          delete term.academic_year.academic_terms;
          
          term.starts_on = new Date(term.starts_on);
          term.ends_on = new Date(term.ends_on);
          terms.push(term);
        }
      }
    }
    return terms;
  }

  const request = endpoint.createRequest('get', {
    stub: 'school/academic-years'
  });

  const response = request.fetch();
  const json = response.json;

  if (!response.ok) {
    Logger.log(json);
    return [];
  }

  return callback(json);
}  



function dl_mb_memberships_({endpoint}) {
 const createClassRequest = (id, idx) => {
    const req = endpoint.createRequest('get', {
      stub: 'classes/' + id
    }, {}, {
      idx,
      kind: 'class'
    });
    req.clearQuery(); // remove count
    return req;
  };

 const createUserRequest = (id, role, idx) => {
    const req = endpoint.createRequest('get', {
      stub: `${role}/` + id
    }, {}, {
      idx, 
      kind: 'user'
    });
    req.clearQuery(); // remove count
    return req;
  };

  const callback = ({memberships}) => {
    // const batch = initBatch_(new Date());
    // for (const [idx, membership] of memberships.entries()) {
    //   const {class_id, user_id, role} = membership;
    //   const classReq = createClassRequest(class_id, idx);
    //   const userReq = createUserRequest(user_id, role === 'Advisor' ? 'teachers' : 'students', idx);
    //   batch.add({request: classReq});
    //   batch.add({request: userReq});
    // }

    // for (const response of batch) { 
    //   const membership = memberships[response.request.idx];
    //   if (response.request.kind == 'class') 
    //     membership.class = response.json.class;
    //   else if (response.request.kind == 'user')
    //     membership.user = response.json.student || response.json.teacher;
    // }
    for (const membership of memberships) {
      if (protectData) protectMembership(membership);
    }
    return memberships;
  }; 

  const memberships = getWithPagination_({
    endpoint,
    callback,
    stub: 'memberships'
  });

  return memberships;
}

function dl_mb_classes_({endpoint, modifiedSince=null, activeOnly=false, protectData=false}) {
  const createTeacherRequest = (id, cIdx) => {
    const req = endpoint.createRequest('get', {
      stub: 'teachers/' + id
    }, {}, {
      cIdx
    });
    req.clearQuery(); // remove count
    return req;
  };

  const callback = ({classes}) => {
    if (Array.isArray(classes) && classes.length > 0) {
      const first = classes[0].id;
      const last = classes[classes.length-1].id;
      Logger.log(`Processing from id ${first} to ${last}`);
    }
    const batch = initBatch_(new Date());
    for (const [cIdx, klass] of classes.entries()) {
      klass.teachers_reporting = [];
      for (const teach of klass.teachers.slice(0, 2)) {  // only show top three teachers, keep it low number
        if (teach.show_on_reports) {
          const req = createTeacherRequest(teach.teacher_id, cIdx);
          batch.add({request: req});
        }
      }
    }

    for (const response of batch) {
      const klass = classes[response.request.cIdx];
      if (!klass) continue;
      const teacher = response.json.teacher;
      if (protectData) protectMBTeacher(teacher);
      klass.teachers_reporting.push(teacher);
    }

    return classes;
  };

  Logger.log('Getting current classes');
  const classes = getWithPagination_({
    endpoint,
    callback,
    stub: 'classes'
  });

  if (!activeOnly) {
    Logger.log('Getting archived classes');
    const archivedClasses = getWithPagination_({
      endpoint,
      callback,
      stub: 'classes'
    }, {
      archived: 'true'
    });

    Array.prototype.push.apply(classes, archivedClasses);
  }

  return classes;

}

function dl_mb_behavior_({endpoint, protectData=false}) {
  let count = 0;

  const callback = ({behavior_notes}) => {
    for (const note of behavior_notes) {
      count += 1;

      if ( (note.notes || '').length > 40000 )
        note.notes = note.notes.slice(0, 49900);

      // parse and parse and parse
      note.notes = `<p>${note.notes}</p>`;
      note.notes = note.notes.replace(/&nbsp;/g, ' ');
      note.notes = note.notes.replace(/<br>/g, '');
      note.notes = note.notes.replace(/&/g, 'and');
      note.notes = note.notes.replace(/<([a-zA-Z.]+@[a-zA-Z.]+)>/g, (match, group) => group);

      // cast to plain text
      let xml; 
      try {
        xml = XmlService.parse(note.notes);
      } catch (e) {
        xml = null;
      }
      if (xml !== null)
        note.notes = xml.getAllContent().map(item => item.getValue()).join(' ');
      
      note.incident_date = new Date(note.incident_time);
      note.id = count;

      if (protectData) {
        protectNote_(note);
      }
    }

    return behavior_notes;
  };

  const notes = getWithPagination_({
    endpoint,
    callback,
    stub: 'behavior/notes'
  });

  return notes;
}

function dl_mb_main_ ({endpoint, modifiedSince=null, activeOnly=false, protectData=false}) {
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
    
    if (Array.isArray(students) && students.length > 0) {
      const first = students[0].id;
      const last = students[students.length-1].id;
      Logger.log(`Processing from id ${first} to ${last}`);
    }

    const batch = initBatch_(new Date());
    for (const [sIdx, student] of students.entries()) {
      for (const parentId of student.parent_ids) {
        const request = createParentRequest(parentId, sIdx);
        batch.add({request});
      }
    }

    for (const response of batch) {
      const student = students[response.request.sIdx];
      if (!student) continue;
      if (!student.parents) student.parents = [];
      if (protectData) 
        protectMBStudent(student);
      const parent = response.json.parent;
      // respect the activeOnly option here too
      if (!activeOnly || (activeOnly && !parent.archived)) { 
        if (protectData)
          protectMBParent(parent);
        student.parents.push(parent);
      }
    }

    return students;
  };

  const mixin = {};
  if (modifiedSince)
    mixin.modified_since = modifiedSince.toISOString();
  if (activeOnly)
    mixin.archived = 0;

  const students = getWithPagination_({
    endpoint,
    callback,
    stub: 'students'
  }, mixin);

  return students;
}

function downloadOAv3_({endpoint, since_date=null, statuses=null, protectData=false, custom_fields=false}) {
  const callback = json => {
    let {students} = json;
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
    // do some sort of reporting
    if (Array.isArray(students) && students.length > 0) {
      const first = students[0].id;
      const last = students[students.length-1].id;
      Logger.log(`Processing from id ${first} to ${last}`);
    }

    // pre filter out those with statuses, if defined, by reassignment
    if (statuses !== null && statuses.length > 0) 
      students = students.filter(s => statuses.includes(s.status));

    for ( const student of (students || []) ) {
      if (!custom_fields) delete student.custom_fields;
      student.parents = [];
      for (const parent_id of (student.parent_ids || []) ) {
        const parent = parents[parent_id];
        if (protectData) {
          protectOAParent_(parent);
        }
        student.parents.push(parent || {});
      }

      if (protectData) {
        protectOAStudent_(student);
      }
    }

    return students;
  }

  if (since_date)

    return getWithCursor_({
      endpoint,
      callback, 
      stub: 'students'
    },{
      since_date
    });
  
  else

    return getWithCursor_({
      endpoint,
      callback, 
      stub: 'students'
    });
  
}

