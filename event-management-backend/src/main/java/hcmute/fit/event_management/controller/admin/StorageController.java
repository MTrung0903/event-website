package hcmute.fit.event_management.controller.admin;

import hcmute.fit.event_management.service.FileService;
import hcmute.fit.event_management.service.Impl.CloudinaryServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    @Autowired
    private CloudinaryServiceImpl cloudinaryServiceImpl;
    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String publicId = cloudinaryServiceImpl.uploadFile(file);
        return ResponseEntity.ok(publicId);
    }

    @GetMapping("/download/{publicId}")
    public ResponseEntity<String> getFileUrl(@PathVariable String publicId) {
        String fileUrl = cloudinaryServiceImpl.getFileUrl(publicId);
        return ResponseEntity.ok(fileUrl);
    }

    @DeleteMapping("/delete/{publicId}")
    public ResponseEntity<String> deleteFile(@PathVariable String publicId) throws IOException {
        boolean deleted = cloudinaryServiceImpl.deleteFile(publicId);
        if (deleted) {
            return ResponseEntity.ok("File deleted: " + publicId);
        } else {
            return ResponseEntity.status(404).body("File not found: " + publicId);
        }
    }

    @GetMapping("/view/{publicId:.+}")
    public ResponseEntity<String> viewImage(@PathVariable String publicId) {
        try {
            String fileUrl = cloudinaryServiceImpl.getFileUrl(publicId);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve file URL: " + e.getMessage());
        }
    }
}