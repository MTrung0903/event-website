package hcmute.fit.event_management.service;

import hcmute.fit.event_management.entity.Booking;

public interface IInvoiceService {
    byte[] generatePdfInvoice(Booking booking);
}
