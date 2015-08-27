package uni.pervasive.noisemeter;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.parse.FunctionCallback;
import com.parse.ParseCloud;
import com.parse.ParseException;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.HashSet;

public class StudentStatsActivity extends Activity {

    //******variables*********
    Spinner courseSpinner, profSpinner;
    TextView studText;
    TextView result;
    private View v;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.student_stats);

        result = (TextView) findViewById(R.id.result);

        //pick values from viev
        studText = (TextView) findViewById(R.id.studentTextView);

        //retrieve matricula of student passed from bundle
        studText.setText(getIntent().getExtras().getString("matricula"));

        /*---Set course drop down menu---*/
        courseSpinner = (Spinner) findViewById(R.id.stud_course_spinner);
        // Create an ArrayAdapter using the string array and a default spinner layout
        final ArrayAdapter<CharSequence> courseAdapter = new ArrayAdapter(this, R.layout.simple_spinner_item);
        // Specify the layout to use when the list of choices appears
        courseAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        // Apply the adapter to the spinner
        courseSpinner.setAdapter(courseAdapter);

        /*---Set prof drop down menu---*/
        profSpinner = (Spinner) findViewById(R.id.stud_prof_spinner);
        // Create an ArrayAdapter using the string array and a default spinner layout
        final ArrayAdapter<CharSequence> profAdapter = new ArrayAdapter(this, R.layout.simple_spinner_item);
        // Specify the layout to use when the list of choices appears
        profAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        // Apply the adapter to the spinner
        profSpinner.setAdapter(profAdapter);

        profSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                result.setText("");
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        //Set listener: when clicking a course, find corresponding professor(s)
        courseSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                result.setText("");
                //retrieve selected course and use it as a query parameter for the cloud function
                profAdapter.clear();
                String course = courseSpinner.getSelectedItem().toString();
                HashMap<String, Object> params = new HashMap<String, Object>();
                params.put("course", course);

                ParseCloud.callFunctionInBackground("getAttendedCoursesProfs", params, new FunctionCallback<String>() {
                    @Override
                    public void done(String result, ParseException e) {
                        if (e == null) {
                            try {
                                JSONArray resarray = new JSONArray(result);
                                HashSet<String> elements = new HashSet<String>();
                                for (int i = 0; i < resarray.length(); i++) {
                                    elements.add(resarray.getJSONObject(i).get("Professor").toString());
                                }

                                profAdapter.addAll(elements);
                            } catch (JSONException jsone) {
                                Toast toast = Toast.makeText(getApplicationContext(), jsone.toString(), Toast.LENGTH_LONG);
                                toast.show();
                            }
                        } else {
                            Toast toast = Toast.makeText(getApplicationContext(), "Error finding professors for this course", Toast.LENGTH_LONG);
                            toast.show();
                        }
                    }
                });
                profAdapter.notifyDataSetChanged();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        //Query Parse function to find courses that have been attended
        ParseCloud.callFunctionInBackground("getAttendedCourses", new HashMap<String, Object>(), new FunctionCallback<String>() {
            @Override
            public void done(String result, ParseException e) {
                if (e == null) {
                    try {
                        JSONArray resarray = new JSONArray(result);
                        HashSet<String> elements = new HashSet<String>();
                        for (int i = 0; i < resarray.length(); i++) {
                            elements.add(resarray.getJSONObject(i).get("Lesson").toString());
                        }

                        courseAdapter.addAll(elements);
                    } catch (JSONException jsone) {

                    }
                } else {
                    Toast toast = Toast.makeText(getApplicationContext(), "Error finding courses", Toast.LENGTH_LONG);
                    toast.show();
                }
            }
        });
        courseAdapter.notifyDataSetChanged();
    }

    public void studentCourseAttendance(View v) {
        String student, lesson, professor;

        student = studText.getText().toString();

        lesson = courseSpinner.getSelectedItem().toString();
        professor = profSpinner.getSelectedItem().toString();

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("student", student);
        params.put("lesson", lesson);
        params.put("professor", professor);

        ParseCloud.callFunctionInBackground("studentCourseAttendance", params, new FunctionCallback<String>() {
            public void done(String percentage, ParseException e) {
                if (e == null) {
                    result.setText(percentage + "%");
                } else {
                    result.setText("Error");
                }
            }
        });

    }

    public void studentAverageAttendance(View v) {
        String student;

        student = studText.getText().toString();

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("student", student);


        ParseCloud.callFunctionInBackground("studentAverageAttendance", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage + "%");
                } else {
                    result.setText("Error");
                }
            }
        });

    }
}