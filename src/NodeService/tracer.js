'use strict';

const opentelemetry = require('@opentelemetry/api');

// Not functionally required but gives some insight what happens behind the scenes
const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { AlwaysOnSampler } = require('@opentelemetry/core');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { MongoDBInstrumentation, MongoDBInstrumentationConfig } = require('@opentelemetry/instrumentation-mongodb');
const { Resource } = require('@opentelemetry/resources');
const { SemanticAttributes, SemanticResourceAttributes: ResourceAttributesSC } = require('@opentelemetry/semantic-conventions');

const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

module.exports = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ResourceAttributesSC.SERVICE_NAME]: serviceName,
    }),
    sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // new MongoDBInstrumentation({enhancedDatabaseReporting: true}), FUNZIONA SOLO CON VERSIONI DI MONGO >= 3.3 a < 4
      HttpInstrumentation,
      ExpressInstrumentation,
    ],
  });

  const zipkin = new ZipkinExporter({url: 'http://zipkin:9411/api/v2/spans', serviceName: serviceName});
  const jaeger = new JaegerExporter({url: 'http://jaeger:14268/api/traces', serviceName: serviceName});
  const exporter = (process.env.EXPORTER || '').toLowerCase().startsWith('z') ? zipkin : jaeger;

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer('express-example');
};

function filterSampler(filterFn, parent) {
  return {
    shouldSample(ctx, tid, spanName, spanKind, attr, links) {
      if (!filterFn(spanName, spanKind, attr)) {
        return { decision: opentelemetry.SamplingDecision.NOT_RECORD };
      }
      return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
    },
    toString() {
      return `FilterSampler(${parent.toString()})`;
    }
  }
}

function ignoreHealthCheck(spanName, spanKind, attributes) {
  return spanKind !== opentelemetry.SpanKind.SERVER || attributes[SemanticAttributes.HTTP_ROUTE] !== "/health";
}