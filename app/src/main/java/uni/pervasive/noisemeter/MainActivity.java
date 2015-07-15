package uni.pervasive.noisemeter;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.BatteryManager;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.view.View.OnClickListener;

import com.parse.FunctionCallback;
import com.parse.Parse;
import com.parse.ParseCloud;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Random;

import android.util.Log;

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
    private static String matricula = "1234567";               //should be received by the login module
    private static String classroom = "A7";                         //should be received by the localiation module
    private static int noiseInterval=10000;    //600,000 milliseconds = 10 minutes between each recording
    private static final int noiseLength = 5000;        //5,000 milliseconds = 5 seconds of noise recording
    private int initialBattery;
    private static String phoneModel;

    public static String getMatricula(){
        return matricula;
    }

    public static String getClassroom(){
        return classroom;
    }

    public static String getPhoneModel(){
        return phoneModel;
    }

    public static void setNoiseInterval(int n){
        noiseInterval = (n + 10)*1000;
        Log.e("NoiseMeter","New interval = "+noiseInterval/1000+" seconds");

    }

    public void startAlarm(final View view) {
        Log.e("NoiseMeter","Starting alarm, interval = " + noiseInterval/1000 + " seconds");

        btnStart.setEnabled(false);
        btnStop.setEnabled(true);

        manager = (AlarmManager)getSystemService(Context.ALARM_SERVICE);

        txtAmpli.setText("Recording");

        manager.set(0, System.currentTimeMillis(), pendingIntent);
        android.os.Handler handler = new android.os.Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                //HERE query DB and check if number of students is different. If it is, update noiseInterval from MainActivity and call editAlarm()
                if(btnStop.isEnabled()){
                    //actual query of ParseCloud
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

    public void cancelAlarm(View view) {

        btnStart.setEnabled(true);
        btnStop.setEnabled(false);

        AlarmReceiver.stop();

        //Final battery usage
        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        int batteryPct = level * 100 / scale;
        txtBattery.setText(String.valueOf(batteryPct) + "%");

        queryDB.putBattery(classroom, matricula, initialBattery, batteryPct);

        txtAmpli.setText("Stopped");

        Intent alarmIntent = new Intent(this, AlarmReceiver.class);
        pendingIntent = PendingIntent.getBroadcast(this, 0, alarmIntent, 0);
        manager = (AlarmManager)getSystemService(Context.ALARM_SERVICE);
        manager.cancel(pendingIntent);

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Enable Local Datastore.
        Parse.enableLocalDatastore(this);
        Parse.initialize(this, "gjDmHU8kCWGxlmcJP97iCfDWXrH5zxtBZRC8kDMM", "chkyio09frhtLJ5stTAdsLVCwhEsxiwd7mV6faDP");

        btnStats = (Button)findViewById(R.id.btnStats);
        btnStats.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                setContentView(R.layout.stats_activity);
            }
        });

        // Retrieve a PendingIntent that will perform a broadcast
        Intent alarmIntent = new Intent(this, AlarmReceiver.class);
        pendingIntent = PendingIntent.getBroadcast(this, 0, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        Context context = getApplicationContext();
        IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        batteryStatus = context.registerReceiver(null, ifilter);

        btnStart=(Button)findViewById(R.id.btnStart);
        btnStop=(Button)findViewById(R.id.btnStop);

        btnStop.setEnabled(false);

        txtAmpli = (TextView)findViewById(R.id.txtAmpli);
        txtBattery = (TextView)findViewById(R.id.txtBattery);

        //Initial battery usage
        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        int batteryPct = level * 100 / scale;
        initialBattery = batteryPct;
        txtBattery.setText(String.valueOf(batteryPct) + "%");

        txtMatricula = (EditText)findViewById(R.id.txtMatricula);
        txtMatricula.addTextChangedListener(new TextWatcher(){
            public void afterTextChanged(Editable s) {
                matricula = s.toString();
            }
            public void beforeTextChanged(CharSequence s, int start, int count, int after){}
            public void onTextChanged(CharSequence s, int start, int before, int count){}
        });

        txtClassroom = (EditText)findViewById(R.id.txtClassroom);
        txtClassroom.addTextChangedListener(new TextWatcher(){
            public void afterTextChanged(Editable s) {
                classroom = s.toString();
            }
            public void beforeTextChanged(CharSequence s, int start, int count, int after){}
            public void onTextChanged(CharSequence s, int start, int before, int count){}
        });

        String deviceName = android.os.Build.MODEL;
        String deviceMan = android.os.Build.MANUFACTURER;
        phoneModel = deviceMan+" "+deviceName;
    }
}