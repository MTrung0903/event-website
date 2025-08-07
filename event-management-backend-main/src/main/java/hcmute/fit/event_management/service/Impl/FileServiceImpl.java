package hcmute.fit.event_management.service.Impl;

import hcmute.fit.event_management.service.IFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Service
public class FileServiceImpl implements IFileService {

    @Value("${upload.path}")
    private String uploadPath;
    private Path path;


    @Override
    public Resource load(String fileName) {
        try {
            // Gọi init() để đảm bảo path được khởi tạo trước khi sử dụng
            if (path == null) {
                init();
            }
            Path file = path.resolve(fileName);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (Exception e) {
            System.out.println("Error load file " + e.getMessage());
            return null;
        }
    }
    @Override
    public String saveFiles(MultipartFile file) {
        try {
            init();
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) return null;

            Path targetPath = path.resolve(originalFileName);
            String fileName = originalFileName;
            String name = fileName;
            String extension = "";

            int dotIndex = fileName.lastIndexOf(".");
            if (dotIndex != -1) {
                name = fileName.substring(0, dotIndex);
                extension = fileName.substring(dotIndex);
            }

            int index = 1;
            while (Files.exists(targetPath)) {
                fileName = name + "(" + index + ")" + extension;
                targetPath = path.resolve(fileName);
                index++;
            }

            Files.copy(file.getInputStream(), targetPath);
            return fileName;

        } catch (Exception e) {
            System.out.println("Error save file: " + e.getMessage());
            return null;
        }
    }


    private void init() {
        try {
            path = Paths.get(uploadPath);
            System.out.println("Upload path: " + path);  // Log để kiểm tra giá trị path
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (Exception e) {
            System.out.println("Error create root folder " + e.getMessage());
        }
    }


}
