package hcmute.fit.event_management.dto.responses;

import hcmute.fit.event_management.comon.PageableResponseBase;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserPageableResponse extends PageableResponseBase implements Serializable {
    private List<UserResponse> users;
}
