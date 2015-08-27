package uni.pervasive.noisemeter;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.BatteryManager;
import android.os.Bundle;
import android.support.v4.widget.DrawerLayout;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;

import com.parse.FunctionCallback;
import com.parse.Parse;
import com.parse.ParseCloud;

import java.util.HashMap;

public class MainActivity extends Activity {

    private PendingIntent pendingIntent;
    private AlarmManager manager;

    private Intent batteryStatus;
    private Button btnStats;
    private Button btnStart;
    private Button btnStop;
    private TextView txtBattery;
    private TextView txtAmpli;
    private EditText txtMatricula;
    private EditText txtClassroom;
    private static String matricula = "1234567";    //should be received by the login module
    private static String classroom = "A7";         //should be received by the localiation module
    private static int noiseInterval = 10000;         //interval (ms) between each recording
    private int initialBattery;
    private static String phoneModel;

    private String[] mOptions;
    private DrawerLayout mDrawerLayout;
    private ListView mDrawerList;

    public static String getMatricula() {
        return matricula;
    }

    public static String getClassroom() {
        return classroom;
    }

    public static String getPhoneModel() {
        return phoneModel;
    }

    //function to change interval between recordings, to be called after each of them and depending
    // on number of students in the classroom (query to Parse)
    public static void setNoiseInterval(int n) {
        noiseInterval = (n + 10) * 1000;
        Log.e("NoiseMeter", "New interval = " + noiseInterval / 1000 + " seconds");

    }

    //function that manages the "alarm" that fires the recording activity
    public void startAlarm(final View view) {
        Log.e("NoiseMeter", "Starting alarm, interval = " + noiseInterval / 1000 + " seconds");

        btnStart.setEnabled(false);
        btnStart.setBackgroundColor(Color.DKGRAY);
        btnStop.setEnabled(true);
        btnStop.setBackgroundColor(Color.parseColor("#ff050fcd"));

        manager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        txtAmpli.setText("Recording");

        //manager starts the activity immediately
        manager.set(0, System.currentTimeMillis(), pendingIntent);
        android.os.Handler handler = new android.os.Handler();

        //intrsuctions to be executed after time equal to noiseInterval,
        //to start a new recording if needed
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                //query DB for the number of students in the classroom and start a new recording
                // with a new time interval that depends on query result
                if (btnStop.isEnabled()) {
                    HashMap<String, Object> params = new HashMap<String, Object>();
                    params.put("getClassroom", classroom);
                    ParseCloud.callFunctionInBackground("getStudentsNumber", params, new FunctionCallback<Integer>() {
                        @Override
                        public void done(Integer number, com.parse.ParseException e) {
                            if (e == null) {
                                setNoiseInterval(number);
                                startAlarm(view);
                            }
                        }
                    });
                }
            }
        }, noiseInterval);
    }

    //function to be called when the recording activity is stopped
    public void cancelAlarm(View view) {

        btnStart.setEnabled(true);
        btnStart.setBackgroundColor(Color.parseColor("#ff050fcd"));
        btnStop.setEnabled(false);
        btnStop.setBackgroundColor(Color.DKGRAY);

        AlarmReceiver.stop();

        //Final battery usage
        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        int batteryPct = level * 100 / scale;
        txtBattery.setText(String.valueOf(batteryPct) + "%");

        //save battery value
        queryDB.putBattery(classroom, matricula, initialBattery, batteryPct);

        txtAmpli.setText("Stopped");

        //Cancel intent
        Intent alarmIntent = new Intent(this, AlarmReceiver.class);
        pendingIntent = PendingIntent.getBroadcast(this, 0, alarmIntent, 0);
        manager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        manager.cancel(pendingIntent);

    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Enable Local Datastore.
        Parse.enableLocalDatastore(this);
        Parse.initialize(this, "gjDmHU8kCWGxlmcJP97iCfDWXrH5zxtBZRC8kDMM", "chkyio09frhtLJ5stTAdsLVCwhEsxiwd7mV6faDP");

        mOptions = getResources().getStringArray(R.array.options_array);
        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        mDrawerList = (ListView) findViewById(R.id.left_drawer);

        // Set the adapter for the list view
        mDrawerList.setAdapter(new ArrayAdapter<String>(this,
                R.layout.drawer_list_item, mOptions));
        // Set the list's click listener
        mDrawerList.setOnItemClickListener(new DrawerItemClickListener());

        // Retrieve a PendingIntent that will perform a broadcast
        Intent alarmIntent = new Intent(this, AlarmReceiver.class);
        pendingIntent = PendingIntent.getBroadcast(this, 0, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        Context context = getApplicationContext();
        IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        batteryStatus = context.registerReceiver(null, ifilter);

        btnStart = (Button) findViewById(R.id.btnStart);
        btnStop = (Button) findViewById(R.id.btnStop);

        btnStop.setEnabled(false);
        btnStop.setBackgroundColor(Color.DKGRAY);

        txtAmpli = (TextView) findViewById(R.id.txtAmpli);
        txtBattery = (TextView) findViewById(R.id.txtBattery);

        //Initial battery usage
        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        int batteryPct = level * 100 / scale;
        initialBattery = batteryPct;
        txtBattery.setText(String.valueOf(batteryPct) + "%");

        //temporary variable that sets the matricula
        //should be managed by the log-in module
        txtMatricula = (EditText) findViewById(R.id.txtMatricula);
        txtMatricula.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                txtMatricula.setText("");
            }
        });
        txtMatricula.addTextChangedListener(new TextWatcher() {
            public void afterTextChanged(Editable s) {
                matricula = s.toString();
            }

            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }
        });

        //temporary variable that sets the classroom
        //should be managed by the beacon detection module
        txtClassroom = (EditText) findViewById(R.id.txtClassroom);
        txtClassroom.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                txtClassroom.setText("");
            }
        });
        txtClassroom.addTextChangedListener(new TextWatcher() {
            public void afterTextChanged(Editable s) {
                classroom = s.toString();
            }

            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }
        });

        //sve device name and module
        String deviceName = android.os.Build.MODEL;
        String deviceMan = android.os.Build.MANUFACTURER;
        phoneModel = deviceMan + " " + deviceName;
    }

    //Activity for stats visualization
    public void startStatsActivity(View v) {
        Intent myIntent = new Intent(v.getContext(), StudentStatsActivity.class);
        startActivity(myIntent);
    }

    private class DrawerItemClickListener implements android.widget.AdapterView.OnItemClickListener {
        @Override
        public void onItemClick(AdapterView parent, View view, int position, long id) {
            selectItem(position);
        }
    }

    private void selectItem(int position) {
        Intent myIntent;
        mDrawerLayout.closeDrawer(mDrawerList);

        switch (position) {
            case 0:
                myIntent = new Intent(getApplicationContext(), StudentStatsActivity.class);
                myIntent.putExtra("matricula", matricula);
                startActivity(myIntent);
                break;
            case 1:
                myIntent = new Intent(getApplicationContext(), ProfessorStatsActivity.class);
                startActivity(myIntent);
                break;
            case 2:
                myIntent = new Intent(getApplicationContext(), CourseStatsActivity.class);
                startActivity(myIntent);
                break;
            default:
                break;
        }
    }

}