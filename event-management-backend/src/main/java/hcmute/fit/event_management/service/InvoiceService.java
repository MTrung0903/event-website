package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Booking;

public interface InvoiceService {
    byte[] generatePdfInvoice(Booking booking);
}
