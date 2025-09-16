package org.aquastream.event.mapper;

import org.aquastream.event.db.entity.BookingEntity;
import org.aquastream.event.db.entity.BookingLogEntity;
import org.aquastream.event.dto.BookingDto;
import org.aquastream.event.dto.BookingLogDto;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/**
 * Mapper for converting booking entities to DTOs.
 */
@Component
public class BookingMapper {
    
    private final EventMapper eventMapper;
    
    public BookingMapper(EventMapper eventMapper) {
        this.eventMapper = eventMapper;
    }
    
    /**
     * Convert BookingEntity to BookingDto with event details
     */
    public BookingDto toBookingDto(BookingEntity entity) {
        if (entity == null) {
            return null;
        }
        
        BookingDto dto = new BookingDto();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        dto.setEventTitle(entity.getEvent().getTitle());
        dto.setEventType(entity.getEvent().getType());
        dto.setOrganizer(eventMapper.toOrganizerDto(entity.getEvent().getOrganizer(), 0L));
        dto.setUserId(entity.getUserId());
        dto.setStatus(entity.getStatus());
        dto.setAmount(entity.getAmount());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaymentId(entity.getPaymentId());
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Event details
        dto.setEventDateStart(entity.getEvent().getDateStart());
        dto.setEventDateEnd(entity.getEvent().getDateEnd());
        dto.setEventLocation(entity.getEvent().getLocation().toString()); // JSON to string
        
        // Calculated fields
        dto.setExpired(entity.isExpired());
        dto.setRequiresPayment(entity.requiresPayment());
        dto.setCanBeConfirmed(entity.canBeConfirmed());
        dto.setRemainingMinutes(calculateRemainingMinutes(entity));
        
        return dto;
    }
    
    /**
     * Convert BookingEntity to simplified BookingDto (without event details)
     */
    public BookingDto toSimpleBookingDto(BookingEntity entity) {
        if (entity == null) {
            return null;
        }
        
        BookingDto dto = new BookingDto();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        dto.setUserId(entity.getUserId());
        dto.setStatus(entity.getStatus());
        dto.setAmount(entity.getAmount());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaymentId(entity.getPaymentId());
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Calculated fields
        dto.setExpired(entity.isExpired());
        dto.setRequiresPayment(entity.requiresPayment());
        dto.setCanBeConfirmed(entity.canBeConfirmed());
        dto.setRemainingMinutes(calculateRemainingMinutes(entity));
        
        return dto;
    }
    
    /**
     * Convert BookingLogEntity to BookingLogDto
     */
    public BookingLogDto toBookingLogDto(BookingLogEntity entity) {
        if (entity == null) {
            return null;
        }
        
        BookingLogDto dto = new BookingLogDto();
        dto.setId(entity.getId());
        dto.setBookingId(entity.getBooking().getId());
        dto.setAction(entity.getAction());
        dto.setOldValue(entity.getOldValue());
        dto.setNewValue(entity.getNewValue());
        dto.setActorUserId(entity.getActorUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        
        return dto;
    }
    
    /**
     * Calculate remaining minutes until booking expiration
     */
    private Long calculateRemainingMinutes(BookingEntity booking) {
        if (booking.getExpiresAt() == null) {
            return null;
        }
        
        Instant now = Instant.now();
        if (now.isAfter(booking.getExpiresAt())) {
            return 0L; // Already expired
        }
        
        Duration remaining = Duration.between(now, booking.getExpiresAt());
        return remaining.toMinutes();
    }
}