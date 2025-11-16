package hcmute.fit.event_management.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    Resource load(String fileName);

    String saveFiles(MultipartFile file);
}
