import { B3PropagatorConfig, BatchSpanProcessorConfig, CommonCollectorConfig, InstrumentationConfig, ZipkinCollectorConfig } from "@jufab/opentelemetry-angular-interceptor";

export interface OpenTelemetryConfig {
    commonConfig: CommonCollectorConfig;
    batchSpanProcessorConfig?: BatchSpanProcessorConfig;
    zipkinConfig?: ZipkinCollectorConfig;
    b3PropagatorConfig?: B3PropagatorConfig;
    instrumentationConfig?: InstrumentationConfig;
  }