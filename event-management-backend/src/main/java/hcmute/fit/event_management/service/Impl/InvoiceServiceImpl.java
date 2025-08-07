package hcmute.fit.event_management.service.Impl;

import com.itextpdf.layout.properties.UnitValue;
import hcmute.fit.event_management.entity.Booking;
import hcmute.fit.event_management.entity.BookingDetails;
import hcmute.fit.event_management.service.IInvoiceService;
import org.springframework.stereotype.Service;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Paragraph;

import java.io.ByteArrayOutputStream;

@Service
public class InvoiceServiceImpl implements IInvoiceService {
    @Override
    public byte[] generatePdfInvoice(Booking booking) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Invoice Header
        document.add(new Paragraph("INVOICE").setBold().setFontSize(16));
        document.add(new Paragraph("Order ID: " + booking.getBookingCode()));
        document.add(new Paragraph("Transaction Date: " + booking.getTransaction().getTransactionDate()));
        document.add(new Paragraph("Status: " + booking.getTransaction().getTransactionStatus()));

        document.add(new Paragraph("\n"));

        // Table with 4 columns: Ticket Name, Quantity, Unit Price, Subtotal
        float[] columnWidths = {4, 2, 2, 2};
        Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();
        table.addHeaderCell("Ticket Name");
        table.addHeaderCell("Quantity");
        table.addHeaderCell("Unit Price");
        table.addHeaderCell("Subtotal");

        for (BookingDetails bkt : booking.getBookingDetails()) {
            table.addCell(bkt.getTicket().getTicketName());
            table.addCell(String.valueOf(bkt.getQuantity()));
            table.addCell("$" + String.format("%.2f", bkt.getTicket().getPrice()));
            table.addCell("$" + String.format("%.2f", bkt.getTicket().getPrice() * bkt.getQuantity()));
        }
        document.add(table);
        document.add(new Paragraph("\nTotal Amount: $" + String.format("%.2f", booking.getTransaction().getTransactionAmount())).setBold());

        document.close();
        return out.toByteArray();
    }

}
