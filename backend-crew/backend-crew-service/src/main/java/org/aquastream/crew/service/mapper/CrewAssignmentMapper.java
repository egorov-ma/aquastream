package org.aquastream.crew.service.mapper;

import org.aquastream.crew.api.dto.CrewAssignmentDto;
import org.aquastream.crew.db.entity.CrewAssignmentEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CrewAssignmentMapper {

    @Autowired
    private CrewMapper crewMapper;

    public CrewAssignmentDto toDto(CrewAssignmentEntity entity) {
        if (entity == null) {
            return null;
        }

        return CrewAssignmentDto.builder()
                .id(entity.getId())
                .crewId(entity.getCrew() != null ? entity.getCrew().getId() : null)
                .userId(entity.getUserId())
                .bookingId(entity.getBookingId())
                .seatNumber(entity.getSeatNumber())
                .position(entity.getPosition())
                .assignedBy(entity.getAssignedBy())
                .assignedAt(entity.getAssignedAt())
                .unassignedAt(entity.getUnassignedAt())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .notes(entity.getNotes())
                .crew(entity.getCrew() != null ? crewMapper.toDto(entity.getCrew()) : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}