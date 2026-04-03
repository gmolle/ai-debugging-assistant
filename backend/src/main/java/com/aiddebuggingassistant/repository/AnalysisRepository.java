package com.aiddebuggingassistant.repository;

import com.aiddebuggingassistant.domain.AnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<AnalysisEntity, UUID> {}
