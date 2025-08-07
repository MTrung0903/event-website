package hcmute.fit.event_management.repository;

import hcmute.fit.event_management.entity.BookingDetails;
import hcmute.fit.event_management.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("select t from Transaction t where t.referenceCode = :orderCode")
    Optional<Transaction> findByOrderCode(@Param("orderCode") String orderCode);
    // admin
    @Query(value = "SELECT COALESCE(SUM(transaction_amount)*0.03,0) FROM transaction WHERE SUBSTRING(transaction_date, 1, 6) = :yearMonth AND transaction_status = 'SUCCESSFULLY'", nativeQuery = true)
    Double getRevenueByMonth(@Param("yearMonth") String yearMonth); // Ví dụ: "202505"
    @Query("SELECT COALESCE(SUM(t.transactionAmount) * 0.03, 0) FROM Transaction t WHERE SUBSTRING(t.transactionDate, 1, 4) = CAST(:year AS string) AND t.transactionStatus = 'SUCCESSFULLY'")
    Double getRevenueByYear(@Param("year") int year);
    @Query(value = "SELECT COALESCE(SUM(transaction_amount)*0.03,0) FROM transaction WHERE transaction_status = 'SUCCESSFULLY'", nativeQuery = true)
    Double getRevenue();

    @Query("select t from Transaction t where t.booking.event.eventID = :eventId")
    List<Transaction> transactions(@Param("eventId") int eventId);


    // organizer
    @Query("SELECT COALESCE(SUM(t.transactionAmount),0) * 0.97 FROM Transaction t WHERE t.booking.event.user.userId = :userId")
    double sumRevenueByOrganizer(int userId);

    @Query("SELECT t FROM Transaction t WHERE t.booking.event.user.userId = :userId")
    List<Transaction> findByOrganizer(int userId);
    @Query("SELECT t FROM Transaction t WHERE t.booking.event.user.userId = :userId AND SUBSTRING(t.transactionDate, 1, 4) = CAST(:year AS string) AND t.transactionStatus = 'SUCCESSFULLY'")
    List<Transaction> findByOrganizerAndYear(@Param("userId") int userId, @Param("year") int year);

    @Query("SELECT COALESCE(SUM(t.transactionAmount), 0) * 0.97 FROM Transaction t WHERE t.booking.event.user.userId = :userId AND SUBSTRING(t.transactionDate, 1, 4) = CAST(:year AS string) AND t.transactionStatus = 'SUCCESSFULLY'")
    double sumRevenueByOrganizerAndYear(@Param("userId") int userId, @Param("year") int year);
    @Query("SELECT t FROM Transaction t WHERE SUBSTRING(t.transactionDate, 1, 4) = CAST(:year AS string) AND t.transactionStatus = 'SUCCESSFULLY'")
    List<Transaction> findByYear(@Param("year") int year);

    List<Transaction> findByBookingUserUserId(int userId);
}
