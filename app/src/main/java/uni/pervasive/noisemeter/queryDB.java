package uni.pervasive.noisemeter;

import com.parse.ParseObject;

/**
 * Created by Valerio on 15/05/2015.
 */
public class queryDB {

    public static void putBattery(String classroom, String matricula, int initialBattery, int batteryPct){
        ParseObject noise = new ParseObject("Battery");
        noise.put("Room",classroom);
        noise.put("Matricula", matricula);
        noise.put("Usage", initialBattery - batteryPct);
        noise.saveEventually();
    }

    public static void putDecibel(String classroom, String matricula, int decibel, String model){
        ParseObject noise = new ParseObject("Noise");
        noise.put("Room",classroom);
        noise.put("Matricula", matricula);
        noise.put("Decibel", decibel);
        noise.put("Model",model);
        noise.saveEventually();           //sends object to the Noise db in Parse
    }

    public static void putTemperature(String classroom, String matricula, int temperature){
        ParseObject noise = new ParseObject("Temperature");
        noise.put("Room",classroom);
        noise.put("Matricula", matricula);
        noise.put("Degrees", temperature);
        noise.saveEventually();
    }
}