package uni.pervasive.noisemeter;

/**
 * Created by Valerio on 13/05/2015.
 */

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.MediaRecorder;
import android.util.Log;

import com.parse.ParseObject;

import java.io.IOException;

public class AlarmReceiver extends BroadcastReceiver {

    private static MediaRecorder mRecorder = null;
    private static final int noiseLength = 5000;        //5,000 milliseconds = 5 seconds of noise recording
    private static final String LOG_TAG = "NoiseMeter";

    @Override
    public void onReceive(Context arg0, Intent arg1) {
        Log.e(LOG_TAG, "STARTING " + MainActivity.getPhoneModel());

        if (mRecorder == null)
            mRecorder = new MediaRecorder();
        else {
            mRecorder.release();
            mRecorder = new MediaRecorder();
        }

        mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
        mRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
        mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
        mRecorder.setOutputFile("/dev/null");
        try {
            mRecorder.prepare();
        } catch (IOException e) {
            Log.e(LOG_TAG, "prepare() failed");
        }
        mRecorder.start();
        mRecorder.getMaxAmplitude();    //Initializing it, because always returns 0 the first time it's called

        //detect the value now
        android.os.Handler handler = new android.os.Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (mRecorder!=null)
                    getAmplitude();
            }
        }, noiseLength);        //noiseLength is the delay after which the value is detetcted*/
    }

    public static void stop() {
        if (mRecorder != null) {
            try {
                mRecorder.stop();
            } catch (IllegalStateException e) {
                Log.e(LOG_TAG, "stop() failed. Task wasn't recording. mRecorder released anyway.");
            }
            mRecorder.release();
            mRecorder = null;
        }
    }

    public void getAmplitude(){
        Log.e(LOG_TAG, "Getting MaxAmplitude");
        if (mRecorder != null) {
            double amplitude = mRecorder.getMaxAmplitude();
            try {
                mRecorder.stop();
            } catch (IllegalStateException e) {
                Log.e(LOG_TAG, "stop() failed. Task wasn't recording. mRecorder released anyway.");
            }
            mRecorder.release();
            mRecorder = null;
            double decibel = 20*Math.log10(amplitude/0.9);      //0.9 found by testing with other apps. Varied between 0.85 and 0.95 more or less
            sendValue((int) decibel);
        }
    }

    public void sendValue(int decibel){
       queryDB.putDecibel(MainActivity.getClassroom(), MainActivity.getMatricula(), decibel, MainActivity.getPhoneModel());
    }

}