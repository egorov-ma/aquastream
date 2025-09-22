package org.aquastream.crew.service.mapper;

import org.aquastream.crew.dto.TentDto;
import org.aquastream.crew.db.entity.TentEntity;
import org.springframework.stereotype.Component;

@Component
public class TentMapper {

    public TentDto toDto(TentEntity entity) {
        if (entity == null) {
            return null;
        }

        return TentDto.builder()
                .id(entity.getId())
                .crewId(entity.getCrew() != null ? entity.getCrew().getId() : null)
                .tentNumber(entity.getTentNumber())
                .tentType(entity.getTentType())
                .brand(entity.getBrand())
                .model(entity.getModel())
                .capacityPersons(entity.getCapacityPersons())
                .seasonRating(entity.getSeasonRating() != null ? entity.getSeasonRating().name() : null)
                .waterproofRating(entity.getWaterproofRating())
                .setupDifficulty(entity.getSetupDifficulty() != null ? entity.getSetupDifficulty().name() : null)
                .weightKg(entity.getWeightKg())
                .packedSizeCm(entity.getPackedSizeCm())
                .condition(entity.getCondition() != null ? entity.getCondition().name() : null)
                .equipment(entity.getEquipment())
                .maintenanceNotes(entity.getMaintenanceNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
