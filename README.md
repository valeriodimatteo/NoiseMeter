# NoiseMeter
Android application for Pervasive System exam, University of La Sapienza, Rome. Spring 2015, http://cclii.dis.uniroma1.it/?q=en/msecs

Valerio Di Matteo
https://www.linkedin.com/profile/view?id=359456267-

Stefano Rosini

##General description
This applictation records noise decibel values in a classroom and sends it to a Parse database (https://www.parse.com/), along with information about user's matricula and classroom id and the level of battery consumption. It also shows statistics about users' attendance to the classes, courses' and professors' average attendance and their average rating (provided on Parse by other modules).
It is also constituted by javascript functions stored on Parse and called CloudCode, which are called either by the app itself or by the Parse DB to execute jobs on the data.

##Architecture

####App --> Parse

The mobile app communicates with the Parse DB that is stored in the cloud. It stores values there and calls ParseCloud functions to get statistic values.

The applications is constituted by 4 modules:

- MainActivity.java: this is the activity that is executed when the app is launched. It allows to enter username and classroom and start/stop the recording.

- AlarmReceiver.java: this is the activity that manages the recording, and is launched when an alarm is fired (at adaptive intervals of time, depending on the number of students in the classroom). It computes the decibel level and sends it to the DB.

- queryDB.java: it is the module that communicates with the Parse DB. It is separated to guarantee good modularity and allow to easily change the DB setup if needed, without touching the code.

- StatsActivity.java: it is the activity that allows to query Parse and show statistics based on student, course and professor.

####Parse --> App

The Parse CloudCode is called by the app and only returns final values, while the whole computation is done at server side with regular jobs or functions executed on demand.

##Parse Tables
- Noise: stores the single decibel values along with matricula, classroom and also phone model (cleaned by a job every 10 minutes).

- NoiseIntervals: stores average and max decibel values, grouping the tuples of Noise every 10 minutes by classroom, and associeting them to professor and course (update by a job every 10 minutes).

- Schedule: stores info about the classes calendar, with dates, times, professors, classrooms and course names.

- Student_Enter_Classroom: stores tuples about students entering classrooms at a given time.

- Student_Exit_Classroom: stores tuples about students going out of classrooms at a given time.

- Presences: stores tuples about students' atendance to a given course, with number of lectures followed (updated by a job every day).

##Jobs/Functions

- getIntervalStats: computes the average and maximum levels of noise every 10 minutes, grouping values by classroom with corresponding professor and course name

- deleteNoise: cleans up the Noise table every 10 minutes after values have been processed

- averageBatteryUsage: computes the average battery usage of a certain user

- averageCourseScore: computes the average rating of certain course (with possible restricted time interval or particular score type)

- averageProfScore: computes the average rating of a certain prof (with possible restricted time interval or particular score type)

- calculatePresences: checks a student's attendance to a lecture by summing up the minutes from which he/she entered to when he/she left

- studentCourseAttendance: computes a student's average attendance to a certain course

- CourseAttendance: computes the general average attendance for a certain course

- studentAverageAttendance: computes a student's general average attendance

- professorAverageAttendance: computes the average general attendance to a certain professor's courses
