package com.ats.atsbackend.domain.resume.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record ResumeBlockValuesUpsertRequest(
        @NotNull Map<String, String> values
) {}
