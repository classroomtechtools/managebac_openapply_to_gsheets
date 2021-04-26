# Data Connector for Google Data Studio

Using this repo, you can turn your spreadsheet into a data connector.

## How

### Enrollment information

<img src="https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/assets/gender.png" alt="Breakdown by gender" width="25%" align="right"/>

By making the spreadsheet and a specific tab a data sourcce, you can get derive charts, tables, graphs, you name it. 

At right is OpenApply information filtered by `status=enrolled` (with actual numbers covered over), shaped into a pivot table so that it reports a breakdown by gender.

The row dimensions are the `grade` column, and the column dimensions are gender. The grades are sorted with a new calculated field created in the data source itself.

That's just getting started though; you could also expose any data points in the custom fields.

### Historical grades

<img src="https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/assets/averagegrades.png" alt="Average Grades" />

If you have a tab full of historical grades, you can use Data Studio to derive aggregate data to identify patterns in time.

Above is a heatmap of average grades, per term. Darker red means higher average grades (which are covered up to preserve anonymity), and lighter colors indicate lower average grades. In this way, you can visualize which subjects seem to have lower or higher grades over time.

The row dimensions are the `class.subject_group` field and the column dimensions are the `term.name` column.

### Individual student grades

<img src="https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/assets/gradesbysubject.png" alt="Grades by subject" />

<img src="https://github.com/classroomtechtools/managebac_openapply_to_gsheets/blob/main/assets/gradepercentage.png" alt="Grade percentage" align="right" width="25%"/>

Data Studio allows controls to be created on a graph, so that the end user can select particular details.

For the graph above, a particular student and two subject groups are chosen: Science and Maths.

At right is the same selection displayed as a percentage of grades.

These graphs were created by downloading the `term_grades` endpoint. In addition to the raw information extracted from that endpoint, it also augments it with relevant and useful data.

Notice, for example, that the graph above includes **During Grade**, which lets you know what grade the student was in at the time of taking that class.



## Setup

The basic idea here is that you can use the downloaded spreadsheet as a data connector to Google Data Studio. 

The way Data Studio works is that you point it to a spreadsheet and tab, and then it can parse the data. There are a few requirements, for example the headers must be unique, which this library ensures.





