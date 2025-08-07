package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name ="booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private int bookingId;
    @Column(name = "total_price")
    private double totalPrice;
    @Column(name = "total_price_usd", columnDefinition = "DOUBLE DEFAULT 0")
    private double totalPriceUSD;
    @Column(name = "create_date")
    private Date createDate;
    @Column(name = "expire_date")
    private Date expireDate;
    @Column(name = "booking_status")
    private String bookingStatus;
    @Column(name = "booking_code")
    private String bookingCode;
    @Column(name = "booking_method")
    private String bookingMethod;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
    @OneToMany(mappedBy = "booking",cascade = CascadeType.ALL)
    private List<BookingDetails> bookingDetails;


    @OneToOne(mappedBy = "booking",cascade = CascadeType.ALL)
    private Transaction transaction;
}
