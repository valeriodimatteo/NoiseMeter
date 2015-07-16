/*
 *  NOISE BACKGROUND JOBS.
 */
/*
 *  deleteNoise:
 *  Deletes all noise values, to be called after processing them with getIntervalStats
 */
Parse.Cloud.job("deleteNoise", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Noise");
    query.find(
        function(results) {
            for (var i = 0; i < results.length; ++i) {
                results[i].destroy({
                    success: function(results) {
                        //alert(results.id + ": ObjectDestroyed number "+i);
                    },
                    error: function(results, error) {
                        alert("Delete Failed. Error=" + error.message);
                    }
                });
            }
        }, {
            success: function(results) {
                response.success("Noises deleted")
            },
            error: function(error) {
                // error is an instance of Parse.Error.
                response.error("Failed to delete noise");
            }
        });
 
});
 
/*
 *  getIntervalStats:
 *  Processes noise values in an interval of 10 minutes, computing and saving average and maximum value corresponsing to each room/lecture
 */
 
Parse.Cloud.job("getIntervalStats", function(request, response) {
    Parse.Cloud.useMasterKey();
 
    // Query for all noise values
    var query = new Parse.Query("Noise");
    var noiseavg = [];
    var noisemax = [];
    var count = [];
    var rooms = [];
    var i = 0;
    //alert("Object created: " + now + " " + old)
    query.each(
        function(results) {
            i++;
            //compute classrooms' avg and max
            var room = results.get("Room");
            var value = results.get("Decibel");
 
            if (!(room in count))
                count[room] = 0;
            count[room] += 1;
            if (!(room in noisemax))
                noisemax[room] = 0;
            if (value > noisemax[room])
                noisemax[room] = value;
            if (!(room in noiseavg))
                noiseavg[room] = 0;
            noiseavg[room] = noiseavg[room] + value;
 
        }, {
            success: function(results) {
                for (var key in noiseavg) {
 
                    //create new stat tuple and assign date and time values (interval = 10 minutes)
                    var NoiseIntervals = Parse.Object.extend("NoiseIntervals");
                    var stat = new NoiseIntervals();
                    var mydate = new Date();
                    date = Math.floor(mydate.setHours(0, 0, 0, 0) / 1000) - 60 * 60 * 2; //60*60*2 equals to two hours which is the offset set on new_schedule --> today is yesterday at 10pm);
                    var now = Math.floor((Math.floor(Date.now() / 1000) - date) / 60); //minutes of the day
                    var old = now - 10; //10 minues earlier -- for the interval of interest
                    stat.set("Date", date);
                    stat.set("Start", old);
                    stat.set("End", now);
 
                    var avg = noiseavg[key] / count[key];
                    var max = noisemax[key];
 
                    stat.set("Room", key);
                    stat.set("Average", avg);
                    stat.set("Max", max);
 
                    alert("TUPLE -> Room:" + stat.get("Room") + ", Avg: " + stat.get("Average") + ", Max: " + stat.get("Max") + ", Count: " + count[key]);
                    alert("Date: " + stat.get("Date") + ", Start: " + stat.get("Start") + ", End: " + stat.get("End"));
 
                    stat.save(null, {
                        success: function(stat) {
                            alert("stat object saved");
                        },
                        error: function(stat, error) {
                            alert("failed to save stat object");
                        }
                    });
 
                }
 
                response.success("Values processed and saved");
 
            },
            error: function(error) {
                // error is an instance of Parse.Error.
                response.error("Failed to process values");
            }
        }
    );
});
 
/*
 *  QUERIES ABOUT PROFESSOR
 */
 
/*
 *  Professor average score.
 *  Parameters:
 *      - name
 *      - score     (to search for just a single score column, default "")
 *      - from      (to search for score only from a certain date, default "")
 *      - until     (to search for score only until a certain date, default "")
 */
 
Parse.Cloud.job("averageProfScore", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Rating");
    query.equalTo("Professor", request.params.name);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i) {
                if (request.params.score == "")
                    sum += (results[i].get("Listening") + results[i].get("Interest") + results[i].get("Understanding")) / 3;
                else
                    sum += results[i].get(request.params.score);
            }
            alert("RESULT: " + sum / results.length);
            response.success("Professor stats computed");
        },
        error: function() {
            response.error("Professor lookup failed");
        }
    });
});
 
Parse.Cloud.define("averageProfScore", function(request, response) {
    var query = new Parse.Query("Rating");
    query.equalTo("Professor", request.params.name);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i) {
                if (request.params.score == "")
                    sum += (results[i].get("Listening") + results[i].get("Interest") + results[i].get("Understanding")) / 3;
                else
                    sum += results[i].get(request.params.score);
            }
            response.success((sum / results.length).toString());
        },
        error: function() {
            response.error("Professor lookup failed");
        }
    });
});
 
/*
 *  QUERIES ABOUT COURSE
 */
 
/*
 *  Course average score.
 *  Parameters:
 *      - name
 *      - score     (to search for just a single score column, default "")
 *      - from      (to search for score only from a certain date, default "")
 *      - until     (to search for score only until a certain date, default "")
 */
 
Parse.Cloud.job("averageCourseScore", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Rating");
    query.equalTo("Course", request.params.name);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i) {
                if (request.params.score == "")
                    sum += (results[i].get("Listening") + results[i].get("Interest") + results[i].get("Understanding")) / 3;
                else
                    sum += results[i].get(request.params.score);
            }
            alert("RESULT: " + sum / results.length)
            response.success("Course stats computed");
        },
        error: function() {
            response.error("Course lookup failed");
        }
    });
});
 
Parse.Cloud.define("averageCourseScore", function(request, response) {
    var query = new Parse.Query("Rating");
    query.equalTo("Course", request.params.name);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i) {
                if (request.params.score == "")
                    sum += (results[i].get("Listening") + results[i].get("Interest") + results[i].get("Understanding")) / 3;
                else
                    sum += results[i].get(request.params.score);
            }
            response.success((sum / results.length).toString());
        },
        error: function() {
            response.error("Course lookup failed");
        }
    });
});
 
/*
 *  QUERIES ABOUT STUDENT.
 */
 
/*
 *  Student average battery usage.
 *  Parameters:
 *      - matricula
 *      - from      (to search for values only from a certain date, default "")
 *      - until     (to search for values only until a certain date, default "")
 */
 
Parse.Cloud.job("averageBatteryUsage", function(request, response) {
    Parse.Cloud.useMasterKey();
    var query = new Parse.Query("Battery");
    query.equalTo("Matricula", request.params.matricula);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i)
                sum += results[i].get("Usage");
            alert("BATTERY:" + sum / results.length);
            response.success("battery stats computed");
        },
        error: function() {
            response.error("Student lookup failed");
        }
    });
});
 
Parse.Cloud.define("averageBatteryUsage", function(request, response) {
    var query = new Parse.Query("Battery");
    query.equalTo("Matricula", request.params.matricula);
    if (request.params.from != "") {
        var from = new Date(request.params.from);
        query.greaterThanOrEqualTo("createdAt", from);
    }
    if (request.params.until != "") {
        var until = new Date(request.params.until);
        query.lessThanOrEqualTo("createdAt", until);
    }
    query.find({
        success: function(results) {
            var sum = 0;
            for (var i = 0; i < results.length; ++i)
                sum += results[i].get("Usage");
            response.success((sum / results.length).toString());
        },
        error: function() {
            response.error("Student lookup failed");
        }
    });
});
 
						//STUDENT STATS (PRESENCE) WITH JOB
/*
	Calculating student presence using data on his enters and exits from class
	detailed description inside the job

*/
Parse.Cloud.job("calculatePresences", function(request, response) {
    Parse.Cloud.useMasterKey();
    var stud, lesson, prof;
    //var keepCycling = 1;


    /*
     -1- pick a student and course(lesson) from Student_Enter_Classroom using "wholeTable"
     -2- select all tuples matching lesson and student from table Student_Enter_Classroom using "enterSelectionQuery"
     -3- select all tuples matching lesson and student from table exit using "exitSelectionQuery"
     -4- calculate minutes student were in class during lesson
     -5- query on schedule table to obtain total minutes of the lesson(don't forget breaks)
     -6- verify if the student followed atleast 75% of the lesson in that case add 1 in table Presences in tuple that matches student && lesson
     -7- delete from Student_Enter_Classroom and from Student_Exit_Classroom tuples matching student && lesson
    */

    //while (keepCycling > 0)
    //{

    // -1- pick student name and lesson we're interested in (we just need a random student)
    var wholeTable = new Parse.Query("Student_Enter_Classroom");
    wholeTable.find({
        success: function(result) {
            if (result.length != 0) {
                stud = result[0].get("Student");
                lesson = result[0].get("Lesson");
                prof = result[0].get("Professor");

                alert("Studend:" + stud);
                alert("Lesson:" + lesson);

                // -2- select on Student_Enter_Classroom with: stud && lesson	
                var enterSelectionQuery = new Parse.Query("Student_Enter_Classroom");
                enterSelectionQuery.equalTo("Lesson", lesson);
                enterSelectionQuery.equalTo("Student", stud);
                enterSelectionQuery.ascending("timeStamp");
                enterSelectionQuery.find({
                    success: function(enterRes) {

                        // -3- select on exit with: stud && lesson	
                        var exitSelectionQuery = new Parse.Query("Student_Exit_Classroom");
                        exitSelectionQuery.equalTo("Lesson", lesson);
                        exitSelectionQuery.equalTo("Student", stud);
                        exitSelectionQuery.ascending("timeStamp");
                        exitSelectionQuery.find({
                            success: function(exitRes) {

                                //-4- calculate minutes followed
                                var follMin = 0;
                                for (var i = 0; i < enterRes.length; i++) {
                                    var diffMs = (exitRes[i].get("timeStamp") - enterRes[i].get("timeStamp"));
                                    var diffMins = Math.floor(((diffMs / 1000) / 60));

                                    follMin += diffMins;
                                }

                                // -5- obtain totMin from schedule table

                                //obtaining day of the week for the followed lesson
                                var weekday = new Array(7);
                                weekday[0] = "Sunday";
                                weekday[1] = "Monday";
                                weekday[2] = "Tuesday";
                                weekday[3] = "Wednesday";
                                weekday[4] = "Thursday";
                                weekday[5] = "Friday";
                                weekday[6] = "Saturday";

                                var selectedDay = weekday[enterRes[0].get("timeStamp").getDay()];

                                var scheduleSelectionQuery = new Parse.Query("Schedule");
                                scheduleSelectionQuery.equalTo("Lesson", lesson);
                                scheduleSelectionQuery.equalTo("Day", selectedDay);
                                scheduleSelectionQuery.find({
                                    success: function(scheduleRes) {

                                        var start = scheduleRes[0].get("Start_Time");
                                        var end = scheduleRes[0].get("End_Time");

                                        var s_temp = start.split(":");
                                        var startHrs = s_temp[0];
                                        var startMns = s_temp[1];

                                        var e_temp = end.split(":");
                                        var endHrs = e_temp[0];
                                        var endMns = e_temp[1];

                                        var hrsSub = endHrs - startHrs;
                                        var mnsSub = endMns - startMns;

                                        var totMin = hrsSub * 60 + mnsSub;

                                        //consider break done during long lessons
                                        if (totMin > 75) {
                                            totMin -= 15;
                                        }

                                        alert("studente: " + stud);
                                        alert("corso: " + lesson);


                                        alert("Followed mins: " + follMin);
                                        alert("Total Mins: " + totMin);

                                        //-6- verify in student followed atleast 75%, if so increase presences 
                                        if ((follMin * 100) / totMin >= 75) {
                                            var presenceQuery = new Parse.Query("Presences");
                                            presenceQuery.equalTo("Lesson", lesson);
                                            presenceQuery.equalTo("Student", stud);
                                            presenceQuery.find({
                                                success: function(presenceRes) {

                                                    //if there are no tuples then it's the first time stud follows lesson, create a tuple
                                                    if (presenceRes.length == 0) {
                                                        alert("No existing tuples for this stud+lesson, let's create one");
                                                        var Presence = Parse.Object.extend("Presences");
                                                        var presence = new Presence();
                                                        presence.set("Student", stud);
                                                        presence.set("Lesson", lesson);
                                                        presence.set("Professor", prof);
                                                        presence.set("Presence", 1);
                                                        presence.save(null, {
                                                            success: function(object) {
                                                                alert("object created and saved");
                                                            },
                                                            error: function(object, error) {
                                                                alert("can't save object the new object");
                                                            }
                                                        });

                                                    }

                                                    //otherwise just update presences adding 1
                                                    else {
                                                        alert("This tuple already exist, let's update it");
                                                        var obj = presenceRes[0];
                                                        var updatedPresences = obj.get("Presence") + 1;
                                                        obj.set("Presence", updatedPresences);
                                                        obj.save(null, {
                                                            success: function(object) {
                                                                alert("object successfully updated");
                                                            },
                                                            error: function(object, error) {
                                                                alert("can't update object");
                                                            }
                                                        });
                                                    }

                                                },
                                                error: function(error) {
                                                    console.log("failed");
                                                }

                                            });
                                        }

                                        //-7-  treated tuples deletion from Student_Enter_Classroom and from exit
                                        for (var k = 0; k < enterRes.length; k++) {
                                            enterRes[k].destroy({
                                                success: function(object) {
                                                    alert("Enter with student:" + stud + " and lesson: " + lesson + " successfully deleted");
                                                },
                                                error: function(object, error) {
                                                    alert("Enter with student:" + stud + " and lesson: " + lesson + " not deleted");
                                                }
                                            });
                                        }

                                        for (var s = 0; s < exitRes.length; s++) {
                                            exitRes[s].destroy({
                                                success: function(object) {
                                                    alert("Exit with student:" + stud + " and lesson: " + lesson + " successfully deleted");
                                                },
                                                error: function(object, error) {
                                                    alert("Exit with student:" + stud + " and lesson: " + lesson + " not deleted");
                                                }
                                            });
                                        }
                                    },
                                    error: function(error) {
                                        console.log("failed");
                                    }
                                });
                            },
                            error: function(error) {
                                console.log("failed");
                            }
                        });
                    },
                    error: function(error) {
                        console.log("failed");
                    }
                });

            } else {
                keepCycling = 0;
            }

        },
        error: function(error) {
            console.log("failed");
        }
    });
    // }

});

//----------------------------------------------------TEST JOB SECTION--------------------------------------------------------------------


						//STUDENT STATS: ATTENDANCE FOR A CERTAIN COURSE (WITH JOB)
 //*******************job that calculates student's course attendance***************************************************//
Parse.Cloud.job("studentCourseAttendance", function(request, status) {
    Parse.Cloud.useMasterKey();

    /*
     -1- obtaining lessons per week from table schedule
     -2- calculate number of weeks passed from semester start
     -3- retrive number of presence the student collected for that course with that professor
	
    */


    //-1- obtaining lessons per week from table schedule
    var scheduleQuery = new Parse.Query("Schedule");
    scheduleQuery.equalTo("Lesson", "Pervasive Systems ");
    scheduleQuery.equalTo("Professor", "Chatzigiannakis");

    scheduleQuery.find({
        success: function(scheduleRes) {
            var lessPerWeek = scheduleRes.length;

            //-2- calculate number of weeks passed from semester start
            var currentDate = new Date();
            alert("current date:" + currentDate);

            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


            //first semester
            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                //if i'm in the first 2 months of the year i'm counting the whole first semester
                if (currentDate < secondSemStart) {
                    var diffMs = firstSemEnd - firstSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                }

            }

            //second semester
            else {
                //take the whole second semester
                if (currentDate > secondSemEnd) {
                    var diffMs = secondSemEnd - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    //var diffMs = currentDate - secondSemStart;
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;

                }
            }

            /*alert("diffWeeks: " + diffWeeks);
            alert ("lezioni settimanali per Pervasive Systems: " +lessPerWeek );
            alert("totalLessons: " + totalLessons);*/


            //-3- retrive number of presence the student collected for that course with that professor
            var presencesQuery = new Parse.Query("Presences");
            presencesQuery.equalTo("Student", "nina");
            presencesQuery.equalTo("Professor", "Chatzigiannakis");
            presencesQuery.equalTo("Lesson", "Pervasive Systems ");
            presencesQuery.find({
                success: function(presRes) {
                    if (presRes.length != 0) {
                        var pres = presRes[0].get("Presence");
                        alert("presences: " + pres);
                    } else {
                        var pres = 0;
                    }

                    //-4- calculate percentage of lesson followed
                    if (pres != 0) {
                        var follPerc = (pres * 100) / totalLessons;
                    }

                    alert("perc: " + follPerc);


                },
                error: function() {
                    alert("could not query Presences")
                }
            });
        },
        error: function(error) {
            console.log("failed");
        }

    });
});

						//COURSE STATS: ATTENDANCE FOR A CERTAIN COURSE (WITH JOB)
 //*******************job that calculates selected course attendance****************************************************//
Parse.Cloud.job("CourseAttendance", function(request, status) {
    Parse.Cloud.useMasterKey();

    /*
     -1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start   
     -2- caluclate attendance percentage ( sum all presences and divide by #lessons*#oftuples)
    */

    //-1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
    var scheduleQuery = new Parse.Query("Schedule");
    scheduleQuery.equalTo("Lesson", "Pervasive Systems ");
    scheduleQuery.equalTo("Professor", "Chatzigiannakis");

    scheduleQuery.find({
        success: function(scheduleRes) {
            //caluclate lessons per week
            var lessPerWeek = scheduleRes.length;

            // calculate number of weeks passed from semester start
            var currentDate = new Date();
            alert("current date:" + currentDate);

            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


            //first semester
            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                //if i'm in the first 2 months of the year i'm counting the whole first semester
                if (currentDate < secondSemStart) {
                    var diffMs = firstSemEnd - firstSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                }

            }

            //second semester
            else {
                //take the whole second semester
                if (currentDate > secondSemEnd) {
                    var diffMs = secondSemEnd - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    //var diffMs = currentDate - secondSemStart;
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;

                }
            }

            /*alert("diffWeeks: " + diffWeeks);
            alert ("lezioni settimanali per Pervasive Systems: " +lessPerWeek );
            alert("totalLessons: " + totalLessons);*/


            //-2- caluclate attendance percentage ( sum all presences and divide by #lessons*#oftuples)
            var presencesQuery = new Parse.Query("Presences");
            var totPres = 0,
                cont = 0;
            presencesQuery.equalTo("Professor", "Chatzigiannakis");
            presencesQuery.equalTo("Lesson", "Pervasive Systems ");
            presencesQuery.each(
                function(res) {
                    totPres += res.get("Presence");
                    cont++;
                }, {
                    success: function() {
                        var averageAtt = totPres / ((cont) * totalLessons);
                        var numeroQuery = presencesQuery.length;

                        alert("average attendance = " + averageAtt);
                    },
                    error: function(error) {
                        // error is an instance of Parse.Error.
                        status.error("Failed to refresh table");
                    }
                });
        },
        error: function(error) {
            console.log("failed");
        }

    });
});

								//STUDENT STATS: ATTENDANCE FOR ALL FOLLOWED COURSES (WITH JOB)
//*****************************job that calculates student average attendance of a student for all courses followed**************//
Parse.Cloud.job("studentAverageAttendance", function(request, status) {
    Parse.Cloud.useMasterKey();
    /*
	 -1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
	 -2-calutlate total lessons and followed lesson for each student (tuple)
	*/


    var follLes = 0,
        summedLessons = 0,
        cont = 0; //???
    var studQuery = new Parse.Query("Presences");
    studQuery.equalTo("Student", "nina");
    studQuery.each(
        function(presRes) {
            //-1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
            var scheduleQuery = new Parse.Query("Schedule");
            scheduleQuery.equalTo("Lesson", presRes.get("Lesson"));
            scheduleQuery.equalTo("Professor", presRes.get("Professor"));

            scheduleQuery.find({

                success: function(scheduleRes) {
                    cont++;
                    //caluclate lessons per week
                    var lessPerWeek = scheduleRes.length;

                    // calculate number of weeks passed from semester start
                    var currentDate = new Date();

                    var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
                    var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
                    var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
                    var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


                    //first semester
                    if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                        //if i'm in the first 2 months of the year i'm counting the whole first semester
                        if (currentDate < secondSemStart) {
                            var diffMs = firstSemEnd - firstSemStart;
                            var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                            var totalLessons = diffWeeks * lessPerWeek;
                        } else {
                            var diffMs = currentDate - secondSemStart;
                            var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                            var totalLessons = diffWeeks * lessPerWeek;
                        }

                    }

                    //second semester
                    else {
                        //take the whole second semester
                        if (currentDate > secondSemEnd) {
                            var diffMs = secondSemEnd - secondSemStart;
                            var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                            var totalLessons = diffWeeks * lessPerWeek;
                        } else {
                            //var diffMs = currentDate - secondSemStart;
                            var diffMs = currentDate - secondSemStart;
                            var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                            var totalLessons = diffWeeks * lessPerWeek;

                        }
                    }

                    /*alert("diffWeeks: " + diffWeeks);
                    alert ("lezioni settimanali per Pervasive Systems: " +lessPerWeek );
                    alert("totalLessons: " + totalLessons);*/

                    //-2-calutlate total lessons and followed lesson for each student (tuple)
                    var dummyQuery = new Parse.Query("Presences");
                    dummyQuery.equalTo("Student", "nina");
                    dummyQuery.find({
                        success: function(dummyRes) {
                            follLes += presRes.get("Presence");
                            summedLessons += totalLessons;
                            if (cont == dummyRes.length) {
                                var resssss = follLes / summedLessons;
                                alert("final result= " + resssss);
                            }


                        },
                        error: function() {
                            response.error("The inserted classroom doesn't exist");
                        }
                    });
                },
                error: function(error) {
                    console.log("failed");
                }

            });
        }, {
            success: function(results) {},
            error: function(error) {

            }
        }
    );
});

						//PROFESSOR STATS: ATTENDANCE FOR A CERTAIN PROFESSOR'S LESSONS (WITH JOB)
 //*******************job that calculates average attendance for a professor's lessons***************************************************//
Parse.Cloud.job("professorAverageAttendance", function(request, status) {
    Parse.Cloud.useMasterKey();
    /*
  //-1- find all tuples of the given professor
    -2- for every tuple query on schedule to obtain number of lesson per week and calculate weeks passed from semester start   
	-3- keep trace of all lessons calculated till now											
	-4- when last tuple has been treated return result
	
	n.b. dummyQuery is done to keep trace of how many tuples a certain professors has
  */

    var dummyQuery = new Parse.Query("Presences");
    dummyQuery.equalTo("Professor", "Chatzigiannakis");
    dummyQuery.find({
        success: function(dummyRes) {
            //-1- find all tuples of the given professor
            var follLes = 0,
                summedLessons = 0,
                cont = 0;
            var studQuery = new Parse.Query("Presences");
            studQuery.equalTo("Professor", "Chatzigiannakis");
            studQuery.each(
                function(presRes) {

                    //-2- for every tuple query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
                    var scheduleQuery = new Parse.Query("Schedule");
                    scheduleQuery.equalTo("Lesson", presRes.get("Lesson"));
                    scheduleQuery.equalTo("Professor", presRes.get("Professor"));

                    scheduleQuery.find({
                        success: function(scheduleRes) {
                            cont++;
                            //caluclate lessons per week
                            var lessPerWeek = scheduleRes.length;

                            // calculate number of weeks passed from semester start
                            var currentDate = new Date();

                            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
                            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
                            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
                            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


                            //first semester
                            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                                //if i'm in the first 2 months of the year i'm counting the whole first semester
                                if (currentDate < secondSemStart) {
                                    var diffMs = firstSemEnd - firstSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                }

                            }

                            //second semester
                            else {
                                //take the whole second semester
                                if (currentDate > secondSemEnd) {
                                    var diffMs = secondSemEnd - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    //var diffMs = currentDate - secondSemStart;
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;

                                }
                            }

                            //-3- keep trace of all lessons calculated till now											
                            follLes += presRes.get("Presence");
                            summedLessons += totalLessons;

                            //-4- when last tuple has been treated return result		
                            if (cont == dummyRes.length) {
                                alert("Lessons per week for course: " + presRes.get("Lesson") + " : " + lessPerWeek);
                                alert("totalLessons" + summedLessons);
                                alert("seguite: " + follLes);

                                var resssss = (follLes / summedLessons) * 100;
                                alert("risultato= " + resssss);
                                //response.success(resssss.toString().substring(0,5));
                            }

                        },
                        error: function(error) {
                            console.log("failed");
                        }

                    });
                }, {
                    success: function(results) {

                    },
                    error: function(error) {

                    }
                }
            );
        },
        error: function() {
            response.error("Error finding average noise");
        }
    });
});


//----------------------------------------------------END TEST JOB SECTION---------------------------------------------------------------



						//STUDENT STATS: ATTENDANCE FOR A CERTAIN COURSE (WITH CLOUD FUNCTION)
 //****************cloud function that calculates student's course attendance********************************************//
Parse.Cloud.define("studentCourseAttendance", function(request, response) {

    /*
     -1- obtain from table schedule number of lesson per week
     -2- calculate number of weeks passed from semester start
     -3- retrive number of presence the student collected for that course
     -4- calculate percentage of lesson followed
    */
    //-1- obtaining lessons per week from table schedule
    var scheduleQuery = new Parse.Query("Schedule");
    scheduleQuery.equalTo("Lesson", request.params.lesson);
    scheduleQuery.equalTo("Professor", request.params.professor);
    scheduleQuery.find({
        success: function(scheduleRes) {
            var lessPerWeek = scheduleRes.length;

            //-2- calculate number of weeks passed from semester start
            var currentDate = new Date();
            alert("current date:" + currentDate);

            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					

            //first semester
            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                //if i'm in the first 2 months of the year i'm counting the whole first semester
                if (currentDate < secondSemStart) {
                    var diffMs = firstSemEnd - firstSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                }

            }

            //second semester
            else {
                //take the whole second semester
                if (currentDate > secondSemEnd) {
                    var diffMs = secondSemEnd - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    //var diffMs = currentDate - secondSemStart;
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;

                }
            }

            //-3- retrive number of presence the student collected for that course with that professor
            var presencesQuery = new Parse.Query("Presences");
            presencesQuery.equalTo("Student", request.params.student);
            presencesQuery.equalTo("Professor", request.params.professor);
            presencesQuery.equalTo("Lesson", request.params.lesson);
            presencesQuery.find({
                success: function(presRes) {
                    if (presRes.length != 0) {
                        var pres = presRes[0].get("Presence");
                        alert("presences: " + pres);
                    } else {
                        var pres = 0;
                    }

                    //-4- calculate percentage of lesson followed
                    if (pres != 0) {
                        var follPerc = (pres * 100) / totalLessons;
                    } else {
                        var follPerc = 0;
                    }

                    response.success(follPerc.toString());


                },
                error: function() {
                    response.error("can't retrieve attendance");
                }
            });



        },
        error: function(error) {
            console.log("failed");
        }

    });

});
						//STUDENT STATS: ATTENDANCE FOR ALL FOLLOWED COURSES (WITH CLOUD FUNCTION)
 //****************cloud function that calculates student's overall attendance******************************************//
Parse.Cloud.define("studentAverageAttendance", function(request, response) {

    /*
	    -1- query on presences to obtain al tuples for a given student
	    -2- for each tuple previously selected query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
	    -3- keep trace of all lessons calculated till now											
	    -4- when last tuple has been treated return result
	
	    n.b. dummyQuery is done to keep trace of how many tuples in presences a certain student has
	    */

    var dummyQuery = new Parse.Query("Presences");
    dummyQuery.equalTo("Student", request.params.student);
    dummyQuery.find({
        success: function(dummyRes) {

            var follLes = 0,
                summedLessons = 0,
                cont = 0;
            var studQuery = new Parse.Query("Presences");
            studQuery.equalTo("Student", request.params.student);
            studQuery.each(
                function(presRes) {

                    //-2- for each tuple previously selected query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
                    var scheduleQuery = new Parse.Query("Schedule");
                    scheduleQuery.equalTo("Lesson", presRes.get("Lesson"));
                    scheduleQuery.equalTo("Professor", presRes.get("Professor"));

                    scheduleQuery.find({
                        success: function(scheduleRes) {
                            cont++;
                            //caluclate lessons per week
                            var lessPerWeek = scheduleRes.length;

                            // calculate number of weeks passed from semester start
                            var currentDate = new Date();

                            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
                            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
                            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
                            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


                            //first semester
                            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                                //if i'm in the first 2 months of the year i'm counting the whole first semester
                                if (currentDate < secondSemStart) {
                                    var diffMs = firstSemEnd - firstSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                }

                            }

                            //second semester
                            else {
                                //take the whole second semester
                                if (currentDate > secondSemEnd) {
                                    var diffMs = secondSemEnd - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    //var diffMs = currentDate - secondSemStart;
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;

                                }
                            }
                            //-3-keep trace of all lessons calculated till now											
                            follLes += presRes.get("Presence");
                            summedLessons += totalLessons;

                            //-4- when last tuple has been treated return result
                            if (cont == dummyRes.length) {
                                var resssss = (follLes / summedLessons) * 100;
                                response.success(resssss.toString().substring(0, 5));
                            }

                        },
                        error: function(error) {
                            console.log("failed");
                        }

                    });
                }, {
                    success: function(results) {

                    },
                    error: function(error) {

                    }
                }
            );

        },
        error: function() {
            alert("dummy query failed");
        }
    });
});


						//COURSE STATS: ATTENDANCE FOR A CERTAIN COURSE (WITH CLOUD FUNCTION)
//*******************cloud function that calculates selected course average attendance********************************//
Parse.Cloud.define("courseAverageAttendance", function(request, response) {


    /*
     -1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
     -2- query on presence to obtain all tuples of the selected course(remember course is identified by course name + professor)
     -3- query on presence to obtain all tuples of the selected course(remember course is identified by course name + professor)
     -4- caluclate attendance percentage ( sum all presences and divide by #lessons*#oftuples)
    */

    //-1- query on schedule to obtain number of lesson per week and calculate weeks passed from semester start
    var scheduleQuery = new Parse.Query("Schedule");
    scheduleQuery.equalTo("Lesson", request.params.lesson);
    scheduleQuery.equalTo("Professor", request.params.professor);

    scheduleQuery.find({
        success: function(scheduleRes) {
            //caluclate lessons per week
            var lessPerWeek = scheduleRes.length;

            // calculate number of weeks passed from semester start
            var currentDate = new Date();
            alert("current date:" + currentDate);

            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


            //first semester
            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                //if i'm in the first 2 months of the year i'm counting the whole first semester
                if (currentDate < secondSemStart) {
                    var diffMs = firstSemEnd - firstSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                }

            }

            //second semester
            else {
                //take the whole second semester
                if (currentDate > secondSemEnd) {
                    var diffMs = secondSemEnd - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;
                } else {
                    //var diffMs = currentDate - secondSemStart;
                    var diffMs = currentDate - secondSemStart;
                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                    var totalLessons = diffWeeks * lessPerWeek;

                }
            }

            //-3- query on presence to obtain all tuples of the selected course(remember course is identified by course name + professor)
            var presencesQuery = new Parse.Query("Presences");
            var totPres = 0,
                cont = 0;
            presencesQuery.equalTo("Professor", request.params.professor);
            presencesQuery.equalTo("Lesson", request.params.lesson);
            presencesQuery.each(
                //-3- keep trace of total presences
                function(res) {
                    totPres += res.get("Presence");
                    cont++;
                }, {
                    //-4- caluclate attendance percentage ( sum all presences and divide by #lessons*#oftuples)
                    success: function() {
                        var averageAtt = (totPres / ((cont) * totalLessons)) * 100;
                        response.success(averageAtt.toString());

                    },
                    error: function(error) {
                        // error is an instance of Parse.Error.
                        status.error("Failed to refresh table");
                    }
                });

        },
        error: function(error) {
            console.log("failed");
        }

    });
});


						//PROFESSOR STATS: ATTENDANCE FOR A CERTAIN PROFESSOR'S LESSONS (WITH CLOUD FUNCTION)
//*******************cloud function that calculates average attendance for a professor's lessons***************************************************//
Parse.Cloud.define("professorAverageAttendance", function(request, response) {
    /*
    -1- find all tuples of the given professor
    -2- for every tuple query on schedule to obtain number of lesson per week and calculate weeks passed from semester start   
	-3- keep trace of all lessons calculated till now											
	-4- when last tuple has been treated return result
	
	n.b. dummyQuery is done to keep trace of how many tuples in presences a certain professors has
  */

    var dummyQuery = new Parse.Query("Presences");
    dummyQuery.equalTo("Professor", request.params.professor);
    dummyQuery.find({
        success: function(dummyRes) {
            //-1- find all tuples of the given professor
            var follLes = 0,
                summedLessons = 0,
                cont = 0;
            var studQuery = new Parse.Query("Presences");
            studQuery.equalTo("Professor", request.params.professor);
            studQuery.each(
                function(presRes) {

                    //-2- for every tuple query on schedule to obtain number of lesson per week and calculate weeks passed from semester start   
                    var scheduleQuery = new Parse.Query("Schedule");
                    scheduleQuery.equalTo("Lesson", presRes.get("Lesson"));
                    scheduleQuery.equalTo("Professor", presRes.get("Professor"));

                    scheduleQuery.find({
                        success: function(scheduleRes) {
                            cont++;
                            //caluclate lessons per week
                            var lessPerWeek = scheduleRes.length;

                            // calculate number of weeks passed from semester start
                            var currentDate = new Date();

                            var firstSemStart = new Date(currentDate.getFullYear(), 8, 23, 0, 0, 0, 0); //23-sett
                            var firstSemEnd = new Date(currentDate.getFullYear(), 11, 20, 0, 0, 0, 0); //20-dic
                            var secondSemStart = new Date(currentDate.getFullYear(), 1, 26, 0, 0, 0, 0); //26-feb					
                            var secondSemEnd = new Date(currentDate.getFullYear(), 5, 20, 0, 0, 0, 0); //20-jun					


                            //first semester
                            if ((currentDate < secondSemStart) || (currentDate > firstSemStart)) {
                                //if i'm in the first 2 months of the year i'm counting the whole first semester
                                if (currentDate < secondSemStart) {
                                    var diffMs = firstSemEnd - firstSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                }

                            }

                            //second semester
                            else {
                                //take the whole second semester
                                if (currentDate > secondSemEnd) {
                                    var diffMs = secondSemEnd - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;
                                } else {
                                    //var diffMs = currentDate - secondSemStart;
                                    var diffMs = currentDate - secondSemStart;
                                    var diffWeeks = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 7);
                                    var totalLessons = diffWeeks * lessPerWeek;

                                }
                            }
                            //-3- keep trace of all lessons calculated till now												
                            follLes += presRes.get("Presence");
                            summedLessons += totalLessons;

                            //-4- when last tuple has been treated return result
                            if (cont == dummyRes.length) {
                                var resssss = (follLes / summedLessons) * 100;
                                response.success(resssss.toString().substring(0, 5));

                            }

                        },
                        error: function(error) {
                            console.log("failed");
                        }

                    });
                }, {
                    success: function(results) {

                    },
                    error: function(error) {

                    }
                }
            );
        },
        error: function() {
            response.error("Error finding average noise");
        }
    });

});
