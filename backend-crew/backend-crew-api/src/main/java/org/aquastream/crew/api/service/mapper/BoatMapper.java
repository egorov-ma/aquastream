package org.aquastream.crew.api.service.mapper;

import org.aquastream.crew.api.dto.BoatDto;
import org.aquastream.crew.db.entity.BoatEntity;
import org.springframework.stereotype.Component;

@Component
public class BoatMapper {

    public BoatDto toDto(BoatEntity entity) {
        if (entity == null) {
            return null;
        }

        return BoatDto.builder()
                .id(entity.getId())
                .crewId(entity.getCrew() != null ? entity.getCrew().getId() : null)
                .boatNumber(entity.getBoatNumber())
                .boatType(entity.getBoatType())
                .brand(entity.getBrand())
                .model(entity.getModel())
                .yearManufactured(entity.getYearManufactured())
                .lengthMeters(entity.getLengthMeters())
                .maxWeightKg(entity.getMaxWeightKg())
                .condition(entity.getCondition() != null ? entity.getCondition().name() : null)
                .equipment(entity.getEquipment())
                .maintenanceNotes(entity.getMaintenanceNotes())
                .lastInspection(entity.getLastInspection())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}