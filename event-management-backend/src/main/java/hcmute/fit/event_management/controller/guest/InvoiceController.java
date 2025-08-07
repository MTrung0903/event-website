package hcmute.fit.event_management.controller.guest;

import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.service.IBookingService;
import hcmute.fit.event_management.service.IInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/invoice")
public class InvoiceController {
    @Autowired
    IBookingService bookingService;
    @Autowired
    IInvoiceService invoiceService;
    @GetMapping("/{orderId}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable("orderId") String orderCode) {
        Booking booking = bookingService.findByBookingCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        // Sinh file PDF
        byte[] pdfBytes = invoiceService.generatePdfInvoice(booking);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition
                .attachment()
                .filename("invoice_" + orderCode + ".pdf")
                .build());
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
