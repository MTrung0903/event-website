package hcmute.fit.event_management.service;

import hcmute.fit.event_management.dto.CheckoutDTO;

public interface IBuyFreeTicket {

    void buyFreeTicket(CheckoutDTO checkoutDTO, String bookingCode);
}
