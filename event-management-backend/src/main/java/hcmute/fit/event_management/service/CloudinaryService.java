package hcmute.fit.event_management.service;

import org.mapstruct.Named;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CloudinaryService {
    // Upload file
    String uploadFile(MultipartFile file) throws IOException;

    // Download file (trả về URL để client tự tải)
    @Named("getFileUrl")
    String getFileUrl(String publicId);

    // Delete file
    boolean deleteFile(String publicId) throws IOException;

    // Lấy publicId từ URL
    String extractPublicIdFromUrl(String url);
}
