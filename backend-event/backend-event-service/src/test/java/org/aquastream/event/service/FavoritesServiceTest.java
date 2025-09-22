package org.aquastream.event.service;

import org.aquastream.event.db.entity.EventEntity;
import org.aquastream.event.db.entity.FavoritesEntity;
import org.aquastream.event.db.entity.OrganizerEntity;
import org.aquastream.event.db.repository.EventRepository;
import org.aquastream.event.db.repository.FavoritesRepository;
import org.aquastream.event.dto.FavoriteActionResult;
import org.aquastream.event.dto.FavoriteEventDto;
import org.aquastream.event.mapper.EventMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoritesServiceTest {
    
    @Mock
    private FavoritesRepository favoritesRepository;
    
    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private EventMapper eventMapper;
    
    @InjectMocks
    private FavoritesService favoritesService;
    
    private UUID userId;
    private UUID eventId;
    private EventEntity eventEntity;
    private OrganizerEntity organizerEntity;
    
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        eventId = UUID.randomUUID();
        
        organizerEntity = OrganizerEntity.builder()
                .id(UUID.randomUUID())
                .slug("test-organizer")
                .name("Test Organizer")
                .build();
        
        eventEntity = EventEntity.builder()
                .id(eventId)
                .title("Test Event")
                .type("RAFTING")
                .organizer(organizerEntity)
                .dateStart(Instant.now().plusSeconds(86400)) // Tomorrow
                .dateEnd(Instant.now().plusSeconds(90000)) // Tomorrow + 1 hour
                .price(BigDecimal.valueOf(100.0))
                .capacity(20)
                .available(10)
                .status("PUBLISHED")
                .tags(new String[]{"adventure", "water"})
                .location(Map.of("address", "Test Location"))
                .build();
    }
    
    @Test
    void addToFavorites_NewFavorite_Success() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(eventEntity));
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(false);
        when(favoritesRepository.save(any(FavoritesEntity.class))).thenReturn(new FavoritesEntity());
        
        // When
        FavoriteActionResult result = favoritesService.addToFavorites(userId, eventId);
        
        // Then
        assertNotNull(result);
        assertEquals(eventId, result.eventId());
        assertTrue(result.isFavorited());
        assertEquals("Event added to favorites", result.message());
        
        verify(favoritesRepository).save(any(FavoritesEntity.class));
    }
    
    @Test
    void addToFavorites_EventNotFound_ThrowsException() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());
        
        // When & Then
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> favoritesService.addToFavorites(userId, eventId));
        
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Event not found", exception.getReason());
        
        verify(favoritesRepository, never()).save(any());
    }
    
    @Test
    void addToFavorites_AlreadyFavorited_ReturnsAlreadyExists() {
        // Given
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(eventEntity));
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(true);
        
        // When
        FavoriteActionResult result = favoritesService.addToFavorites(userId, eventId);
        
        // Then
        assertNotNull(result);
        assertEquals(eventId, result.eventId());
        assertTrue(result.isFavorited());
        assertEquals("Event already in favorites", result.message());
        
        verify(favoritesRepository, never()).save(any());
    }
    
    @Test
    void removeFromFavorites_ExistingFavorite_Success() {
        // Given
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(true);
        when(favoritesRepository.deleteByUserIdAndEventId(userId, eventId)).thenReturn(1);
        
        // When
        FavoriteActionResult result = favoritesService.removeFromFavorites(userId, eventId);
        
        // Then
        assertNotNull(result);
        assertEquals(eventId, result.eventId());
        assertFalse(result.isFavorited());
        assertEquals("Event removed from favorites", result.message());
        
        verify(favoritesRepository).deleteByUserIdAndEventId(userId, eventId);
    }
    
    @Test
    void removeFromFavorites_NotFavorited_ReturnsNotFound() {
        // Given
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(false);
        
        // When
        FavoriteActionResult result = favoritesService.removeFromFavorites(userId, eventId);
        
        // Then
        assertNotNull(result);
        assertEquals(eventId, result.eventId());
        assertFalse(result.isFavorited());
        assertEquals("Event not found in favorites", result.message());
        
        verify(favoritesRepository, never()).deleteByUserIdAndEventId(any(), any());
    }
    
    @Test
    void getUserFavorites_ReturnsListOfFavorites() {
        // Given
        FavoritesEntity favorite = FavoritesEntity.builder()
                .id(new FavoritesEntity.FavoritesId(userId, eventId))
                .createdAt(Instant.now())
                .event(eventEntity)
                .build();
        
        List<FavoritesEntity> favorites = List.of(favorite);
        when(favoritesRepository.findByUserIdWithEvents(userId)).thenReturn(favorites);
        
        // When
        List<FavoriteEventDto> result = favoritesService.getUserFavorites(userId);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        
        FavoriteEventDto dto = result.get(0);
        assertEquals(eventId, dto.eventId());
        assertEquals("Test Event", dto.title());
        assertEquals("test-organizer", dto.organizerSlug());
        assertEquals("Test Organizer", dto.organizerName());
        assertEquals("RAFTING", dto.type());
        assertEquals(100.0, dto.price());
        assertEquals("PUBLISHED", dto.status());
    }
    
    @Test
    void isFavorited_ReturnsTrueForFavoritedEvent() {
        // Given
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(true);
        
        // When
        boolean result = favoritesService.isFavorited(userId, eventId);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void isFavorited_ReturnsFalseForNonFavoritedEvent() {
        // Given
        when(favoritesRepository.existsById_UserIdAndId_EventId(userId, eventId)).thenReturn(false);
        
        // When
        boolean result = favoritesService.isFavorited(userId, eventId);
        
        // Then
        assertFalse(result);
    }
    
    @Test
    void getFavoriteCount_ReturnsCount() {
        // Given
        Long expectedCount = 5L;
        when(favoritesRepository.countByEventId(eventId)).thenReturn(expectedCount);
        
        // When
        Long result = favoritesService.getFavoriteCount(eventId);
        
        // Then
        assertEquals(expectedCount, result);
    }
    
    @Test
    void getUserFavoriteCount_ReturnsUserCount() {
        // Given
        Long expectedCount = 3L;
        when(favoritesRepository.countByUserId(userId)).thenReturn(expectedCount);
        
        // When
        Long result = favoritesService.getUserFavoriteCount(userId);
        
        // Then
        assertEquals(expectedCount, result);
    }
}