package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "check_in_ticket")
public class CheckInTicket {
    @Id
    @Column(name = "ticket_code")
    private String ticketCode;
    @Column(name = "status")
    private int status;
    @Column(name = "check_date")
    private LocalDateTime checkDate;
    @ManyToOne
    @JoinColumn(name = "booking_details_id")
    private BookingDetails bookingDetails;
}
