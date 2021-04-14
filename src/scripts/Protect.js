const faker = Faker.module(); // in case needed below
const makeFake = (obj, prop, func, ...params) => {
  if (obj[prop] === undefined) return;
  obj[prop] = func.apply(null, params);
}

function protectCommonParent_ (parent) {
  // gender is not throughout
  makeFake(parent, 'first_name', faker.name.firstName,);
  makeFake(parent, 'middle_name', faker.name.middleName);
  makeFake(parent, 'last_name', faker.name.lastName);
  makeFake(parent, 'preferred_name', () => parent.first_name);
  makeFake(parent, 'other_name', () => parent.first_name);
  makeFake(parent, 'email', faker.internet.email);
  makeFake(parent, 'city', faker.address.city);
  makeFake(parent, 'country', faker.address.country);
  makeFake(parent, 'state', faker.address.state);
}

function protectMBParent_ (parent) {
  protectCommonParent_(parent);
  makeFake(parent, 'birthday', faker.date.recent);
  makeFake(parent, 'employer', faker.date.recent);
  makeFake(parent, 'gender', faker.name.gender);
  for (const lang of parent.languages) {
    makeFake(lang, faker.address.country);
  }
}

function protectOAParent_ (parent) {
  protectCommonParent_(parent);
  makeFake(parent, 'address', faker.address.streetAddress);
  makeFake(parent, 'address_ii', faker.address.secondaryAddress);
  makeFake(parent, 'first_name', faker.name.firstName);
  makeFake(parent, 'preferred_name', () => parent.first_name);
  makeFake(parent, 'other_name', () => parent.first_name);
  makeFake(parent, 'last_name', faker.name.lastName);
  makeFake(parent, 'email', faker.internet.email);
  makeFake(parent, 'city', faker.address.city);
  makeFake(parent, 'country', faker.address.country);
  makeFake(parent, 'name', () => `${parent.first_name} ${parent.last_name}`);
  makeFake(parent, 'nationality', faker.address.country);
  makeFake(parent, 'state', faker.address.state);
  for (const prop of ['mobile_phone', 'phone']) {
    makeFake(parent, prop, 
      () => faker.phone.phoneNumber( (parent[prop] || '').replace(/[0-9]/g, "#") )
    );
  }
  makeFake(parent, 'postal_code', faker.address.zipCode);
}

function protectCommonStudent_ (student) {
  makeFake(student, 'student_id', faker.datatype.number);
  makeFake(student, 'gender', faker.name.gender);
  makeFake(student, 'first_name', faker.name.firstName, student.gender);
  makeFake(student, 'middle_name', faker.name.middleName, student.gender);
  makeFake(student, 'last_name', faker.name.lastName);
  makeFake(student, 'preferred_name', () => student.first_name);
  makeFake(student, 'other_name', () => student.first_name);
  makeFake(student, 'email', faker.internet.email);
  makeFake(student, 'city', faker.address.city);
  makeFake(student, 'country', faker.address.country);
  makeFake(student, 'state', faker.address.state);
}

function protectOAStudent_ (student) {
  protectCommonStudent_(student);
  makeFake(student, 'custom_id', () => student.student_id);
  makeFake(student, 'address', faker.address.streetAddress);
  makeFake(student, 'address_ii', faker.address.secondaryAddress);
  makeFake(student, 'postal_code', faker.address.zipCode);

  makeFake(student, 'name', () => `${student.first_name} ${student.last_name}`);
  makeFake(student, 'birth_date', faker.date.recent);
  makeFake(student, 'enrolled_at', faker.date.recent);
  makeFake(student, 'enrolled_date', () => student.enrolled_at);
  makeFake(student, 'enrollment_year', 
    () => Utilities.formatDate(student.enrolled_at, "GMT", 'YYYY'
  ));
  makeFake(student, 'full_address', () => faker.address.streetAddress(true));  // full address
  makeFake(student, 'inquired_at', faker.date.recent);
  makeFake(student, 'inquired_date', () => student.inquired_at),
  makeFake(student, 'nationality', faker.address.country);
  makeFake(student, 'passport_id', faker.datatype.number);
  makeFake(student, 'profile_photo', faker.internet.url);
}

function protectMBStudent_ (student) {
  protectCommonStudent_(student);
  makeFake(student, 'street_address', faker.address.streetAddress);
  makeFake(student, 'street_address_ii', faker.address.secondaryAddress);
  makeFake(student, 'zipcode', faker.address.zipCode);
  makeFake(student, 'attendance_start_date', faker.date.recent);
  makeFake(student, 'birthday', faker.date.recent);
  makeFake(student, 'created_at', faker.date.recent);
  makeFake(student, 'graduating_year', () => Utilities.formatDate(faker.date.soon(), 'UTC', 'YYYY'));
  makeFake(student, 'last_accessed_at', faker.date.recent);
  for (const prop of ['mobile_phone_number', 'phone_number']) {
    makeFake(student, prop, 
      () => faker.phone.phoneNumber( (student[prop] || '').replace(/[0-9]/g, "#") )
    );
  }
  makeFake(student, 'photo_url', faker.internet.url);
  for (const nationality of student.nationalities) {
    makeFake(nationality, faker.address.country);
  }
}


function protectMBTeacher_ (teacher) {
  makeFake(teacher, 'first_name', faker.name.firstName,);
  makeFake(teacher, 'middle_name', faker.name.middleName);
  makeFake(teacher, 'last_name', faker.name.lastName);
  makeFake(teacher, 'preferred_name', () => teacher.first_name);
  makeFake(teacher, 'other_name', () => teacher.first_name);
  makeFake(teacher, 'email', faker.internet.email);
  makeFake(teacher, 'city', faker.address.city);
  makeFake(teacher, 'country', faker.address.country);
  makeFake(teacher, 'state', faker.address.state);
  for (const language of teacher.languages) {
    makeFake(language, faker.address.country);
  }
  for (const nationality of teacher.nationalities) {
    makeFake(nationality, faker.address.country);
  }
  for (const prop of ['mobile_phone_number', 'phone_number']) {
    makeFake(teacher, prop, 
      () => faker.phone.phoneNumber( (teacher[prop] || '').replace(/[0-9]/g, "#") )
    );
  }
  makeFake(teacher, 'photo_url', faker.internet.url);
}

function protectNote_(note) {
  makeFake(note, 'notes', faker.lorem.paragraph);
  makeFake(note, 'incident_date', faker.date.recent);
  makeFake(note, 'incident_time', faker.date.recent);
  makeFake(note, 'email', faker.internet.email);
  makeFake(note, 'first_name', faker.name.firstName);
  makeFake(note, 'last_name', faker.name.lastName);
  makeFake(note, 'reported_by', () => faker.fake("{{name.firstName}} {{name.lastName}}"));
  makeFake(note, 'homeroom_advisor', () => faker.fake("{{name.firstName}} {{name.lastName}}"));
  makeFake(note, 'preferred_name', faker.name.firstName);
}

const stable_names_ = new Map();
function protectTermGrade_ (obj) {
  const {name: real_name} = obj;
  if (stable_names_.has(real_name)) {
    obj.name = stable_names_.get(real_name);
  } else {
    makeFake(obj, 'name', () => faker.fake("{{name.firstName}} {{name.lastName}}"));
    stable_names_.set(real_name, obj.name);  // remember
  }
  makeFake(obj.term_grade, 'comments', faker.lorem.paragraph);
}

function protectMembership_ (membership) {
  makeFake(membership, 'user_email', fake.internet.email); 
}

