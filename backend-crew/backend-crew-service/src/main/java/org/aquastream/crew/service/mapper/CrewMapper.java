package org.aquastream.crew.service.mapper;

import org.aquastream.crew.dto.CrewDto;
import org.aquastream.crew.db.entity.CrewEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CrewMapper {

    @Autowired
    private BoatMapper boatMapper;

    @Autowired
    private TentMapper tentMapper;

    public CrewDto toDto(CrewEntity entity) {
        if (entity == null) {
            return null;
        }

        return CrewDto.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .name(entity.getName())
                .type(entity.getType().name())
                .capacity(entity.getCapacity())
                .currentSize(entity.getCurrentSize())
                .description(entity.getDescription())
                .metadata(entity.getMetadata())
                .boat(entity.getBoat() != null ? boatMapper.toDto(entity.getBoat()) : null)
                .tent(entity.getTent() != null ? tentMapper.toDto(entity.getTent()) : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
