/**
 * The following two functions interact with an endpoint where only latest can be retrieved
 *  so two wrapper functions are provided that just calls the third core function
 */

 const cachingOkay = true;

 function run_FullMainMB() {
   run_MainMB_({ isIncremental: false });
 }
 
 function run_IncrementalMainMB() {
   run_MainMB_({ isIncremental: true });
 }
 
 function run_MainMB_({ isIncremental }) {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_main } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_main,
       downloader: dl_mb_main,
     },
     {
       isIncremental,
       priorityHeaders: [
         "id",
         "student_id",
         "first_name",
         "last_name",
         "class_grade",
         "email",
       ],
       activeOnly: ACTIVE_ONLY,
       protectData: PROTECT_DATA,
     }
   );
 }
 
 function run_Teachers_MB() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_teachers } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_teachers,
       downloader: dl_mb_teachers,
     },
     {
       isIncremental: false, // not yet implemented
       useMetadata: false, // not yet implemented
 
       activeOnly: true,  // true for only archived teachers
       priorityHeaders: [
         "id",
         "last_name",
         "first_name",
         "email",
         "role"
       ],
       protectData: false,
       cnDomain: false
     }
   );
 }
 
 /**
  *
  */
 function run_Classes_MB() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_classes } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_classes,
       downloader: dl_mb_classes,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       useMetadata: true,
       activeOnly: ACTIVE_ONLY,
       priorityHeaders: [
         "id",
         "uniq_id",
         "name",
         "grade",
         "program_code",
         "subject_group",
       ],
       protectData: PROTECT_DATA,
     }
   );
 }
 
 function runMBAcademicTerms() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_academic_terms } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_academic_terms,
       downloader: dl_mb_academic_terms,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ["id", "name", "programme"],
       protectData: PROTECT_DATA,
     }
   );
 }
 
 function runMBmemberships() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_memberships } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_memberships,
       downloader: dl_mb_memberships,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ["id"],
       protectData: PROTECT_DATA,
       useMetadata: false // too much info at this endpoint to justify using metadata 
     }
   );
 }
 
 function runMBBehavior() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_behavior } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_behavior,
       downloader: dl_mb_behavior,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ["id", "student_id"],
       protectData: PROTECT_DATA,
       sortCallback: (a, b) => a.student_id - b.student_id,
     }
   );
 }
 
 function getMBTermsByDate_ ({date=new Date()}) { 
   const modules = MB_OA_Gsheets.modules();
   const {manageBacUpdater} = modules;
 
   const {dl_mb_academic_terms_for_date} = modules.downloaders;
 
   // here, downloader is a higher-order function, using date as a closure so can filter
   const downloader = dl_mb_academic_terms_for_date({date});
 
   manageBacUpdater(MB_Auth, {
     id: SS_ID, 
     syncKey: SYNC_KEYS.mb_current_terms,
     downloader
   }, {
     isIncremental: false,  // this endpoint doesn't have since_date or modifiedSince option
     priorityHeaders: ['id', 'program', 'name', 'starts_on', 'ends_on'],
     protectData: false,  // no option to protect this data,
     useMetadata: false
   });
 }
 
 function runMBTermGradesForDate() {
   const date = new Date(); // or replace by desired date in yyyy/MM/dd format e.g. new Date('2021/12/01')
   getMBTermsByDate_({date});
 }
 
 /**
  * Terms IDs must be [ <int>, <str> ]
  * Where the strings are unique.
  */
 function runMBTermGradesForTerm() {
   const term_ids = [
     [0, 'name'],  // [raw ID, name for sheet]
   ];
   const modules = MB_OA_Gsheets.modules();
   const {manageBacUpdater} = modules;
   const {dl_mb_term_grades_for_a_term} = modules.downloaders;
 
   for (const [term_id, name] of term_ids) {
     if (!name) throw new Error(`Specify a name for term ${term_id}`);
     const downloader = dl_mb_term_grades_for_a_term({term_id});
     
     manageBacUpdater(MB_Auth, {
       id: SS_ID, 
       syncKey: `term_grades ${term_id}`,
       downloader
     }, {
       isIncremental: false,  // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ['id', 'name', 'program', 'class.name', 'class.grade_number'],
       protectData: PROTECT_DATA,
       useMetadata: false,
     });
   
   }
 }
 
 function runMBTermGrades() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_term_grades } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_termgrades,
       downloader: dl_mb_term_grades,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ["id", "name", "program"],
       protectData: PROTECT_DATA,
     }
   );
 }
 
 function runMBAttendance() {
   const modules = MB_OA_Gsheets.modules();
   const { manageBacUpdater } = modules.orchestrators;
   const { dl_mb_attendance } = modules.downloaders;
 
   manageBacUpdater(
     MB_Auth,
     {
       id: SS_ID,
       syncKey: SYNC_KEYS.mb_attendance,
       downloader: dl_mb_attendance,
     },
     {
       isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
       priorityHeaders: ["id", "student_id", "grade"],
       protectData: PROTECT_DATA,
     }
   );
 }
 