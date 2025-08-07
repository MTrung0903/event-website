package hcmute.fit.event_management.controller.guest;


import hcmute.fit.event_management.config.PayPalConfig;
import hcmute.fit.event_management.dto.CheckoutDTO;
import hcmute.fit.event_management.dto.TransactionDTO;

import hcmute.fit.event_management.entity.*;

import hcmute.fit.event_management.service.*;

import hcmute.fit.event_management.service.Impl.MomoService;
import hcmute.fit.event_management.service.Impl.PayPalService;
import hcmute.fit.event_management.service.Impl.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import payload.Response;

import java.io.IOException;
import java.util.*;


@RestController
@RequestMapping("/api/v1/payment")
public class CheckoutController {
    @Autowired
    ITransactionService transactionService;

    @Autowired
    private VNPAYService vnPayService;

    @Autowired
    private MomoService momoService;

    @Autowired
    IBuyFreeTicket buyFreeTicket;
    @Autowired
    private PayPalService payPalService;

    @Autowired
    PayPalConfig payPalConfig;

    @PostMapping("/create-vnpay")
    public ResponseEntity<?> createPaymentWithVNPAY(HttpServletRequest request, @RequestBody CheckoutDTO checkoutDTO) {
        try {
            String paymentUrl = vnPayService.createPaymentUrl(request, checkoutDTO);
            return ResponseEntity.ok(Collections.singletonMap("paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create payment");
        }
    }

    @GetMapping("/vnpay-ipn")
    public void vnpayIPN(HttpServletRequest request) throws Exception {
        vnPayService.ipn(request);
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws Exception {
        response.sendRedirect("http://localhost:3000/payment-result?orderCode=" + request.getParameter("vnp_TxnRef"));
    }

    @PostMapping("/create-momo")
    public ResponseEntity<?> createPaymentWithMomo(@RequestBody CheckoutDTO checkoutDTO) {
        return momoService.createQRCode(checkoutDTO);
    }

    @PostMapping("/momo-ipn")
    public void momoIPN(@RequestBody Map<String, String> payload) throws Exception {
        System.out.println(payload);
        momoService.ipn(payload);
    }

    @GetMapping("/momo-return")
    public void momoReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        response.sendRedirect("http://localhost:3000/payment-result?orderCode=" + params.get("transId"));
    }

    @GetMapping("/status/{orderCode}")
    public ResponseEntity<?> checkStatus(@PathVariable("orderCode") String orderCode) {
        Optional<Transaction> transactionOpt = transactionService.findByOrderCode(orderCode);
        TransactionDTO transactionDTO = new TransactionDTO();
        if (transactionOpt.isPresent()) {
            Transaction transaction = transactionOpt.get();
            BeanUtils.copyProperties(transaction, transactionDTO);
        }
        return new ResponseEntity<>(transactionDTO, HttpStatus.OK);
    }

    @PostMapping("/free-ticket")
    public ResponseEntity<?> buyFreeTicket(@RequestBody CheckoutDTO checkoutDTO) throws IOException {
        String bookingCode = String.valueOf(System.currentTimeMillis());
        buyFreeTicket.buyFreeTicket(checkoutDTO, bookingCode);
        Response response = new Response(1, "Payment successfully", bookingCode);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/paypal/pay")
    public ResponseEntity<Map<String, String>> payment(@RequestBody CheckoutDTO checkoutDTO) {
        try {
            Map<String, Object> response = payPalService.createPayment(checkoutDTO, "USD", payPalConfig.getCancelUrl(),payPalConfig.getSuccessUrl() );
            Object linksObj = response.get("links");
            if (linksObj instanceof Iterable) {
                for (Map<String, Object> link : (Iterable<Map<String, Object>>) linksObj) {
                    if ("approve".equals(link.get("rel"))) {
                        return ResponseEntity.ok(Collections.singletonMap("paymentUrl", (String) link.get("href")));
                    }
                }
            }
            return ResponseEntity.ok(Collections.singletonMap("paymentUrl", "/"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Collections.singletonMap("error", "Could not create payment: " + e.getMessage()));
        }
    }

    @GetMapping("/paypal/success")
    public void success(@RequestParam("token") String orderCode, HttpServletResponse response) {
        try {
            payPalService.success(orderCode, response);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GetMapping("/paypal/cancel")
    public ResponseEntity<Map<String, String>> cancel() {
        return ResponseEntity.ok(Collections.singletonMap("message", "Payment cancelled"));
    }
}
