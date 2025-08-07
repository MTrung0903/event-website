package hcmute.fit.event_management.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // Upload file
    public String uploadFile(MultipartFile file) throws IOException {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            System.out.println("Upload result: " + uploadResult);
            return (String) uploadResult.get("public_id");
        } catch (Exception e) {
            System.err.println("Error uploading to Cloudinary: " + e.getMessage());
            throw new IOException("Failed to upload: " + e.getMessage());
        }
    }

    // Download file (trả về URL để client tự tải)
    @Named("getFileUrl")
    public String getFileUrl(String publicId) {
        // Determine resource type dynamically based on publicId or context
        // For simplicity, we assume the resource type is stored or can be inferred
        return cloudinary.url().secure(true).resourceType("auto").generate(publicId);
    }

    // Delete file
    public boolean deleteFile(String publicId) throws IOException {
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "auto"));
        return "ok".equals(result.get("result"));
    }

    // Lấy publicId từ URL
    public String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/");
        String fileNameWithVersion = parts[parts.length - 1]; // vd: v1234567890/sample.jpg
        return fileNameWithVersion.substring(fileNameWithVersion.indexOf("/") + 1).split("\\.")[0]; // Lấy "sample"
    }
}