package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.repository.EventRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class EventStatusUpdateService {
    @Autowired
    private EventRepository eventRepository;

    private static final Logger logger = LoggerFactory.getLogger(EventStatusUpdateService.class);

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void updateEventStatusOnStartup() {
        logger.info("Bắt đầu cập nhật trạng thái sự kiện khi ứng dụng khởi động...");
        updateEventStatus();
        logger.info("Hoàn tất cập nhật trạng thái sự kiện.");
    }


    public void updateEventStatus() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = today.plusDays(1).minusNanos(1);

        List<Event> events = eventRepository.findEventsForStatusUpdate(Arrays.asList("public"), endOfDay);
        List<Event> eventsToUpdate = new ArrayList<>();

        for (Event event : events) {
            if (event.getEventEnd() != null) {
                LocalDateTime eventEndDate = event.getEventEnd().withHour(0).withMinute(0).withSecond(0).withNano(0);
                if ("public".equals(event.getEventStatus()) &&
                        (eventEndDate.isBefore(today) || eventEndDate.isEqual(today))) {
                    event.setEventStatus("Complete");
                    eventsToUpdate.add(event);
                }
            }
        }

        if (!eventsToUpdate.isEmpty()) {
            eventRepository.saveAll(eventsToUpdate);
            logger.info("Đã cập nhật trạng thái {} sự kiện thành 'Complete'", eventsToUpdate.size());
        }
    }
}
