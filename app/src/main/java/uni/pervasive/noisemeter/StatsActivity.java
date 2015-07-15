package uni.pervasive.noisemeter;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import com.parse.*;
import java.util.HashMap;

public class StatsActivity extends Activity {

    //******variables*********
    EditText studText,classText,professorText;
    TextView result;
    private View v;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stats);
    }

    public void studentCourseAttendance(View v){
        String student,lesson,professor;

        //pick values from view
        studText = (EditText) findViewById(R.id.studentEditText);
        classText = (EditText) findViewById(R.id.lessonEditText);
        professorText = (EditText) findViewById(R.id.professorEditText);

        student = studText.getText().toString();
        lesson = classText.getText().toString();
        professor = professorText.getText().toString();

        result = (TextView) findViewById(R.id.result);

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("student", student);
        params.put("lesson", lesson);
        params.put("professor", professor);

        ParseCloud.callFunctionInBackground("sCa", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage+ "%");
                } else {
                    result.setText("Error");
                }
            }
        });


    }

    public void studentAverageAttendance(View v){
        String student;

        studText = (EditText) findViewById(R.id.studentEditText);
        student = studText.getText().toString();
        result = (TextView) findViewById(R.id.result);


        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("student", student);


        ParseCloud.callFunctionInBackground("sAa", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage+ "%");
                } else {
                    result.setText("Error");
                }
            }
        });

    }

    public void courseAverageAttendance(View v){
        String lesson,professor;

        //pick values from view
        classText = (EditText) findViewById(R.id.lessonEditText);
        professorText = (EditText) findViewById(R.id.professorEditText);

        lesson = classText.getText().toString();
        professor = professorText.getText().toString();

        result = (TextView) findViewById(R.id.result);

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("lesson", lesson);
        params.put("professor", professor);

        ParseCloud.callFunctionInBackground("cAa", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage+ "%");
                } else {
                    result.setText("Error");
                }
            }
        });
    }

    public void professorAverageAttendance(View v){

        String professor;

        //pick values from view
        professorText = (EditText) findViewById(R.id.professorEditText);
        professor = professorText.getText().toString();

        result = (TextView) findViewById(R.id.result);

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("professor", professor);

        ParseCloud.callFunctionInBackground("pAa", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage + "%");
                } else {
                    result.setText("Error");
                }
            }
        });

    }

    public void professorAverageRating(View v){

        String professor;

        //pick values from view
        professorText = (EditText) findViewById(R.id.professorEditText);
        professor = professorText.getText().toString();

        result = (TextView) findViewById(R.id.result);

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("name", professor);
        params.put("until","");
        params.put("from","");
        params.put("score","");

        ParseCloud.callFunctionInBackground("averageProfScore", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage);
                } else {
                    result.setText("Error");
                }
            }
        });
    }

    public void courseAverageRating(View v){
        String course;

        //pick values from view
        classText = (EditText) findViewById(R.id.lessonEditText);
        course = classText.getText().toString();

        result = (TextView) findViewById(R.id.result);

        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("name", course);
        params.put("until","");
        params.put("from","");
        params.put("score","");

        ParseCloud.callFunctionInBackground("averageCourseScore", params, new FunctionCallback<String>() {
            public void done(String percentage, com.parse.ParseException e) {
                if (e == null) {
                    result.setText(percentage);
                } else {
                    result.setText("Error");
                }
            }
        });
    }









}
