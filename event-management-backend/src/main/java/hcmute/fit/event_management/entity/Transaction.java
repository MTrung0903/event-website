package hcmute.fit.event_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "transaction")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private int transactionId;
    @Column(name ="payment_method")
    private String paymentMethod;
    @Column(name = "transaction_date")
    private String transactionDate;
    @Column(name = "transaction_amount")
    private double transactionAmount;
    @Column(name = "transaction_amount_usd", columnDefinition = "DOUBLE DEFAULT 0")
    private double transactionAmountUSD;
    @Column(name ="transaction_no")
    private String transactionNo;
    @Column(name = "transaction_status")
    private String transactionStatus;
    @Column(name = "reference_code")
    private String referenceCode;
    @Column(name = "transaction_info")
    private String transactionInfo;
    @Column(name = "transaction_message")
    private String message;
    @OneToOne
    @JoinColumn
    private Booking booking;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL)
    private List<Refund> refunds;
}
