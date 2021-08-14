function run_Full_Main_OA() {
  run_Main_OA_({ isIncremental: false });
}

function run_Incremental_Main_OA() {
  run_Main_OA_({ isIncremental: true });
}

function run_Main_OA_({ isIncremental }) {
  const modules = MB_OA_Gsheets.modules();
  const { openApplyUpdater } = modules.orchestrators;
    
  openApplyUpdater(
    OA_Auth,
    {
      id: SS_ID,
      syncKey: SYNC_KEYS.oa_main,
    },
    {
      isIncremental,

      // set this value in Global.gs
      protectData: PROTECT_DATA,

      // optionally, you can ask it to download the forms (same as "custom_fields") by specifying a list of fields
      // for example:
      // includeCustomFields: ['parent_guardian', 'emergency_contact', 'health_information']
      // (... warning that including many custom fields may result in very large amount of info
      includeCustomFields: [],

      // optionally define which statuses to download, and will only display those
      // for example statuses: ['withdrawn', 'graduated']
      // for example statuses: ['enrolled'] 
      // if you have tabbedStatues to true, they will appear in tabs intead of one sheet
      statuses: ['enrolled'],

      // if you are looking to download a very large dataset, for example with all the custom_fields, 
      // you can turn off the developer metadata magic
      useMetadata: true

    }
  );
}

function one_student_with_id() {
  const openapply_id = 0; // <-- enter valid ID for your domain here
  const { views } = MB_OA_Gsheets.modules();
  const { students_id_endpoint } = views;
  const result = students_id_endpoint(OA_Auth, openapply_id);
  if (result.error) throw new Error(result.error + " id: " + openapply_id);

  const { student } = result;
  const { first_name, last_name, id } = student;
  Logger.log(`${id}: ${first_name} ${last_name}`);

  // display whatever you need, perhaps the names of all the custom fields?
  const custom_fields_headers = Object.keys(student.custom_fields);
  Logger.log(custom_fields_headers);
}

function one_parent_with_id() {
  const openapply_id = 0; // <-- enter valid ID for your domain here
  const { views } = MB_OA_Gsheets.modules();
  const { parents_id_endpoint } = views;

  const result = parents_id_endpoint(OA_Auth, openapply_id);
  if (result.error) throw new Error(result.error + " id: " + openapply_id);

  const { parent } = result;
  Logger.log(parent);
}

function one_student_at_students() {
  const { students_endpoint } = MB_OA_Gsheets.modules().views;
  const result = students_endpoint(OA_Auth);

  Logger.log(result);
}

function one_parent_at_parents() {
  const { parents_endpoint } = MB_OA_Gsheets.modules().views;
  const result = parents_endpoint(OA_Auth);

  Logger.log(result);
}
