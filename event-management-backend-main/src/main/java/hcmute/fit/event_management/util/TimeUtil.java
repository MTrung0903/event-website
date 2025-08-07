package hcmute.fit.event_management.util;

import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class TimeUtil {

    public static Time parseTime(String timeStr) throws ParseException {
        // Định dạng của thời gian đầu vào
        SimpleDateFormat formatter = new SimpleDateFormat("hh:mm a");

        // Parse từ String thành java.util.Date
        java.util.Date utilDate = formatter.parse(timeStr.trim());

        // Chuyển từ java.util.Date thành java.sql.Time
        return new Time(utilDate.getTime());
    }

}
