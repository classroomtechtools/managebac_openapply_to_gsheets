# Practical example with OpenApply

The solution demonstrated below provides an example of an extended setup useful for Admissions officers. 

The default setup is where a spreadsheet holds student information in OpenApply, with linked parents in the same row, with each column representing a field. See the default setup file for more information.

The extensions to this default are the following:

- There are custom fields in the OA database for each student that includes an array of emergency contact information, including name and phone number details. The user wishes this information to be shown on the spreadsheet, but you're not sure of the exact name of the data.

- There are additional fields on the parents that ae not included in the default, especially the `email` field. In addition, parents have a nationality data point in custom fields which would like to be displayed as well. Again, you are not certain of the exact name of the data.

- Finally, there is allergy information, which is in the health information area. You need to identify the exact path for that information as well.

- You only need current students to be displayed.


## Research

By using the helper functions inside `OpenApply.gs`, which are called `one_student_with_id`, `one_parent_with_id`, `one_student_at_students`, and `one_parent_at_parents`, you can see the exact names of the custom fields. For example, from using the front end you know that parents' nationalities are stored, but you are not certain how it is structued, and thus not sure how to derive the dot notation.

You run `one_parent_at_parents` function and get back a long result, summarized here:

```js
{
  "parents": [
    {
      "id": ...,
      ...
      "custom_fields": {
        ...
        "nationality": "Anonymous Country",
        ...
      }
    }
  ]
}
```

Now you are sure that the dot notation should be `custom_fields.nationality`. 

The same process applies to the student information we seek. You run `one_student_at_students` (which can have a very large output for some schools):

```js
"students": [
    {
      "id": 1,
      "custom_fields": {
        ...,
        "emergency_contact": [
          {
            "last_name": "Last Name",
            "first_name": "First Name",
            ...
            "mobile_number": "+2322242"
          },
          ...
        ]
      }
    }
}
```

Now you are sure that the dot notation for the contact phone number should be `emergency_contact[0].mobile_number`, which will get the first one. Subsequent numbers can be grabbed with `[1]` and so on.

You continue in this vein, similiarly for the other data points you need.

## Final result

The below example gets us to the final result in your `OpenApply.gs` area.

```js
function run_Full_Main_OA() {
  run_Main_OA_({isIncremental: false});
}

function run_Incremental_Main_OA() {
  run_Main_OA_({isIncremental: true});
}

function run_Main_OA_({isIncremental}) {
  const {openApplyUpdater} = MB_OA_Gsheets.module();
  
  openApplyUpdater(OA_Auth, {
    id: SS_ID,
    syncKey: 'key'
  }, {
    isIncremental,
    activeOnly: true,
    protectData: true,
    includeParentFields: ['email', 'custom_fields.nationality'],
    includeCustomFields: [
      'emergency_contact[0].last_name', 'emergency_contact[0].first_name', 'emergency_contact[0].phone',
      'emergency_contact[1].last_name', 'emergency_contact[1].first_name', 'emergency_contact[1].phone',
      'health_information[0].health_allergies_description'

    ],
    priorityHeaders: ['enrolled_date', 'withdrawn_date', 'graduated_date', 'status', 'custom_id', 'last_name', 'first_name', 'grade', 'gender', 'preferred_name', 'birth_date', 'parents[0].last_name', 'parents[0].first_name', 'parents[0].phone_number', 'parents[0].email', 'parents[0].nationality', 'parents[1].last_name', 'parents[1].first_name', 'parents[1].phone_number', 'parents[1].email', 'parents[1].nationality', 'country', 'nationality', 'custom_fields.emergency_contact[0].last_name', 'custom_fields.emergency_contact[0].first_name', 'custom_fields.emergency_contact[0].phone', 'custom_fields.emergency_contact[1].last_name', 'custom_fields.emergency_contact[1].last_name', 'custom_fields.emergency_contact[1].phone', 'health_information[0].health_allergies_description', 'custom_fields.medication', 'email', 'address_i', ]
  });
}
```

You can now run the full function once, and run the incremental one subsequently, and will update accordingly.

When students have exited the school and their status field turns to `withdrawn`, simply hide the row (or filter out).