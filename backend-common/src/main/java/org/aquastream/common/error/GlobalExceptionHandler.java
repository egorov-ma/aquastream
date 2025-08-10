package org.aquastream.common.error;

import org.aquastream.common.domain.DomainConstants;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ProblemDetails> handleApiException(ApiException ex, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatus());
        ProblemDetails body = baseProblem(request, status);
        body.setTitle(status.getReasonPhrase());
        body.setDetail(ex.getMessage());
        body.setCode(ex.getCode());
        HttpHeaders headers = defaultHeaders();
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            // По AC: Retry-After обязателен и код rate.limit-exceeded
            if (body.getCode() == null || body.getCode().isBlank()) {
                body.setCode("rate.limit-exceeded");
            }
            headers.add(HttpHeaders.RETRY_AFTER, "60");
        }
        return new ResponseEntity<>(body, headers, status);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetails> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        ProblemDetails body = baseProblem(request, status);
        body.setTitle("Validation Failed");
        body.setCode("validation.failed");
        List<ProblemDetails.FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldError)
                .collect(Collectors.toList());
        body.setErrors(errors);
        return new ResponseEntity<>(body, defaultHeaders(), status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetails> handleOther(Exception ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        ProblemDetails body = baseProblem(request, status);
        body.setTitle(status.getReasonPhrase());
        body.setDetail("Unexpected error");
        body.setCode("internal.error");
        return new ResponseEntity<>(body, defaultHeaders(), status);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetails> handleResponseStatus(ResponseStatusException ex, WebRequest request) {
        HttpStatus status = ex.getStatusCode() instanceof HttpStatus hs ? hs : HttpStatus.INTERNAL_SERVER_ERROR;
        ProblemDetails body = baseProblem(request, status);
        body.setTitle(status.getReasonPhrase());
        body.setDetail(ex.getReason());
        body.setCode(defaultCodeFor(status));
        HttpHeaders headers = defaultHeaders();
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            body.setCode("rate.limit-exceeded");
            headers.add(HttpHeaders.RETRY_AFTER, "60");
        }
        return new ResponseEntity<>(body, headers, status);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetails> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        HttpStatus status = HttpStatus.FORBIDDEN;
        ProblemDetails body = baseProblem(request, status);
        body.setTitle(status.getReasonPhrase());
        body.setDetail("Access is denied");
        body.setCode("access.denied");
        return new ResponseEntity<>(body, defaultHeaders(), status);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetails> handleAuth(AuthenticationException ex, WebRequest request) {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        ProblemDetails body = baseProblem(request, status);
        body.setTitle(status.getReasonPhrase());
        body.setDetail("Unauthorized");
        body.setCode("unauthorized");
        return new ResponseEntity<>(body, defaultHeaders(), status);
    }

    private String defaultCodeFor(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "bad.request";
            case UNAUTHORIZED -> "unauthorized";
            case FORBIDDEN -> "access.denied";
            case NOT_FOUND -> "not.found";
            case CONFLICT -> "conflict";
            case UNPROCESSABLE_ENTITY -> "unprocessable";
            case TOO_MANY_REQUESTS -> "rate.limit-exceeded";
            default -> "error";
        };
    }

    private ProblemDetails baseProblem(WebRequest request, HttpStatus status) {
        ProblemDetails pd = new ProblemDetails();
        pd.setType(URI.create("https://aquastream.app/problems/" + status.value()));
        pd.setStatus(status.value());
        if (request instanceof ServletWebRequest swr) {
            pd.setInstance(swr.getRequest().getRequestURI());
            String corr = swr.getRequest().getHeader(DomainConstants.HEADER_REQUEST_ID);
            if (corr == null || corr.isBlank()) {
                corr = MDC.get(DomainConstants.LOG_CORRELATION_ID);
            }
            if (corr != null && !corr.isBlank()) pd.setCorrelationId(corr);
        } else {
            // WebFlux или иные реализации WebRequest
            String desc = request.getDescription(false); // формата "uri=/path"
            if (desc != null && desc.startsWith("uri=")) {
                pd.setInstance(desc.substring(4));
            }
            String corr = MDC.get(DomainConstants.LOG_CORRELATION_ID);
            if (corr != null && !corr.isBlank()) pd.setCorrelationId(corr);
        }
        return pd;
    }

    private ProblemDetails.FieldError toFieldError(FieldError fe) {
        String code = (fe.getCode() != null) ? fe.getCode() : "invalid";
        return new ProblemDetails.FieldError(fe.getField(), fe.getDefaultMessage(), code);
    }

    private HttpHeaders defaultHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_TYPE, ProblemDetails.MEDIA_TYPE);
        return headers;
    }
}


