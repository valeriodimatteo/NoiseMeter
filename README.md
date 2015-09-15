# NoiseMeter
Android application developed for the project of the [Pervasive System elective class](http://ru1.cti.gr/~ichatz/index.php/Site/PervasiveSystems), University of La Sapienza, Rome. Spring 2015, http://cclii.dis.uniroma1.it/?q=en/msecs

[Valerio Di Matteo](https://it.linkedin.com/pub/valerio-di-matteo/a0/46a/80b/en)

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

![alt tag](http://s18.postimg.org/7jkspjpyx/Screenshot.png)

##Parse Tables
- Noise: stores the single decibel values along with matricula, classroom and also phone model (cleaned by a job every 10 minutes).
![alt tag](http://s24.postimg.org/5zpaoah1x/noise.png)

- NoiseIntervals: stores average and max decibel values, grouping the tuples of Noise every 10 minutes by classroom, and associeting them to professor and course (update by a job every 10 minutes).
![alt tag](http://s18.postimg.org/u2j9iqh4p/Immagine.png)

- Schedule: stores info about the classes calendar, with dates, times, professors, classrooms and course names.
![alt tag](http://s14.postimg.org/gvy55z9o1/Immagine.png)

- Student_Enter_Classroom: stores tuples about students entering classrooms at a given time.
![alt tag](http://s10.postimg.org/6ddpxq5dl/Immagine.png)

- Student_Exit_Classroom: stores tuples about students going out of classrooms at a given time.
![alt tag](http://s8.postimg.org/cjfuy16ud/Immagine.png)

- Presences: stores tuples about students' atendance to a given course, with number of lectures followed (updated by a job every day).
![alt tag](http://s8.postimg.org/ffyakknad/Immagine.png)

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


#Survey
Before starting developing the application, feedback from users about different functionalities was needed, that's why we made and distributed a survey to final users (Sapienza's students).
The survey not only was looking to find out what users were thinking about functionalities offered by our application, but also about functionalities offered by parallel projects carried out by other collegues.
Even if the whole survey will be avaible (file named survey.pdf in the Survey folder) we will only briefly discuss topics related to the Noise Meter application.
Before starting the developing of an Android application we were interested in how many devices would have support our software (that's what questions 3 and 4 of the survey are looking for). Survey results are presented in the following graphs.

![alt tag](http://s27.postimg.org/7cdpcvhb7/phone_population.jpg)
![alt tag](http://s9.postimg.org/sldizeq9b/android_version.jpg)


As said before in the first paragraph, battery consumption is used in order to determine if students have been using mobile phones during lessons. The first idea was to track out what kind of applications they were using.
Since those two approaches lead to the same information and app monitoring is seen as a bit too much an invasive control, we have chosen the battery usage parameter. The following graph shows how app monitoring is perceived by users. As explained in the survey.pdf document (uploaded in the Survey folder) for the majority of questions we have four different possible fixed answers: strongly disagree (ST_D), slightly disagree (SL_D), slightly agree (SL_A), strongly agree (ST_A).

![alt tag](http://s21.postimg.org/sv4q8so47/app_usage_monitoring.jpg)

From the open questions in the survey it came out that people were afraid of being registered while talking while the phone was taking enviroment noise samples, that's why half of the user population seemed to not get along very well with noise sampling. Indeed the noise treatment is done only considering a decibel value and once it has been extracted no track of the recording will be held anywhere, that's why even with an apparently high percentage of users were not very happy about noise sampling, we carried on this important feature of the app.

![alt tag](http://s27.postimg.org/s6qyxg9k3/phone_noise_monitoring.jpg)

The last important step is to find out if users want to take part of the app beta testing. The results shows that half of users are actually interested in helping this project beta testing our first release.

![alt tag](http://s1.postimg.org/lh3j7oha7/beta_testing.jpg)

For more informations about the survey and the analysis carried on it, all documents are included in the Survey folder.

