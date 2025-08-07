package hcmute.fit.event_management.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface IFileService {

    Resource load(String fileName);

    String saveFiles(MultipartFile file);
}
