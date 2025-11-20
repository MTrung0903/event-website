package hcmute.fit.event_management.exception;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;

@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "404",
                    description = "Bad Request",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "404 Response",
                                    summary = "Handle exception when resource not found",
                                    value = """
                        {
                          "timestamp": "2025-11-19T06:07:35.321+00:00",
                          "status": 404,
                          "path": "/api/v1/users/123",
                          "error": "Not Found",
                          "message": "{data} not found"
                        }
                        """
                            )
                    )
            )
    })
    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException e, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());

        String path = request.getDescription(false).replace("uri=", "");
        errorResponse.setPath(path);

        errorResponse.setStatus(HttpStatus.NOT_FOUND.value());
        errorResponse.setError(HttpStatus.NOT_FOUND.getReasonPhrase());
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }
}
