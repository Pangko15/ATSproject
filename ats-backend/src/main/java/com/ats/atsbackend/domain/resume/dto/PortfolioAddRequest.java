package com.ats.atsbackend.domain.resume.dto;

import jakarta.validation.constraints.NotNull;

public record PortfolioAddRequest(
        @NotNull Long portfolioFileId
) {}
