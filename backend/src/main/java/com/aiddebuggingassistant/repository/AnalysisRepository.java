package com.aiddebuggingassistant.repository;

import com.aiddebuggingassistant.domain.AnalysisEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<AnalysisEntity, UUID> {

    List<AnalysisEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
