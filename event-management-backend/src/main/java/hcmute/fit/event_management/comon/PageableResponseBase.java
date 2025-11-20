package hcmute.fit.event_management.comon;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class PageableResponseBase {
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private Long totalElements;
}
