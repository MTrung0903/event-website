package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.dto.TransactionDTO;
import hcmute.fit.event_management.entity.Event;
import hcmute.fit.event_management.entity.Transaction;
import hcmute.fit.event_management.service.ITransactionService;
import hcmute.fit.event_management.service.Impl.PayPalService;
import hcmute.fit.event_management.service.Impl.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payload.Response;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/refund")
public class RefundController {
    @Autowired
    ITransactionService transactionService;
    @Autowired
    private VNPAYService vnPayService;

    @Autowired
    PayPalService payPalService;

    @GetMapping("/valid/{refCode}")
    public ResponseEntity<?> valid(@PathVariable("refCode") String refCode) {
        Response response;
        Transaction transaction = transactionService.findByOrderCode(refCode).orElse(new Transaction());
        if (transaction.getTransactionStatus().equals("REFUNDED")) {
            response = new Response(0,"This transaction has been refunded", null);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        Event event = transaction.getBooking().getEvent();
        if (event.getRefunds().equals("no")) {
            response = new Response(0,"This event does not allow refund", null);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = event.getEventStart();
        int validityDays = event.getValidityDays();
        LocalDateTime deadline = startTime.minusDays(validityDays);
        if (!now.isBefore(deadline)) {
            response = new Response(0,"Over permitted time limit for refund", null);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        response = new Response(1,"Valid", null);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @PostMapping("/{refCode}")
    public ResponseEntity<?> refund(HttpServletRequest request, @PathVariable("refCode") String refCode) throws Exception {
        Transaction transaction = transactionService.findByOrderCode(refCode).orElse(new Transaction());
        TransactionDTO transactionDTO = new TransactionDTO();
        BeanUtils.copyProperties(transaction, transactionDTO);

        if (transaction.getPaymentMethod().equals("VNPAY")) {
            return vnPayService.refund(request, transaction);
        }
        else {
            return payPalService.refundPayment(transaction);
        }
    }
}
