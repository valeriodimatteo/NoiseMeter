package uni.pervasive.noisemeter;

/**
 * Created by Valerio on 13/05/2015.
 *
 * Alarm Receiver activity that handles the recording.
 */

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.MediaRecorder;
import android.util.Log;

import java.io.IOException;

public class AlarmReceiver extends BroadcastReceiver {

    private static MediaRecorder mRecorder = null;
    private static final int noiseLength = 5000;        //recording length in milliseconds
    private static final String LOG_TAG = "NoiseMeter";

    //alarm receiver: instructions to be executed as the alarm fires
    @Override
    public void onReceive(Context arg0, Intent arg1) {
        Log.e(LOG_TAG, "STARTING " + MainActivity.getPhoneModel());

        //set a mediarecorder
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

        //start the recording
        mRecorder.start();
        //Initialize the result, because it always returns 0 the first time it's called
        mRecorder.getMaxAmplitude();

        //detect the value now
        android.os.Handler handler = new android.os.Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (mRecorder!=null)
                    getAmplitude();
            }
        }, noiseLength);        //noiseLength is the delay after which the value is detected
    }

    //function to be called when the recording is stopped
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

    //function that computes the decibel after the recording is finished
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

            //Compute decibels
            //0.9 factor found by testing with other apps
            //Varied between 0.85 and 0.95 more or less
            double decibel = 20*Math.log10(amplitude/0.9);
            sendValue((int) decibel);   //send value to Parse
        }
    }

    public void sendValue(int decibel){
       queryDB.putDecibel(MainActivity.getClassroom(), MainActivity.getMatricula(), decibel, MainActivity.getPhoneModel());
    }

}