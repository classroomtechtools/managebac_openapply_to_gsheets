/**
 * 
 * These are the functions that you can either run manually, or else set up a timer
 * 
 */



/** 
 * Retrieve student and parent information -- if ACTIVE_ONLY is true will only download non-archived students and their linked parents
 * Recommended to run this sparingly... once a week or overnight as needed
 */
function run_MB_StudentsParents_Full() {
    run_MainMB_({ isIncremental: false });
}

/**
 * Same as above, except that it only downloads any chances since the last time it was run
 * This function can be run much more frequently. It uses polling technique so that only changes are downloaded
 */
function run_MB_StudentsParents_Incremental() {
    run_MainMB_({ isIncremental: true });
}


/**
 * run_StudentsParents_MB_Full and run_StudentsParents_MB_Incremental use this
 */
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


/**
 * Downloads all the teachers
 */
function run_MB_Teachers() {
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
 * Downloads all the classes. If ACTIVE_ONLY is true will only get non archived classes
 */
function run_MB_Classes_MB() {
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

/**
 * Download all the term information
 */
function run_MB_AcademicTerms() {
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

function run_MB_Memberships() {
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

function run_MB_Behavior() {
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

function getMBTermsByDate_({ date = new Date() }) {
    const modules = MB_OA_Gsheets.modules();
    const { manageBacUpdater } = modules;

    const { dl_mb_academic_terms_for_date } = modules.downloaders;

    // here, downloader is a higher-order function, using date as a closure so can filter
    const downloader = dl_mb_academic_terms_for_date({ date });

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

function run_MB_TermGradesForDate() {
    const date = new Date(); // or replace by desired date in yyyy/MM/dd format e.g. new Date('2021/12/01')
    getMBTermsByDate_({ date });
}

/**
 * Terms IDs must be [ <int>, <str> ]
 * Where the strings are unique.
 */
function run_MB_TermGradesForTerms() {
    const term_ids = [
        [0, 'name'],  // [raw ID, name for sheet]
    ];
    const modules = MB_OA_Gsheets.modules();
    const { manageBacUpdater } = modules;
    const { dl_mb_term_grades_for_a_term } = modules.downloaders;

    for (const [term_id, name] of term_ids) {
        if (!name) throw new Error(`Specify a name for term ${term_id}`);
        const downloader = dl_mb_term_grades_for_a_term({ term_id });

        manageBacUpdater(MB_Auth, {
            id: SS_ID,
            syncKey: name,
            downloader
        }, {
            isIncremental: false,  // this endpoint doesn't have since_date or modifiedSince option
            priorityHeaders: ['id', 'name', 'program', 'class.name', 'class.grade_number'],
            protectData: PROTECT_DATA,
            useMetadata: false,
        });

    }
}

function run_MB_TermGrades() {
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

function run_MB_Attendance() {
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
            priorityHeaders: ["id", "student_id", "grade", "attendance.Present", "attendance.Absent"],
            protectData: PROTECT_DATA,
            useMetadata: false
        }
    );
}


function run_MB_ClassAttendance_byDate({ start_date = null, end_date = null } = {}) {

    const modules = MB_OA_Gsheets.modules();
    const { manageBacUpdater } = modules;
    const { dl_mb_classAttendance_bydate } = modules.downloaders;

    start_date = start_date || '2022-04-01';
    end_date = end_date || '2022-04-28';
    const synckey = `Class Attendance: ${start_date}-${end_date}`;  // need dyanmic sync key in this context

    manageBacUpdater(
        MB_Auth,
        {
            id: SS_ID,
            syncKey: synckey,
            downloader: dl_mb_classAttendance_bydate,
        },
        {
            isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
            useMetadata: false,
            priorityHeaders: ['class.uniq_id', 'student.student_id', 'student.name', 'student.grade', 'date', 'period', 'status', 'note'],
            protectData: PROTECT_DATA,
        }, {
        downloaderKeywords: {
            start_date, end_date
        }
    }
    );
}

function run_MB_HRAttendance_byDate({ start_date = null, end_date = null, year_group_ids = null } = {}) {

    const modules = MB_OA_Gsheets.modules();
    const { manageBacUpdater } = modules;
    const { dl_mb_hrAttendance_bydate } = modules.downloaders;

    year_group_ids = year_group_ids || [];
    start_date = start_date || '2022-02-01';
    end_date = end_date || '2022-02-28';
    const synckey = `HR Attendance: ${start_date}-${end_date}`;  // need dyanmic sync key in this context

    manageBacUpdater(
        MB_Auth,
        {
            id: SS_ID,
            syncKey: synckey,
            downloader: dl_mb_hrAttendance_bydate,
        },
        {
            isIncremental: false, // this endpoint doesn't have since_date or modifiedSince option
            useMetadata: false,
            priorityHeaders: ['student.id', 'student.name', 'student.grade', 'teacher.name'],
            protectData: PROTECT_DATA,
        }, {
        downloaderKeywords: {
            start_date, end_date, year_group_ids
        }
    }
    );
}


function report_HrAttendance_byDate() {
    const { reports } = MB_OA_Gsheets.modules();
    const targetTab = '<TargetTabName>';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceTab = ss.getSheetByName('<SourceTabName>');
    const values = sourceTab.getDataRange().getValues();
    const jsons = dottie.rowsToJsons(values);

    const tabbed = ['status', 'note'];
    const tabular = reports.tabular(jsons, ['student.id', 'date'], tabbed, {
        date: (dte) => new Date(dte).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }),
        'student.grade': (grade) => grade - 1
    });

    tabular.sort((a, b) => {
        const value = a.student.grade - b.student.grade;
        if (value === 0) {
            const val = a.teacher.name.localeCompare(b.teacher.name);
            if (val === 0) {
                return a.student.name.localeCompare(b.student.name);
            }
        }
        return value;
    });


    // const rows = reports.jsonsToRowsWithHeaderChange({jsons: tabular, priorityHeaders: ['student.id', 'student.name', 'student.grade', 'teacher.name'], delimiter: ' — '});
    const rows = reports.jsonsToRowsWithNestedHeaders({
        jsons: tabular,
        startingIndex: tabbed.length + 1,
        endingIndexOffset: -3,
        priorityHeaders: ['student.id', 'student.name', 'student.grade', 'class_uniq_id'],
        delimiter: ' — '
    });
    ss.getSheetByName(targetTab).getDataRange().clear()
    ss.getSheetByName(targetTab).setFrozenRows(tabbed.length);
    ss.getSheetByName(targetTab).getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}


function report_ClassAttendance_byDate() {
    const { reports } = MB_OA_Gsheets.modules();
    const targetTab = '<TargetTabName>';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sourceTab = ss.getSheetByName('<SourceTabName>');
    const values = sourceTab.getDataRange().getValues();
    const jsons = dottie.rowsToJsons(values);

    const tabbed = ['status', 'note', 'class_uniq_id'];
    const tabular = reports.tabular(jsons, ['student.id', 'date', 'period'], tabbed, {
        date: (dte) => new Date(dte).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: '2-digit'
        }),
        'student.grade': (grade) => grade - 1,
        'class_uniq_id': (_, json) => json.class.uniq_id
    });

    tabular.sort((a, b) => {
        const value = a.student.grade - b.student.grade;
        if (value === 0) {
            return a.student.name.localeCompare(b.student.name);
        }
        return value;
    });

    const rows = reports.jsonsToRowsWithNestedHeaders({
        jsons: tabular,
        startingIndex: tabbed.length,
        endingIndexOffset: -3,
        priorityHeaders: ['student.id', 'student.name', 'student.grade', 'class_uniq_id'],
        delimiter: ' — '
    }
    );
    ss.getSheetByName(targetTab).getDataRange().clear()
    ss.getSheetByName(targetTab).getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    ss.getSheetByName(targetTab).freezeRows(tabbed.length);

}
