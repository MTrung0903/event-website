package hcmute.fit.event_management.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ticket")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;
    @Column(name = "ticket_name")
    private String ticketName;
    @Column(name = "ticket_type")
    private String ticketType;
    @Column(name="price")
    private double price;
    @Column(name = "quantity")
    private int quantity;
    @Column(name = "sold", columnDefinition = "INT DEFAULT 0")
    private int sold;
    @JsonFormat(pattern = "yyyy-MM-dd ", timezone = "UTC")
    @Column(name = "start_time")
    private Date startTime;
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "UTC")
    @Column(name = "end_time")
    private Date endTime;
    @ManyToOne
    @JoinColumn(name ="event_id")
    private Event event;
}
