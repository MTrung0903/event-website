package hcmute.fit.event_management.controller.customer;

import hcmute.fit.event_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import payload.Response;

@RestController
@RequestMapping("api/user/v1")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<Response> getAllUsers(@RequestParam(required = false) String keyword,
                                                @RequestParam(required = false) String sort,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getPageableUser(keyword, sort, page, size));
    }

}
