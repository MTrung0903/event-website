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
@Table(name = "refund")
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refund_id")
    private int refundId;

    @Column(name = "request_date")
    private String requestDate;

    @Column(name = "refund_amount")
    private double refundAmount;

    @Column(name = "refund_amount_usd", columnDefinition = "DOUBLE DEFAULT 0")
    private double refundAmountUSD;

    @Column(name = "status")
    private String status;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "message")
    private String message;

    @ManyToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

}
