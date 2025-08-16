package org.aquastream.event.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedResponse<T> {
    private List<T> items;
    private long total;
    private int page;
    private int size;
    private long totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}